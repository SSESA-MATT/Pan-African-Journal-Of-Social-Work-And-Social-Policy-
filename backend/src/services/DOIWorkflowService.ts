import { Pool } from 'pg';
import { DOIManager, ArticleData } from '../utils/doiManager';
import { EmailService } from './EmailService';
import { getEmailConfig } from '../config/doi';

export interface WorkflowTrigger {
  type: 'article_published' | 'article_updated' | 'manual_trigger' | 'batch_process';
  articleId?: number;
  articleIds?: number[];
  userId?: string;
  metadata?: Record<string, any>;
}

export interface WorkflowResult {
  success: boolean;
  processedCount: number;
  successfulCount: number;
  failedCount: number;
  results: Array<{
    articleId: number;
    doi?: string;
    success: boolean;
    error?: string;
  }>;
  notifications: Array<{
    type: 'email' | 'system';
    recipient: string;
    subject: string;
    sent: boolean;
    error?: string;
  }>;
}

export interface QueuedWorkflow {
  id: string;
  type: WorkflowTrigger['type'];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  articleIds: number[];
  userId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: WorkflowResult;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DOI Registration Workflow Service
 * Handles automated DOI generation and registration workflows
 */
export class DOIWorkflowService {
  private doiManager: DOIManager;
  private emailService: EmailService;
  private pool: Pool;
  private emailConfig: ReturnType<typeof getEmailConfig>;
  private processingQueue: Map<string, QueuedWorkflow> = new Map();
  private isProcessing = false;

  constructor(pool: Pool, emailService: EmailService) {
    this.pool = pool;
    this.doiManager = new DOIManager(pool);
    this.emailService = emailService;
    this.emailConfig = getEmailConfig();
    
    // Start background processing
    this.startBackgroundProcessing();
  }

  /**
   * Trigger DOI workflow for article publication
   */
  async triggerArticlePublicationWorkflow(
    articleId: number,
    userId?: string,
    priority: QueuedWorkflow['priority'] = 'medium'
  ): Promise<{ workflowId: string; queued: boolean }> {
    try {
      // Check if article exists and is published
      const article = await this.getArticleData(articleId);
      if (!article) {
        throw new Error(`Article ${articleId} not found`);
      }

      if (!article.publicationDate || article.publicationDate > new Date()) {
        throw new Error(`Article ${articleId} is not yet published`);
      }

      // Create workflow queue entry
      const workflowId = this.generateWorkflowId();
      const queuedWorkflow: QueuedWorkflow = {
        id: workflowId,
        type: 'article_published',
        status: 'pending',
        articleIds: [articleId],
        userId,
        priority,
        scheduledAt: new Date(),
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to database
      await this.saveQueuedWorkflow(queuedWorkflow);
      
      // Add to processing queue
      this.processingQueue.set(workflowId, queuedWorkflow);

      return { workflowId, queued: true };
    } catch (error) {
      console.error('Failed to trigger article publication workflow:', error);
      throw error;
    }
  }

  /**
   * Trigger batch DOI workflow for multiple articles
   */
  async triggerBatchWorkflow(
    articleIds: number[],
    userId?: string,
    priority: QueuedWorkflow['priority'] = 'low'
  ): Promise<{ workflowId: string; queued: boolean }> {
    try {
      if (articleIds.length === 0) {
        throw new Error('No articles provided for batch workflow');
      }

      // Validate articles exist and are published
      const validArticleIds: number[] = [];
      for (const articleId of articleIds) {
        const article = await this.getArticleData(articleId);
        if (article && article.publicationDate && article.publicationDate <= new Date()) {
          validArticleIds.push(articleId);
        }
      }

      if (validArticleIds.length === 0) {
        throw new Error('No valid published articles found');
      }

      // Create workflow queue entry
      const workflowId = this.generateWorkflowId();
      const queuedWorkflow: QueuedWorkflow = {
        id: workflowId,
        type: 'batch_process',
        status: 'pending',
        articleIds: validArticleIds,
        userId,
        priority,
        scheduledAt: new Date(),
        retryCount: 0,
        maxRetries: 2, // Lower retry count for batch operations
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to database
      await this.saveQueuedWorkflow(queuedWorkflow);
      
      // Add to processing queue
      this.processingQueue.set(workflowId, queuedWorkflow);

      return { workflowId, queued: true };
    } catch (error) {
      console.error('Failed to trigger batch workflow:', error);
      throw error;
    }
  }

  /**
   * Process a single workflow
   */
  async processWorkflow(workflowId: string): Promise<WorkflowResult> {
    const workflow = this.processingQueue.get(workflowId) || await this.getQueuedWorkflow(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    try {
      // Update workflow status
      workflow.status = 'processing';
      workflow.startedAt = new Date();
      workflow.updatedAt = new Date();
      await this.updateQueuedWorkflow(workflow);

      // Get article data for all articles
      const articles: ArticleData[] = [];
      for (const articleId of workflow.articleIds) {
        const article = await this.getArticleData(articleId);
        if (article) {
          articles.push(article);
        }
      }

      // Process DOI generation
      const batchResult = await this.doiManager.batchGenerateDOIs(articles, {
        forceRegenerate: workflow.type === 'manual_trigger'
      });

      // Prepare workflow result
      const workflowResult: WorkflowResult = {
        success: batchResult.failed === 0,
        processedCount: articles.length,
        successfulCount: batchResult.successful,
        failedCount: batchResult.failed,
        results: batchResult.results,
        notifications: []
      };

      // Send notifications
      await this.sendWorkflowNotifications(workflow, workflowResult);

      // Update workflow with results
      workflow.status = workflowResult.success ? 'completed' : 'failed';
      workflow.completedAt = new Date();
      workflow.updatedAt = new Date();
      workflow.result = workflowResult;
      await this.updateQueuedWorkflow(workflow);

      // Remove from processing queue if completed
      if (workflow.status === 'completed') {
        this.processingQueue.delete(workflowId);
      }

      return workflowResult;
    } catch (error) {
      // Handle workflow failure
      workflow.status = 'failed';
      workflow.completedAt = new Date();
      workflow.updatedAt = new Date();
      workflow.result = {
        success: false,
        processedCount: 0,
        successfulCount: 0,
        failedCount: workflow.articleIds.length,
        results: workflow.articleIds.map(id => ({
          articleId: id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })),
        notifications: []
      };
      
      await this.updateQueuedWorkflow(workflow);
      this.processingQueue.delete(workflowId);
      
      throw error;
    }
  }

  /**
   * Get workflow status
   */
  async getWorkflowStatus(workflowId: string): Promise<QueuedWorkflow | null> {
    return this.processingQueue.get(workflowId) || await this.getQueuedWorkflow(workflowId);
  }

  /**
   * Get all workflows with optional filtering
   */
  async getWorkflows(filters: {
    status?: QueuedWorkflow['status'];
    type?: QueuedWorkflow['type'];
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ workflows: QueuedWorkflow[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(filters.status);
      paramIndex++;
    }

    if (filters.type) {
      conditions.push(`type = $${paramIndex}`);
      values.push(filters.type);
      paramIndex++;
    }

    if (filters.userId) {
      conditions.push(`user_id = $${paramIndex}`);
      values.push(filters.userId);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await this.pool.query(`
      SELECT COUNT(*) as total FROM doi_workflows ${whereClause}
    `, values);

    const total = parseInt(countResult.rows[0].total);

    // Get workflows with pagination
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    const dataResult = await this.pool.query(`
      SELECT * FROM doi_workflows 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...values, limit, offset]);

    const workflows = dataResult.rows.map(row => this.mapWorkflowRow(row));

    return { workflows, total };
  }

  /**
   * Retry failed workflow
   */
  async retryWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const workflow = await this.getQueuedWorkflow(workflowId);
      
      if (!workflow) {
        return { success: false, error: 'Workflow not found' };
      }

      if (workflow.status !== 'failed') {
        return { success: false, error: 'Only failed workflows can be retried' };
      }

      if (workflow.retryCount >= workflow.maxRetries) {
        return { success: false, error: 'Maximum retry attempts exceeded' };
      }

      // Reset workflow for retry
      workflow.status = 'pending';
      workflow.retryCount++;
      workflow.startedAt = undefined;
      workflow.completedAt = undefined;
      workflow.result = undefined;
      workflow.updatedAt = new Date();

      await this.updateQueuedWorkflow(workflow);
      this.processingQueue.set(workflowId, workflow);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Cancel pending workflow
   */
  async cancelWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const workflow = await this.getQueuedWorkflow(workflowId);
      
      if (!workflow) {
        return { success: false, error: 'Workflow not found' };
      }

      if (workflow.status === 'processing') {
        return { success: false, error: 'Cannot cancel workflow that is currently processing' };
      }

      if (workflow.status === 'completed') {
        return { success: false, error: 'Cannot cancel completed workflow' };
      }

      // Mark as failed with cancellation message
      workflow.status = 'failed';
      workflow.completedAt = new Date();
      workflow.updatedAt = new Date();
      workflow.result = {
        success: false,
        processedCount: 0,
        successfulCount: 0,
        failedCount: workflow.articleIds.length,
        results: workflow.articleIds.map(id => ({
          articleId: id,
          success: false,
          error: 'Workflow cancelled by user'
        })),
        notifications: []
      };

      await this.updateQueuedWorkflow(workflow);
      this.processingQueue.delete(workflowId);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Start background processing of queued workflows
   */
  private startBackgroundProcessing(): void {
    // Process queue every 30 seconds
    setInterval(async () => {
      if (this.isProcessing) return;
      
      try {
        this.isProcessing = true;
        await this.processQueuedWorkflows();
      } catch (error) {
        console.error('Error processing workflow queue:', error);
      } finally {
        this.isProcessing = false;
      }
    }, 30000);

    // Load pending workflows on startup
    this.loadPendingWorkflows();
  }

  /**
   * Process all queued workflows
   */
  private async processQueuedWorkflows(): Promise<void> {
    // Get pending workflows ordered by priority and creation time
    const pendingWorkflows = Array.from(this.processingQueue.values())
      .filter(w => w.status === 'pending')
      .sort((a, b) => {
        // Priority order: urgent > high > medium > low
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Then by creation time (older first)
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    // Process up to 3 workflows concurrently
    const maxConcurrent = 3;
    const processing = pendingWorkflows.slice(0, maxConcurrent);

    const promises = processing.map(workflow => 
      this.processWorkflow(workflow.id).catch(error => {
        console.error(`Failed to process workflow ${workflow.id}:`, error);
      })
    );

    await Promise.all(promises);
  }

  /**
   * Load pending workflows from database on startup
   */
  private async loadPendingWorkflows(): Promise<void> {
    try {
      const { workflows } = await this.getWorkflows({ 
        status: 'pending',
        limit: 100 
      });

      workflows.forEach(workflow => {
        this.processingQueue.set(workflow.id, workflow);
      });

      console.log(`Loaded ${workflows.length} pending DOI workflows`);
    } catch (error) {
      console.error('Failed to load pending workflows:', error);
    }
  }
import { Request, Response } from 'express';
import { SubmissionService } from '../services/SubmissionService';
import { CreateSubmissionRequest, UpdateSubmissionStatusRequest } from '../models/types';

export class SubmissionController {
  private submissionService: SubmissionService;

  constructor() {
    this.submissionService = new SubmissionService();
  }

  /**
   * Create a new manuscript submission
   */
  createSubmission = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const submissionData: CreateSubmissionRequest = req.body;
      
      // Validate submission data
      const validationErrors = this.submissionService.validateSubmissionData(submissionData);
      if (validationErrors.length > 0) {
        res.status(400).json({ 
          error: 'Validation failed', 
          details: validationErrors 
        });
        return;
      }

      // Check if manuscript file is provided
      const manuscriptFile = req.file;
      if (!manuscriptFile) {
        res.status(400).json({ error: 'Manuscript file is required' });
        return;
      }

      const submission = await this.submissionService.createSubmission(
        userId,
        submissionData,
        manuscriptFile
      );

      res.status(201).json({
        message: 'Submission created successfully',
        submission
      });
    } catch (error: any) {
      console.error('Error creating submission:', error);
      res.status(400).json({ 
        error: 'Failed to create submission', 
        message: error.message 
      });
    }
  };

  /**
   * Get submission by ID
   */
  getSubmissionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const submission = await this.submissionService.getSubmissionById(id, userId, userRole);
      
      if (!submission) {
        res.status(404).json({ error: 'Submission not found' });
        return;
      }

      res.json({ submission });
    } catch (error: any) {
      console.error('Error fetching submission:', error);
      res.status(403).json({ 
        error: 'Access denied', 
        message: error.message 
      });
    }
  };

  /**
   * Get submissions by author (current user's submissions)
   */
  getMySubmissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const submissions = await this.submissionService.getSubmissionsByAuthor(userId);
      res.json({ submissions });
    } catch (error: any) {
      console.error('Error fetching user submissions:', error);
      res.status(500).json({ 
        error: 'Failed to fetch submissions', 
        message: error.message 
      });
    }
  };

  /**
   * Get all submissions (admin/editor only)
   */
  getAllSubmissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRole = req.user?.role;
      if (!userRole) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const submissions = await this.submissionService.getAllSubmissions(userRole);
      res.json({ submissions });
    } catch (error: any) {
      console.error('Error fetching all submissions:', error);
      res.status(403).json({ 
        error: 'Access denied', 
        message: error.message 
      });
    }
  };

  /**
   * Update submission status (admin/editor only)
   */
  updateSubmissionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const statusUpdate: UpdateSubmissionStatusRequest = req.body;

      if (!userId || !userRole) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Validate status update data
      if (!statusUpdate.status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      const validStatuses = ['submitted', 'under_review', 'revisions_required', 'accepted', 'rejected'];
      if (!validStatuses.includes(statusUpdate.status)) {
        res.status(400).json({ error: 'Invalid status value' });
        return;
      }

      const updatedSubmission = await this.submissionService.updateSubmissionStatus(
        id,
        statusUpdate,
        userId,
        userRole
      );

      if (!updatedSubmission) {
        res.status(404).json({ error: 'Submission not found' });
        return;
      }

      res.json({
        message: 'Submission status updated successfully',
        submission: updatedSubmission
      });
    } catch (error: any) {
      console.error('Error updating submission status:', error);
      res.status(403).json({ 
        error: 'Access denied', 
        message: error.message 
      });
    }
  };

  /**
   * Update submission manuscript (for revisions)
   */
  updateSubmissionManuscript = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const manuscriptFile = req.file;
      if (!manuscriptFile) {
        res.status(400).json({ error: 'Manuscript file is required' });
        return;
      }

      const updatedSubmission = await this.submissionService.updateSubmissionManuscript(
        id,
        userId,
        manuscriptFile
      );

      if (!updatedSubmission) {
        res.status(404).json({ error: 'Submission not found' });
        return;
      }

      res.json({
        message: 'Manuscript updated successfully',
        submission: updatedSubmission
      });
    } catch (error: any) {
      console.error('Error updating manuscript:', error);
      res.status(400).json({ 
        error: 'Failed to update manuscript', 
        message: error.message 
      });
    }
  };

  /**
   * Get submission statistics (admin/editor only)
   */
  getSubmissionStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRole = req.user?.role;
      if (!userRole) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const statistics = await this.submissionService.getSubmissionStatistics(userRole);
      res.json({ statistics });
    } catch (error: any) {
      console.error('Error fetching submission statistics:', error);
      res.status(403).json({ 
        error: 'Access denied', 
        message: error.message 
      });
    }
  };

  /**
   * Search submissions (admin/editor only)
   */
  searchSubmissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const submissions = await this.submissionService.searchSubmissions(q, userRole);
      res.json({ submissions });
    } catch (error: any) {
      console.error('Error searching submissions:', error);
      res.status(403).json({ 
        error: 'Access denied', 
        message: error.message 
      });
    }
  };

  /**
   * Get submissions pending review (admin/editor only)
   */
  getSubmissionsPendingReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const userRole = req.user?.role;
      if (!userRole) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const submissions = await this.submissionService.getSubmissionsPendingReview(userRole);
      res.json({ submissions });
    } catch (error: any) {
      console.error('Error fetching pending submissions:', error);
      res.status(403).json({ 
        error: 'Access denied', 
        message: error.message 
      });
    }
  };
}
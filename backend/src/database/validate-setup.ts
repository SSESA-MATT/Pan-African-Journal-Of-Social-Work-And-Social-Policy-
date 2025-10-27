import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ValidationResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

class SetupValidator {
  private results: ValidationResult[] = [];

  private addResult(component: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any) {
    this.results.push({ component, status, message, details });
  }

  async validateTables(): Promise<void> {
    console.log('🔍 Validating database tables...');

    const requiredTables = [
      'articles',
      'volumes',
      'issues',
      'submissions',
      'users',
      'reviews',
      'dois',
      'article_metrics',
      'metric_events',
      'editorial_events',
      'search_analytics',
      'citations',
      'supplementary_materials'
    ];

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          this.addResult('Tables', 'fail', `Table ${tableName} is not accessible`, error);
        } else {
          this.addResult('Tables', 'pass', `Table ${tableName} exists and is accessible`);
        }
      } catch (error) {
        this.addResult('Tables', 'fail', `Error checking table ${tableName}`, error);
      }
    }
  }

  async validateIndexes(): Promise<void> {
    console.log('🔍 Validating database indexes...');

    const indexQueries = [
      {
        name: 'Articles full-text search index',
        query: `
          SELECT indexname, indexdef 
          FROM pg_indexes 
          WHERE tablename = 'articles' 
          AND indexname LIKE '%search%gin%'
        `
      },
      {
        name: 'DOI indexes',
        query: `
          SELECT indexname 
          FROM pg_indexes 
          WHERE tablename = 'dois'
        `
      },
      {
        name: 'Metrics indexes',
        query: `
          SELECT indexname 
          FROM pg_indexes 
          WHERE tablename = 'article_metrics'
        `
      }
    ];

    for (const indexQuery of indexQueries) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: indexQuery.query 
        });

        if (error) {
          this.addResult('Indexes', 'fail', `Error checking ${indexQuery.name}`, error);
        } else if (data && data.length > 0) {
          this.addResult('Indexes', 'pass', `${indexQuery.name} exists`, data);
        } else {
          this.addResult('Indexes', 'warning', `${indexQuery.name} may be missing`);
        }
      } catch (error) {
        this.addResult('Indexes', 'fail', `Error validating ${indexQuery.name}`, error);
      }
    }
  }

  async validateFunctions(): Promise<void> {
    console.log('🔍 Validating database functions...');

    const functions = [
      'search_articles_fulltext',
      'search_articles_advanced',
      'get_search_facets',
      'update_article_metrics',
      'log_metric_event'
    ];

    for (const functionName of functions) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: `
            SELECT proname, prosrc 
            FROM pg_proc 
            WHERE proname = '${functionName}'
          `
        });

        if (error) {
          this.addResult('Functions', 'fail', `Error checking function ${functionName}`, error);
        } else if (data && data.length > 0) {
          this.addResult('Functions', 'pass', `Function ${functionName} exists`);
        } else {
          this.addResult('Functions', 'fail', `Function ${functionName} is missing`);
        }
      } catch (error) {
        this.addResult('Functions', 'fail', `Error validating function ${functionName}`, error);
      }
    }
  }

  async validateViews(): Promise<void> {
    console.log('🔍 Validating database views...');

    const views = [
      'article_metrics_summary',
      'editorial_calendar_view'
    ];

    for (const viewName of views) {
      try {
        const { data, error } = await supabase
          .from(viewName)
          .select('*')
          .limit(1);

        if (error) {
          this.addResult('Views', 'fail', `View ${viewName} is not accessible`, error);
        } else {
          this.addResult('Views', 'pass', `View ${viewName} exists and is accessible`);
        }
      } catch (error) {
        this.addResult('Views', 'fail', `Error checking view ${viewName}`, error);
      }
    }
  }

  async validateSampleData(): Promise<void> {
    console.log('🔍 Validating sample data...');

    // Check for articles
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title')
      .limit(5);

    if (articlesError) {
      this.addResult('Sample Data', 'fail', 'Error checking articles', articlesError);
    } else if (!articles || articles.length === 0) {
      this.addResult('Sample Data', 'warning', 'No sample articles found');
    } else {
      this.addResult('Sample Data', 'pass', `Found ${articles.length} sample articles`);
    }

    // Check for metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('article_metrics')
      .select('id, article_id, metric_type, count')
      .limit(5);

    if (metricsError) {
      this.addResult('Sample Data', 'fail', 'Error checking metrics', metricsError);
    } else if (!metrics || metrics.length === 0) {
      this.addResult('Sample Data', 'warning', 'No sample metrics found');
    } else {
      this.addResult('Sample Data', 'pass', `Found ${metrics.length} sample metrics`);
    }

    // Check for editorial events
    const { data: events, error: eventsError } = await supabase
      .from('editorial_events')
      .select('id, title, event_type')
      .limit(5);

    if (eventsError) {
      this.addResult('Sample Data', 'fail', 'Error checking editorial events', eventsError);
    } else if (!events || events.length === 0) {
      this.addResult('Sample Data', 'warning', 'No sample editorial events found');
    } else {
      this.addResult('Sample Data', 'pass', `Found ${events.length} sample editorial events`);
    }
  }

  async validateSearchFunctionality(): Promise<void> {
    console.log('🔍 Validating search functionality...');

    // Test basic search function
    try {
      const { data, error } = await supabase.rpc('search_articles_fulltext', {
        search_query: 'social work'
      });

      if (error) {
        this.addResult('Search', 'fail', 'Full-text search function failed', error);
      } else {
        this.addResult('Search', 'pass', `Full-text search returned ${data?.length || 0} results`);
      }
    } catch (error) {
      this.addResult('Search', 'fail', 'Error testing full-text search', error);
    }

    // Test advanced search function
    try {
      const { data, error } = await supabase.rpc('search_articles_advanced', {
        search_query: 'community',
        limit_count: 5
      });

      if (error) {
        this.addResult('Search', 'fail', 'Advanced search function failed', error);
      } else {
        this.addResult('Search', 'pass', `Advanced search returned ${data?.length || 0} results`);
      }
    } catch (error) {
      this.addResult('Search', 'fail', 'Error testing advanced search', error);
    }

    // Test facets function
    try {
      const { data, error } = await supabase.rpc('get_search_facets', {});

      if (error) {
        this.addResult('Search', 'fail', 'Search facets function failed', error);
      } else {
        this.addResult('Search', 'pass', 'Search facets function working', data);
      }
    } catch (error) {
      this.addResult('Search', 'fail', 'Error testing search facets', error);
    }
  }

  async validateMetricsFunctionality(): Promise<void> {
    console.log('🔍 Validating metrics functionality...');

    // Test metrics update function
    try {
      // Get a sample article ID
      const { data: articles } = await supabase
        .from('articles')
        .select('id')
        .limit(1);

      if (articles && articles.length > 0) {
        const articleId = articles[0].id;

        // Test the update_article_metrics function
        const { error } = await supabase.rpc('update_article_metrics', {
          p_article_id: articleId,
          p_metric_type: 'view',
          p_increment: 1
        });

        if (error) {
          this.addResult('Metrics', 'fail', 'Metrics update function failed', error);
        } else {
          this.addResult('Metrics', 'pass', 'Metrics update function working');
        }

        // Test the log_metric_event function
        const { error: logError } = await supabase.rpc('log_metric_event', {
          p_article_id: articleId,
          p_event_type: 'view',
          p_user_session: 'test_session',
          p_metadata: { test: true }
        });

        if (logError) {
          this.addResult('Metrics', 'fail', 'Metric event logging failed', logError);
        } else {
          this.addResult('Metrics', 'pass', 'Metric event logging working');
        }
      } else {
        this.addResult('Metrics', 'warning', 'No articles available for metrics testing');
      }
    } catch (error) {
      this.addResult('Metrics', 'fail', 'Error testing metrics functionality', error);
    }
  }

  async runAllValidations(): Promise<void> {
    console.log('🚀 Starting database setup validation...\n');

    await this.validateTables();
    await this.validateIndexes();
    await this.validateFunctions();
    await this.validateViews();
    await this.validateSampleData();
    await this.validateSearchFunctionality();
    await this.validateMetricsFunctionality();

    this.printResults();
  }

  private printResults(): void {
    console.log('\n📊 Validation Results:');
    console.log('======================\n');

    const groupedResults = this.results.reduce((acc, result) => {
      if (!acc[result.component]) {
        acc[result.component] = [];
      }
      acc[result.component].push(result);
      return acc;
    }, {} as Record<string, ValidationResult[]>);

    let totalPass = 0;
    let totalFail = 0;
    let totalWarning = 0;

    for (const [component, results] of Object.entries(groupedResults)) {
      console.log(`\n${component}:`);
      console.log('-'.repeat(component.length + 1));

      for (const result of results) {
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
        console.log(`  ${icon} ${result.message}`);

        if (result.status === 'pass') totalPass++;
        else if (result.status === 'fail') totalFail++;
        else totalWarning++;
      }
    }

    console.log('\n📈 Summary:');
    console.log('===========');
    console.log(`✅ Passed: ${totalPass}`);
    console.log(`❌ Failed: ${totalFail}`);
    console.log(`⚠️  Warnings: ${totalWarning}`);
    console.log(`📊 Total: ${totalPass + totalFail + totalWarning}`);

    if (totalFail > 0) {
      console.log('\n❌ Setup validation failed. Please check the errors above.');
      process.exit(1);
    } else if (totalWarning > 0) {
      console.log('\n⚠️  Setup validation completed with warnings. Review the warnings above.');
    } else {
      console.log('\n✅ All validations passed! Database setup is complete and working correctly.');
    }
  }
}

// Run validation if this file is executed directly
if (require.main === module) {
  const validator = new SetupValidator();
  validator.runAllValidations().catch(console.error);
}

export { SetupValidator };
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import pool from '../config/database';

export class DatabaseSeeder {
  private pool: Pool;

  constructor(dbPool: Pool) {
    this.pool = dbPool;
  }

  /**
   * Seed the database with initial data
   */
  async seedDatabase(): Promise<void> {
    console.log('🌱 Starting database seeding...');

    try {
      await this.seedUsers();
      await this.seedVolumes();
      await this.seedIssues();
      await this.seedSampleSubmissions();
      
      console.log('🎉 Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  /**
   * Seed initial users (admin, editors, sample authors, reviewers)
   */
  private async seedUsers(): Promise<void> {
    console.log('👥 Seeding users...');

    const users = [
      {
        email: 'admin@africajournal.org',
        password: 'admin123',
        first_name: 'System',
        last_name: 'Administrator',
        affiliation: 'Africa Journal Platform',
        role: 'admin'
      },
      {
        email: 'editor@africajournal.org',
        password: 'editor123',
        first_name: 'Chief',
        last_name: 'Editor',
        affiliation: 'East Africa Social Work Regional Resource Centre',
        role: 'editor'
      },
      {
        email: 'author1@university.ac.ke',
        password: 'author123',
        first_name: 'Dr. Amina',
        last_name: 'Mwangi',
        affiliation: 'University of Nairobi',
        role: 'author'
      },
      {
        email: 'author2@university.ac.tz',
        password: 'author123',
        first_name: 'Prof. Joseph',
        last_name: 'Mbeki',
        affiliation: 'University of Dar es Salaam',
        role: 'author'
      },
      {
        email: 'reviewer1@university.ac.ug',
        password: 'reviewer123',
        first_name: 'Dr. Sarah',
        last_name: 'Nakamura',
        affiliation: 'Makerere University',
        role: 'reviewer'
      },
      {
        email: 'reviewer2@university.ac.rw',
        password: 'reviewer123',
        first_name: 'Prof. Emmanuel',
        last_name: 'Uwimana',
        affiliation: 'University of Rwanda',
        role: 'reviewer'
      }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      await this.pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, affiliation, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
      `, [user.email, hashedPassword, user.first_name, user.last_name, user.affiliation, user.role]);
    }

    console.log('✅ Users seeded successfully');
  }

  /**
   * Seed initial volumes
   */
  private async seedVolumes(): Promise<void> {
    console.log('📚 Seeding volumes...');

    const volumes = [
      {
        volume_number: 1,
        year: 2024,
        description: 'Inaugural Volume - Foundations of African Social Work'
      },
      {
        volume_number: 2,
        year: 2025,
        description: 'Decolonial Approaches to Social Policy in Africa'
      }
    ];

    for (const volume of volumes) {
      await this.pool.query(`
        INSERT INTO volumes (volume_number, year, description)
        VALUES ($1, $2, $3)
        ON CONFLICT (volume_number) DO NOTHING
      `, [volume.volume_number, volume.year, volume.description]);
    }

    console.log('✅ Volumes seeded successfully');
  }

  /**
   * Seed initial issues
   */
  private async seedIssues(): Promise<void> {
    console.log('📖 Seeding issues...');

    // Get volume IDs
    const volumeResult = await this.pool.query('SELECT id, volume_number FROM volumes ORDER BY volume_number');
    const volumes = volumeResult.rows;

    if (volumes.length === 0) {
      console.log('⚠️  No volumes found, skipping issue seeding');
      return;
    }

    const issues = [
      {
        issue_number: 1,
        volume_id: volumes[0].id,
        description: 'Indigenous Knowledge Systems in Social Work Practice'
      },
      {
        issue_number: 2,
        volume_id: volumes[0].id,
        description: 'Community-Based Social Work Interventions'
      },
      {
        issue_number: 1,
        volume_id: volumes[1]?.id,
        description: 'Policy Frameworks for Social Justice'
      }
    ];

    for (const issue of issues) {
      if (issue.volume_id) {
        await this.pool.query(`
          INSERT INTO issues (issue_number, volume_id, description)
          VALUES ($1, $2, $3)
          ON CONFLICT (volume_id, issue_number) DO NOTHING
        `, [issue.issue_number, issue.volume_id, issue.description]);
      }
    }

    console.log('✅ Issues seeded successfully');
  }

  /**
   * Seed sample submissions for testing
   */
  private async seedSampleSubmissions(): Promise<void> {
    console.log('📝 Seeding sample submissions...');

    // Get author IDs
    const authorResult = await this.pool.query("SELECT id FROM users WHERE role = 'author' LIMIT 2");
    const authors = authorResult.rows;

    if (authors.length === 0) {
      console.log('⚠️  No authors found, skipping submission seeding');
      return;
    }

    const submissions = [
      {
        title: 'Ubuntu Philosophy in Contemporary Social Work Practice: A Kenyan Perspective',
        abstract: 'This paper explores the integration of Ubuntu philosophy into modern social work practice in Kenya. Through qualitative research with 30 social workers, we examine how traditional African values can enhance contemporary social work interventions while maintaining professional standards.',
        keywords: ['Ubuntu', 'Social Work', 'Kenya', 'Indigenous Knowledge', 'Community Practice'],
        author_id: authors[0].id,
        co_authors: ['Dr. Mary Wanjiku', 'Prof. Peter Kiprotich'],
        status: 'under_review'
      },
      {
        title: 'Decolonizing Social Policy: Lessons from Tanzania\'s Community Development Approach',
        abstract: 'This study analyzes Tanzania\'s community development policies through a decolonial lens, examining how post-independence social policies have evolved to incorporate indigenous governance structures and traditional conflict resolution mechanisms.',
        keywords: ['Decolonization', 'Social Policy', 'Tanzania', 'Community Development', 'Governance'],
        author_id: authors[1]?.id || authors[0].id,
        co_authors: ['Dr. Fatuma Hassan'],
        status: 'submitted'
      }
    ];

    for (const submission of submissions) {
      await this.pool.query(`
        INSERT INTO submissions (title, abstract, keywords, author_id, co_authors, status)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        submission.title,
        submission.abstract,
        JSON.stringify(submission.keywords),
        submission.author_id,
        JSON.stringify(submission.co_authors),
        submission.status
      ]);
    }

    console.log('✅ Sample submissions seeded successfully');
  }

  /**
   * Clear all data from the database (for testing purposes)
   */
  async clearDatabase(): Promise<void> {
    console.log('🧹 Clearing database...');

    const tables = ['articles', 'reviews', 'submissions', 'issues', 'volumes', 'users'];
    
    for (const table of tables) {
      await this.pool.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
    }

    console.log('✅ Database cleared successfully');
  }
}

export const databaseSeeder = new DatabaseSeeder(pool!);

// CLI interface for running seeds
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'seed':
      databaseSeeder.seedDatabase()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Seeding failed:', error);
          process.exit(1);
        });
      break;
      
    case 'clear':
      databaseSeeder.clearDatabase()
        .then(() => process.exit(0))
        .catch(error => {
          console.error('Database clearing failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: ts-node seeds.ts [seed|clear]');
      process.exit(1);
  }
}
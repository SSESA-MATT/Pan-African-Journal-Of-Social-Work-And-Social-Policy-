import { BaseRepository } from './BaseRepository';
import { User } from './types';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    // SQL-first mode for testing with local database
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const result = await this.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No user found
      }
      throw error;
    }

    return data;
  }

  /**
   * Find users by role
   */
  async findByRole(role: User['role']): Promise<User[]> {
    // SQL-first mode for testing with local database
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const result = await this.query(
        'SELECT * FROM users WHERE role = $1 ORDER BY created_at DESC',
        [role]
      );
      return result.rows;
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Search users by name or affiliation
   */
  async search(query: string): Promise<User[]> {
    // SQL-first mode for testing with local database
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const searchPattern = `%${query}%`;
      const result = await this.query(
        `SELECT * FROM users 
         WHERE first_name ILIKE $1 
            OR last_name ILIKE $1 
            OR affiliation ILIKE $1 
         ORDER BY last_name ASC`,
        [searchPattern]
      );
      return result.rows;
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,affiliation.ilike.%${query}%`)
      .order('last_name', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, updates: Partial<User>): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Activate/deactivate user account
   */
  async updateStatus(id: string, isActive: boolean): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Get user statistics by role
   */
  async getUserStats(): Promise<Record<string, number>> {
    // SQL-first mode for testing with local database
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const result = await this.query(
        'SELECT role, COUNT(*) as count FROM users GROUP BY role'
      );
      
      const stats: Record<string, number> = {};
      result.rows.forEach((row: any) => {
        stats[row.role] = parseInt(row.count, 10);
      });
      
      return stats;
    }

    const { data, error } = await this.supabase
      .from('users')
      .select('role');

    if (error) {
      throw error;
    }

    const stats: Record<string, number> = {};
    data?.forEach((row: any) => {
      stats[row.role] = (stats[row.role] || 0) + 1;
    });

    return stats;
  }

  /**
   * Create user with specific ID (for Supabase Auth integration)
   */
  async createWithId(userData: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    affiliation: string;
    role: User['role'];
  }): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Update user role (admin function)
   */
  async updateRole(id: string, role: User['role']): Promise<User | null> {
    // SQL-first mode for testing with local database
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      const result = await this.query(
        'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [role, id]
      );
      return result.rows[0] || null;
    }

    const { data, error } = await this.supabase
      .from('users')
      .update({ 
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Find users with pagination
   */
  async findWithPagination(page: number = 1, limit: number = 10): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const offset = (page - 1) * limit;

    // SQL-first mode for testing with local database
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      // Get total count
      const countResult = await this.query('SELECT COUNT(*) as total FROM users');
      const total = parseInt(countResult.rows[0].total, 10);

      // Get paginated data
      const dataResult = await this.query(
        'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      return {
        users: dataResult.rows,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    }

    // Get total count
    const { count, error: countError } = await this.supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Get paginated data
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return {
      users: data || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      currentPage: page
    };
  }
}

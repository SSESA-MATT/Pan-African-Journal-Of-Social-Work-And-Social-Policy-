import { BaseRepository } from '@/lib/server/BaseRepository';
import { User } from '@/types/api';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  /**
   * Create user with specific ID (for Supabase Auth integration)
   */
  async createWithId(userData: Omit<User, 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert([{
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
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
   * Update user role
   */
  async updateRole(id: string, role: User['role']): Promise<User | null> {
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
   * Get users with pagination and filtering
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    filters?: {
      role?: User['role'];
      is_active?: boolean;
      search?: string;
    }
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;
    
    let query = this.supabase.from('users').select('*');
    let countQuery = this.supabase.from('users').select('*', { count: 'exact', head: true });

    if (filters?.role) {
      query = query.eq('role', filters.role);
      countQuery = countQuery.eq('role', filters.role);
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
      countQuery = countQuery.eq('is_active', filters.is_active);
    }

    if (filters?.search) {
      const searchFilter = `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,affiliation.ilike.%${filters.search}%`;
      query = query.or(searchFilter);
      countQuery = countQuery.or(searchFilter);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const [{ data, error }, { count, error: countError }] = await Promise.all([
      query,
      countQuery
    ]);

    if (error) throw error;
    if (countError) throw countError;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit
    };
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<User['role'], number>;
  }> {
    const [totalResult, activeResult, inactiveResult, ...roleResults] = await Promise.all([
      this.supabase.from('users').select('*', { count: 'exact', head: true }),
      this.supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', true),
      this.supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_active', false),
      this.supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
      this.supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'editor'),
      this.supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'reviewer'),
      this.supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'author'),
    ]);

    return {
      total: totalResult.count || 0,
      active: activeResult.count || 0,
      inactive: inactiveResult.count || 0,
      byRole: {
        admin: roleResults[0]?.count || 0,
        editor: roleResults[1]?.count || 0,
        reviewer: roleResults[2]?.count || 0,
        author: roleResults[3]?.count || 0,
      }
    };
  }
}

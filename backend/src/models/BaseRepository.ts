import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Pool, QueryResult } from 'pg';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export abstract class BaseRepository<T> {
  protected supabase: SupabaseClient;
  protected tableName: string;
  // Shared pg pool for raw SQL queries used by some repositories
  private static pgPool: Pool | null = null;

  constructor(tableName: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.tableName = tableName;
  }

  /**
   * Run a raw SQL query using pg Pool. Some legacy repositories expect a `query` method.
   * Falls back to throwing a clear error if DATABASE_URL is not configured.
   */
  protected async query(sql: string, params?: any[]): Promise<QueryResult<any>> {
    if (!BaseRepository.pgPool) {
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL is not set; raw SQL queries are unavailable');
      }

      BaseRepository.pgPool = new Pool({ connectionString: databaseUrl });
    }

    return BaseRepository.pgPool.query(sql, params || []);
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No record found
      }
      throw error;
    }

    return data;
  }

  /**
   * Create a new record
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .insert([data])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Update an existing record
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    const { data: result, error } = await this.supabase
      .from(this.tableName)
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return result;
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  }

  /**
   * Find all records
   */
  async findAll(): Promise<T[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Count records
   */
  async count(): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return count || 0;
  }
}

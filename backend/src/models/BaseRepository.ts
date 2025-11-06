import { SupabaseClient } from '@supabase/supabase-js';
import { Pool, QueryResult } from 'pg';
import { supabase } from '../config/supabase';
import defaultPool from '../config/database';

export abstract class BaseRepository<T> {
  // We export a real Supabase client from src/config/supabase.ts (dummy in test/local).
  // Declare as non-null so derived repositories don't need to guard every call.
  protected supabase: SupabaseClient;
  protected tableName: string;
  // Shared pg pool for raw SQL queries used by some repositories
  private static pgPool: Pool | null = null;

  constructor(tableName: string) {
    // Use the configured supabase client exported from src/config/supabase.ts.
    // That module now always exports a client (dummy in local/test mode), so cast
    // to SupabaseClient and assign directly to avoid TS nullable complaints.
    this.supabase = supabase as SupabaseClient;
    this.tableName = tableName;
  }

  /**
   * Run a raw SQL query using pg Pool. Some legacy repositories expect a `query` method.
   * Falls back to throwing a clear error if DATABASE_URL is not configured.
   */
  protected async query(sql: string, params?: any[]): Promise<QueryResult<any>> {
    // Prefer using the application's shared pool (from config/database) when available
    if (!BaseRepository.pgPool) {
      if (defaultPool) {
        BaseRepository.pgPool = defaultPool as Pool;
      } else {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
          throw new Error('DATABASE_URL is not set; raw SQL queries are unavailable');
        }

        BaseRepository.pgPool = new Pool({ connectionString: databaseUrl });
      }
    }

    return BaseRepository.pgPool.query(sql, params || []);
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<T | null> {
    // When DB_HOST is set (test mode), use SQL directly since test data
    // is inserted via pg Pool and won't be visible to Supabase client
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      try {
        const res = await this.query(`SELECT * FROM ${this.tableName} WHERE id = $1 LIMIT 1`, [id]);
        return res.rows[0] || null;
      } catch (sqlErr) {
        throw sqlErr;
      }
    }

    // Try Supabase first (normal runtime). If the Supabase HTTP client cannot
    // reach the API (fetch failed) fall back to a direct SQL query using pg Pool.
    try {
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
    } catch (err: any) {
      throw err;
    }
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
    // When DB_HOST is set (test mode), use SQL directly
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      try {
        const res = await this.query(`SELECT * FROM ${this.tableName} ORDER BY created_at DESC`);
        return res.rows || [];
      } catch (sqlErr) {
        throw sqlErr;
      }
    }

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

/**
 * lib/db/index.ts
 * Single PostgreSQL client for the entire application.
 * All database access goes through this module only — no raw pg imports elsewhere.
 */

import { Pool, QueryResult, QueryResultRow } from 'pg'

// Singleton pool — reuse across serverless function invocations
// In development, Next.js clears the module cache on every change,
// which creates orphaned pools and exhausts database connections.
// We must store the pool on the global object to persist across HMR.
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined
}

function getPool(): Pool {
  if (!globalForDb.pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set.')
    }
    
    // DEBUG: check what the parsed URL looks like inside Next.js
    console.log('[db] Initialising pool with URL:', connectionString)

    const newPool = new Pool({
      connectionString,
      // Supabase requires SSL
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000, // Increased timeout just in case
    })

    newPool.on('error', (err) => {
      // Log pool errors without exposing connection details
      console.error('[db] Unexpected pool error. Reconnecting on next query.', err.message)
    })
    
    globalForDb.pool = newPool
  }
  return globalForDb.pool
}

/**
 * Execute a parameterised query and return typed rows.
 * Always use this helper — never call pool.query() directly outside this file.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const client = getPool()
  return client.query<T>(text, params)
}

/**
 * Run multiple statements inside a single transaction.
 * The callback receives a connected client; commit/rollback are handled here.
 */
export async function withTransaction<T>(
  fn: (client: import('pg').PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

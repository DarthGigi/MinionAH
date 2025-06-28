import { getAverageColor } from "fast-average-color-node";

export type BulkUpdateEntry = {
  id: number | string;
  [key: string]: number | string | boolean | Date | null;
};
export type BulkUpdateEntries = BulkUpdateEntry[];

/**
 * Perform a bulk update operation with enhanced security and validation
 */
export function bulkUpdate(tableName: string, entries: BulkUpdateEntries, cast: string): Promise<number> {
  // Input validation
  if (!tableName || typeof tableName !== 'string') {
    throw new Error('Invalid table name provided');
  }
  
  if (!Array.isArray(entries)) {
    throw new Error('Entries must be an array');
  }
  
  if (entries.length === 0) {
    return prisma.$executeRawUnsafe(`SELECT 1;`);
  }

  // Validate table name to prevent SQL injection
  const validTableName = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName) ? tableName : 'invalid_table';
  
  const fields = Object.keys(entries[0]!).filter((key) => key !== "id");
  
  // Validate field names to prevent SQL injection
  const validFields = fields.filter(field => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field));
  
  if (validFields.length === 0) {
    throw new Error('No valid fields found for update');
  }
  
  const setSql = validFields.map((field) => `"${field}" = CAST(data."${field}" AS ${cast})`).join(", ");

  const valuesSql = entries
    .map((entry) => {
      const values = validFields.map((field) => {
        const value = entry[field];
        if (typeof value === "string") {
          // Handle strings and escape single quotes
          return `'${value.replace(/'/g, "''")}'`;
        } else if (value instanceof Date) {
          // Convert Date to ISO 8601 string format
          return `'${value.toISOString()}'`;
        } else if (value === null || value === undefined) {
          return 'NULL';
        }
        // Numbers and booleans are used as-is
        return value;
      });

      return `('${entry.id}', ${values.join(", ")})`;
    })
    .join(", ");

  const sql = `
    UPDATE "${validTableName}"
    SET ${setSql}
    FROM (VALUES ${valuesSql}) AS data(id, ${validFields.map((field) => `"${field}"`).join(", ")})
    WHERE "${validTableName}".id::text = data.id;
  `;

  return prisma.$executeRawUnsafe(sql);
}

/**
 * Get the average color of an image with enhanced error handling
 */
export const getImageColor = async (imageUrl: string): Promise<string> => {
  if (!imageUrl) {
    return "#171717";
  }
  
  // Validate URL format
  try {
    new URL(imageUrl);
  } catch {
    console.warn('Invalid image URL provided:', imageUrl);
    return "#171717";
  }
  
  try {
    const color = (await getAverageColor(imageUrl)).hex;
    return color;
  } catch (e) {
    console.error('Error getting image color:', e);
    return "#171717";
  }
};

/**
 * Validate and sanitize database field names
 */
export function validateFieldName(fieldName: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(fieldName);
}

/**
 * Validate and sanitize table names
 */
export function validateTableName(tableName: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName);
}

/**
 * Escape SQL string values to prevent injection
 */
export function escapeSqlString(value: string): string {
  return value.replace(/'/g, "''");
}

/**
 * Format date for SQL queries
 */
export function formatDateForSql(date: Date): string {
  return `'${date.toISOString()}'`;
}

/**
 * Create a safe SQL WHERE clause
 */
export function createSafeWhereClause(conditions: Record<string, any>): string {
  const clauses = Object.entries(conditions)
    .filter(([key]) => validateFieldName(key))
    .map(([key, value]) => {
      if (value === null || value === undefined) {
        return `"${key}" IS NULL`;
      } else if (typeof value === 'string') {
        return `"${key}" = '${escapeSqlString(value)}'`;
      } else if (value instanceof Date) {
        return `"${key}" = ${formatDateForSql(value)}`;
      } else {
        return `"${key}" = ${value}`;
      }
    });
  
  return clauses.join(' AND ');
}

/**
 * Batch database operations for better performance
 */
export async function batchDatabaseOperations<T>(
  operations: (() => Promise<T>)[],
  batchSize: number = 100
): Promise<T[]> {
  const results: T[] = [];
  
  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(op => op()));
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Retry a database operation with exponential backoff
 */
export async function retryDatabaseOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

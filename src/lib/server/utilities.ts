import { type PrismaPromise } from "$generated/prisma";
import { getAverageColor } from "fast-average-color-node";

export type BulkUpdateEntry = {
  id: number | string;
  [key: string]: number | string | boolean | Date;
};
export type BulkUpdateEntries = BulkUpdateEntry[];

export function bulkUpdate(tableName: string, entries: BulkUpdateEntries, cast: string): PrismaPromise<number> {
  if (entries.length === 0) return prisma.$executeRawUnsafe(`SELECT 1;`);

  const fields = Object.keys(entries[0]!).filter((key) => key !== "id");
  const setSql = fields.map((field) => `"${field}" = CAST(data."${field}" AS ${cast})`).join(", ");

  const valuesSql = entries
    .map((entry) => {
      const values = fields.map((field) => {
        const value = entry[field];
        if (typeof value === "string") {
          // Handle strings and escape single quotes
          return `'${value.replace(/'/g, "''")}'`;
        } else if (value instanceof Date) {
          // Convert Date to ISO 8601 string format
          return `'${value.toISOString()}'`;
        }
        // Numbers and booleans are used as-is
        return value;
      });

      return `('${entry.id}', ${values.join(", ")})`;
    })
    .join(", ");

  const sql = `
    UPDATE "${tableName}"
    SET ${setSql}
    FROM (VALUES ${valuesSql}) AS data(id, ${fields.map((field) => `"${field}"`).join(", ")})
    WHERE "${tableName}".id::text = data.id;
  `;

  return prisma.$executeRawUnsafe(sql);
}

export const getImageColor = async (imageUrl: string): Promise<string> => {
  if (!imageUrl) {
    return "#171717";
  }
  try {
    const color = (await getAverageColor(imageUrl)).hex;
    return color;
  } catch (e) {
    console.error(e);
    return "#171717";
  }
};

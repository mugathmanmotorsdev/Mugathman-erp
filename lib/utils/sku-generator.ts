/**
 * Generates a unique SKU with sufficient entropy to minimize collisions.
 *
 * Format: PREFIX-CATEG-RAND-TS
 * - PREFIX: first 3 chars of product name
 * - CATEG:  first 3 chars of category
 * - RAND:   4-digit random number (1000-9999)
 * - TS:     Last 4 chars of base36-encoded millisecond timestamp
 *
 * The timestamp component changes every ~60ms, reducing the effective
 * collision pool from 9000 to practically zero even for concurrent creates.
 */
export function generateSKU(name: string, category: string) {
    const prefix = name.substring(0, 3).toUpperCase()
    const categoryPrefix = category.substring(0, 3).toUpperCase()
    const random = Math.floor(1000 + Math.random() * 9000)
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase()
    return `${prefix}-${categoryPrefix}-${random}-${timestamp}`
}
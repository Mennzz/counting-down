import { snakeToCamel } from "./utils";
import { toUtcISOString } from "./time";

// Walk a value and normalize any date-like fields to UTC ISO strings
function normalizeDates(value: any): any {
    if (Array.isArray(value)) return value.map(normalizeDates);
    if (value && typeof value === "object") {
        const out: any = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = normalizeDatesField(k, v);
        }
        return out;
    }
    return value;
}

function isLikelyDateKey(key: string): boolean {
    // Common camelCase API keys: createdAt, updatedAt, departureAt, arrivalAt, ...
    return /At$|Date$/.test(key);
}

function isLikelyDateString(val: unknown): val is string {
    if (typeof val !== "string") return false;
    // Quick check for date-like patterns to avoid touching arbitrary strings
    return (
        /\d{4}-\d{2}-\d{2}/.test(val) || // 2025-11-18
        /T\d{2}:\d{2}:\d{2}/.test(val) || // T time
        /^[0-9]{10,13}$/.test(val) // epoch seconds/ms
    );
}

function normalizeDatesField(key: string, val: any): any {
    if (Array.isArray(val) || (val && typeof val === "object")) return normalizeDates(val);
    if (isLikelyDateKey(key) && (isLikelyDateString(val) || typeof val === "number")) {
        try {
            return toUtcISOString(val);
        } catch {
            return val;
        }
    }
    return val;
}

export async function processResponse<T = any>(data: any): Promise<T> {
    // Convert snake_case → camelCase first
    const camel = snakeToCamel<T>(data);
    // Normalize date-like fields to UTC ISO strings
    const normalized = normalizeDates(camel);
    return normalized as T;
}
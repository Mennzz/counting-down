import { snakeToCamel } from "./utils";
import { toUtcISOString } from "./time";

type Normalizable = unknown;

// Walk a value and normalize any date-like fields to UTC ISO strings
function normalizeDates(value: Normalizable): Normalizable {
    if (Array.isArray(value)) {
        return value.map((item) => normalizeDates(item));
    }

    if (value && typeof value === "object") {
        const input = value as Record<string, Normalizable>;
        const out: Record<string, Normalizable> = {};

        for (const [key, val] of Object.entries(input)) {
            out[key] = normalizeDatesField(key, val);
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
        /^[0-9]{10,13}$/.test(val)
    );
}

function normalizeDatesField(key: string, val: Normalizable): Normalizable {
    if (Array.isArray(val) || (val && typeof val === "object")) {
        return normalizeDates(val);
    }

    if (isLikelyDateKey(key) && (isLikelyDateString(val) || typeof val === "number")) {
        try {
            return toUtcISOString(val);
        } catch {
            return val;
        }
    }

    return val;
}

export async function processResponse<T = unknown>(data: unknown): Promise<T> {
    // Convert snake_case → camelCase first
    const camelData = snakeToCamel(data) as Normalizable;
    // Normalize date-like fields to UTC ISO strings
    const normalized = normalizeDates(camelData);
    return normalized as T;
}
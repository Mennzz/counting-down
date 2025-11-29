// Utilities for parsing and formatting dates safely in UTC

// Treats various API date formats as UTC and returns a Date (UTC instant)
export function parseApiDateUtc(value: string | number | Date): Date {
	if (value instanceof Date) return value;

	// Epoch numbers or numeric strings
	if (typeof value === "number" || /^\d+$/.test(value)) {
		const n = typeof value === "number" ? value : Number(value);
		// Heuristic: 10 digits = seconds, 13 digits = ms
		const ms = n < 1e12 ? n * 1000 : n;
		return new Date(ms);
	}

	const s = value.trim();

	// Already has a timezone (Z or ±hh:mm) → Date will parse as UTC instant
	if (/[zZ]|[+-]\d{2}:\d{2}$/.test(s)) return new Date(s);

	// Date-only (assume midnight UTC)
	const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/;
	const m1 = s.match(dateOnly);
	if (m1) {
		const [_, y, mo, d] = m1;
		return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 0, 0, 0));
	}

	// Common “naive” datetime: treat as UTC
	// Normalize separators (Safari dislikes space; ensure 'T')
	const naive = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?)$/;
	const m2 = s.match(naive);
	if (m2) return new Date(`${m2[1]}T${m2[2]}Z`);

	// Fallback: if no timezone present, assume UTC by appending Z safely
	if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(s)) {
		const normalized = s.replace(" ", "T");
		return new Date(`${normalized}Z`);
	}

	return new Date(s);
}

// Return ISO string in UTC for consistent storage/transport
export function toUtcISOString(value: string | number | Date): string {
	return parseApiDateUtc(value).toISOString();
}

// Format a Date in UTC for display
export function formatUtc(
	d: Date,
	locale = "en-US",
	options: Intl.DateTimeFormatOptions = {
		dateStyle: "medium",
		timeStyle: "short",
	}
): string {
	return new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...options }).format(d);
}


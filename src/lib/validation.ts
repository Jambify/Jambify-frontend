// Simple input validation and sanitization helpers
export const MAX_NAME_LENGTH = 60;
export const MAX_UNI_LENGTH = 120;
export const MAX_EMAIL_LENGTH = 254;
export const MAX_TEXT_LENGTH = 2000;
export const MAX_TITLE_LENGTH = 120;

// Truncate input to a maximum length and collapse excessive whitespace
export function truncateInput(value: string, max = 100) {
    if (!value) return "";
    // collapse multiple spaces
    const collapsed = value.replace(/\s+/g, " ").trimStart();
    if (collapsed.length <= max) return collapsed;
    return collapsed.slice(0, max);
}

// Basic name validation: allow letters, numbers, spaces, hyphens, and common punctuation
export function validateName(value: string) {
    if (!value) return false;
    const v = value.trim();
    if (v.length === 0) return false;
    // allow letters, numbers, spaces, hyphens, apostrophes, and dots
    return /^[\p{L}0-9 .'-]+$/u.test(v);
}


export function normalizePrefix(value: unknown): string | null {
  if (!value) return null;
  
  const strValue = String(value).toUpperCase().trim();
  
  // Remove all non-alphanumeric characters except hyphen
  let cleaned = strValue.replace(/[^A-Z0-9-]/g, '');
  
  // If it's in the format Letters followed by Numbers without a hyphen (e.g. VO15203)
  // or with multiple spaces/hyphens, we want to normalize it to VO-15203
  
  // First, remove any existing hyphens to have a flat string like VO15203
  const flat = cleaned.replace(/-/g, '');
  
  // Match prefix letters and suffix numbers
  const match = flat.match(/^([A-Z]+)(\d+)$/);
  
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  
  // If it doesn't match the specific letter-number pattern, return the cleaned version if not empty
  return cleaned.length > 0 ? cleaned : null;
}

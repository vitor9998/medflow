/**
 * Normalizes a phone number to the format 55 + digits.
 * Removes all non-numeric characters and ensures it starts with the Brazil country code (55).
 * 
 * @param phone The phone number string to normalize
 * @returns The normalized phone number string
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");
  
  if (digits.length === 0) return "";

  // If it already starts with 55, return it
  if (digits.startsWith("55")) {
    return digits;
  }
  
  // Otherwise, prepend 55
  return `55${digits}`;
}

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

/**
 * Validates if a phone number is a valid Brazilian number.
 * Expected format: 55 + DDD (2 digits) + Number (8 or 9 digits)
 * 
 * @param phone The phone number to validate
 * @returns boolean
 */
export function isValidBrazilPhone(phone: string): boolean {
  if (!phone) return false;

  const cleaned = phone.replace(/\D/g, "");

  console.log("📞 VALIDANDO TELEFONE:", cleaned);

  // Deve ter entre 12 e 13 dígitos (55 + DDD + número)
  if (cleaned.length < 12 || cleaned.length > 13) {
    return false;
  }

  // Deve começar com 55
  if (!cleaned.startsWith("55")) {
    return false;
  }

  const ddd = cleaned.slice(2, 4);

  // DDD deve ser entre 11 e 99
  const dddNum = parseInt(ddd);
  if (dddNum < 11 || dddNum > 99) {
    return false;
  }

  const number = cleaned.slice(4);

  // Número deve ter 8 ou 9 dígitos
  if (number.length < 8 || number.length > 9) {
    return false;
  }

  return true;
}

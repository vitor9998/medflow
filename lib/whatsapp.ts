/**
 * Utilitários para integração com WhatsApp (Evolution API).
 */

/**
 * Formata um número de telefone para o padrão exigido pela Evolution API.
 * - Remove todos os caracteres não numéricos.
 * - Garante que comece com o prefixo do Brasil (55).
 */
export function formatPhone(phone: string): string {
  // Remove tudo que não é dígito
  let cleaned = phone.replace(/\D/g, '');

  // Se não começa com 55, assume que é um número brasileiro sem DDI e adiciona
  if (!cleaned.startsWith('55')) {
    cleaned = `55${cleaned}`;
  }

  return cleaned;
}

/**
 * Validação básica de comprimento para números brasileiros.
 * 55 + DDD + Número (8 ou 9 dígitos) = 12 ou 13 caracteres.
 */
export function isPhoneValid(phone: string): boolean {
  return phone.length >= 12 && phone.length <= 13;
}

/**
 * Normaliza e valida o conteúdo da mensagem.
 */
export function normalizeMessage(message: string): string {
  return message.trim();
}

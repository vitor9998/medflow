/**
 * Parser de intenção para mensagens recebidas via WhatsApp.
 * Utiliza listas de palavras-chave e normalização de texto para identificar
 * se o paciente deseja confirmar, cancelar ou remarcar.
 */

export type Intent = "confirmar" | "cancelar" | "remarcar" | "desconhecido";

const KEYWORDS = {
  confirmar: [
    "sim", "ok", "confirmo", "blz", "pode confirmar", "confirmado", 
    "com certeza", "estarei la", "estarei lá", "confirmar"
  ],
  cancelar: [
    "nao", "não", "cancelar", "nao posso", "não posso", "desistir", 
    "infelizmente nao", "infelizmente não", "cancela", "cancelado"
  ],
  remarcar: [
    "remarcar", "outro horario", "outro horário", "outro dia", "reagendar"
  ]
};

/**
 * Normaliza o texto removendo acentos, caracteres especiais e convertendo para minúsculas.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .trim();
}

/**
 * Analisa uma mensagem e retorna a intenção detectada.
 */
export function parseIntent(message: string): Intent {
  if (!message) return "desconhecido";

  const normalized = normalizeText(message);

  // 1. Verificar Remarcação (Prioridade alta pois geralmente contém "não" ou "não posso")
  if (KEYWORDS.remarcar.some((k: string) => normalized.includes(normalizeText(k)))) {
    return "remarcar";
  }

  // 2. Verificar Cancelamento
  if (KEYWORDS.cancelar.some((k: string) => normalized.includes(normalizeText(k)))) {
    return "cancelar";
  }

  // 3. Verificar Confirmação
  if (KEYWORDS.confirmar.some((k: string) => normalized.includes(normalizeText(k)))) {
    return "confirmar";
  }

  return "desconhecido";
}

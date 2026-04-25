export interface ConsultaLembrete {
  nome: string;
  data: string;
  hora: string;
}

/**
 * Constrói a mensagem padrão de lembrete para ser utilizada em todos os canais.
 */
export function buildMensagemLembrete(consulta: ConsultaLembrete): string {
  const dataFormatada = consulta.data?.split("-").reverse().join("/");
  return `Olá ${consulta.nome}, você tem consulta em ${dataFormatada} às ${consulta.hora}. Confirma presença?`;
}

/**
 * Determina qual o melhor canal de comunicação para um paciente.
 * Prioridade: Telefone (WhatsApp) > Email.
 */
export function determinarCanalComunicacao(consulta: { telefone?: string; email?: string }): "whatsapp" | "email" | "sem_canal" {
  if (consulta.telefone) {
    return "whatsapp";
  }
  if (consulta.email) {
    return "email";
  }
  return "sem_canal";
}

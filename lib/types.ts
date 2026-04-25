export type Consulta = {
  id: number;
  status: string;
  data: string;
  tentativas_contato: number;
  confirmacao_status: string | null;
  lembrete_enviado?: boolean;
};

export type AgendaActionPayload = {
  id: number;
};

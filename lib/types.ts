export type Consulta = {
  id: number;
  nome: string;
  telefone: string;
  email: string | null;
  status: string;
  data: string;
  hora: string;
  tentativas_contato: number;
  confirmacao_status: string | null;
  lembrete_enviado?: boolean;
};

export type AgendaActionPayload = {
  id: number;
};

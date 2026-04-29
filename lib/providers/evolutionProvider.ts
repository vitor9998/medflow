/**
 * Provider para abstração da Evolution API.
 * Isola a lógica de rede e autenticação específica do fornecedor.
 */
export class EvolutionProvider {
  private apiUrl = process.env.EVOLUTION_API_URL;
  private apiKey = process.env.EVOLUTION_API_KEY;
  private instance = process.env.EVOLUTION_INSTANCE;

  /**
   * Envia uma mensagem de texto simples via Evolution API.
   */
  async sendMessage(phone: string, message: string) {
    if (!this.apiUrl || !this.apiKey || !this.instance) {
      throw new Error('Configuração da Evolution API ausente no ambiente');
    }

    const url = `${this.apiUrl}/message/sendText/${this.instance}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey
      },
      body: JSON.stringify({
        number: phone,
        textMessage: {
          text: message
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Evolution API retornou status ${response.status}`);
    }

    return data;
  }

  /**
   * Verifica se a instância está conectada.
   */
  async isConnected(): Promise<boolean> {
    if (!this.apiUrl || !this.apiKey || !this.instance) return false;

    try {
      const url = `${this.apiUrl}/instance/connectionState/${this.instance}`;
      const response = await fetch(url, {
        headers: { 'apikey': this.apiKey }
      });

      if (!response.ok) return false;

      const data = await response.json();
      // O status esperado é "open" ou "CONNECTED" dependendo da versão da Evolution API
      // Geralmente retorna { instance: { state: "open" } } ou similar
      return data.instance?.state === 'open' || data.instance?.connectionStatus === 'CONNECTED';
    } catch (error) {
      console.error('[EvolutionProvider] Erro ao verificar conexão:', error);
      return false;
    }
  }
}

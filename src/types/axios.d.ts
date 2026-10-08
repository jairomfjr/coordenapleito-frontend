import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * Quando true, erros HTTP 403 desta requisição podem ser ignorados na UI
     * (ex.: prefetch de combos que nem todo perfil pode acessar). Use com {@link toastApiError}.
     */
    silentForbidden?: boolean;
    /**
     * Não envia o header {@code X-Equipment-Context-ID} (ex.: listagens para troca de contexto
     * ou associação de equipamentos no cadastro de usuário).
     */
    skipEquipmentContext?: boolean;
  }
}

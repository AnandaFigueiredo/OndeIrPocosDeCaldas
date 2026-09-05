// MOCK AUTH - SUBSTITUIR POR SUPABASE AUTH.
// Apenas navegação de desenvolvimento. Não protege dados, APIs ou localStorage.
const KEY = 'ondeir.mock-session';
export const authService = {
  isAuthenticated: () => sessionStorage.getItem(KEY) === 'demo',
  async login(email, password) {
    if (email.trim().toLowerCase() !== 'admin@example.com' || password !== 'demo123') throw new Error('E-mail ou senha de demonstração incorretos.');
    sessionStorage.setItem(KEY, 'demo');
  },
  logout() { sessionStorage.removeItem(KEY); },
};

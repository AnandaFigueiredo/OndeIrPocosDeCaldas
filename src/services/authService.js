import { isMockMode, requireSupabase, supabase } from '../lib/supabase';
const KEY = 'ondeir.mock-session';
export const authService = {
  async getSession() {
    if (isMockMode) return sessionStorage.getItem(KEY) === 'demo' ? { user: { id: 'demo', email: 'admin@example.com' } } : null;
    const { data, error } = await requireSupabase().auth.getSession();
    if (error) throw new Error('Não foi possível verificar sua sessão. Entre novamente.');
    return data.session;
  },
  async getUser() {
    if (isMockMode) return (await this.getSession())?.user || null;
    const { data, error } = await requireSupabase().auth.getUser();
    if (error) throw new Error('Não foi possível verificar sua conta. Entre novamente.');
    return data.user;
  },
  async isAuthenticated() {
    if (isMockMode) return sessionStorage.getItem(KEY) === 'demo';
    const client = requireSupabase();
    const { data: { session }, error } = await client.auth.getSession();
    if (error) throw new Error('Não foi possível verificar sua sessão. Entre novamente.');
    if (!session) return false;
    const { data: admin, error: permissionError } = await client.rpc('is_admin');
    if (permissionError) throw new Error('Não foi possível verificar o acesso administrativo. Confira a configuração do banco.');
    if (admin !== true) {
      await client.auth.signOut({ scope: 'local' });
      throw new Error('Seu usuário não possui acesso administrativo.');
    }
    return true;
  },
  async signIn(email, password) {
    if (isMockMode) {
      // MOCK AUTH restrito ao desenvolvimento sem conexão ativa.
      if (email.trim().toLowerCase() !== 'admin@example.com' || password !== 'demo123') throw new Error('E-mail ou senha de demonstração incorretos.');
      sessionStorage.setItem(KEY, 'demo'); return;
    }
    const client = requireSupabase();
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(error.code === 'email_not_confirmed' ? 'Confirme o e-mail da conta antes de entrar.' : 'Não foi possível entrar. Confira o e-mail, a senha e sua conexão.');
    try { if (!await this.isAuthenticated()) throw new Error('Esta conta não tem acesso ao painel. Solicite a liberação à administradora do projeto.'); }
    catch (error) { await client.auth.signOut({ scope: 'local' }); throw error; }
  },
  async signOut() {
    if (isMockMode) { sessionStorage.removeItem(KEY); return; }
    const { error } = await requireSupabase().auth.signOut({ scope: 'local' });
    if (error) throw new Error('Não foi possível sair. Verifique a conexão e tente novamente.');
  },
  login(email, password) { return this.signIn(email, password); },
  logout() { return this.signOut(); },
  subscribe(callback) {
    if (!supabase) return () => {};
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => callback());
    return () => subscription.unsubscribe();
  },
};

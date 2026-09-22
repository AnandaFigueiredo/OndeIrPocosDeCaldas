import { createClient } from '@supabase/supabase-js';
const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
export const isMockMode = import.meta.env.DEV && import.meta.env.VITE_DATA_MODE === 'mock';
export const isSupabaseMode = !isMockMode && /^https:\/\/[^/]+\/?$/.test(url) && key.startsWith('sb_publishable_');
export const configurationError = isSupabaseMode || isMockMode ? '' : 'Conexão ainda não configurada. Informe a URL e a chave pública do Supabase nas variáveis de ambiente.';
export const supabase = isSupabaseMode ? createClient(url.replace(/\/$/, ''), key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }) : null;
// A vitrine consulta como visitante mesmo quando uma administradora está logada.
// Assim, a policy pública continua sendo a autoridade sobre campanhas visíveis.
export const publicSupabase = isSupabaseMode ? createClient(url.replace(/\/$/, ''), key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'ondeir-public' } }) : null;
export function requireSupabase() { if (!supabase) throw new Error(configurationError || 'O Supabase não está ativo neste ambiente.'); return supabase; }
export function requirePublicSupabase() { requireSupabase(); return publicSupabase; }

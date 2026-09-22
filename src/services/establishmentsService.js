import { isMockMode, requireSupabase } from '../lib/supabase';
import { establishmentsSupabaseService } from './establishmentsSupabaseService';
async function adapter() {
  if (isMockMode) return (await import('./establishmentsMockService')).establishmentsService;
  requireSupabase(); return establishmentsSupabaseService;
}
export const establishmentsService = Object.fromEntries(['getAll', 'getPublic', 'getById', 'getBySlug', 'create', 'update', 'remove', 'toggleStatus'].map(method => [method, async (...args) => (await adapter())[method](...args)]));
export async function resetMockData() {
  if (!isMockMode) throw new Error('Restauração permitida somente no modo de demonstração local.');
  return (await import('./establishmentsMockService')).resetMockData();
}

import { requireSupabase, requirePublicSupabase } from '../lib/supabase';
import { fromDatabase, toDatabase, databaseError } from './establishmentsMapper';
import { uploadMedia, discardUploads, validateMedia, mediaPaths } from './mediaService';
import { removeFiles, removeEstablishmentFiles } from './storageService';
import { authService } from './authService';

function changed() { window.dispatchEvent(new Event('establishments-changed')); }
async function fail(error) {
  if (error?.code === '42501' || error?.status === 403) {
    await authService.signOut().catch(() => {});
    throw new Error('Seu usuário não possui acesso administrativo.');
  }
  throw databaseError(error);
}
async function list(client) {
  const all = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from('establishments').select('*')
      .order('display_order', { ascending: true }).order('created_at', { ascending: false }).order('id').range(offset, offset + 499);
    if (error) await fail(error);
    all.push(...data.map(fromDatabase));
    if (data.length < 500) return all;
  }
}
async function saveMediaAndFields(id, input, old) {
  validateMedia(input);
  toDatabase(input);
  const uploaded = await uploadMedia(input, id);
  let data;
  try {
    const result = await requireSupabase().from('establishments').update(toDatabase(uploaded.data)).eq('id', id).select().single();
    if (result.error) await fail(result.error);
    data = fromDatabase(result.data);
  } catch (error) { await discardUploads(uploaded.uploadedPaths); throw error; }
  const kept = new Set(mediaPaths(data));
  const cleaned = old ? await removeFiles(mediaPaths(old).filter(path => !kept.has(path))) : true;
  changed();
  return { ...data, ...(cleaned ? {} : { storageWarning: 'Alterações salvas. Algumas imagens antigas não puderam ser removidas do armazenamento.' }) };
}
export const establishmentsSupabaseService = {
  getAll: () => list(requireSupabase()),
  getPublic: () => list(requirePublicSupabase()),
  async getById(id) {
    const { data, error } = await requireSupabase().from('establishments').select('*').eq('id', id).maybeSingle();
    if (error) await fail(error);
    return fromDatabase(data);
  },
  async getBySlug(slug) {
    const { data, error } = await requirePublicSupabase().from('establishments').select('*').eq('slug', slug).maybeSingle();
    if (error) await fail(error);
    return fromDatabase(data);
  },
  async create(input) {
    validateMedia(input);
    const payload = toDatabase(input);
    // O registro permanece inativo até todas as imagens e campos serem salvos.
    const { data, error } = await requireSupabase().from('establishments').insert({ ...payload, is_active: false, logo_url: '', cover_image_url: '', gallery: [] }).select().single();
    if (error) await fail(error);
    try { return await saveMediaAndFields(data.id, input); }
    catch (error) {
      // Se não conseguirmos desfazer, preserve o ID para retomar a edição sem duplicar.
      let removed = false;
      try {
        const rollback = await requireSupabase().from('establishments').delete().eq('id', data.id).select('id');
        removed = !rollback.error && rollback.data?.length === 1;
      } catch { /* O erro abaixo orienta a recuperação do cadastro. */ }
      if (!removed) { error.createdId = data.id; error.message += ' O cadastro foi mantido inativo. Abra a edição para concluir.'; }
      changed(); throw error;
    }
  },
  async update(id, input) {
    const old = await this.getById(id);
    if (!old) throw new Error('Cadastro não encontrado.');
    return saveMediaAndFields(id, { ...old, ...input }, old);
  },
  async remove(id) {
    const { data, error } = await requireSupabase().from('establishments').delete().eq('id', id).select('id');
    if (error) await fail(error);
    if (!data.length) throw new Error('Cadastro não encontrado ou acesso não autorizado.');
    const cleaned = await removeEstablishmentFiles(id);
    changed();
    return { warning: cleaned ? '' : 'Cadastro excluído. Algumas imagens não puderam ser removidas do armazenamento.' };
  },
  async toggleStatus(id, isActive) {
    if (typeof isActive !== 'boolean') { const old = await this.getById(id); if (!old) throw new Error('Cadastro não encontrado.'); isActive = !old.isActive; }
    const { data, error } = await requireSupabase().from('establishments').update({ is_active: isActive }).eq('id', id).select().single();
    if (error) await fail(error);
    changed(); return fromDatabase(data);
  },
};

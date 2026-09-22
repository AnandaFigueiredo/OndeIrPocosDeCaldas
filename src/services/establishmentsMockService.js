import { establishments, emptyEstablishment } from '../data/establishments';
import { CATEGORIES, getActiveEstablishments, getEstablishmentBySlug, slugify, safeUrl } from '../utils/establishments';
const KEY = 'ondeir.establishments.v1';
function read() {
  const stored = localStorage.getItem(KEY);
  if (!stored) { localStorage.setItem(KEY, JSON.stringify(establishments)); return structuredClone(establishments); }
  const parsed = JSON.parse(stored);
  if (!Array.isArray(parsed)) throw new Error('Os dados locais não puderam ser lidos. Preserve seus dados antes de restaurar a demonstração.');
  return parsed;
}
function write(items) {
  try { localStorage.setItem(KEY, JSON.stringify(items)); }
  catch { throw new Error('Não foi possível salvar no navegador. Reduza as imagens ou verifique o espaço disponível.'); }
  window.dispatchEvent(new Event('establishments-changed'));
}
function validate(data, all, id) {
  const item = { ...emptyEstablishment, ...data, name: data.name.trim(), slug: slugify(data.slug || data.name) };
  if (!item.name || !CATEGORIES.includes(item.category) || !item.slug) throw new Error('Informe nome, slug e categoria válidos.');
  if (all.some(other => other.slug === item.slug && other.id !== id)) throw new Error('Este slug já está em uso. Escolha outro.');
  if (item.startDate && item.endDate && item.startDate > item.endDate) throw new Error('A data final deve ser igual ou posterior à inicial.');
  for (const key of ['instagram', 'website', 'mapsUrl']) if (item[key] && !safeUrl(item[key])) throw new Error('Use links completos começando com https:// ou http://.');
  if (!['standard', 'featured', 'premium'].includes(item.placementType)) throw new Error('Tipo de destaque inválido.');
  if (!Number.isFinite(Number(item.displayOrder)) || Number(item.displayOrder) < 0) throw new Error('Informe uma ordem de exibição válida.');
  item.displayOrder = Number(item.displayOrder);
  return item;
}
// Adaptador local assíncrono. Substituir as implementações por consultas Supabase.
export const establishmentsService = {
  async getAll() { return read().sort((a, b) => a.displayOrder - b.displayOrder); },
  async getPublic() { return getActiveEstablishments(read()); },
  async getById(id) { return read().find(item => item.id === id) || null; },
  async getBySlug(slug) { return getEstablishmentBySlug(read(), slug); },
  async create(data) { const all = read(); const now = new Date().toISOString(); const item = { ...validate(data, all), id: crypto.randomUUID(), createdAt: now, updatedAt: now }; write([...all, item]); return item; },
  async update(id, data) { const all = read(); const old = all.find(item => item.id === id); if (!old) throw new Error('Cadastro não encontrado.'); const item = { ...validate({ ...old, ...data }, all, id), id, createdAt: old.createdAt, updatedAt: new Date().toISOString() }; write(all.map(other => other.id === id ? item : other)); return item; },
  async remove(id) { write(read().filter(item => item.id !== id)); },
  async toggleStatus(id, isActive) { const item = await this.getById(id); if (!item) throw new Error('Cadastro não encontrado.'); return this.update(id, { isActive: typeof isActive === 'boolean' ? isActive : !item.isActive }); },
};
export async function resetMockData() {
  if (!import.meta.env.DEV) throw new Error('Restauração disponível somente em desenvolvimento.');
  write(structuredClone(establishments));
}

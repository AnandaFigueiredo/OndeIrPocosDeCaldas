import { emptyEstablishment } from '../data/emptyEstablishment';
import { CATEGORIES, slugify, safeUrl } from '../utils/establishments';
const fields = {
  id: 'id', name: 'name', slug: 'slug', category: 'category', subcategory: 'subcategory',
  shortDescription: 'short_description', description: 'description', logo: 'logo_url', coverImage: 'cover_image_url',
  gallery: 'gallery', phone: 'phone', whatsapp: 'whatsapp', address: 'address', number: 'address_number',
  neighborhood: 'neighborhood', city: 'city', state: 'state', zipCode: 'cep', mapsUrl: 'maps_url',
  instagram: 'instagram_url', website: 'website_url', openingHours: 'opening_hours',
  badge: 'badge', placementType: 'placement_type', displayOrder: 'display_order', isActive: 'is_active',
  startDate: 'start_date', endDate: 'end_date', createdAt: 'created_at', updatedAt: 'updated_at',
};
export const fromDatabase = row => row ? { ...emptyEstablishment, ...Object.fromEntries(Object.entries(fields).map(([key, column]) => [key, row[column] ?? emptyEstablishment[key] ?? null])) } : null;
export function toDatabase(data) {
  const item = { ...emptyEstablishment, ...data };
  item.name = item.name.trim(); item.slug = slugify(item.slug || item.name);
  item.startDate = item.startDate || null; item.endDate = item.endDate || null;
  if (!item.name || !item.slug || !CATEGORIES.includes(item.category)) throw new Error('Informe nome, slug e categoria válidos.');
  if (item.startDate && item.endDate && item.startDate > item.endDate) throw new Error('A data final deve ser igual ou posterior à inicial.');
  if (!['standard', 'featured', 'premium'].includes(item.placementType)) throw new Error('Tipo de destaque inválido.');
  item.displayOrder = Number(item.displayOrder);
  if (!Number.isSafeInteger(item.displayOrder) || item.displayOrder < 0) throw new Error('Informe uma ordem de exibição inteira e não negativa.');
  for (const key of ['instagram', 'website', 'mapsUrl']) if (item[key] && !safeUrl(item[key])) throw new Error('Use links completos começando com https:// ou http://.');
  if (item.gallery.length > 8) throw new Error('A galeria aceita até 8 imagens.');
  return Object.fromEntries(Object.entries(fields).filter(([key]) => !['id', 'createdAt', 'updatedAt'].includes(key)).map(([key, column]) => [column, item[key]]));
}
export function databaseError(error) {
  if (error?.code === '23505') return new Error('Este slug já está em uso. Escolha outro.');
  if (error?.code === '42501' || error?.status === 403) return new Error('Sem permissão para alterar este cadastro. Entre com uma conta administradora.');
  if (error?.code === '23514') return new Error('Confira os campos, datas e links do cadastro. Um valor não foi aceito pelo banco.');
  return new Error('Não foi possível concluir a operação. Verifique sua conexão e tente novamente.');
}

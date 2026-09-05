import { today } from './dates';
export const CATEGORIES = ['Gastronomia', 'Cafés', 'Bares', 'Compras', 'Hospedagem', 'Passeios', 'Experiências', 'Serviços', 'Eventos'];
export const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const safeUrl = value => { try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
export const safeImage = value => /^(data:image\/(png|jpeg|webp|gif);base64,|blob:|\/images\/)/i.test(value || '') ? value : safeUrl(value);
export function campaignStatus(item, now = today()) {
  if (!item.isActive) return 'INATIVO';
  if (item.endDate && item.endDate < now) return 'EXPIRADO';
  if (item.startDate && item.startDate > now) return 'AGENDADO';
  return 'ATIVO';
}
export const isCampaignActive = (item, now) => campaignStatus(item, now) === 'ATIVO';
export const getActiveEstablishments = (items, now) => items.filter(item => isCampaignActive(item, now)).sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
export const getFeaturedEstablishments = (items, now) => getActiveEstablishments(items, now).filter(item => item.placementType !== 'standard');
export const getEstablishmentBySlug = (items, slug, now) => getActiveEstablishments(items, now).find(item => item.slug === slug) || null;
export const filterEstablishments = (items, { query = '', category = 'Todos' } = {}) => items.filter(item => (category === 'Todos' || item.category === category) && slugify(item.name).includes(slugify(query)));

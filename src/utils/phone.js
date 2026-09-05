export function normalizePhone(value = '') {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}
export const phoneUrl = value => normalizePhone(value) ? `tel:+${normalizePhone(value)}` : '';
export const whatsappUrl = value => normalizePhone(value) ? `https://wa.me/${normalizePhone(value)}` : '';
export function formatPhone(value = '') {
  const digits = value.replace(/\D/g, '');
  const local = digits.startsWith('55') && digits.length > 11 ? digits.slice(2) : digits;
  return local.length === 10 || local.length === 11 ? `(${local.slice(0, 2)}) ${local.slice(2, -4)}-${local.slice(-4)}` : value;
}

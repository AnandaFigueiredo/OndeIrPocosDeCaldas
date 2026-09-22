import { requireSupabase } from '../lib/supabase';

export const MEDIA_BUCKET = 'establishments';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const folders = ['logos', 'covers', 'gallery'];
export function validateImage(file) {
  if (!(file instanceof Blob) || !IMAGE_TYPES.includes(file.type)) throw new Error('Use imagens JPG, PNG ou WebP.');
  if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error('Use imagens de até 5 MB cada.');
}
function safeFilename(file) {
  const base = (file.name || 'imagem').replace(/\.[^.]+$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'imagem';
  return `${base}.${extensions[file.type]}`;
}
export function getPublicUrl(path) { return requireSupabase().storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl; }
async function upload(file, establishmentId, folder) {
  validateImage(file);
  if (!/^[a-zA-Z0-9-]+$/.test(establishmentId)) throw new Error('Salve o cadastro antes de enviar imagens.');
  const path = `${folder}/${establishmentId}/${Date.now()}-${crypto.randomUUID()}-${safeFilename(file)}`;
  const { error } = await requireSupabase().storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type, cacheControl: '3600', upsert: false });
  if (error) throw new Error('Não foi possível enviar a imagem. Confira sua conexão, o limite do arquivo e sua permissão de acesso.');
  return { path, url: getPublicUrl(path) };
}
export const uploadLogo = (file, id) => upload(file, id, 'logos');
export const uploadCover = (file, id) => upload(file, id, 'covers');
export const uploadGalleryImage = (file, id) => upload(file, id, 'gallery');
export async function deleteFile(path) {
  const { error } = await requireSupabase().storage.from(MEDIA_BUCKET).remove([path]);
  if (error) throw new Error('Não foi possível remover a imagem do armazenamento.');
}
export function ownedMediaPath(url, id) {
  try {
    const root = new URL(getPublicUrl(''));
    const value = new URL(url);
    if (value.origin !== root.origin || !value.pathname.startsWith(root.pathname)) return null;
    const path = decodeURIComponent(value.pathname.slice(root.pathname.length));
    return folders.some(folder => path.startsWith(`${folder}/${id}/`)) && !path.split('/').includes('..') ? path : null;
  } catch { return null; }
}
export async function removeFiles(paths) {
  if (!paths.length) return true;
  try {
    const { error } = await requireSupabase().storage.from(MEDIA_BUCKET).remove([...new Set(paths)]);
    if (error) throw error;
    return true;
  } catch { console.warn('O cadastro foi processado, mas algumas imagens não puderam ser removidas do Storage.'); return false; }
}
export async function removeEstablishmentFiles(id) {
  try {
    const bucket = requireSupabase().storage.from(MEDIA_BUCKET), paths = [];
    for (const folder of folders) {
      for (let offset = 0; ; offset += 100) {
        const { data, error } = await bucket.list(`${folder}/${id}`, { limit: 100, offset, sortBy: { column: 'name', order: 'asc' } });
        if (error) throw error;
        paths.push(...data.filter(file => file.id).map(file => `${folder}/${id}/${file.name}`));
        if (data.length < 100) break;
      }
    }
    return await removeFiles(paths);
  } catch { console.warn('O cadastro foi excluído, mas não foi possível limpar suas imagens no Storage.'); return false; }
}

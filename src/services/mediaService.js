import { uploadLogo, uploadCover, uploadGalleryImage, removeFiles, ownedMediaPath, validateImage } from './storageService';
export { MAX_IMAGE_BYTES } from './storageService';
export function validateMedia(data) {
  for (const value of [data.logo, data.coverImage, ...(data.gallery || [])]) {
    if (value instanceof Blob) validateImage(value);
    else if (value && !/^https?:\/\//.test(value)) throw new Error('Selecione novamente a imagem para enviá-la ao armazenamento.');
  }
}
// Arquivos selecionados são enviados somente ao salvar. URLs existentes são preservadas.
export async function uploadMedia(data, establishmentId) {
  const uploadedPaths = [];
  async function upload(source, uploadFile) {
    if (!(source instanceof Blob)) return source || '';
    const result = await uploadFile(source, establishmentId);
    uploadedPaths.push(result.path);
    return result.url;
  }
  try {
    const result = { ...data, logo: await upload(data.logo, uploadLogo), coverImage: await upload(data.coverImage, uploadCover), gallery: [] };
    for (const source of data.gallery || []) result.gallery.push(await upload(source, uploadGalleryImage));
    return { data: result, uploadedPaths };
  } catch (error) { await removeFiles(uploadedPaths); throw error; }
}
export const discardUploads = removeFiles;
export function mediaPaths(item) {
  return [item.logo, item.coverImage, ...(item.gallery || [])].map(url => ownedMediaPath(url, item.id)).filter(Boolean);
}

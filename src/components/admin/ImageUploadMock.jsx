import { useEffect, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { safeImage } from '../../utils/establishments';
export default function ImageUploadMock({ label, value, onChange, multiple = false }) {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [previews, setPreviews] = useState([]);
  const urls = useRef([]);
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);
  const values = multiple ? value || [] : value ? [value] : [];
  async function upload(e) {
    const files = Array.from(e.target.files || []); e.target.value = ''; setError('');
    if (files.some(file => !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 700000)) { setError('Use JPG, PNG, WebP ou GIF de até 700 KB por imagem.'); return; }
    if (multiple && values.length + files.length > 8) { setError('A galeria aceita até 8 imagens.'); return; }
    setBusy(true);
    // SUBSTITUIR POR SUPABASE STORAGE.
    // Object URLs para preview imediato; data URLs para persistência local após recarregar.
    const pending = files.map(file => URL.createObjectURL(file)); urls.current.push(...pending); setPreviews(pending);
    try {
      const images = await Promise.all(files.map(file => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Não foi possível ler a imagem.')); reader.readAsDataURL(file); })));
      onChange(multiple ? [...values, ...images] : images[0] || '');
    } catch (e) { setError(e.message); }
    finally { pending.forEach(URL.revokeObjectURL); urls.current = urls.current.filter(url => !pending.includes(url)); setPreviews([]); setBusy(false); }
  }
  return <div className="image-upload"><label className="upload-label"><Upload size={20} /><span>{label}<small>Selecionar {multiple ? 'imagens' : 'imagem'} · até 700 KB cada</small></span><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple={multiple} disabled={busy} onChange={upload} /></label><div className="upload-previews">{values.map((src, i) => <div key={i}><img src={safeImage(src)} alt={`${label} ${i + 1}`} /><button type="button" aria-label={`Remover ${label.toLowerCase()} ${i + 1}`} onClick={() => onChange(multiple ? values.filter((_, index) => index !== i) : '')}><X size={16} /></button></div>)}{previews.map(src => <img key={src} src={src} alt="Carregando prévia" />)}</div>{error && <p className="admin-error" role="alert">{error}</p>}{busy && <p role="status">Lendo imagens…</p>}</div>;
}

import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { safeImage } from '../../utils/establishments';
import { isMockMode } from '../../lib/supabase';
import { validateImage, IMAGE_TYPES } from '../../services/storageService';

function Preview({ source, label }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!(source instanceof Blob)) { setUrl(source); return; }
    const localUrl = URL.createObjectURL(source); setUrl(localUrl);
    return () => URL.revokeObjectURL(localUrl);
  }, [source]);
  return url ? <img src={safeImage(url)} alt={label} /> : null;
}
export default function ImageUpload({ label, value, onChange, multiple = false, onBusyChange }) {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const values = multiple ? value || [] : value ? [value] : [];
  async function select(e) {
    const files = Array.from(e.target.files || []); e.target.value = ''; setError('');
    if (!files.length || busy) return;
    try {
      files.forEach(validateImage);
      if (isMockMode && files.some(file => file.size > 700000)) throw new Error('No modo de demonstração, use imagens de até 700 KB.');
      if (multiple && values.length + files.length > 8) throw new Error('A galeria aceita até 8 imagens.');
      setBusy(true); onBusyChange?.(true);
      const images = isMockMode ? await Promise.all(files.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.')); reader.readAsDataURL(file);
      }))) : files;
      onChange(multiple ? [...values, ...images] : images[0]);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); onBusyChange?.(false); }
  }
  return <div className="image-upload"><label className="upload-label"><Upload size={20} /><span>{label}<small>Selecionar {multiple ? 'imagens' : 'imagem'} · até {isMockMode ? '700 KB' : '5 MB'} cada</small></span><input type="file" accept={IMAGE_TYPES.join(',')} multiple={multiple} disabled={busy} onChange={select} /></label><div className="upload-previews">{values.map((source, i) => <div key={i}><Preview source={source} label={`${label} ${i + 1}`} /><button type="button" disabled={busy} aria-label={`Remover ${label.toLowerCase()} ${i + 1}`} onClick={() => onChange(multiple ? values.filter((_, index) => index !== i) : '')}><X size={16} /></button></div>)}</div>{error && <p className="admin-error" role="alert">{error}</p>}{busy && <p role="status">Lendo imagens…</p>}</div>;
}

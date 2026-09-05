import { useCallback, useEffect, useState } from 'react';
import { establishmentsService } from '../services/establishmentsService';
export function useEstablishments(publicOnly = false) {
  const [items, setItems] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const refresh = useCallback(async () => { try { setItems(await establishmentsService[publicOnly ? 'getPublic' : 'getAll']()); setError(''); } catch (e) { setError(e.message); } finally { setLoading(false); } }, [publicOnly]);
  useEffect(() => { refresh(); const timer = setInterval(refresh, 30000); window.addEventListener('storage', refresh); window.addEventListener('establishments-changed', refresh); return () => { clearInterval(timer); window.removeEventListener('storage', refresh); window.removeEventListener('establishments-changed', refresh); }; }, [refresh]);
  return { items, loading, error, refresh };
}

import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, Store, LogOut, Menu, X, ArrowUpRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { usePageMeta } from '../../hooks/usePageMeta';
import { BRAND } from '../../config/brand';
import { isMockMode } from '../../lib/supabase';
function AdminDrawer({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current, previous = document.activeElement;
    node.showModal();
    const resize = () => { if (innerWidth > 900) onClose(); };
    window.addEventListener('resize', resize);
    return () => { node.close(); window.removeEventListener('resize', resize); previous?.focus(); };
  }, [onClose]);
  return <dialog ref={ref} className="admin-drawer-dialog" aria-label="Menu do painel" onCancel={e => { e.preventDefault(); onClose(); }}><div className="drawer-heading"><strong>Painel Onde Ir</strong><button autoFocus aria-label="Fechar navegação" onClick={onClose}><X size={22} /></button></div><nav className="admin-drawer" aria-label="Menu mobile"><SidebarLinks /></nav><p>{isMockMode ? <>Ambiente de demonstração.<br />Dados salvos neste navegador.</> : <>Painel administrativo.<br />Dados compartilhados com segurança.</>}</p></dialog>;
}
export function ProtectedRoute({ children }) {
  const [authenticated, setAuthenticated] = useState(false), [checking, setChecking] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    let active = true, timer;
    async function check() {
      try { const allowed = await authService.isAuthenticated(); if (!active) return; setAuthenticated(allowed); setError(''); if (!allowed) window.location.replace('/admin/login'); }
      catch (e) { if (active) { setAuthenticated(false); setError(e.message); } }
      finally { if (active) setChecking(false); }
    }
    check();
    const unsubscribe = authService.subscribe(() => { clearTimeout(timer); timer = setTimeout(check, 0); });
    const interval = setInterval(check, 60000);
    return () => { active = false; clearTimeout(timer); clearInterval(interval); unsubscribe(); };
  }, []);
  if (error) return <main className="container section"><p role="alert">{error}</p><a href="/admin/login" className="text-link">Voltar ao login</a></main>;
  return !checking && authenticated ? children : <p className="container section" role="status">Verificando acesso…</p>;
}
function SidebarLinks() {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function logout() { setBusy(true); try { await authService.logout(); window.location.assign('/admin/login'); } catch (e) { setError(e.message); setBusy(false); } }
  return <><a href="/admin" aria-current={location.pathname === '/admin' ? 'page' : undefined}><LayoutDashboard size={19} />Dashboard</a><a href="/admin/establishments" aria-current={location.pathname.startsWith('/admin/establishments') ? 'page' : undefined}><Store size={19} />Estabelecimentos</a><a href="/lugares" target="_blank" rel="noopener noreferrer"><ArrowUpRight size={19} />Ver vitrine</a><button disabled={busy} onClick={logout}><LogOut size={19} />Sair</button>{error && <p role="alert">{error}</p>}</>;
}
export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  usePageMeta('Painel | Onde Ir Poços de Caldas', 'Painel para administrar estabelecimentos.', true);
  return <ProtectedRoute><div className="admin-shell"><aside className="admin-sidebar"><a className="admin-brand" href="/admin"><img src={BRAND.logo} alt="Onde Ir" /><span>Painel Onde Ir<small>Poços de Caldas</small></span></a><nav aria-label="Painel administrativo"><SidebarLinks /></nav><p>{isMockMode ? <>Ambiente de demonstração<br />Dados salvos neste navegador.</> : <>Painel administrativo<br />Dados salvos no Supabase.</>}</p></aside><div className="admin-main"><header className="admin-header"><button className="admin-menu" aria-label="Abrir navegação" onClick={() => setOpen(true)}><Menu /></button><span>Gestão de estabelecimentos</span><span className="admin-demo-badge">{isMockMode ? 'MOCK · LOCAL' : 'SUPABASE'}</span></header><main className="admin-content">{children}</main></div>{open && <AdminDrawer onClose={() => setOpen(false)} />}</div></ProtectedRoute>;
}

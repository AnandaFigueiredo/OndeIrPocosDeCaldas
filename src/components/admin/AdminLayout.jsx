import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, Store, LogOut, Menu, X, ArrowUpRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { usePageMeta } from '../../hooks/usePageMeta';
import { BRAND } from '../../config/brand';
function AdminDrawer({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current, previous = document.activeElement;
    node.showModal();
    const resize = () => { if (innerWidth > 900) onClose(); };
    window.addEventListener('resize', resize);
    return () => { node.close(); window.removeEventListener('resize', resize); previous?.focus(); };
  }, [onClose]);
  return <dialog ref={ref} className="admin-drawer-dialog" aria-label="Menu do painel" onCancel={e => { e.preventDefault(); onClose(); }}><div className="drawer-heading"><strong>Painel Onde Ir</strong><button autoFocus aria-label="Fechar navegação" onClick={onClose}><X size={22} /></button></div><nav className="admin-drawer" aria-label="Menu mobile"><SidebarLinks /></nav><p>Ambiente de demonstração.<br />Dados salvos neste navegador.</p></dialog>;
}
export function ProtectedRouteMock({ children }) {
  const authenticated = authService.isAuthenticated();
  useEffect(() => { if (!authenticated) window.location.replace('/admin/login'); }, [authenticated]);
  return authenticated ? children : <p role="status">Abrindo login…</p>;
}
function SidebarLinks() {
  return <><a href="/admin" aria-current={location.pathname === '/admin' ? 'page' : undefined}><LayoutDashboard size={19} />Dashboard</a><a href="/admin/establishments" aria-current={location.pathname.startsWith('/admin/establishments') ? 'page' : undefined}><Store size={19} />Estabelecimentos</a><a href="/lugares" target="_blank" rel="noopener noreferrer"><ArrowUpRight size={19} />Ver vitrine</a><button onClick={() => { authService.logout(); window.location.assign('/admin/login'); }}><LogOut size={19} />Sair</button></>;
}
export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);
  usePageMeta('Painel | Onde Ir Poços de Caldas', 'Painel de demonstração para administrar estabelecimentos.', true);
  return <ProtectedRouteMock><div className="admin-shell"><aside className="admin-sidebar"><a className="admin-brand" href="/admin"><img src={BRAND.logo} alt="Onde Ir" /><span>Painel Onde Ir<small>Poços de Caldas</small></span></a><nav aria-label="Painel administrativo"><SidebarLinks /></nav><p>Ambiente de demonstração<br />Dados salvos neste navegador.</p></aside><div className="admin-main"><header className="admin-header"><button className="admin-menu" aria-label="Abrir navegação" onClick={() => setOpen(true)}><Menu /></button><span>Gestão de estabelecimentos</span><span className="admin-demo-badge">MOCK · LOCAL</span></header><main className="admin-content">{children}</main></div>{open && <AdminDrawer onClose={() => setOpen(false)} />}</div></ProtectedRouteMock>;
}

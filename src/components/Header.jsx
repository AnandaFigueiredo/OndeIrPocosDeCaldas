import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { CTA, Logo } from './UI';
export const links = [['Início', 'inicio'], ['Sobre', 'sobre'], ['Como funciona', 'como-funciona'], ['Divulgue seu negócio', 'divulgue'], ['Trabalhos', 'trabalhos'], ['Contato', 'contato']];
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  useEffect(() => { const scroll = () => setScrolled(window.scrollY > 30); scroll(); window.addEventListener('scroll', scroll, { passive: true }); return () => window.removeEventListener('scroll', scroll); }, []);
  useEffect(() => {
    if (!open) return;
    const key = e => { if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    const resize = () => { if (window.innerWidth > 1100) setOpen(false); };
    document.addEventListener('keydown', key); window.addEventListener('resize', resize);
    return () => { document.removeEventListener('keydown', key); window.removeEventListener('resize', resize); };
  }, [open]);
  return <header className={`header ${scrolled || open ? 'solid' : ''}`}><div className="header-inner"><Logo /><button ref={trigger} className="menu-toggle" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button><nav id="navigation" className={open ? 'navigation open' : 'navigation'} aria-label="Navegação principal" onClick={e => { if (e.target.closest('a')) setOpen(false); }}>{links.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}<CTA /></nav></div></header>;
}

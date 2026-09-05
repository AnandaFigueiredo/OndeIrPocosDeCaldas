import { ArrowUpRight, MapPin } from 'lucide-react';
import { BRAND } from '../config/brand';
import { contactUrl } from '../config/contact';
export function Logo({ href = '#inicio' }) {
  return <a href={href} className="logo" aria-label="Onde Ir Poços de Caldas — início">{BRAND.logo ? <span className="logo-frame"><img src={BRAND.logo} alt="Onde Ir Poços de Caldas" /></span> : <><MapPin strokeWidth={1.3} /><span>onde ir<span className="logo-sub">POÇOS DE CALDAS</span></span></>}</a>;
}
export function CTA({ children = 'Quero divulgar meu negócio', light = false }) {
  return <a className={`button ${light ? 'button-light' : ''}`} href={contactUrl()} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={18} /></a>;
}
export function Eyebrow({ children }) { return <p className="eyebrow">{children}</p>; }
export function Media({ src, alt, className = '', children, eager = false }) {
  return <div className={`media ${src ? 'has-image' : 'placeholder'} ${className}`}>{src ? <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} /> : <><span className="art-ring ring-one" aria-hidden="true" /><span className="art-ring ring-two" aria-hidden="true" /><span className="asset-note">FOTOGRAFIA EM BREVE</span></>}{children}</div>;
}

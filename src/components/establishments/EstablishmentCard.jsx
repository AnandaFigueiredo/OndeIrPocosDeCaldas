import { ArrowUpRight, MapPin, Phone, Compass } from 'lucide-react';
import { formatPhone, phoneUrl } from '../../utils/phone';
import { safeImage } from '../../utils/establishments';
export function PlaceImage({ src, name, className = '' }) {
  return <div className={`place-image ${className}`}>{safeImage(src) ? <img src={safeImage(src)} alt={name} loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }} /> : <><Compass aria-hidden="true" size={60} strokeWidth={.8} /><span>Um lugar para descobrir</span></>}</div>;
}
export default function EstablishmentCard({ item, preview = false }) {
  return <article className={`place-card placement-${item.placementType}`}><div className="place-card-media"><PlaceImage src={item.coverImage} name={item.name} />{item.badge && <span className="place-badge">{item.badge}</span>}</div><div className="place-card-copy"><p className="eyebrow">{item.category}{item.isMock ? ' · DEMONSTRAÇÃO' : ''}</p><h3>{item.name}</h3><p>{item.shortDescription}</p><div className="place-card-meta">{item.neighborhood && <span><MapPin size={14} />{item.neighborhood}</span>}{item.phone && <a href={phoneUrl(item.phone)}><Phone size={14} />{formatPhone(item.phone)}</a>}</div>{preview ? <span className="text-link">Conhecer <ArrowUpRight size={16} /></span> : <a className="text-link" href={`/lugares/${item.slug}`} aria-label={`Conhecer ${item.name}`}>Conhecer <ArrowUpRight size={16} /></a>}</div></article>;
}

import { Phone, MessageCircle, Instagram, Globe, MapPin } from 'lucide-react';
import { formatPhone, phoneUrl, whatsappUrl } from '../../utils/phone';
import { safeUrl } from '../../utils/establishments';
export default function ContactActions({ item }) {
  return <div className="place-contacts">{item.whatsapp && <a className="button" href={whatsappUrl(item.whatsapp)} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} />Chamar no WhatsApp</a>}{item.phone && <a className="contact-action" href={phoneUrl(item.phone)}><Phone size={18} />{formatPhone(item.phone)}</a>}{[['instagram', Instagram, 'Instagram'], ['website', Globe, 'Visitar site']].map(([key, Icon, label]) => safeUrl(item[key]) && <a className="contact-action" key={key} href={safeUrl(item[key])} target="_blank" rel="noopener noreferrer"><Icon size={18} />{label}</a>)}</div>;
}
export function LocationInfo({ item }) {
  return <div className="place-location"><h3>Onde encontrar</h3>{item.address && <p>{item.address}{item.number && `, ${item.number}`}</p>}<p>{[item.neighborhood, `${item.city}/${item.state}`].filter(Boolean).join(' — ')}</p>{item.zipCode && <p>CEP {item.zipCode}</p>}{safeUrl(item.mapsUrl) && <a className="text-link" href={safeUrl(item.mapsUrl)} target="_blank" rel="noopener noreferrer"><MapPin size={18} />Ver no mapa</a>}</div>;
}

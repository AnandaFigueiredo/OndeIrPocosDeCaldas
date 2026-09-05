import { Instagram, MessageCircle, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Logo } from './UI';
import { links } from './Header';
import { CONTACT, contactUrl } from '../config/contact';
export default function Footer() {
  return <footer className="container footer"><div className="footer-top"><div><Logo /><p>Descubra Poços. Viva Poços.</p></div><nav aria-label="Navegação do rodapé">{links.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav><a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="text-link"><Instagram size={18} /><span>@ondeirpocosdecaldas</span><ArrowUpRight size={16} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Onde Ir Poços de Caldas. Todos os direitos reservados.</span><span>Feito de boas descobertas, em Poços de Caldas.</span></div></footer>;
}
export function WhatsAppButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const update = () => setVisible(window.scrollY > 650); update(); window.addEventListener('scroll', update, { passive: true }); return () => window.removeEventListener('scroll', update); }, []);
  if (!visible) return null;
  return <a className="floating-contact" href={contactUrl()} target="_blank" rel="noopener noreferrer" aria-label={CONTACT.whatsapp ? 'Solicitar orçamento pelo WhatsApp' : 'Entrar em contato pelo Instagram'}>{CONTACT.whatsapp ? <MessageCircle size={23} /> : <Instagram size={23} />}</a>;
}

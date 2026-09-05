import { ArrowUpRight, Camera, Compass, Image, Layers, MapPin, MessageCircle, Smartphone, Sparkles, Video } from 'lucide-react';
import { services } from '../data/services';
import { BRAND } from '../config/brand';
import { CONTACT } from '../config/contact';
import { CTA, Eyebrow, Media } from './UI';
export function Advertise() {
  return <section id="divulgue" className="advertise"><div className="container advertise-layout reveal"><div><Eyebrow>PARA QUEM EMPREENDE EM POÇOS</Eyebrow><h2>Seu negócio<br />também pode ser<br /><em>descoberto.</em></h2></div><div className="advertise-copy"><span className="round-arrow" aria-hidden="true"><ArrowUpRight size={48} strokeWidth={1} /></span><h3>Você cuida da experiência.<br />A gente ajuda mais pessoas<br />a conhecê-la.</h3><p>Apresentamos seu negócio através de conteúdos conectados com a cidade e com quem está em busca do próximo lugar para conhecer.</p><CTA light /><p className="business-types">Restaurantes · Cafés · Hotéis · Pousadas · Lojas · Atrações · Experiências · Eventos · Serviços · Novos negócios · Lançamentos</p></div></div></section>;
}
const steps = [ ['Entre em contato', 'Conte um pouco sobre sua empresa, serviço ou experiência.'], ['Montamos a proposta', 'Entendemos o que você quer divulgar e indicamos o formato mais adequado.'], ['Produzimos o conteúdo', 'O Onde Ir transforma sua experiência em um conteúdo pensado para despertar interesse.'], ['Sua marca aparece', 'O conteúdo é apresentado para uma audiência conectada com Poços de Caldas.'] ];
export function HowItWorks() {
  return <section id="como-funciona" className="section container reveal"><Eyebrow>DO PRIMEIRO OLÁ À PRÓXIMA DESCOBERTA</Eyebrow><h2>Como funciona<br />a <em>divulgação?</em></h2><ol className="timeline">{steps.map(([title, text], i) => <li key={title}><span className="step-number">0{i + 1}</span><span className="step-dot" /><h3>{title}</h3><p>{text}</p></li>)}</ol></section>;
}
const icons = { video: Video, phone: Smartphone, image: Image, camera: Camera, layers: Layers };
export function Services() {
  return <section className="services-section"><div className="section container reveal"><div className="section-heading"><div><Eyebrow>FORMATOS QUE APROXIMAM</Eyebrow><h2>Conte sua história<br />do <em>jeito certo.</em></h2></div><p>O formato muda.<br />A vontade de descobrir permanece.</p></div><div className="services-grid">{services.map(s => { const Icon = icons[s.icon]; return <article key={s.name}><Icon size={28} strokeWidth={1.25} /><span className="service-detail">{s.detail}</span><h3>{s.name}</h3><p>{s.text}</p></article>; })}</div><div className="services-footer"><p>Cada negócio é diferente. Por isso, entendemos sua necessidade<br className="desktop-break" /> antes de montar a melhor proposta.</p><CTA>Solicitar orçamento</CTA></div></div></section>;
}
const benefits = [ [MapPin, 'Audiência local', 'Pessoas interessadas no que acontece em Poços de Caldas.'], [Compass, 'Descoberta', 'Seu negócio apresentado no momento em que alguém procura algo novo.'], [MessageCircle, 'Conteúdo', 'Uma comunicação natural, contextualizada e conectada à experiência.'], [Sparkles, 'Relevância local', 'Uma marca construída em torno da cidade e de quem vive ou visita Poços.'] ];
export function Benefits() {
  return <section className="section container benefits reveal"><div><Eyebrow>BOAS CONEXÕES COMEÇAM AQUI</Eyebrow><h2>Quem procura<br />onde ir pode<br />encontrar <em>você.</em></h2></div><div className="benefits-list">{benefits.map(([Icon, title, text]) => <article key={title}><Icon size={24} strokeWidth={1.2} /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>;
}
export function FinalCTA() {
  return <section id="contato" className="final-cta"><Media src={BRAND.finalImage} alt="Experiências em Poços de Caldas" className="final-art" /><div className="container reveal"><Eyebrow>A PRÓXIMA HISTÓRIA PODE SER A SUA</Eyebrow><h2>Pronto para colocar<br />seu negócio <em>no mapa?</em></h2><p>Conte pra gente o que você quer divulgar e receba uma proposta.</p><CTA light>Solicitar orçamento</CTA><span className="contact-note">{CONTACT.whatsapp ? 'Vamos conversar pelo WhatsApp.' : 'Vamos conversar pelo Instagram.'}</span>{CONTACT.email && <a className="email-link" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>}</div></section>;
}

import { useEstablishments } from '../../hooks/useEstablishments';
import EstablishmentCard from './EstablishmentCard';
import { ArrowUpRight } from 'lucide-react';
export function CommercialInvite() {
  return <aside className="places-invite"><div><h3>Quer ver sua empresa por aqui?</h3><p>Apresente seu negócio para quem procura onde comer, comprar, passear e viver novas experiências em Poços de Caldas.</p></div><a className="button" href="/#divulgue">Divulgar meu negócio <ArrowUpRight size={18} /></a></aside>;
}
export function DemoNotice({ items }) { return items.some(item => item.isMock) ? <p className="places-demo">Vitrine em demonstração: os cadastros identificados como exemplo são fictícios. Contatos e endereços são ilustrativos.</p> : null; }
export default function EstablishmentsSection() {
  const { items, loading, error } = useEstablishments(true);
  return <section id="lugares" className="section container places-section"><div className="section-heading"><div><p className="eyebrow">LUGARES, ENCONTROS E BOAS DESCOBERTAS</p><h2>Por onde <em>começar?</em></h2></div><a href="/lugares" className="text-link">Ver todos os lugares <ArrowUpRight size={18} /></a></div><p className="places-intro">Lugares, sabores e experiências para você descobrir em Poços de Caldas.</p><DemoNotice items={items} />{loading ? <p role="status">Carregando lugares…</p> : error ? <p role="alert">{error}</p> : items.length ? <div className="places-grid">{items.slice(0, 6).map(item => <EstablishmentCard key={item.id} item={item} />)}</div> : <p className="places-empty">Novos lugares estarão por aqui em breve.</p>}<CommercialInvite /></section>;
}

import { useState } from 'react';
import { useEstablishments } from '../hooks/useEstablishments';
import { usePageMeta } from '../hooks/usePageMeta';
import { filterEstablishments } from '../utils/establishments';
import EstablishmentCard from '../components/establishments/EstablishmentCard';
import EstablishmentFilters from '../components/establishments/EstablishmentFilters';
import { CommercialInvite, DemoNotice } from '../components/establishments/EstablishmentsSection';
import { Logo } from '../components/UI';
export function PlacesHeader() { return <header className="places-header container"><Logo href="/" /><nav aria-label="Navegação dos lugares"><a href="/">Início</a><a href="/lugares">Explorar lugares</a><a href="/#divulgue">Divulgar</a></nav></header>; }
export default function PlacesPage() {
  const { items, loading, error } = useEstablishments(true);
  const [query, setQuery] = useState(''), [category, setCategory] = useState('Todos');
  const filtered = filterEstablishments(items, { query, category });
  usePageMeta('Onde Ir em Poços de Caldas | Lugares, restaurantes e experiências', 'Descubra restaurantes, cafés, lojas, passeios, experiências e negócios em Poços de Caldas.');
  return <><PlacesHeader /><main className="container places-page"><p className="eyebrow">SEU PRÓXIMO ENCONTRO COM A CIDADE</p><h1>Descubra <em>Poços de Caldas.</em></h1><p className="places-intro">Restaurantes, experiências, lojas e lugares para conhecer pela cidade.</p><EstablishmentFilters {...{ query, setQuery, category, setCategory }} /><DemoNotice items={items} /><p role="status" className="result-count">{loading ? 'Carregando lugares…' : `${filtered.length} ${filtered.length === 1 ? 'lugar encontrado' : 'lugares encontrados'}`}</p>{error ? <p role="alert">{error}</p> : <div className="places-grid">{filtered.map(item => <EstablishmentCard key={item.id} item={item} />)}</div>}{!loading && !error && !filtered.length && <div className="places-empty"><h3>Nenhum lugar por aqui ainda.</h3><p>Tente outro nome ou categoria.</p><button className="button" onClick={() => { setQuery(''); setCategory('Todos'); }}>Limpar filtros</button></div>}<CommercialInvite /></main></>;
}

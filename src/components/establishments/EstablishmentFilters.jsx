import { Search } from 'lucide-react';
import { CATEGORIES } from '../../utils/establishments';
export default function EstablishmentFilters({ query, setQuery, category, setCategory }) {
  return <div className="places-filters"><label className="place-search"><Search size={20} /><span className="sr-only">Buscar lugar</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar lugar" type="search" /></label><div className="category-filters" role="group" aria-label="Filtrar por categoria">{['Todos', ...CATEGORIES].map(label => <button key={label} aria-pressed={category === label} onClick={() => setCategory(label)}>{label}</button>)}</div></div>;
}

import { useEstablishments } from '../hooks/useEstablishments';
import { usePageMeta } from '../hooks/usePageMeta';
import { safeImage } from '../utils/establishments';
import { PlacesHeader } from './PlacesPage';
import { PlaceImage } from '../components/establishments/EstablishmentCard';
import ContactActions, { LocationInfo } from '../components/establishments/ContactActions';
import EstablishmentGallery from '../components/establishments/EstablishmentGallery';
import { CommercialInvite, DemoNotice } from '../components/establishments/EstablishmentsSection';
export default function PlaceDetailsPage({ slug }) {
  const { items, loading, error } = useEstablishments(true);
  const item = items.find(entry => entry.slug === slug);
  usePageMeta(item ? `${item.name} | Onde Ir Poços de Caldas` : 'Lugar não disponível | Onde Ir Poços de Caldas', item?.shortDescription || 'Conheça os lugares em Poços de Caldas.', Boolean(item?.isMock));
  return <><PlacesHeader /><main className="container place-details"><a href="/lugares" className="text-link">← Voltar aos lugares</a>{loading ? <p role="status">Carregando lugar…</p> : error ? <p role="alert">{error}</p> : !item ? <div className="places-empty"><h1>Lugar não disponível.</h1><p>Este cadastro não está publicado no momento. Explore outras descobertas.</p></div> : <><DemoNotice items={[item]} /><PlaceImage src={item.coverImage} name={item.name} className="place-cover" /><div className="place-details-grid"><div>{safeImage(item.logo) && <img className="place-business-logo" src={safeImage(item.logo)} alt={`Logo de ${item.name}`} />}<p className="eyebrow">{item.category}{item.subcategory && ` · ${item.subcategory}`}{item.badge && ` · ${item.badge}`}</p><h1>{item.name}</h1><p className="place-description">{item.description || item.shortDescription}</p>{item.priceRange && <p>Faixa de preço: {item.priceRange}</p>}<EstablishmentGallery images={item.gallery} name={item.name} /></div><aside><h2>Planeje sua visita</h2><ContactActions item={item} /><LocationInfo item={item} />{!!item.openingHours?.length && <section className="opening-hours"><h3>Horários de funcionamento</h3><dl>{item.openingHours.map((entry, i) => <div key={i}><dt>{entry.day}</dt><dd>{entry.hours}</dd></div>)}</dl></section>}</aside></div><CommercialInvite /></>}</main></>;
}

import { safeImage } from '../../utils/establishments';
export default function EstablishmentGallery({ images, name }) {
  if (!images?.length) return null;
  return <section className="place-gallery"><h2>Um pouco <em>desse lugar.</em></h2><div>{images.filter(safeImage).map((src, i) => <img src={safeImage(src)} key={`${src}-${i}`} alt={`${name} — imagem ${i + 1}`} loading="lazy" />)}</div></section>;
}

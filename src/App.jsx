import { useEffect } from 'react';
import Header from './components/Header';
import { Hero, Positioning, Numbers, Discover, Portfolio, Testimonials, About, InstagramSection } from './components/Editorial';
import { Advertise, HowItWorks, Services, Benefits, FinalCTA } from './components/Business';
import Footer, { WhatsAppButton } from './components/Footer';
import EstablishmentsSection from './components/establishments/EstablishmentsSection';
export default function App() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach(el => { el.classList.add('will-reveal'); observer.observe(el); });
    return () => observer.disconnect();
  }, []);
  return <><a href="#conteudo" className="skip-link">Pular para o conteúdo</a><Header /><main id="conteudo"><Hero /><Positioning /><Numbers /><Discover /><EstablishmentsSection /><Advertise /><HowItWorks /><Services /><Benefits /><Portfolio /><Testimonials /><About /><InstagramSection /><FinalCTA /></main><Footer /><WhatsAppButton /></>;
}

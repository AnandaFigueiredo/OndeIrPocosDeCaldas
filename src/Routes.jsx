import { lazy, Suspense, useEffect, useState } from 'react';
import App from './App';
const PlacesPage = lazy(() => import('./pages/PlacesPage'));
const PlaceDetailsPage = lazy(() => import('./pages/PlaceDetailsPage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const LoginPage = lazy(() => import('./pages/Admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/Admin/DashboardPage'));
const ListPage = lazy(() => import('./pages/Admin/Establishments/EstablishmentsListPage'));
const FormPage = lazy(() => import('./pages/Admin/Establishments/EstablishmentForm'));
// Rotas pequenas sem dependência extra. Links nativos permitem abrir em nova aba.
export default function Routes() {
  const [path, setPath] = useState(location.pathname.replace(/\/$/, '') || '/');
  useEffect(() => { const update = () => setPath(location.pathname.replace(/\/$/, '') || '/'); window.addEventListener('popstate', update); return () => window.removeEventListener('popstate', update); }, []);
  let page;
  if (path === '/') page = <App />;
  else if (path === '/lugares') page = <PlacesPage />;
  else if (/^\/lugares\/[^/]+$/.test(path)) page = <PlaceDetailsPage slug={decodeURIComponent(path.split('/')[2])} />;
  else if (path === '/admin/login') page = <LoginPage />;
  else if (path === '/admin') page = <AdminLayout><DashboardPage /></AdminLayout>;
  else if (path === '/admin/establishments') page = <AdminLayout><ListPage /></AdminLayout>;
  else if (path === '/admin/establishments/new') page = <AdminLayout><FormPage /></AdminLayout>;
  else if (/^\/admin\/establishments\/[^/]+\/edit$/.test(path)) page = <AdminLayout><FormPage id={path.split('/')[3]} /></AdminLayout>;
  else page = <main className="container section"><h1>Página não encontrada.</h1><a className="text-link" href="/">Voltar ao início</a></main>;
  return <Suspense fallback={<p className="container section" role="status">Carregando…</p>}>{page}</Suspense>;
}

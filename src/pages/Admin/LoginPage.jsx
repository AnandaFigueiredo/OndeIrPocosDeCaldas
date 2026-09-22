import { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { authService } from '../../services/authService';
import { usePageMeta } from '../../hooks/usePageMeta';
import { BRAND } from '../../config/brand';
import { isMockMode, configurationError } from '../../lib/supabase';
export default function LoginPage() {
  const [show, setShow] = useState(false), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  usePageMeta('Entrar no painel | Onde Ir Poços de Caldas', 'Acesso ao painel administrativo.', true);
  async function submit(e) { e.preventDefault(); if (submitting.current) return; submitting.current = true; setError(''); const data = new FormData(e.currentTarget); setBusy(true); try { await authService.login(data.get('email'), data.get('password')); location.assign('/admin'); } catch (err) { setError(err.message); setBusy(false); submitting.current = false; } }
  return <main className="admin-login"><div><a href="/"><img src={BRAND.logo} alt="Onde Ir Poços de Caldas" /></a><p className="eyebrow">UM ESPAÇO PARA CUIDAR DAS DESCOBERTAS</p><h1>Bem-vinda ao painel.</h1><p>Gerencie os lugares que aparecem no Onde Ir.</p><form onSubmit={submit}>{configurationError && <p role="alert" className="admin-error">{configurationError}</p>}<label>E-mail<input name="email" type="email" autoComplete="username" required /></label><label>Senha<span className="password-field"><input name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required /><button type="button" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShow(!show)}>{show ? <EyeOff size={20} /> : <Eye size={20} />}</button></span></label>{error && <p role="alert" className="admin-error">{error}</p>}<button className="admin-button" disabled={busy || Boolean(configurationError)}>{busy ? 'Entrando…' : 'Entrar'}</button></form>{isMockMode && <div className="admin-notice"><strong>Acesso de demonstração</strong><p>E-mail: admin@example.com<br />Senha: demo123</p><small>Autenticação fictícia. Os cadastros ficam somente neste navegador; não use dados confidenciais.</small></div>}<a href="/" className="text-link">← Voltar ao site</a></div></main>;
}

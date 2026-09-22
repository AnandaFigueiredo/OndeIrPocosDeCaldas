import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';

const env = loadEnv('development', process.cwd(), 'VITE_');
const url = env.VITE_SUPABASE_URL?.trim();
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
if (!url || !key?.startsWith('sb_publishable_')) throw new Error('Configure a URL base e a chave pública em .env.local.');
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await client.from('establishments').select('id, name').limit(1);
if (error) { console.error('Falha na leitura pública:', error.code || '', error.message); process.exitCode = 1; }
else console.log(`PASS conexão e leitura pública: ${data.length} registro(s) na amostra.`);
const response = await fetch(`${url}/rest/v1/`, { headers: { apikey: key, Accept: 'application/openapi+json' }, signal: AbortSignal.timeout(15000) });
if (response.ok) {
  const spec = await response.json();
  const table = spec.definitions?.establishments;
  console.log('Colunas disponíveis:', Object.keys(table?.properties || {}).join(', '));
  console.log('Campos obrigatórios:', table?.required || []);
  console.log('Função is_admin exposta:', Boolean(spec.paths?.['/rpc/is_admin']));
} else console.log('Especificação da API indisponível:', response.status);
const admin = await client.rpc('is_admin');
console.log('is_admin sem sessão:', admin.error ? `acesso recusado (${admin.error.code})` : admin.data);
const columns = 'id,name,slug,category,subcategory,short_description,description,logo_url,cover_image_url,gallery,phone,whatsapp,address,address_number,neighborhood,city,state,cep,maps_url,instagram_url,website_url,opening_hours,badge,placement_type,display_order,is_active,start_date,end_date,created_at,updated_at';
const schema = await client.from('establishments').select(columns).limit(1);
console.log('Contrato de colunas:', schema.error ? schema.error.message : 'PASS');
if (schema.error) process.exitCode = 1;
for (const column of ['price_range', 'is_mock']) {
  const result = await client.from('establishments').select(column).limit(1);
  console.log(`Coluna opcional ${column}:`, result.error ? result.error.message : 'disponível');
}

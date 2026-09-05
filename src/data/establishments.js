// DADOS MOCKADOS APENAS PARA DESENVOLVIMENTO.
// SUBSTITUIR POR DADOS REAIS DO SUPABASE.
// Telefones deliberadamente inválidos e URLs example.com: não são contatos comerciais.
export const emptyEstablishment = {
  name: '', slug: '', category: '', subcategory: '', shortDescription: '', description: '',
  logo: '', coverImage: '', gallery: [], phone: '', whatsapp: '', address: '', number: '',
  neighborhood: '', city: 'Poços de Caldas', state: 'MG', zipCode: '', mapsUrl: '',
  instagram: '', website: '', openingHours: [], priceRange: '', badge: '', placementType: 'standard',
  displayOrder: 1, isActive: true, startDate: null, endDate: null, isMock: false,
};
const samples = [
  ['Café Alameda — Exemplo', 'cafe-alameda', 'Cafés', 'Uma pausa para cafés, conversas e sabores.', 'premium', 'Em destaque'],
  ['Bistrô da Serra — Exemplo', 'bistro-da-serra', 'Gastronomia', 'Uma proposta de encontro ao redor da mesa.', 'featured', 'Parceiro'],
  ['Casa Aurora — Exemplo', 'casa-aurora', 'Hospedagem', 'Um espaço de demonstração para boas estadias.', 'standard', ''],
  ['Estação 35 — Exemplo', 'estacao-35', 'Experiências', 'Novas maneiras de viver e descobrir a cidade.', 'featured', 'Experiência'],
  ['Villa Verde — Exemplo', 'villa-verde', 'Passeios', 'Um convite ilustrativo para sair da rotina.', 'standard', 'Novidade'],
  ['Ateliê Central — Exemplo', 'atelie-central', 'Compras', 'Criações, detalhes e descobertas pelo caminho.', 'standard', ''],
];
export const establishments = samples.map(([name, slug, category, shortDescription, placementType, badge], i) => ({
  ...emptyEstablishment, id: `demo-${i + 1}`, name, slug, category, shortDescription, placementType, badge,
  description: `${shortDescription} Este cadastro é fictício e serve exclusivamente para experimentar a vitrine e o painel. Não representa um anunciante real.`,
  neighborhood: 'Centro', address: 'Endereço de demonstração', number: '0', displayOrder: i + 1,
  phone: i % 2 === 0 ? '00000000000' : '', whatsapp: i < 2 ? '00000000000' : '',
  instagram: i < 3 ? 'https://example.com/instagram-demonstracao' : '', website: i === 0 ? 'https://example.com' : '',
  mapsUrl: i < 2 ? 'https://www.google.com/maps/search/?api=1&query=Po%C3%A7os%20de%20Caldas' : '',
  openingHours: i === 0 ? [{ day: 'Segunda a sexta (exemplo)', hours: '08:00 às 18:00' }] : [],
  createdAt: '2026-09-01T12:00:00Z', updatedAt: '2026-09-01T12:00:00Z', isMock: true,
}));

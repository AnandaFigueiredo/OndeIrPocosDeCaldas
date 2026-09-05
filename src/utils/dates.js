// Datas de campanha são dias civis em America/Sao_Paulo, inclusive a data final.
export const today = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
export const formatDate = value => value ? value.slice(0, 10).split('-').reverse().join('/') : 'Sem limite';
export const daysRemaining = (end, now = today()) => Math.round((Date.parse(`${end}T12:00:00Z`) - Date.parse(`${now}T12:00:00Z`)) / 86400000);

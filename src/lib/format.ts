/**
 * Funções puras de formatação/validação usadas pelas telas.
 * Datas trafegam na API como "YYYY-MM-DD"; na tela, como "DD/MM/AAAA".
 */

const TIME_ZONE = 'America/Sao_Paulo';

export const onlyDigits = (v: string) => v.replace(/\D/g, '');

/** UID do cartão em hex maiúsculo sem separador ("04:a2:1f:9c" → "04A21F9C"). */
export function normalizeCardUid(uid: string): string {
  return uid.replace(/[^0-9a-f]/gi, '').toUpperCase();
}

/** "04A21F9C" → "04:A2:1F:9C" (só para exibição). */
export function formatCardUid(uid: string | null | undefined): string {
  if (!uid) return '';
  const n = normalizeCardUid(uid);
  return n.match(/.{1,2}/g)?.join(':') ?? n;
}

/** Máscara progressiva de CPF: 000.000.000-00. */
export function maskCpf(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

export function isValidCpf(v: string): boolean {
  const d = onlyDigits(v);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(d[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return digit(9) === Number(d[9]) && digit(10) === Number(d[10]);
}

/** Máscara progressiva de telefone: (21) 99999-9999 ou (21) 3333-3333. */
export function maskPhone(v: string): string {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Máscara progressiva de data: DD/MM/AAAA. */
export function maskDate(v: string): string {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** "14/03/1968" → "1968-03-14"; inválida ou incompleta → null. */
export function brDateToIso(v: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v.trim());
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const date = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  if (
    date.getUTCFullYear() !== Number(yyyy) ||
    date.getUTCMonth() !== Number(mm) - 1 ||
    date.getUTCDate() !== Number(dd)
  ) {
    return null;
  }
  return `${yyyy}-${mm}-${dd}`;
}

/** "1968-03-14" → "14/03/1968"; vazio → "". */
export function isoDateToBr(v: string | null | undefined): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v ?? '');
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

/** Idade completa em anos numa data de referência. */
export function ageFrom(birthIso: string | null | undefined, now = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(birthIso ?? '');
  if (!m) return null;
  const today = todayParts(now);
  let age = today.year - Number(m[1]);
  if (today.month < Number(m[2]) || (today.month === Number(m[2]) && today.day < Number(m[3]))) age--;
  return age;
}

/** Ano/mês/dia "de parede" em São Paulo. */
export function todayParts(now = new Date()): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { year: get('year'), month: get('month'), day: get('day') };
}

/** Hoje em São Paulo como "YYYY-MM-DD". */
export function todayIso(now = new Date()): string {
  const { year, month, day } = todayParts(now);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** (2026, 11) → "Novembro/26". */
export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month - 1]}/${String(year).slice(-2)}`;
}

/** Soma meses a um par ano/mês. */
export function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const idx = year * 12 + (month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

/** Primeiro e último dia do mês como "YYYY-MM-DD". */
export function monthRange(year: number, month: number): { from: string; to: string } {
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const mm = String(month).padStart(2, '0');
  return { from: `${year}-${mm}-01`, to: `${year}-${mm}-${String(last).padStart(2, '0')}` };
}

/** ISO → "18/11/2026 · 14:05" no fuso de São Paulo. */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('pt-BR', { timeZone: TIME_ZONE });
  const time = d.toLocaleTimeString('pt-BR', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' });
  return `${date} · ${time}`;
}

export function formatTime(iso: string | Date): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' });
}

/** Nome exibido: social quando houver. */
export const displayName = (b: { name: string; socialName: string | null }) => b.socialName?.trim() || b.name;

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

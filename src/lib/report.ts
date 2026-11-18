import type { AssistanceRecord } from './types';

const dayKey = (iso: string) =>
  new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

/**
 * Ordem do relatório do mockup: por dia (mais antigo primeiro), depois por
 * nome completo e, no mesmo nome, por horário.
 */
export function sortReportRows<T extends Pick<AssistanceRecord, 'attendedAt' | 'beneficiary'>>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const da = dayKey(a.attendedAt);
    const db = dayKey(b.attendedAt);
    if (da !== db) return da < db ? -1 : 1;
    const byName = a.beneficiary.name.localeCompare(b.beneficiary.name, 'pt-BR');
    if (byName) return byName;
    return new Date(a.attendedAt).getTime() - new Date(b.attendedAt).getTime();
  });
}

import type { AssistanceRecord, AssistanceService } from './types';

/** Quantos atendimentos de cada serviço existem na lista (normalmente: os do mês corrente). */
export function countByService(records: Pick<AssistanceRecord, 'service'>[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of records) counts[r.service.id] = (counts[r.service.id] ?? 0) + 1;
  return counts;
}

/**
 * Situação do serviço no mês para um assistido: serviços com limite mensal
 * (ex.: Matula = 1 retirada por mês) ficam bloqueados quando o limite é atingido.
 * O portal faz a mesma checagem e responde 409 MONTHLY_LIMIT_REACHED.
 */
export function monthlyStatus(
  service: Pick<AssistanceService, 'id' | 'monthlyLimit'>,
  counts: Record<string, number>,
): { used: number; limit: number | null; blocked: boolean } {
  const used = counts[service.id] ?? 0;
  const limit = service.monthlyLimit && service.monthlyLimit > 0 ? service.monthlyLimit : null;
  return { used, limit, blocked: limit !== null && used >= limit };
}

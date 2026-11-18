import { PORTAL_URL } from './config';
import { normalizeCardUid } from './format';
import type {
  AssistanceRecord,
  AssistanceService,
  AssistanceServiceInput,
  Beneficiary,
  BeneficiaryInput,
  Me,
} from './types';

/** Nome do cookie de sessão do portal (lib/auth/portal-config.ts no people-manager). */
const SESSION_COOKIE = 'billing-portal-session';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setApiToken(value: string | null) {
  token = value;
}

/** Chamado quando o portal responde 401 (sessão expirada). */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

type Query = Record<string, string | number | undefined | null>;

function buildUrl(path: string, query?: Query): string {
  const qs = Object.entries(query ?? {})
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `${PORTAL_URL}${path}${qs ? `?${qs}` : ''}`;
}

export async function request<T>(
  method: string,
  path: string,
  options: { query?: Query; body?: unknown; form?: FormData } = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (token) {
    // O portal aceita o JWT tanto como Bearer quanto como o cookie de sessão.
    headers.Authorization = `Bearer ${token}`;
    headers.Cookie = `${SESSION_COOKIE}=${token}`;
  }
  let body: BodyInit | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, options.query), { method, headers, body });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'Sem conexão com o portal. Verifique a internet e tente de novo.');
  }

  if (res.status === 204) return undefined as T;

  const json = (await res.json().catch(() => null)) as
    | { data?: T; error?: { code?: string; message?: string } }
    | null;

  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized?.();
    throw new ApiError(
      res.status,
      json?.error?.code ?? 'HTTP_ERROR',
      json?.error?.message ?? `Erro ${res.status} ao falar com o portal.`,
    );
  }
  return (json?.data ?? json) as T;
}

const BASE = '/api/portal/assistance';

export const authApi = {
  sendCode: (email: string) => request<unknown>('POST', '/api/portal/magic-link/send', { body: { email } }),
  verifyCode: (email: string, code: string) =>
    request<{ token: string; expiresIn: number; user: { id: string; email: string } }>(
      'POST',
      '/api/portal/auth/mobile-token',
      { body: { email, code } },
    ),
};

export const api = {
  me: () => request<Me>('GET', `${BASE}/me`),

  listBeneficiaries: (query: { q?: string; registeredFrom?: string; registeredTo?: string; limit?: number } = {}) =>
    request<Beneficiary[]>('GET', `${BASE}/beneficiaries`, { query }),
  getBeneficiary: (id: string) => request<Beneficiary>('GET', `${BASE}/beneficiaries/${id}`),
  findByCard: (uid: string) =>
    request<Beneficiary>('GET', `${BASE}/beneficiaries/by-card/${encodeURIComponent(normalizeCardUid(uid))}`),
  createBeneficiary: (input: BeneficiaryInput) => request<Beneficiary>('POST', `${BASE}/beneficiaries`, { body: input }),
  updateBeneficiary: (id: string, input: Partial<BeneficiaryInput>) =>
    request<Beneficiary>('PATCH', `${BASE}/beneficiaries/${id}`, { body: input }),
  uploadPhoto: (id: string, photo: { uri: string; mimeType?: string | null; fileName?: string | null }) => {
    const form = new FormData();
    const type = photo.mimeType || 'image/jpeg';
    // React Native aceita { uri, name, type } como arquivo no FormData.
    form.append('file', { uri: photo.uri, name: photo.fileName || 'foto.jpg', type } as unknown as Blob);
    return request<Beneficiary>('POST', `${BASE}/beneficiaries/${id}/photo`, { form });
  },

  listServices: (includeInactive = false) =>
    request<AssistanceService[]>('GET', `${BASE}/services`, { query: { includeInactive: includeInactive ? 1 : undefined } }),
  createService: (input: AssistanceServiceInput) => request<AssistanceService>('POST', `${BASE}/services`, { body: input }),
  updateService: (id: string, input: Partial<AssistanceServiceInput>) =>
    request<AssistanceService>('PATCH', `${BASE}/services/${id}`, { body: input }),

  listRecords: (query: { beneficiaryId?: string; from?: string; to?: string; limit?: number } = {}) =>
    request<AssistanceRecord[]>('GET', `${BASE}/records`, { query }),
  createRecord: (beneficiaryId: string, serviceId: string) =>
    request<AssistanceRecord>('POST', `${BASE}/records`, { body: { beneficiaryId, serviceId } }),
  deleteRecord: (id: string) => request<void>('DELETE', `${BASE}/records/${id}`),
};

/** Mensagem amigável para qualquer erro. */
export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return 'Algo deu errado. Tente de novo.';
}

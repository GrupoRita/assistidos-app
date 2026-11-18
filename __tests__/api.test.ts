jest.mock('@/lib/config', () => ({ PORTAL_URL: 'https://portal.test' }));

import { api, ApiError, setApiToken, setUnauthorizedHandler } from '@/lib/api';

const json = (status: number, body: unknown) =>
  Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) } as Response);

describe('cliente da API do portal', () => {
  const fetchMock = jest.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    setApiToken('jwt-123');
    setUnauthorizedHandler(null);
  });

  it('envia o token como Bearer e como cookie de sessão do portal', async () => {
    fetchMock.mockReturnValue(json(200, { data: [] }));
    await api.listBeneficiaries({ q: 'maria', registeredFrom: undefined });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://portal.test/api/portal/assistance/beneficiaries?q=maria');
    expect(init.headers.Authorization).toBe('Bearer jwt-123');
    expect(init.headers.Cookie).toBe('billing-portal-session=jwt-123');
  });

  it('normaliza o UID na busca por cartão', async () => {
    fetchMock.mockReturnValue(json(200, { data: { id: 'b1' } }));
    await api.findByCard('04:a2:1f:9c');
    expect(fetchMock.mock.calls[0][0]).toBe('https://portal.test/api/portal/assistance/beneficiaries/by-card/04A21F9C');
  });

  it('desembrulha { data } e envia JSON no POST', async () => {
    fetchMock.mockReturnValue(json(201, { data: { id: 'r1' } }));
    await expect(api.createRecord('b1', 's1')).resolves.toEqual({ id: 'r1' });
    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ beneficiaryId: 'b1', serviceId: 's1' });
  });

  it('converte erro do portal em ApiError com código e mensagem', async () => {
    fetchMock.mockReturnValue(json(409, { error: { code: 'MONTHLY_LIMIT_REACHED', message: 'Matula já retirada este mês.' } }));
    await expect(api.createRecord('b1', 's1')).rejects.toMatchObject({
      status: 409,
      code: 'MONTHLY_LIMIT_REACHED',
      message: 'Matula já retirada este mês.',
    });
  });

  it('avisa a sessão expirada no 401', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    fetchMock.mockReturnValue(json(401, { error: { code: 'UNAUTHORIZED', message: 'Não autenticado' } }));
    await expect(api.me()).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalled();
  });

  it('traduz falha de rede', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    await expect(api.me()).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });
});

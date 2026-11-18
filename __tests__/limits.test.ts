import { countByService, monthlyStatus } from '@/lib/limits';

const rec = (serviceId: string) => ({ service: { id: serviceId, name: serviceId, emoji: '•' } });

describe('limite mensal de serviços', () => {
  const counts = countByService([rec('matula'), rec('dentista'), rec('dentista')]);

  it('conta atendimentos por serviço', () => {
    expect(counts).toEqual({ matula: 1, dentista: 2 });
  });

  it('bloqueia a Matula depois da retirada do mês', () => {
    expect(monthlyStatus({ id: 'matula', monthlyLimit: 1 }, counts)).toEqual({ used: 1, limit: 1, blocked: true });
  });

  it('libera serviço com limite ainda não atingido', () => {
    expect(monthlyStatus({ id: 'dentista', monthlyLimit: 3 }, counts).blocked).toBe(false);
  });

  it('serviço sem limite nunca bloqueia', () => {
    expect(monthlyStatus({ id: 'dentista', monthlyLimit: null }, counts)).toEqual({ used: 2, limit: null, blocked: false });
    expect(monthlyStatus({ id: 'dentista', monthlyLimit: 0 }, counts).blocked).toBe(false);
  });
});

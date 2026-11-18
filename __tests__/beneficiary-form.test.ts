jest.mock('@/lib/nfc', () => ({}));
jest.mock('expo-image-picker', () => ({}));

import { initialValues, toInput } from '@/components/beneficiary-form';

describe('formulário de assistido', () => {
  const base = { ...initialValues(null), name: ' Maria Aparecida ', cpf: '12345678909' };

  it('exige nome e CPF', () => {
    expect(toInput({ ...base, name: '' }).error).toBe('Preencha pelo menos nome completo e CPF.');
    expect(toInput({ ...base, cpf: '' }).error).toBe('Preencha pelo menos nome completo e CPF.');
  });

  it('rejeita CPF e datas inválidos', () => {
    expect(toInput({ ...base, cpf: '12345678900' }).error).toMatch(/CPF inválido/);
    expect(toInput({ ...base, birthDate: '31/02/1990' }).error).toMatch(/nascimento inválida/);
  });

  it('monta o corpo da API com campos normalizados', () => {
    const { input } = toInput({ ...base, birthDate: '14/03/1968', dependents: '4', cardUid: '04A21F9C', socialName: '' });
    expect(input).toMatchObject({
      name: 'Maria Aparecida',
      cpf: '123.456.789-09',
      socialName: null,
      birthDate: '1968-03-14',
      dependents: 4,
      cardUid: '04A21F9C',
    });
    expect(input?.registeredAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('pré-preenche o cartão lido na tela inicial', () => {
    expect(initialValues(null, '04B733E1').cardUid).toBe('04B733E1');
  });
});

describe('telefone vindo do portal', () => {
  it('o portal devolve só dígitos; o formulário mostra com máscara', () => {
    const b = { id: 'b1', code: 'A-0001', name: 'MARIA', socialName: null, phone: '21987654321', cpf: '123.456.789-09',
      birthDate: null, registeredAt: '2026-11-18', dependents: 0, cardUid: null, photoUrl: null, notes: null, active: true };
    expect(initialValues(b).phone).toBe('(21) 98765-4321');
  });
});

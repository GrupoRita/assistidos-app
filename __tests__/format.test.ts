import {
  addMonths,
  ageFrom,
  brDateToIso,
  formatCardUid,
  isValidCpf,
  isoDateToBr,
  maskCpf,
  maskDate,
  maskPhone,
  monthLabel,
  monthRange,
  normalizeCardUid,
  todayIso,
} from '@/lib/format';

describe('cartão NFC', () => {
  it('normaliza UID em qualquer formato', () => {
    expect(normalizeCardUid('04:a2:1f:9c')).toBe('04A21F9C');
    expect(normalizeCardUid('04-A2 1F 9C')).toBe('04A21F9C');
  });
  it('formata UID para exibição', () => {
    expect(formatCardUid('04a21f9c')).toBe('04:A2:1F:9C');
    expect(formatCardUid(null)).toBe('');
  });
});

describe('CPF', () => {
  it('aplica a máscara progressivamente', () => {
    expect(maskCpf('123')).toBe('123');
    expect(maskCpf('1234')).toBe('123.4');
    expect(maskCpf('1234567')).toBe('123.456.7');
    expect(maskCpf('12345678909')).toBe('123.456.789-09');
    expect(maskCpf('123456789091234')).toBe('123.456.789-09');
  });
  it('valida dígitos verificadores', () => {
    expect(isValidCpf('123.456.789-09')).toBe(true);
    expect(isValidCpf('123.456.789-00')).toBe(false);
    expect(isValidCpf('111.111.111-11')).toBe(false);
    expect(isValidCpf('123')).toBe(false);
  });
});

describe('telefone e data', () => {
  it('mascara celular e fixo', () => {
    expect(maskPhone('21987654321')).toBe('(21) 98765-4321');
    expect(maskPhone('2133334444')).toBe('(21) 3333-4444');
    expect(maskPhone('2')).toBe('(2');
  });
  it('mascara e converte datas', () => {
    expect(maskDate('14031968')).toBe('14/03/1968');
    expect(brDateToIso('14/03/1968')).toBe('1968-03-14');
    expect(brDateToIso('31/02/2020')).toBeNull();
    expect(brDateToIso('14/03')).toBeNull();
    expect(isoDateToBr('1968-03-14')).toBe('14/03/1968');
    expect(isoDateToBr(null)).toBe('');
  });
});

describe('datas no fuso de São Paulo', () => {
  // 02:30 UTC de 01/12 ainda é 30/11 em São Paulo (UTC-3).
  const lateNight = new Date('2026-12-01T02:30:00Z');
  it('usa o dia de São Paulo, não o UTC', () => {
    expect(todayIso(lateNight)).toBe('2026-11-30');
  });
  it('calcula a idade completa', () => {
    expect(ageFrom('1968-03-14', new Date('2026-03-13T15:00:00Z'))).toBe(57);
    expect(ageFrom('1968-03-14', new Date('2026-03-14T15:00:00Z'))).toBe(58);
    expect(ageFrom(null)).toBeNull();
  });
  it('rotula e navega pelos meses', () => {
    expect(monthLabel(2026, 11)).toBe('Novembro/26');
    expect(addMonths(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(monthRange(2024, 2)).toEqual({ from: '2024-02-01', to: '2024-02-29' });
  });
});

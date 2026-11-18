import { sortReportRows } from '@/lib/report';

const row = (id: string, attendedAt: string, name: string) => ({
  id,
  attendedAt,
  beneficiary: { id, code: id, name, socialName: null, photoUrl: null },
});

describe('ordenação do relatório', () => {
  it('ordena por dia, depois nome, depois horário', () => {
    const rows = [
      row('a', '2026-11-18T15:00:00Z', 'Maria'),
      row('b', '2026-11-17T20:00:00Z', 'Zélia'),
      row('c', '2026-11-18T12:00:00Z', 'Maria'),
      row('d', '2026-11-18T18:00:00Z', 'Ana'),
    ];
    expect(sortReportRows(rows).map((r) => r.id)).toEqual(['b', 'd', 'c', 'a']);
  });

  it('agrupa pelo dia de São Paulo (01h UTC conta no dia anterior)', () => {
    const rows = [row('late', '2026-11-18T01:00:00Z', 'Ana'), row('early', '2026-11-17T13:00:00Z', 'Bia')];
    expect(sortReportRows(rows).map((r) => r.id)).toEqual(['late', 'early']);
  });
});

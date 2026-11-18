import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { DateRange } from '@/components/date-range';
import { Empty, T } from '@/components/ui';
import { useAsync } from '@/hooks/use-async';
import { api } from '@/lib/api';
import { brDateToIso, formatDateTime, isoDateToBr, todayIso } from '@/lib/format';
import { sortReportRows } from '@/lib/report';
import { colors, fonts, radius } from '@/lib/theme';

export default function ReportScreen() {
  const today = todayIso();
  const [from, setFrom] = useState(isoDateToBr(today.slice(0, 8) + '01'));
  const [to, setTo] = useState(isoDateToBr(today));
  const fromIso = brDateToIso(from);
  const toIso = brDateToIso(to);

  const { data, error, loading } = useAsync(
    () => (fromIso && toIso ? api.listRecords({ from: fromIso, to: toIso, limit: 1000 }) : Promise.resolve([])),
    [fromIso, toIso],
  );
  const rows = useMemo(() => sortReportRows(data ?? []), [data]);

  return (
    <FlatList
      data={rows}
      keyExtractor={(r) => r.id}
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      ListHeaderComponent={
        <View style={{ gap: 14, marginBottom: 12 }}>
          <T variant="title">Atendimentos no período</T>
          <DateRange from={from} to={to} onFrom={setFrom} onTo={setTo} />
          <T variant="muted">
            {loading ? 'Carregando…' : `${rows.length} atendimento(s)`}
            {rows.length >= 1000 ? ' — mostrando os 1000 primeiros; reduza o período.' : ''}
          </T>
          {loading && <ActivityIndicator color={colors.nfc} />}
        </View>
      }
      ListEmptyComponent={!loading ? <Empty>{error ?? 'Nenhum atendimento no período.'}</Empty> : undefined}
      renderItem={({ item, index }) => (
        <View style={[styles.row, index === 0 && styles.first, index === rows.length - 1 && styles.last]}>
          <T variant="small">{formatDateTime(item.attendedAt)}</T>
          <T style={{ fontFamily: fonts.bold }}>{item.beneficiary.name}</T>
          <T variant="muted">
            {item.service.emoji} {item.service.name}
          </T>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 2,
  },
  first: { borderTopWidth: 1, borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md },
  last: { borderBottomLeftRadius: radius.md, borderBottomRightRadius: radius.md },
});

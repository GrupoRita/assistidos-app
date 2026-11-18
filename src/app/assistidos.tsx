import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { DateRange } from '@/components/date-range';
import { Avatar, Empty, Field, T } from '@/components/ui';
import { useAsync } from '@/hooks/use-async';
import { api } from '@/lib/api';
import { brDateToIso, displayName, isoDateToBr } from '@/lib/format';
import { colors, fonts, radius } from '@/lib/theme';

export default function BeneficiaryListScreen() {
  const [name, setName] = useState('');
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const fromIso = from ? brDateToIso(from) : undefined;
  const toIso = to ? brDateToIso(to) : undefined;

  useEffect(() => {
    const t = setTimeout(() => setQ(name.trim()), 300);
    return () => clearTimeout(t);
  }, [name]);

  const { data, error, loading } = useAsync(
    () =>
      api.listBeneficiaries({
        q: q || undefined,
        registeredFrom: fromIso ?? undefined,
        registeredTo: toIso ?? undefined,
        limit: 500,
      }),
    [q, fromIso, toIso],
  );
  const rows = data ?? [];

  return (
    <FlatList
      data={rows}
      keyExtractor={(b) => b.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
      ListHeaderComponent={
        <View style={{ gap: 14, marginBottom: 12 }}>
          <T variant="title">Assistidos cadastrados</T>
          <Field label="Nome" value={name} onChangeText={setName} placeholder="Digite parte do nome" />
          <DateRange from={from} to={to} onFrom={setFrom} onTo={setTo} fromLabel="Cadastro de" />
          <T variant="muted">{loading ? 'Carregando…' : `${rows.length} assistido(s)`}</T>
          {loading && !data && <ActivityIndicator color={colors.nfc} />}
        </View>
      }
      ListEmptyComponent={!loading ? <Empty>{error ?? 'Nenhum assistido encontrado.'}</Empty> : undefined}
      renderItem={({ item, index }) => (
        <Pressable
          onPress={() => router.push({ pathname: '/assistido/[id]', params: { id: item.id } })}
          style={({ pressed }) => [
            styles.row,
            index === 0 && styles.first,
            index === rows.length - 1 && styles.last,
            pressed && { backgroundColor: colors.accent },
          ]}
        >
          <Avatar uri={item.photoUrl} name={displayName(item)} size={40} />
          <View style={{ flex: 1 }}>
            <T style={{ fontFamily: fonts.bold }} numberOfLines={1}>
              {item.name}
            </T>
            <T variant="small">
              {item.phone || '—'} · cadastro {isoDateToBr(item.registeredAt) || '—'}
            </T>
          </View>
          <T variant="small">{item.code}</T>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  first: { borderTopWidth: 1, borderTopLeftRadius: radius.md, borderTopRightRadius: radius.md },
  last: { borderBottomLeftRadius: radius.md, borderBottomRightRadius: radius.md },
});

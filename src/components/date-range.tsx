import { View } from 'react-native';

import { Field } from '@/components/ui';
import { maskDate } from '@/lib/format';

export function DateRange({
  from,
  to,
  onFrom,
  onTo,
  fromLabel = 'De',
  toLabel = 'Até',
}: {
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  fromLabel?: string;
  toLabel?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Field style={{ flex: 1 }} label={fromLabel} value={from} onChangeText={(v) => onFrom(maskDate(v))} keyboardType="number-pad" placeholder="DD/MM/AAAA" />
      <Field style={{ flex: 1 }} label={toLabel} value={to} onChangeText={(v) => onTo(maskDate(v))} keyboardType="number-pad" placeholder="DD/MM/AAAA" />
    </View>
  );
}

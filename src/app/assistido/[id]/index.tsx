import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EditServiceButton, NewServiceTile, gridStyles } from '@/components/service-grid';
import { useToast } from '@/components/toast';
import { Avatar, Button, Card, Empty, Pill, T } from '@/components/ui';
import { useAsync } from '@/hooks/use-async';
import { api, ApiError, errorMessage } from '@/lib/api';
import {
  addMonths,
  ageFrom,
  displayName,
  formatCardUid,
  formatDateTime,
  formatTime,
  isoDateToBr,
  maskPhone,
  monthLabel,
  monthRange,
  plural,
  todayParts,
} from '@/lib/format';
import { countByService, monthlyStatus } from '@/lib/limits';
import type { AssistanceService } from '@/lib/types';
import { colors, fonts, radius } from '@/lib/theme';

export default function BeneficiaryPanel() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const toast = useToast();
  const today = todayParts();
  const current = monthRange(today.year, today.month);

  const beneficiary = useAsync(() => api.getBeneficiary(id), [id]);
  const services = useAsync(() => api.listServices(), []);
  const monthRecords = useAsync(() => api.listRecords({ beneficiaryId: id, ...current, limit: 1000 }), [id, current.from]);

  const [showData, setShowData] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [ref, setRef] = useState({ year: today.year, month: today.month });
  const [saving, setSaving] = useState<string | null>(null);

  const isCurrentRef = ref.year === today.year && ref.month === today.month;
  const refRange = monthRange(ref.year, ref.month);
  const history = useAsync(
    () => (isCurrentRef ? Promise.resolve(null) : api.listRecords({ beneficiaryId: id, ...refRange, limit: 1000 })),
    [id, refRange.from, isCurrentRef],
  );
  const refRecords = isCurrentRef ? monthRecords.data : history.data;

  const counts = useMemo(() => countByService(monthRecords.data ?? []), [monthRecords.data]);
  const limited = (services.data ?? []).filter((s) => s.monthlyLimit);

  const b = beneficiary.data;
  if (!b) {
    return (
      <View style={styles.center}>
        {beneficiary.error ? <Empty>{beneficiary.error}</Empty> : <ActivityIndicator color={colors.nfc} />}
      </View>
    );
  }
  const name = displayName(b);
  const age = ageFrom(b.birthDate);
  const currentLabel = monthLabel(today.year, today.month);
  const refLabel = monthLabel(ref.year, ref.month);

  const register = async (s: AssistanceService) => {
    if (monthlyStatus(s, counts).blocked || saving) return;
    setSaving(s.id);
    try {
      const rec = await api.createRecord(b.id, s.id);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      monthRecords.setData((prev) => [rec, ...(prev ?? [])]);
      toast(`${s.name} registrado às ${formatTime(rec.attendedAt)}`);
    } catch (e) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      toast(errorMessage(e), 'error');
      if (e instanceof ApiError && e.code === 'MONTHLY_LIMIT_REACHED') void monthRecords.reload();
    } finally {
      setSaving(null);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: name }} />

      <View style={styles.monthBanner}>
        <T style={styles.monthCaption}>MÊS DE REFERÊNCIA</T>
        <T style={styles.monthValue}>{currentLabel}</T>
      </View>

      <Card style={{ alignItems: 'center', gap: 12 }}>
        <Avatar uri={b.photoUrl} name={name} size={128} rounded={16} />
        <T style={styles.name}>{name}</T>
        <T variant="muted" style={{ textAlign: 'center' }}>
          {[b.code, age !== null ? `${age} anos` : null, plural(b.dependents, 'dependente', 'dependentes')]
            .filter(Boolean)
            .join(' · ')}
        </T>
        <View style={styles.row}>
          <Button label={showData ? 'Ocultar dados' : 'Ver dados completos'} variant="outline" small onPress={() => setShowData((v) => !v)} />
          <Button
            label="✎ Alterar dados"
            variant="outline"
            small
            onPress={() => router.push({ pathname: '/assistido/[id]/editar', params: { id: b.id } })}
          />
        </View>
        {showData && (
          <View style={styles.details}>
            <Detail label="Nome completo" value={b.name} />
            <Detail label="Nome social" value={b.socialName} />
            <Detail label="Telefone" value={b.phone ? maskPhone(b.phone) : null} />
            <Detail label="CPF" value={b.cpf} mono />
            <Detail label="Nascimento" value={isoDateToBr(b.birthDate)} />
            <Detail label="Cadastro" value={isoDateToBr(b.registeredAt)} />
            <Detail label="Dependentes" value={String(b.dependents)} />
            <Detail label="Cartão NFC" value={formatCardUid(b.cardUid)} mono />
            {b.notes ? <Detail label="Observações" value={b.notes} /> : null}
          </View>
        )}
        <View style={styles.row}>
          {limited.map((s) => {
            const st = monthlyStatus(s, counts);
            return (
              <Pill
                key={s.id}
                tone={st.blocked ? 'secondary' : 'accent'}
                label={st.blocked ? `✓ ${s.name} retirada este mês` : `${s.name} disponível este mês`}
              />
            );
          })}
          <Pill label={`${monthRecords.data?.length ?? 0} atendimentos em ${currentLabel}`} />
        </View>
      </Card>

      <Button
        label={showHistory ? 'Fechar histórico' : `📅 Histórico de ${refLabel}${refRecords ? ` (${refRecords.length})` : ''}`}
        onPress={() => setShowHistory((v) => !v)}
        style={{ alignSelf: 'center' }}
      />

      {showHistory && (
        <View style={{ gap: 10 }}>
          <View style={styles.monthNav}>
            <Button label="‹" variant="outline" small onPress={() => setRef((r) => addMonths(r.year, r.month, -1))} accessibilityLabel="Mês anterior" />
            <T style={{ fontFamily: fonts.bold, fontSize: 17 }}>Histórico de {refLabel}</T>
            <Button
              label="›"
              variant="outline"
              small
              disabled={isCurrentRef}
              onPress={() => setRef((r) => addMonths(r.year, r.month, 1))}
              accessibilityLabel="Próximo mês"
            />
          </View>
          {!refRecords ? (
            history.error ? <Empty>{history.error}</Empty> : <ActivityIndicator color={colors.nfc} />
          ) : refRecords.length === 0 ? (
            <Empty>Nenhum atendimento neste mês.</Empty>
          ) : (
            <View style={styles.list}>
              {refRecords.map((r, i) => (
                <View key={r.id} style={[styles.listRow, i > 0 && styles.listBorder]}>
                  <T style={{ fontSize: 20 }}>{r.service.emoji}</T>
                  <T style={{ fontFamily: fonts.medium, flex: 1 }}>{r.service.name}</T>
                  <T variant="muted">{formatDateTime(r.attendedAt)}</T>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={gridStyles.grid}>
        {(services.data ?? []).map((s) => {
          const st = monthlyStatus(s, counts);
          return (
            <View key={s.id} style={gridStyles.cell}>
              <Pressable
                onPress={() => void register(s)}
                disabled={st.blocked || !!saving}
                accessibilityRole="button"
                accessibilityLabel={`Registrar ${s.name}`}
                style={({ pressed }) => [
                  styles.serviceTile,
                  pressed && { borderColor: colors.primary, transform: [{ scale: 0.97 }] },
                  st.blocked && { opacity: 0.5 },
                ]}
              >
                <T style={{ fontSize: 36 }}>{s.emoji}</T>
                <T style={styles.serviceName}>{s.name}</T>
                <T variant="muted">{st.blocked ? 'Já retirada este mês' : (s.description ?? '')}</T>
                {saving === s.id && <ActivityIndicator color={colors.nfc} style={{ marginTop: 6 }} />}
              </Pressable>
              <EditServiceButton service={s} />
            </View>
          );
        })}
        <View style={gridStyles.cell}>
          <NewServiceTile big />
        </View>
      </View>
    </ScrollView>
  );
}

function Detail({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <T variant="muted" style={{ width: 120 }}>
        {label}
      </T>
      <T variant={mono ? 'mono' : 'body'} style={{ flex: 1, fontFamily: mono ? 'monospace' : fonts.medium, fontSize: 15 }}>
        {value || '—'}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  content: { padding: 20, gap: 20, paddingBottom: 60 },
  monthBanner: {
    backgroundColor: colors.nfc,
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthCaption: { color: colors.nfcForeground, opacity: 0.8, fontSize: 12, letterSpacing: 2 },
  monthValue: { color: colors.nfcForeground, fontFamily: fonts.display, fontSize: 18 },
  name: { fontFamily: fonts.display, fontSize: 22, textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  details: { alignSelf: 'stretch', backgroundColor: colors.muted, borderRadius: radius.md, padding: 12, gap: 6 },
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  list: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  listBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  serviceTile: {
    flex: 1,
    minHeight: 150,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 20,
  },
  serviceName: { fontFamily: fonts.bold, fontSize: 18, marginTop: 10 },
});

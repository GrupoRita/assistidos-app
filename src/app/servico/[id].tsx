import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { useToast } from '@/components/toast';
import { Button, Card, Empty, ErrorText, Field, T } from '@/components/ui';
import { useAsync } from '@/hooks/use-async';
import { api, errorMessage } from '@/lib/api';
import type { AssistanceService } from '@/lib/types';
import { colors, radius } from '@/lib/theme';

const SERVICE_EMOJIS = ['🧺', '🦷', '💬', '🤝', '📖', '🩺', '💊', '👕', '✂️', '🎨', '🍲', '🧘', '📚', '💼', '❤️', '⭐', '🩹', '👵', '🧸', '🤰'];

export default function ServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'novo';
  const { data, error } = useAsync(
    () => (isNew ? Promise.resolve(null) : api.listServices(true).then((all) => all.find((s) => s.id === id) ?? null)),
    [id, isNew],
  );

  if (!isNew && data === undefined) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        {error ? <Empty>{error}</Empty> : <ActivityIndicator color={colors.nfc} />}
      </View>
    );
  }
  if (!isNew && data === null) return <Empty>Serviço não encontrado.</Empty>;
  return <ServiceForm key={id} initial={data ?? undefined} />;
}

function ServiceForm({ initial }: { initial?: AssistanceService }) {
  const toast = useToast();
  const [f, setF] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    durationMinutes: String(initial?.durationMinutes ?? 30),
    monthlyLimit: initial?.monthlyLimit ? String(initial.monthlyLimit) : '',
    emoji: initial?.emoji ?? '⭐',
    active: initial?.active ?? true,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!f.name.trim()) {
      setError('Informe o nome do serviço.');
      return;
    }
    setSaving(true);
    setError('');
    const input = {
      name: f.name.trim(),
      description: f.description.trim() || null,
      emoji: f.emoji,
      durationMinutes: Number(f.durationMinutes) || null,
      monthlyLimit: Number(f.monthlyLimit) || null,
      active: f.active,
    };
    try {
      if (initial) await api.updateService(initial.id, input);
      else await api.createService(input);
      toast(initial ? 'Serviço atualizado' : 'Serviço criado');
      router.back();
    } catch (e) {
      setError(errorMessage(e));
      setSaving(false);
    }
  };

  const digits = (k: 'durationMinutes' | 'monthlyLimit') => (v: string) => setF({ ...f, [k]: v.replace(/\D/g, '').slice(0, 4) });

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: initial ? 'Editar serviço' : 'Novo serviço' }} />
      <Card style={{ gap: 16 }}>
        <T variant="title">{initial ? 'Editar serviço' : 'Novo serviço'}</T>
        <Field label="Nome *" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} />
        <Field label="Descrição" value={f.description} onChangeText={(v) => setF({ ...f, description: v })} />
        <Field label="Duração estimada do atendimento (minutos)" value={f.durationMinutes} onChangeText={digits('durationMinutes')} keyboardType="number-pad" />
        <Field
          label="Limite por mês (vazio = sem limite)"
          value={f.monthlyLimit}
          onChangeText={digits('monthlyLimit')}
          keyboardType="number-pad"
          placeholder="Ex.: 1 para a Matula"
        />
        <View style={{ gap: 6 }}>
          <T variant="label">Ícone</T>
          <View style={styles.emojis}>
            {SERVICE_EMOJIS.map((em) => (
              <Pressable
                key={em}
                onPress={() => setF({ ...f, emoji: em })}
                accessibilityLabel={`Ícone ${em}`}
                accessibilityState={{ selected: f.emoji === em }}
                style={[styles.emoji, f.emoji === em && styles.emojiSelected]}
              >
                <T style={{ fontSize: 24 }}>{em}</T>
              </Pressable>
            ))}
          </View>
        </View>
        {initial && (
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <T variant="label">Serviço ativo</T>
              <T variant="small">Serviços inativos somem da tela de atendimento.</T>
            </View>
            <Switch value={f.active} onValueChange={(v) => setF({ ...f, active: v })} trackColor={{ true: colors.nfc }} />
          </View>
        )}
        <ErrorText>{error}</ErrorText>
        <Button label="Salvar serviço" onPress={save} loading={saving} />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emojis: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emoji: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiSelected: { borderColor: colors.primary, backgroundColor: colors.accent },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});

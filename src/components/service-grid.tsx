import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { T } from '@/components/ui';
import type { AssistanceService } from '@/lib/types';
import { colors, fonts, radius } from '@/lib/theme';

/** Botão ✏️ que abre a edição do serviço. */
export function EditServiceButton({ service }: { service: AssistanceService }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/servico/[id]', params: { id: service.id } })}
      accessibilityLabel={`Editar ${service.name}`}
      hitSlop={8}
      style={styles.edit}
    >
      <T style={{ fontSize: 14 }}>✏️</T>
    </Pressable>
  );
}

export function NewServiceTile({ big }: { big?: boolean }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/servico/[id]', params: { id: 'novo' } })}
      style={[styles.tile, styles.dashed, big && styles.tileBig]}
      accessibilityRole="button"
      accessibilityLabel="Novo serviço"
    >
      <T style={{ fontSize: big ? 36 : 28, color: colors.mutedForeground }}>＋</T>
      <T style={[styles.name, big && { fontSize: 18 }, { color: colors.mutedForeground }]}>Novo serviço</T>
    </Pressable>
  );
}

/** Grade de serviços da tela inicial (somente consulta/edição). */
export function ServiceGrid({ services }: { services: AssistanceService[] }) {
  return (
    <View style={styles.grid}>
      {services.map((s) => (
        <View key={s.id} style={styles.cell}>
          <View style={styles.tile}>
            <T style={{ fontSize: 28 }}>{s.emoji}</T>
            <T style={styles.name}>{s.name}</T>
            <T variant="small">
              {[s.description, s.durationMinutes ? `${s.durationMinutes} min` : null].filter(Boolean).join(' · ')}
            </T>
          </View>
          <EditServiceButton service={s} />
        </View>
      ))}
      <View style={styles.cell}>
        <NewServiceTile />
      </View>
    </View>
  );
}

export const gridStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { width: '50%', padding: 6 },
});

const styles = StyleSheet.create({
  ...gridStyles,
  tile: {
    flex: 1,
    minHeight: 120,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 4,
  },
  tileBig: { minHeight: 150, borderRadius: radius.xl, padding: 20 },
  dashed: { borderStyle: 'dashed', borderWidth: 2, backgroundColor: 'transparent' },
  name: { fontFamily: fonts.bold, fontSize: 15, marginTop: 6 },
  edit: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});

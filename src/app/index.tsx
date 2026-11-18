import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ServiceGrid } from '@/components/service-grid';
import { Avatar, Button, Empty, T } from '@/components/ui';
import { useAsync } from '@/hooks/use-async';
import { api, ApiError, errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { displayName, formatCardUid, formatDateTime } from '@/lib/format';
import { cancelCardRead, nfcStatus, openNfcSettings, readCardUid, type NfcStatus } from '@/lib/nfc';
import type { Beneficiary } from '@/lib/types';
import { colors, fonts, radius } from '@/lib/theme';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function HomeScreen() {
  const { signOut, email } = useAuth();
  const me = useAsync(() => api.me(), []);
  const recent = useAsync(() => api.listRecords({ limit: 8 }), []);
  const services = useAsync(() => api.listServices(), []);
  const [showServices, setShowServices] = useState(false);

  const confirmSignOut = () =>
    Alert.alert('Sair', `Deseja sair da conta ${email ?? ''}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => void signOut() },
    ]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <T style={styles.title} numberOfLines={2}>
          {me.data?.organization.name ?? 'Rita Atende'}
        </T>
        <View style={styles.headerButtons}>
          <Button label="👥 Lista de assistidos" variant="outlineNfc" small style={{ flex: 1 }} onPress={() => router.push('/assistidos')} />
          <Button label="+ Novo assistido" small style={{ flex: 1 }} onPress={() => router.push('/assistido/novo')} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Image source={require('@/assets/images/logo-rita.jpg')} style={styles.logo} accessibilityLabel="Grupo de Estudos Espíritas Rita de Cássia" />
        <T style={styles.slogan}>Cada pessoa importa.{'\n'}Cada atendimento conta.</T>

        <CardReader />

        <View style={{ gap: 12 }}>
          <T variant="heading">Atendimentos recentes</T>
          {recent.error ? (
            <Empty>{recent.error}</Empty>
          ) : !recent.data?.length ? (
            <Empty>{recent.loading ? 'Carregando…' : 'Nenhum atendimento registrado ainda.'}</Empty>
          ) : (
            <View style={styles.grid}>
              {recent.data.map((r) => (
                <View key={r.id} style={styles.cell}>
                  <Pressable
                    style={({ pressed }) => [styles.recent, pressed && { borderColor: colors.primary }]}
                    onPress={() => router.push({ pathname: '/assistido/[id]', params: { id: r.beneficiary.id } })}
                  >
                    <Avatar uri={r.beneficiary.photoUrl} name={displayName(r.beneficiary)} />
                    <T style={{ fontFamily: fonts.bold, fontSize: 14, marginTop: 8 }} numberOfLines={1}>
                      {displayName(r.beneficiary)}
                    </T>
                    <T variant="small" numberOfLines={1}>
                      {r.service.emoji} {r.service.name}
                    </T>
                    <T variant="small">{formatDateTime(r.attendedAt)}</T>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <ManualSearch />

        {showServices && (
          <View style={{ gap: 12 }}>
            <T variant="heading">Serviços</T>
            {services.error ? <Empty>{services.error}</Empty> : <ServiceGrid services={services.data ?? []} />}
          </View>
        )}

        <View style={{ alignItems: 'center', gap: 8 }}>
          <Button label={showServices ? 'Fechar serviços' : '🧩 Serviços'} onPress={() => setShowServices((v) => !v)} />
          <Button label="Sair" variant="ghost" small onPress={confirmSignOut} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Cartão azul "Aproxime o cartão do assistido".
 * Android: lê continuamente enquanto a tela está aberta.
 * iOS: o sistema só lê com a folha de NFC aberta, então a leitura começa no toque.
 */
function CardReader() {
  const [status, setStatus] = useState<NfcStatus | 'checking'>('checking');
  const [message, setMessage] = useState('');
  const [unknownUid, setUnknownUid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const active = useRef(false);
  const autoRead = Platform.OS === 'android';

  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(0.45, { duration: 900 }), -1, true);
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const handleUid = useCallback(async (uid: string): Promise<boolean> => {
    setBusy(true);
    try {
      const b = await api.findByCard(uid);
      setMessage('');
      setUnknownUid(null);
      router.push({ pathname: '/assistido/[id]', params: { id: b.id } });
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setMessage(`Cartão ${formatCardUid(uid)} não cadastrado.`);
        setUnknownUid(uid);
      } else {
        setMessage(errorMessage(e));
      }
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      active.current = true;
      void (async () => {
        const s = await nfcStatus();
        setStatus(s);
        if (s !== 'ready' || !autoRead) return;
        while (active.current) {
          const uid = await readCardUid();
          if (!active.current) break;
          if (!uid) {
            await sleep(700);
            continue;
          }
          if (await handleUid(uid)) break;
        }
      })();
      return () => {
        active.current = false;
        void cancelCardRead();
      };
    }, [autoRead, handleUid]),
  );

  const readOnce = async () => {
    if (status !== 'ready') return;
    const uid = await readCardUid();
    if (uid) await handleUid(uid);
  };

  const hint =
    status === 'unsupported'
      ? 'Este aparelho não tem NFC. Use a busca manual abaixo.'
      : status === 'disabled'
        ? 'O NFC está desligado.'
        : autoRead
          ? null
          : 'Toque aqui para ler';

  return (
    <View style={{ gap: 8 }}>
      <Pressable
        onPress={autoRead ? undefined : readOnce}
        disabled={autoRead || busy}
        accessibilityRole={autoRead ? undefined : 'button'}
        style={styles.nfcCard}
      >
        <Animated.View style={[styles.nfcIcon, status === 'ready' && pulseStyle]}>
          <T style={{ fontSize: 34 }}>📶</T>
        </Animated.View>
        <T style={styles.nfcTitle}>{busy ? 'Buscando assistido…' : 'Aproxime o cartão do assistido'}</T>
        {hint && <T style={styles.nfcText}>{hint}</T>}
        {message ? <T style={[styles.nfcText, { fontFamily: fonts.bold }]}>{message}</T> : null}
      </Pressable>
      {status === 'disabled' && <Button label="Ativar NFC nas configurações" variant="outlineNfc" small onPress={() => void openNfcSettings()} />}
      {unknownUid && (
        <Button
          label="Cadastrar assistido com este cartão"
          variant="secondary"
          small
          onPress={() => router.push({ pathname: '/assistido/novo', params: { cardUid: unknownUid } })}
        />
      )}
    </View>
  );
}

function ManualSearch() {
  const [q, setQ] = useState('');
  const [found, setFound] = useState<{ term: string; results: Beneficiary[]; error: string }>({
    term: '',
    results: [],
    error: '',
  });
  const term = q.trim();

  useEffect(() => {
    if (term.length < 2) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const res = await api.listBeneficiaries({ q: term, limit: 20 });
        if (!cancelled) setFound({ term, results: res, error: res.length ? '' : 'Ninguém encontrado.' });
      } catch (e) {
        if (!cancelled) setFound({ term, results: [], error: errorMessage(e) });
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [term]);

  // Só mostra o resultado da busca correspondente ao texto atual.
  const current = term.length >= 2 && found.term === term;
  const results = current ? found.results : [];
  const error = current ? found.error : '';

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <T variant="heading">Busca manual</T>
        <Button label="📋 Relatório" variant="outline" small onPress={() => router.push('/relatorio')} />
      </View>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Nome, CPF ou código (ex: A-0012)"
        placeholderTextColor={colors.mutedForeground}
        style={styles.input}
        autoCorrect={false}
      />
      {error ? <T variant="muted">{error}</T> : null}
      {results.length > 0 && (
        <View style={styles.list}>
          {results.map((b, i) => (
            <Pressable
              key={b.id}
              onPress={() => router.push({ pathname: '/assistido/[id]', params: { id: b.id } })}
              style={({ pressed }) => [styles.row, i > 0 && styles.rowBorder, pressed && { backgroundColor: colors.accent }]}
            >
              <Avatar uri={b.photoUrl} name={displayName(b)} size={36} />
              <T style={{ fontFamily: fonts.medium, flex: 1 }} numberOfLines={1}>
                {displayName(b)}
              </T>
              <T variant="small">{b.code}</T>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  title: { fontFamily: fonts.display, fontSize: 19, color: colors.nfc, textAlign: 'center' },
  headerButtons: { flexDirection: 'row', gap: 8 },
  content: { padding: 20, gap: 28, paddingBottom: 48 },
  logo: { width: 150, height: 150, borderRadius: 24, alignSelf: 'center' },
  slogan: { fontFamily: fonts.displayItalic, fontSize: 18, color: colors.nfc, textAlign: 'center', marginTop: -12 },
  nfcCard: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 380,
    aspectRatio: 1.586,
    backgroundColor: colors.nfc,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  nfcIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(243,250,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nfcTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.nfcForeground, textAlign: 'center', marginTop: 6 },
  nfcText: { color: colors.nfcForeground, fontSize: 14, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { width: '50%', padding: 6 },
  recent: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.foreground,
  },
  list: { backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
});

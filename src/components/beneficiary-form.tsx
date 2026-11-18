import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Avatar, Button, Card, ErrorText, Field, T } from '@/components/ui';
import {
  brDateToIso,
  formatCardUid,
  isValidCpf,
  isoDateToBr,
  maskCpf,
  maskDate,
  maskPhone,
  todayIso,
} from '@/lib/format';
import { nfcStatus, openNfcSettings, readCardUid } from '@/lib/nfc';
import type { Beneficiary, BeneficiaryInput } from '@/lib/types';
import { colors, fonts, radius } from '@/lib/theme';

export type PickedPhoto = { uri: string; mimeType?: string | null; fileName?: string | null };

export type FormValues = {
  name: string;
  socialName: string;
  phone: string;
  cpf: string;
  birthDate: string;
  registeredAt: string;
  dependents: string;
  cardUid: string;
  notes: string;
};

export function initialValues(b?: Beneficiary | null, cardUid?: string): FormValues {
  return {
    name: b?.name ?? '',
    socialName: b?.socialName ?? '',
    phone: maskPhone(b?.phone ?? ''),
    cpf: b?.cpf ?? '',
    birthDate: isoDateToBr(b?.birthDate),
    registeredAt: isoDateToBr(b?.registeredAt ?? todayIso()),
    dependents: String(b?.dependents ?? 0),
    cardUid: b?.cardUid ?? cardUid ?? '',
    notes: b?.notes ?? '',
  };
}

/** Valida o formulário e monta o corpo da API. Retorna a mensagem de erro, se houver. */
export function toInput(f: FormValues): { input?: BeneficiaryInput; error?: string } {
  if (!f.name.trim() || !f.cpf.trim()) return { error: 'Preencha pelo menos nome completo e CPF.' };
  if (!isValidCpf(f.cpf)) return { error: 'CPF inválido. Confira os números.' };
  const birthDate = f.birthDate.trim() ? brDateToIso(f.birthDate) : null;
  if (f.birthDate.trim() && !birthDate) return { error: 'Data de nascimento inválida (use DD/MM/AAAA).' };
  const registeredAt = f.registeredAt.trim() ? brDateToIso(f.registeredAt) : todayIso();
  if (!registeredAt) return { error: 'Data de cadastro inválida (use DD/MM/AAAA).' };
  const dependents = Number(f.dependents || 0);
  if (!Number.isInteger(dependents) || dependents < 0) return { error: 'Dependentes deve ser um número inteiro.' };
  return {
    input: {
      name: f.name.trim(),
      socialName: f.socialName.trim() || null,
      phone: f.phone.trim() || null,
      cpf: maskCpf(f.cpf),
      birthDate,
      registeredAt,
      dependents,
      cardUid: f.cardUid.trim() || null,
      notes: f.notes.trim() || null,
    },
  };
}

export function BeneficiaryForm({
  title,
  initial,
  photoUrl,
  submitLabel,
  onSubmit,
}: {
  title: string;
  initial: FormValues;
  photoUrl?: string | null;
  submitLabel: string;
  onSubmit: (input: BeneficiaryInput, photo: PickedPhoto | null) => Promise<void>;
}) {
  const [f, setF] = useState<FormValues>(initial);
  const [photo, setPhoto] = useState<PickedPhoto | null>(null);
  const [error, setError] = useState('');
  const [nfcMsg, setNfcMsg] = useState('');
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k: keyof FormValues, mask?: (v: string) => string) => (v: string) =>
    setF((p) => ({ ...p, [k]: mask ? mask(v) : v }));

  const pickPhoto = () =>
    Alert.alert('Foto do assistido', undefined, [
      { text: 'Tirar foto', onPress: () => void choose('camera') },
      { text: 'Escolher da galeria', onPress: () => void choose('library') },
      { text: 'Cancelar', style: 'cancel' },
    ]);

  const choose = async (source: 'camera' | 'library') => {
    const perm =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setError(source === 'camera' ? 'Permissão da câmera negada.' : 'Permissão da galeria negada.');
      return;
    }
    const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.6 };
    const res = source === 'camera' ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
    const asset = res.canceled ? null : res.assets[0];
    if (asset) setPhoto({ uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName });
  };

  const readCard = async () => {
    const status = await nfcStatus();
    if (status === 'unsupported') {
      setNfcMsg('Este aparelho não tem NFC.');
      return;
    }
    if (status === 'disabled') {
      setNfcMsg('O NFC está desligado. Ative-o nas configurações.');
      void openNfcSettings();
      return;
    }
    setReading(true);
    setNfcMsg('Aproxime o cartão das costas do celular…');
    const uid = await readCardUid('Aproxime o cartão novo do assistido');
    setReading(false);
    if (uid) {
      setF((p) => ({ ...p, cardUid: uid }));
      setNfcMsg(`✓ Cartão ${formatCardUid(uid)} vinculado. Toque em salvar.`);
    } else {
      setNfcMsg('Não consegui ler o cartão. Segure-o parado nas costas do celular por 2 segundos.');
    }
  };

  const submit = async () => {
    const { input, error: err } = toInput(f);
    if (!input) {
      setError(err ?? '');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSubmit(input, photo);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Card style={{ gap: 16 }}>
          <T variant="title">{title}</T>

          <Pressable onPress={pickPhoto} style={{ alignItems: 'center', gap: 6 }} accessibilityRole="button" accessibilityLabel="Alterar foto">
            <Avatar uri={photo?.uri ?? photoUrl} name={f.socialName || f.name || '?'} size={112} rounded={16} />
            <T style={{ color: colors.nfc, fontFamily: fonts.bold }}>📷 {photo || photoUrl ? 'Trocar foto' : 'Adicionar foto'}</T>
          </Pressable>

          <Field label="Nome completo *" value={f.name} onChangeText={set('name')} autoCapitalize="words" />
          <Field label="Nome social" value={f.socialName} onChangeText={set('socialName')} autoCapitalize="words" />
          <Field label="Telefone" value={f.phone} onChangeText={set('phone', maskPhone)} keyboardType="phone-pad" placeholder="(21) 90000-0000" />
          <Field label="CPF *" value={f.cpf} onChangeText={set('cpf', maskCpf)} keyboardType="number-pad" placeholder="000.000.000-00" />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Field style={{ flex: 1 }} label="Nascimento" value={f.birthDate} onChangeText={set('birthDate', maskDate)} keyboardType="number-pad" placeholder="DD/MM/AAAA" />
            <Field style={{ flex: 1 }} label="Cadastro" value={f.registeredAt} onChangeText={set('registeredAt', maskDate)} keyboardType="number-pad" placeholder="DD/MM/AAAA" />
          </View>
          <Field label="Dependentes" value={f.dependents} onChangeText={set('dependents', (v) => v.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" />
          <Field label="Observações" value={f.notes} onChangeText={set('notes')} multiline />

          <View style={styles.nfcBox}>
            <T variant="label">Cartão NFC</T>
            <T variant="mono" style={{ fontSize: 18 }}>
              {f.cardUid ? formatCardUid(f.cardUid) : 'Nenhum cartão vinculado'}
            </T>
            <Button
              label={`📶 ${f.cardUid ? 'Gravar outro cartão' : 'Gravar cartão NFC'}`}
              variant="secondary"
              onPress={readCard}
              loading={reading}
              style={{ alignSelf: 'flex-start' }}
            />
            {nfcMsg ? <T variant="muted">{nfcMsg}</T> : null}
          </View>

          <ErrorText>{error}</ErrorText>
          <Button label={submitLabel} onPress={submit} loading={saving} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  nfcBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
  },
});

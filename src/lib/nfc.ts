import { Platform } from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

import { normalizeCardUid } from './format';

export type NfcStatus = 'ready' | 'unsupported' | 'disabled';

let started: Promise<void> | null = null;

function ensureStarted() {
  started ??= NfcManager.start();
  return started;
}

export async function nfcStatus(): Promise<NfcStatus> {
  try {
    if (!(await NfcManager.isSupported())) return 'unsupported';
    await ensureStarted();
    if (Platform.OS === 'android' && !(await NfcManager.isEnabled())) return 'disabled';
    return 'ready';
  } catch {
    // Sem o módulo nativo (Expo Go, web) o NFC simplesmente não existe.
    return 'unsupported';
  }
}

/** Tecnologias que expõem o UID do cartão (MIFARE, NTAG, ISO 14443/15693). */
const TECHS: NfcTech[] =
  Platform.OS === 'ios'
    ? [NfcTech.MifareIOS, NfcTech.Iso15693IOS, NfcTech.IsoDep, NfcTech.FelicaIOS]
    : [NfcTech.NfcA, NfcTech.NfcB, NfcTech.NfcF, NfcTech.NfcV, NfcTech.IsoDep];

/**
 * Espera um cartão encostar e devolve o UID normalizado ("04A21F9C").
 * Retorna null se a leitura for cancelada (pelo usuário ou por `cancelCardRead`).
 * No iOS abre a folha de leitura do sistema; no Android lê em segundo plano.
 */
export async function readCardUid(alertMessage = 'Aproxime o cartão do assistido'): Promise<string | null> {
  await ensureStarted();
  try {
    await NfcManager.requestTechnology(TECHS, { alertMessage });
    const tag = await NfcManager.getTag();
    const uid = normalizeCardUid(tag?.id ?? '');
    if (Platform.OS === 'ios') await NfcManager.setAlertMessageIOS('Cartão lido ✓').catch(() => undefined);
    return uid || null;
  } catch {
    return null;
  } finally {
    await NfcManager.cancelTechnologyRequest().catch(() => undefined);
  }
}

export async function cancelCardRead() {
  await NfcManager.cancelTechnologyRequest().catch(() => undefined);
}

export async function openNfcSettings() {
  await NfcManager.goToNfcSetting().catch(() => undefined);
}

import { Image } from 'expo-image';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, ErrorText, Field, T } from '@/components/ui';
import { errorMessage } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors, fonts } from '@/lib/theme';

export default function LoginScreen() {
  const auth = useAuth();
  const [email, setEmail] = useState(auth.email ?? '');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Informe um e-mail válido.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await auth.sendCode(email);
      setStep('code');
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (code.trim().length < 6) {
      setError('Digite os 6 números do código.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await auth.verifyCode(email, code);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image source={require('@/assets/images/logo-rita.jpg')} style={styles.logo} />
          <T style={styles.slogan}>
            Cada pessoa importa.{'\n'}Cada atendimento conta.
          </T>
          <Card style={{ gap: 16, width: '100%', maxWidth: 420 }}>
            <T variant="title">Entrar</T>
            {step === 'email' ? (
              <>
                <T variant="muted">Use o mesmo e-mail do Portal da Casa. Enviaremos um código de acesso.</T>
                <Field
                  label="E-mail"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="voce@exemplo.com"
                  onSubmitEditing={send}
                  returnKeyType="send"
                />
                <ErrorText>{error}</ErrorText>
                <Button label="Receber código" onPress={send} loading={busy} />
              </>
            ) : (
              <>
                <T variant="muted">Enviamos um código de 6 números para {email.trim().toLowerCase()}.</T>
                <Field
                  label="Código"
                  value={code}
                  onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  textContentType="oneTimeCode"
                  placeholder="000000"
                  onSubmitEditing={verify}
                  autoFocus
                />
                <ErrorText>{error}</ErrorText>
                <Button label="Entrar" onPress={verify} loading={busy} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Button label="Trocar e-mail" variant="ghost" small onPress={() => { setStep('email'); setCode(''); setError(''); }} />
                  <Button label="Reenviar código" variant="ghost" small onPress={send} disabled={busy} />
                </View>
              </>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 20 },
  logo: { width: 140, height: 140, borderRadius: 24 },
  slogan: { fontFamily: fonts.displayItalic, fontSize: 18, color: colors.nfc, textAlign: 'center' },
});

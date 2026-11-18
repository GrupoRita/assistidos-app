import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { colors, fonts, radius } from '@/lib/theme';

export function T({
  children,
  style,
  variant = 'body',
  numberOfLines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  variant?: 'body' | 'muted' | 'small' | 'title' | 'heading' | 'label' | 'mono';
  numberOfLines?: number;
}) {
  return (
    <Text style={[styles.text, textVariants[variant], style]} numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

type ButtonVariant = 'nfc' | 'outline' | 'outlineNfc' | 'secondary' | 'ghost' | 'destructive';

export function Button({
  label,
  onPress,
  variant = 'nfc',
  disabled,
  loading,
  small,
  style,
  accessibilityLabel,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: v.bg, borderColor: v.border },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <Text style={[styles.buttonText, small && { fontSize: 14 }, { color: v.fg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  error,
  style,
  ...input
}: TextInputProps & { label: string; error?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ gap: 4 }, style]}>
      <T variant="label">{label}</T>
      <TextInput
        placeholderTextColor={colors.mutedForeground}
        {...input}
        style={[styles.input, error ? { borderColor: colors.destructive } : null]}
      />
      {error ? <T style={{ color: colors.destructive, fontSize: 13 }}>{error}</T> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <View style={styles.empty}>
      <T variant="muted" style={{ textAlign: 'center' }}>
        {children}
      </T>
    </View>
  );
}

export function Pill({ label, tone = 'muted' }: { label: string; tone?: 'muted' | 'secondary' | 'accent' }) {
  const bg = tone === 'secondary' ? colors.secondary : tone === 'accent' ? colors.accent : colors.muted;
  const fg = tone === 'secondary' ? colors.secondaryForeground : colors.accentForeground;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={{ color: fg, fontFamily: fonts.bold, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export function Avatar({
  uri,
  name,
  size = 48,
  rounded = size / 2,
}: {
  uri: string | null | undefined;
  name: string;
  size?: number;
  rounded?: number;
}) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: rounded, backgroundColor: colors.muted }}
        contentFit="cover"
        transition={150}
        accessibilityLabel={`Foto de ${name}`}
      />
    );
  }
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        backgroundColor: colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: fonts.display, fontSize: size * 0.38, color: colors.primary }}>{initials}</Text>
    </View>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <T style={{ color: colors.destructive, fontFamily: fonts.medium }}>{children}</T>;
}

const styles = StyleSheet.create({
  text: { color: colors.foreground, fontFamily: fonts.body, fontSize: 16 },
  button: {
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmall: { minHeight: 38, paddingHorizontal: 14, paddingVertical: 7 },
  buttonText: { fontFamily: fonts.bold, fontSize: 16, textAlign: 'center' },
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
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  empty: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 24,
  },
  pill: { borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 5 },
});

const textVariants = StyleSheet.create({
  body: {},
  muted: { color: colors.mutedForeground, fontSize: 14 },
  small: { color: colors.mutedForeground, fontSize: 12 },
  title: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32 },
  heading: { fontFamily: fonts.bold, fontSize: 17 },
  label: { fontFamily: fonts.medium, fontSize: 14 },
  mono: { fontFamily: 'monospace', fontSize: 16 },
});

const buttonVariants: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  nfc: { bg: colors.nfc, fg: colors.nfcForeground, border: colors.nfc },
  outline: { bg: 'transparent', fg: colors.foreground, border: colors.border },
  outlineNfc: { bg: 'transparent', fg: colors.nfc, border: colors.nfc },
  secondary: { bg: colors.secondary, fg: colors.secondaryForeground, border: colors.secondary },
  ghost: { bg: 'transparent', fg: colors.nfc, border: 'transparent' },
  destructive: { bg: 'transparent', fg: colors.destructive, border: colors.destructive },
};

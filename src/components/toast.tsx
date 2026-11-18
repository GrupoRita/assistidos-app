import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius } from '@/lib/theme';

type ToastTone = 'success' | 'error';
const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string; tone: ToastTone } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const show = useCallback((message: string, tone: ToastTone = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message, tone });
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <View pointerEvents="none" style={[styles.wrap, { bottom: insets.bottom + 24 }]}>
          <Animated.View
            key={toast.id}
            entering={FadeInDown}
            exiting={FadeOutDown}
            accessibilityLiveRegion="polite"
            style={[styles.toast, { backgroundColor: toast.tone === 'error' ? colors.destructive : colors.nfc }]}
          >
            <Text style={styles.text}>
              {toast.tone === 'success' ? '✓ ' : ''}
              {toast.message}
            </Text>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: {
    borderRadius: radius.full,
    paddingHorizontal: 22,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  text: { color: colors.nfcForeground, fontFamily: fonts.bold, fontSize: 15, textAlign: 'center' },
});

/** Paleta do mockup "Rita Atende" (convertida de oklch para hex). */
export const colors = {
  background: '#FBF6EE',
  foreground: '#020618',
  card: '#FFFFFF',
  primary: '#822B31',
  nfc: '#005998',
  nfcForeground: '#F3FAFF',
  secondary: '#9EE1AB',
  secondaryForeground: '#062911',
  muted: '#F1F5F9',
  mutedForeground: '#62748E',
  accent: '#FAE5C3',
  accentForeground: '#0F172B',
  destructive: '#E7000B',
  border: '#E2E8F0',
} as const;

export const fonts = {
  display: 'Fraunces_700Bold',
  displayItalic: 'Fraunces_400Regular_Italic',
  body: 'NunitoSans_400Regular',
  medium: 'NunitoSans_600SemiBold',
  bold: 'NunitoSans_700Bold',
} as const;

export const radius = { md: 12, lg: 16, xl: 24, full: 999 } as const;

import Constants from 'expo-constants';

/**
 * URL do portal (people-manager). Em desenvolvimento, aponte para o servidor
 * local com `EXPO_PUBLIC_PORTAL_URL=http://<ip-da-maquina>:3025 npx expo start`.
 */
export const PORTAL_URL: string = (
  process.env.EXPO_PUBLIC_PORTAL_URL ||
  (Constants.expoConfig?.extra?.portalUrl as string | undefined) ||
  'https://portal.rita.org.br'
).replace(/\/+$/, '');

# CLAUDE.md

App mobile **Rita Atende** (Expo SDK 58 + React Native + TypeScript). Veja o README.

## Regras

- Respostas ao usuário em português com acentuação correta (ele escreve sem acentos).
- Código em inglês; textos da interface em português.
- Expo muda a cada SDK: antes de usar uma API do Expo/EAS, consulte
  `https://docs.expo.dev/versions/v58.0.0/` (ou `https://docs.expo.dev/llms.txt`) em vez de confiar na memória.
- Instale dependências com `npx expo install <pacote>` (resolve versões compatíveis).
- Nunca crie/edite `ios/` e `android/` à mão (Continuous Native Generation) — use `app.json` e config plugins.
- O NFC (`react-native-nfc-manager`) não existe no Expo Go: testes manuais exigem development build.
- A API vive no repo `people-manager` em `app/api/portal/assistance/` — o contrato está
  descrito em `src/lib/api.ts` / `src/lib/types.ts`; mudanças de contrato precisam ser feitas nos dois repos.
- Toda mudança de comportamento vem com teste em `__tests__/` na mesma alteração.
- Antes de concluir: `npm test`, `npm run typecheck`, `npm run lint`.

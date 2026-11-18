# Rita Atende

App mobile nativo (React Native + Expo) para registrar os **atendimentos dos assistidos**
da Casa Espírita Cristã Maria de Nazaré. O voluntário aproxima o **cartão NFC** do
assistido do celular, o app abre a ficha dele e um toque registra o serviço prestado
(Matula, Dentista, Psicóloga…).

Os dados ficam no **Portal da Casa** ([people-manager](https://github.com/GrupoRita/people-manager)),
na API `/api/portal/assistance`.

## Funcionalidades

- Login com o e-mail do Portal da Casa (código de 6 números por e-mail)
- Leitura do cartão NFC — contínua no Android, por toque no iOS
- Ficha do assistido: foto, idade, dependentes, dados completos, histórico por mês
- Registro de atendimento com um toque, respeitando limite mensal (ex.: Matula 1×/mês)
- Cadastro e edição de assistidos, com foto pela câmera/galeria e gravação do cartão NFC
- Cadastro de serviços (ícone, descrição, duração, limite por mês)
- Lista de assistidos e relatório de atendimentos por período
- Busca manual por nome, CPF ou código

## Stack

- [Expo](https://expo.dev) SDK 58 · React Native 0.88 · TypeScript
- [Expo Router](https://docs.expo.dev/router/introduction/) (rotas em `src/app/`)
- [react-native-nfc-manager](https://github.com/revtel/react-native-nfc-manager) para o NFC
- `expo-secure-store` (token), `expo-image-picker` (foto), Jest + `jest-expo` (testes)

## Desenvolvendo

O NFC é um módulo nativo, então **o app não roda no Expo Go** — é preciso um
*development build* (uma vez só; depois o código JS recarrega na hora).

```bash
npm install

# Development build (na nuvem, sem Android Studio/Xcode)
npx eas-cli@latest build --profile development --platform android

# ...ou localmente, com o celular no USB
npx expo run:android

# Servidor de desenvolvimento apontando para um portal local
EXPO_PUBLIC_PORTAL_URL=http://<ip-da-sua-maquina>:3025 npx expo start
```

Sem `EXPO_PUBLIC_PORTAL_URL`, o app usa `https://portal.rita.org.br` (`extra.portalUrl` em `app.json`).

### Comandos

```bash
npm test            # testes (Jest)
npm run typecheck   # TypeScript
npm run lint        # ESLint
npx expo-doctor     # confere dependências e configuração do Expo
```

## Estrutura

```
src/
  app/                  # telas (Expo Router)
    _layout.tsx         # fontes, autenticação, pilha de navegação
    login.tsx           # e-mail → código
    index.tsx           # leitura NFC, recentes, busca, serviços
    assistidos.tsx      # lista de assistidos
    relatorio.tsx       # atendimentos no período
    assistido/novo.tsx, assistido/[id]/index.tsx, assistido/[id]/editar.tsx
    servico/[id].tsx    # criar/editar serviço ("novo" cria)
  components/           # UI compartilhada (botões, campos, formulário, toast)
  hooks/use-async.ts    # carregamento com recarga ao voltar para a tela
  lib/                  # api, auth, nfc, formatação, regras de limite mensal
__tests__/              # testes unitários
```

## Permissões no portal

Qualquer usuário do Portal da Casa com **perfil de trabalhador ativo** na organização
pode usar o app. Os dados são sempre isolados pela organização da conta.

## Licença

[MIT](http://www.opensource.org/licenses/mit-license.php)

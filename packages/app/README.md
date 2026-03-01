# 🥊 CT de Boxe — App Mobile

App mobile para o **Centro de Treinamento de Boxe — Equipe Argel Riboli**, desenvolvido em React Native com Expo. O sistema substitui o uso atual do Tecnofit, centralizando o gerenciamento de alunos, check-ins, treinos, pagamentos e comunicação do CT.

---

## ⚠️ Boas Práticas e Regras de Segurança

> Leia antes de executar qualquer comando ou usar agentes de IA no terminal.

### Regras para uso com agentes de IA (Claude Code, Copilot, etc.)

- **Nunca autorize comandos de deleção sem revisar.** Qualquer comando contendo `rmdir`, `rm -rf`, `del`, `Remove-Item` ou similar deve ser lido com atenção antes de executar. Se o agente sugerir apagar algo, pause e confirme se faz sentido.
- **Revise cada passo antes de confirmar.** Agentes podem encadear ações rapidamente — leia o que será feito antes de dar OK.
- **Nunca rode comandos fora da pasta do projeto.** O terminal sempre deve estar dentro de `ct-boxe/`. Confirme com `pwd` (Mac/Linux) ou `Get-Location` (Windows) antes de rodar qualquer coisa.
- **Em caso de dúvida, cancele.** `Ctrl+C` interrompe qualquer comando em execução no terminal. Use sem medo.
- **Nunca apague pastas do sistema ou do perfil de usuário do Windows.** Pastas como `C:\Users\seu-usuario\Desktop`, `Documents`, `Downloads` são do sistema operacional — jamais devem ser tocadas por scripts do projeto.

### Regras para o nome da pasta do projeto

- **O nome da pasta não pode ter espaços, acentos ou caracteres especiais.** Use sempre `ct-boxe` (com hífen, sem maiúsculas).
- ✅ Correto: `C:\projetos\ct-boxe`
- ❌ Errado: `C:\CT do Boxe`, `C:\Área de Trabalho\CT do Boxe`

### Regras para Git e GitHub

- **Nunca force push na branch main** sem alinhamento com o time.
- **Sempre commite antes de mudar de branch** para não perder trabalho.
- **Não commite arquivos com credenciais** (URLs do Supabase, chaves de API). Use `.env` e certifique-se que `.gitignore` está configurado.

---

## 📱 Sobre o Projeto

- **Cliente:** CT de Boxe — Equipe Argel Riboli
- **Plataforma:** iOS e Android (via Expo)
- **Público:** ~200 alunos com recorrência mensal
- **Status:** Em desenvolvimento — fase inicial

---

## 🧱 Stack Tecnológica

| Camada | Tecnologia | Descrição |
|---|---|---|
| App base | React Native + Expo | Framework principal do app mobile |
| Estilização | NativeWind (Tailwind CSS) | Classes utilitárias para estilização |
| Componentes UI | Gluestack UI v2 | Biblioteca de componentes compatível com NativeWind |
| Backend / Banco | Supabase | Banco de dados PostgreSQL, autenticação e API |
| Pagamentos | Mercado Pago SDK | Integração para cobranças recorrentes |
| Editor | VS Code | Ambiente de desenvolvimento |

---

## 🎨 Design

- **Tema:** Claro (light mode)
- **Paleta:** Branco como base, vermelho como cor de acento
- **Design System:** Gluestack UI v2 customizado
- **Referência visual:** App atual Tecnofit (mapeado e analisado)

### Problemas identificados no Tecnofit (a evitar):
- Navegação via drawer dificulta descoberta de funcionalidades
- Telas vazias passam sensação de produto incompleto
- Check-in com UX desnecessariamente complexa

---

## 🗂️ Arquitetura de Informação

Navegação principal via **Bottom Tab Navigation** (a definir tabs exatas).

Funcionalidades previstas:
- Autenticação de alunos
- Home com próximas aulas e avisos
- Check-in em aulas
- Visualização de treinos/fichas
- Histórico de presença
- Pagamentos e recorrência (Mercado Pago)
- Feed de comunicados do CT

---

## ☁️ Infraestrutura

- **App:** Distribuído via Play Store e App Store (sem hospedagem de servidor)
- **Backend:** Supabase (plano gratuito — suporta até 50k usuários ativos/mês, suficiente para ~200 alunos)
- **Hostinger / Laravel / PHP:** Não utilizados neste projeto

---

## 🚀 Instalação e Setup

### Antes de começar — checklist obrigatório

- [ ] A pasta do projeto tem nome sem espaços ou acentos? (`ct-boxe` ✅)
- [ ] O terminal está aberto dentro da pasta correta?
- [ ] Você tem Node.js instalado? (`node -v` deve retornar uma versão)
- [ ] Você tem uma conta no Expo e no Supabase?

### Pré-requisitos

- Node.js (versão LTS) — [https://nodejs.org](https://nodejs.org)
- VS Code — [https://code.visualstudio.com](https://code.visualstudio.com)
- Conta no Expo — [https://expo.dev](https://expo.dev)
- Conta no Supabase — [https://supabase.com](https://supabase.com)
- App **Expo Go** no celular (para testar durante o desenvolvimento)

### 1. Instalar o Expo CLI

```bash
npm install -g expo-cli
```

### 2. Criar o projeto

> ⚠️ Execute este comando em uma pasta com nome simples, sem espaços ou acentos.
> O agente ou terminal pode ter comportamento imprevisível em pastas com nomes especiais.

```bash
npx create-expo-app ct-boxe --template blank-typescript
cd ct-boxe
```

### 3. Instalar NativeWind

```bash
npm install nativewind
npm install --save-dev tailwindcss
npx tailwindcss init
```

Configurar o `tailwind.config.js`:

```js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Adicionar no `babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["nativewind/babel"],
  };
};
```

### 4. Instalar Gluestack UI v2

```bash
npx gluestack-ui init
```

Seguir o assistente de configuração. Documentação oficial: [https://gluestack.io](https://gluestack.io)

### 5. Instalar Supabase Client

```bash
npm install @supabase/supabase-js
```

Criar o arquivo `lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'SUA_URL_AQUI'
const supabaseAnonKey = 'SUA_CHAVE_AQUI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

> ⚠️ Nunca commite esse arquivo com as chaves reais. Use variáveis de ambiente (`.env`) e adicione ao `.gitignore`.
> As chaves ficam no painel do Supabase em **Project Settings > API**.

### 6. Rodar o projeto

```bash
npx expo start
```

Escanear o QR Code com o Expo Go no celular.

---

## 📁 Estrutura de Pastas Sugerida

```
ct-boxe/
├── app/                  # Telas (roteamento via Expo Router)
│   ├── (tabs)/           # Telas das tabs principais
│   ├── auth/             # Login e cadastro
│   └── _layout.tsx       # Layout raiz
├── components/           # Componentes reutilizáveis
├── lib/                  # Configurações (supabase.ts, etc)
├── assets/               # Imagens, fontes, ícones
├── constants/            # Cores, temas, constantes
└── README.md
```

---

## 🔗 Links Úteis

- [Expo Docs](https://docs.expo.dev)
- [NativeWind Docs](https://www.nativewind.dev)
- [Gluestack UI v2](https://gluestack.io)
- [Supabase Docs](https://supabase.com/docs)
- [Mercado Pago SDK React Native](https://www.mercadopago.com.br/developers/pt/docs)

---

## 👤 Responsável pelo Design

Gabriel — UX/UI Designer  
Ferramentas: Figma, Whimsical

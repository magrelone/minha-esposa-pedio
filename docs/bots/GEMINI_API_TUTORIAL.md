# 🔑 Tutorial: Como Obter Sua Chave de API Gratuita do Google Gemini (GEMINI_API_TUTORIAL.md)

Este guia ensina o passo a passo completo para obter uma chave de API do **Google Gemini 2.0 Flash** sem pagar nada e sem precisar cadastrar cartão de crédito.

---

## ⚡ Por que Usar o Gemini 2.0 Flash no Bot?
- **Camada 100% Gratuita**: **1.500 requisições por dia** (com limite de 15 por minuto).
- **Sem Cartão de Crédito**: O Google AI Studio não exige forma de pagamento para a camada gratuita.
- **Detecção Cirúrgica em Jogos Difíceis**: Entende e detecta itens mesmo com filtros de névoa, bloom, saturação excessiva de cores e motion blur.
- **Proteção no Aplicativo**: Nosso sistema conta com limitador automático em 1.500/dia, bloqueando qualquer excesso e mantendo seu gasto em **R$ 0,00**.

---

## 📋 Passo a Passo para Gerar a Chave (Leva menos de 1 minuto)

### Passo 1: Acessar o Google AI Studio
1. Abra o navegador e acesse: 👉 [https://aistudio.google.com/](https://aistudio.google.com/)
2. Faça login com qualquer conta normal do Google (Gmail).

---

### Passo 2: Ir para a Seção de Chaves de API
1. No menu superior ou lateral esquerdo, clique no botão azul **"Get API key"** (Obter chave de API).
   *(Link direto: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey))*.

---

### Passo 3: Criar uma Nova Chave
1. Clique no botão **"Create API key"** (ou *"Criar chave de API em novo projeto"*).
2. Se aparecer uma lista de projetos, selecione **"Create API key in new project"**.
3. Em poucos segundos, uma chave alfanumérica será gerada (ela começa com `AIzaSy...`).

---

### Passo 4: Copiar e Salvar a Chave
1. Clique no ícone de copiar ao lado da chave gerada.
2. Guarde-a com segurança (ela funciona como sua senha de acesso ao modelo).

---

### Passo 5: Inserir a Chave no Aplicativo
Você pode conectar sua chave de duas formas simples:

#### Opção A: Pela Interface do Aplicativo (Mais Fácil)
1. Abra o aplicativo **💕 Pedi para meu marido**.
2. Vá na aba **Configurações** (ou aba **Bots > Visão**).
3. No campo **"Chave da API Gemini"**, cole sua chave (`AIzaSy...`) e clique em **Salvar**.

#### Opção B: Por Variável de Ambiente
1. No Windows, abra o PowerShell ou Prompt de Comando e execute:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'SUA_CHAVE_AQUI', 'User')
   ```
2. O aplicativo e o Bot SDK detectarão a variável automaticamente.

---

## 🛡️ Monitoramento de Cota e Gastos no Aplicativo
- O aplicativo salva localmente o arquivo de controle em `runtime/gemini_usage.json`.
- Cada requisição de imagem feita consome 1 ponto da cota diária.
- Ao atingir **1.500 requisições**, o aplicativo trava novas chamadas à nuvem até a meia-noite seguinte para garantir que você **nunca seja cobrado**.
- O custo estimado exibido é permanentemente **R$ 0,00 (Gratuito)**.

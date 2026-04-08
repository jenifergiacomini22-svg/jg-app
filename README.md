# ⚡ JG App - Progressive Web App

Aplicativo de produção de conteúdo para gerenciar agenda, ideias e roteiros para vídeos.

## 📋 Funcionalidades

### 📊 Dashboard
- Visão geral do dia
- Cards de frentes (Marca Pessoal, Escritório, Lex Aura)
- Ideias recentes
- Eventos de hoje

### 📅 Agenda
- Integração com Google Calendar (próxima atualização)
- Visualização por dia, semana e mês
- Navegação entre datas

### 💡 Banco de Ideias
- Kanban com 4 colunas: Ideia Bruta → Em Roteiro → Para Gravar → Publicado
- Filtro por frente
- Drag & drop entre colunas
- Tipos: Insight, Link, Print, Roteiro

### 📖 Teleprompter
- Lista de roteiros salvos
- Auto-scroll com controle de velocidade
- Fullscreen para gravação
- Teclado: ESPAÇO para play/pause

## 🚀 Instalar Localmente

1. Baixe os arquivos da pasta `PWA`
2. Abra `index.html` no navegador
3. Recomendado: use um servidor local (vs. abrir direto o arquivo)

## 📦 Arquivos

- `index.html` - Estrutura do app
- `styles.css` - Estilos (tema claro, 3 paletas de cores)
- `app.js` - Lógica da aplicação
- `manifest.json` - Configuração PWA
- `service-worker.js` - Offline support

## 🌐 Deploy no Netlify

### Opção 1: Arrastar & Soltar (Mais Fácil)

1. Vá para **drop.netlify.com**
2. Arraste a pasta `PWA` inteira para a página
3. Pronto! Seu app terá um URL público

### Opção 2: Git + Deploy Automático

1. Crie um repositório GitHub (ou GitLab)
2. Faça upload da pasta `PWA`
3. Conecte seu repositório ao Netlify
4. Netlify faz deploy automático a cada push

### Opção 3: Netlify CLI

```bash
npm install -g netlify-cli
cd PWA
netlify deploy
```

## 💾 Dados

Os dados são salvos **localmente** no navegador usando `localStorage`:
- Ideias
- Roteiros

Não há sincronização com backend por enquanto.

## 🔜 Próximas Atualizações

- [ ] Google Calendar API integração
- [ ] Backend para sincronizar dados
- [ ] Google Agenda autenticação
- [ ] Compartilhamento de ideias
- [ ] Notificações de lembretes
- [ ] Temas personalizáveis

## ⌨️ Atalhos

- `ESPAÇO` - Play/Pause Teleprompter
- `ESC` - Fechar modais

## 🎨 Cores

**Marca Pessoal:**
- Dourado: `#C4A96B`
- Cobre: `#A0673A`
- Grafite: `#6B6868`

**Escritório (Giacomini & Silva):**
- Dourado: `#C79938`
- Dourado Vibrant: `#F2C445`

**Lex Aura:**
- Roxo Royal: `#452A5B`
- Ciano: `#60E0F0`
- Orquídea: `#C9A0D4`

## 📱 Responsividade

Totalmente responsivo para:
- Celular (320px+)
- Tablet (768px+)
- Desktop (1024px+)

## 🔒 Privacy

Todos os dados ficam no seu dispositivo. Nenhuma informação é enviada para servidores externos (sem conexão com APIs externas).

---

**Feito com ❤️ para Jenifer Giacomini**

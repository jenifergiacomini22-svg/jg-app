# 🚀 Deploy no Netlify — Guia Rápido

## ⚡ Opção Mais Fácil: Netlify Drop (Sem Conta Necessária)

### Passo 1
Abra seu navegador e vá para:
```
https://drop.netlify.com
```

### Passo 2
Você vai ver uma página com um grande retângulo cinza que diz **"Drag and drop your site output folder here"**

Na pasta `App Jenifer/PWA`, você tem estes arquivos:
- ✅ index.html
- ✅ styles.css
- ✅ app.js
- ✅ manifest.json
- ✅ service-worker.js
- ✅ README.md

### Passo 3
**Arraste a pasta `PWA` inteira** para o retângulo cinza do Netlify Drop.

### Passo 4
Esperare alguns segundos (normalmente menos de 30s). Você vai ver:
```
✅ Site deployed!
Domain: https://[nome-aleatorio].netlify.app
```

### Passo 5
Clique no link. Seu app está ao vivo! 🎉

---

## 📱 Teste no Celular

1. Abra a URL no navegador do seu celular (mesmo WiFi do PC)
2. Aperte o botão de menu (⋮)
3. Procure por **"Adicionar à tela inicial"** ou **"Install app"**
4. Pronto! O app aparece como ícone na tela principal

---

## 🔐 Usar Domínio Personalizado (Opcional)

Se quiser um domínio próprio tipo `meuapp.com`:

1. Crie conta gratuita em https://www.netlify.com
2. Conecte seu domínio nas configurações
3. (Pode ser feito depois — teste primeiro com o domínio temporário)

---

## ⚙️ Se Quiser Fazer Deploy Automático (GitHub)

### Setup (Uma vez)
1. Crie repo GitHub: `https://github.com/new`
2. Nome: `jg-app`
3. Faça upload da pasta `PWA`
4. Conecte ao Netlify: vá em https://app.netlify.com e clique **"Connect to Git"**
5. Selecione seu repo
6. Pronto! Cada `git push` faz deploy automático

---

## 🐛 Se Algo Não Funcionar

- **"Página em branco"** → Abra o Console (F12) e veja erros
- **"Banco de Ideias vazio"** → Normal! Os dados são locais no seu navegador
- **"Teleprompter não funciona"** → Selecione um roteiro primeiro
- **"Offline não funciona"** → Recarregue 1x online para cachear files

---

## ✅ Checklist Após Deploy

- [ ] Acessar a URL no navegador — dashboard aparece?
- [ ] Clicar em "💡 Banco de Ideias" — mostra 3 ideias exemplo?
- [ ] Clicar em "📖 Teleprompter" — mostra 3 roteiros?
- [ ] Criar uma nova ideia — salva e aparece no kanban?
- [ ] Criar um novo roteiro — aparece na lista?
- [ ] Testar no celular — layout responsivo?
- [ ] Instalar como app no celular — funciona offline?

---

**Assim que fizer deploy, compartilha o link comigo para teste!** 🚀

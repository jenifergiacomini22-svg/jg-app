// ===== JGAPP - APLICATIVO DE PRODUÇÃO DE CONTEÚDO =====

class JGApp {
  constructor() {
    this.currentScreen = 'dashboard';
    this.currentDate = new Date();
    this.ideas = [];
    this.scripts = [];
    this.agendaMode = 'day';
    this.teleprompterPlaying = false;
    this.teleprompterSpeed = 1;
    this.currentIdeaId = null;

    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.loadData();
    this.setupEventListeners();
    this.updateGreeting();
    this.updateDashboard();
    this.goTo('dashboard');
  }

  // ===== SERVICE WORKER =====
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => {
          console.log('✅ Service Worker registrado com sucesso');
          return reg.update();
        })
        .catch(err => {
          console.log('⚠️ Service Worker error (ok em dev):', err);
        });
    }
  }

  // ===== DATA MANAGEMENT =====
  loadData() {
    const ideasData = localStorage.getItem('jgapp_ideas');
    const scriptsData = localStorage.getItem('jgapp_scripts');

    this.ideas = ideasData ? JSON.parse(ideasData) : this.getDefaultIdeas();
    this.scripts = scriptsData ? JSON.parse(scriptsData) : this.getDefaultScripts();

    this.saveData();
  }

  saveData() {
    localStorage.setItem('jgapp_ideas', JSON.stringify(this.ideas));
    localStorage.setItem('jgapp_scripts', JSON.stringify(this.scripts));
  }

  getDefaultIdeas() {
    return [
      {
        id: 'idea-1',
        titulo: 'Como escolher um advogado',
        descricao: 'Principais critérios na hora de contratar',
        tipo: 'roteiro',
        frente: 'lex-aura',
        status: 'bruto',
        link: '',
        imagem: '',
        criado: new Date().toISOString()
      },
      {
        id: 'idea-2',
        titulo: '5 direitos que todo cliente tem',
        descricao: 'Legislação sobre direitos de cliente',
        tipo: 'insight',
        frente: 'escritorio',
        status: 'gravar',
        link: '',
        imagem: '',
        criado: new Date().toISOString()
      },
      {
        id: 'idea-3',
        titulo: 'Carreira em advocacia',
        descricao: 'Dicas para começar na profissão',
        tipo: 'roteiro',
        frente: 'marca-pessoal',
        status: 'roteiro',
        link: '',
        imagem: '',
        criado: new Date().toISOString()
      }
    ];
  }

  getDefaultScripts() {
    return [
      {
        id: 'script-1',
        titulo: 'Lex Aura - Sem dançar',
        conteudo: 'Oi, tudo bem? Você sabe que não precisa dançar para fazer conteúdo de qualidade? Neste vídeo vou mostrar como criar roteiros impactantes para sua advocacia.',
        frente: 'lex-aura',
        criado: new Date().toISOString()
      },
      {
        id: 'script-2',
        titulo: 'Marca Pessoal - Quase desisti',
        conteudo: 'Quase desisti de tudo. Mas encontrei a razão para continuar. Quer saber qual é? Acompanhe comigo essa jornada de transformação pessoal e profissional.',
        frente: 'marca-pessoal',
        criado: new Date().toISOString()
      },
      {
        id: 'script-3',
        titulo: 'Escritório - 5 Direitos',
        conteudo: 'Todo cliente tem direitos. Vou explicar os 5 principais: direito à informação clara, direito à confidencialidade, direito a segunda opinião, direito a bom atendimento, e direito ao resultado transparente.',
        frente: 'escritorio',
        criado: new Date().toISOString()
      }
    ];
  }

  // ===== NAVEGAÇÃO =====
  setupEventListeners() {
    // Topnav
    document.querySelectorAll('.topnav-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const screen = e.target.dataset.screen;
        this.goTo(screen);
      });
    });

    // Agenda
    document.querySelectorAll('.btn-view-mode').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-view-mode').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.agendaMode = e.target.dataset.mode;
        this.renderAgenda();
      });
    });

    document.getElementById('prev-date')?.addEventListener('click', () => {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
      this.renderAgenda();
    });

    document.getElementById('next-date')?.addEventListener('click', () => {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
      this.renderAgenda();
    });

    document.querySelector('.btn-today')?.addEventListener('click', () => {
      this.currentDate = new Date();
      this.renderAgenda();
    });

    // Banco de Ideias
    document.getElementById('btn-new-idea')?.addEventListener('click', () => {
      this.currentIdeaId = null;
      document.getElementById('modal-idea-title').textContent = 'Nova Ideia';
      document.getElementById('form-idea').reset();
      document.getElementById('form-idea-submit').textContent = 'Criar';
      this.openModal('modal-idea');
    });

    document.getElementById('form-idea')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveIdea();
    });

    document.getElementById('idea-image')?.addEventListener('change', (e) => {
      this.handleImageUpload(e);
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.renderKanban();
      });
    });

    // Teleprompter
    document.getElementById('script-select')?.addEventListener('change', (e) => {
      this.loadScript(e.target.value);
    });

    document.getElementById('btn-new-script')?.addEventListener('click', () => {
      this.openModal('modal-script');
    });

    document.getElementById('form-script')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createScript();
    });

    document.getElementById('play-pause')?.addEventListener('click', () => {
      this.toggleTeleprompter();
    });

    document.getElementById('speed-slider')?.addEventListener('change', (e) => {
      this.teleprompterSpeed = parseFloat(e.target.value);
      document.getElementById('speed-value').textContent = this.teleprompterSpeed + 'x';
    });

    document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
      this.enterFullscreenTeleprompter();
    });
  }

  handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        document.getElementById('idea-image-preview').innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: cover;">`;
        document.getElementById('idea-image').dataset.base64 = base64;
      };
      reader.readAsDataURL(file);
    }
  }

  goTo(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screen)?.classList.add('active');

    document.querySelectorAll('.topnav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`[data-screen="${screen}"]`)?.classList.add('active');

    this.currentScreen = screen;

    if (screen === 'ideias') {
      this.renderKanban();
    } else if (screen === 'agenda') {
      this.renderAgenda();
    } else if (screen === 'teleprompter') {
      this.renderTeleprompter();
    } else if (screen === 'dashboard') {
      this.updateDashboard();
    }
  }

  // ===== DASHBOARD =====
  updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '';

    if (hour < 12) greeting = '🌅 Bom dia, Jenifer!';
    else if (hour < 18) greeting = '☀️ Boa tarde, Jenifer!';
    else greeting = '🌙 Boa noite, Jenifer!';

    const greetingEl = document.getElementById('greeting');
    if (greetingEl) greetingEl.textContent = greeting;
  }

  updateDashboard() {
    // Atualizar contadores de ideias por frente
    const frontesCount = {
      'marca-pessoal': this.ideas.filter(i => i.frente === 'marca-pessoal').length,
      'escritorio': this.ideas.filter(i => i.frente === 'escritorio').length,
      'lex-aura': this.ideas.filter(i => i.frente === 'lex-aura').length
    };

    document.querySelectorAll('.frente-stats span').forEach((el, idx) => {
      const frontes = ['marca-pessoal', 'escritorio', 'lex-aura'];
      el.textContent = frontesCount[frontes[idx]] + ' ideias';
    });

    // Atualizar ideias recentes
    const recentIdeas = this.ideas.slice(-3).reverse();
    const recentContainer = document.getElementById('recent-ideas');
    if (recentContainer) {
      if (recentIdeas.length === 0) {
        recentContainer.innerHTML = '<p class="empty-state">Nenhuma ideia ainda. <a href="#" onclick="app.goTo(\'ideias\'); return false;">Criar a primeira →</a></p>';
      } else {
        recentContainer.innerHTML = recentIdeas.map(idea => `
          <div style="padding: 12px; background: #f9f9f9; border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick="app.viewIdea('${idea.id}')">
            <div style="font-weight: 600; color: #3A3736;">${idea.titulo}</div>
            <div style="font-size: 0.75rem; color: #6B6868; margin-top: 4px;">${this.getFrente(idea.frente)} • ${idea.tipo}</div>
          </div>
        `).join('');
      }
    }

    // Atualizar eventos de hoje (mock)
    const todayContainer = document.getElementById('today-events');
    if (todayContainer) {
      todayContainer.innerHTML = '<p class="empty-state">Nenhum evento para hoje</p>';
    }
  }

  // ===== BANCO DE IDEIAS =====
  saveIdea() {
    const titulo = document.getElementById('idea-titulo').value;
    const descricao = document.getElementById('idea-descricao').value;
    const tipo = document.getElementById('idea-tipo').value;
    const frente = document.getElementById('idea-frente').value;
    const link = document.getElementById('idea-link').value;
    const imagem = document.getElementById('idea-image').dataset.base64 || '';

    if (this.currentIdeaId) {
      // Editar ideia existente
      const idea = this.ideas.find(i => i.id === this.currentIdeaId);
      if (idea) {
        idea.titulo = titulo;
        idea.descricao = descricao;
        idea.tipo = tipo;
        idea.frente = frente;
        idea.link = link;
        if (imagem) idea.imagem = imagem;
      }
    } else {
      // Criar nova ideia
      const idea = {
        id: 'idea-' + Date.now(),
        titulo,
        descricao,
        tipo,
        frente,
        status: 'bruto',
        link,
        imagem,
        criado: new Date().toISOString()
      };
      this.ideas.push(idea);
    }

    this.saveData();
    this.renderKanban();
    this.closeModal('modal-idea');
    document.getElementById('form-idea').reset();
    document.getElementById('idea-image').dataset.base64 = '';
    document.getElementById('idea-image-preview').innerHTML = '';
  }

  viewIdea(ideaId) {
    this.currentIdeaId = ideaId;
    const idea = this.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const dateStr = new Date(idea.criado).toLocaleDateString('pt-BR');

    let content = `
      <div class="idea-detail-section">
        <span class="idea-detail-label">Título</span>
        <div class="idea-detail-value">${idea.titulo}</div>
      </div>

      <div class="idea-detail-section">
        <span class="idea-detail-label">Descrição</span>
        <div class="idea-detail-value">${idea.descricao || 'Sem descrição'}</div>
      </div>

      <div class="idea-detail-section">
        <span class="idea-detail-label">Informações</span>
        <div class="idea-detail-value">
          <div>Tipo: <strong>${this.getIdealType(idea.tipo)}</strong></div>
          <div>Frente: <strong>${this.getFrente(idea.frente)}</strong></div>
          <div>Status: <strong>${this.getStatusDisplay(idea.status)}</strong></div>
          <div>Criada: <strong>${dateStr}</strong></div>
        </div>
      </div>
    `;

    if (idea.link) {
      content += `
        <div class="idea-detail-section">
          <span class="idea-detail-label">Link do Post</span>
          <div class="idea-detail-value">
            <a href="${idea.link}" target="_blank">${idea.link}</a>
          </div>
        </div>
      `;
    }

    if (idea.imagem) {
      content += `
        <div class="idea-detail-section">
          <span class="idea-detail-label">Thumbnail</span>
          <img src="${idea.imagem}" class="idea-detail-image" alt="Thumbnail">
        </div>
      `;
    }

    document.getElementById('idea-detail-content').innerHTML = content;
    this.openModal('modal-idea-detail');
  }

  editCurrentIdea() {
    if (!this.currentIdeaId) return;
    const idea = this.ideas.find(i => i.id === this.currentIdeaId);
    if (!idea) return;

    document.getElementById('modal-idea-title').textContent = 'Editar Ideia';
    document.getElementById('idea-titulo').value = idea.titulo;
    document.getElementById('idea-descricao').value = idea.descricao;
    document.getElementById('idea-tipo').value = idea.tipo;
    document.getElementById('idea-frente').value = idea.frente;
    document.getElementById('idea-link').value = idea.link;
    document.getElementById('form-idea-submit').textContent = 'Salvar';

    if (idea.imagem) {
      document.getElementById('idea-image-preview').innerHTML = `<img src="${idea.imagem}" style="width: 100%; height: 100%; object-fit: cover;">`;
      document.getElementById('idea-image').dataset.base64 = idea.imagem;
    }

    this.closeModal('modal-idea-detail');
    this.openModal('modal-idea');
  }

  deleteCurrentIdea() {
    if (!this.currentIdeaId) return;
    if (!confirm('Tem certeza que deseja deletar essa ideia?')) return;

    this.ideas = this.ideas.filter(i => i.id !== this.currentIdeaId);
    this.saveData();
    this.renderKanban();
    this.closeModal('modal-idea-detail');
  }

  renderKanban() {
    const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';

    const columns = ['bruto', 'roteiro', 'gravar', 'publicado'];
    columns.forEach(status => {
      const container = document.getElementById(`col-${status}`);
      if (container) {
        let ideas = this.ideas.filter(i => i.status === status);
        if (filter !== 'all') {
          ideas = ideas.filter(i => i.frente === filter);
        }

        container.innerHTML = ideas.map(idea => `
          <div class="idea-card idea-card-clickable ${idea.frente}" draggable="true" data-id="${idea.id}" onclick="app.viewIdea('${idea.id}')">
            ${idea.imagem ? `<div style="width: 100%; height: 100px; background: url(${idea.imagem}); background-size: cover; background-position: center; border-radius: 4px; margin-bottom: 8px;"></div>` : ''}
            <div class="idea-card-title">${idea.titulo}</div>
            <div class="idea-card-meta">${this.getFrente(idea.frente)} • ${idea.tipo}</div>
            ${idea.link ? `<div style="font-size: 0.65rem; color: #C4A96B; margin-top: 4px;">🔗 Link publicado</div>` : ''}
          </div>
        `).join('');
      }
    });

    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    let draggedId = null;

    // Desktop drag & drop
    document.querySelectorAll('.idea-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedId = e.target.closest('[data-id]').dataset.id;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedId);
        e.target.style.opacity = '0.5';
      });

      card.addEventListener('dragend', (e) => {
        e.target.style.opacity = '1';
      });

      // Mobile touch - long press para mover
      let touchStartTime = 0;
      card.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        draggedId = e.target.closest('[data-id]').dataset.id;
      });
    });

    document.querySelectorAll('.column-cards').forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.style.background = 'rgba(196, 169, 107, 0.1)';
      });

      col.addEventListener('dragleave', (e) => {
        col.style.background = 'transparent';
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.style.background = 'transparent';
        const ideaId = e.dataTransfer.getData('text/plain');
        const newStatus = col.closest('.kanban-column').dataset.status;

        const idea = this.ideas.find(i => i.id === ideaId);
        if (idea) {
          idea.status = newStatus;
          this.saveData();
          this.renderKanban();
        }
      });

      // Mobile touch - tap column para adicionar à coluna (alternativa ao drag)
      col.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (draggedId) {
          const newStatus = col.closest('.kanban-column').dataset.status;
          const idea = this.ideas.find(i => i.id === draggedId);
          if (idea) {
            idea.status = newStatus;
            this.saveData();
            this.renderKanban();
            draggedId = null;
          }
        }
      });
    });
  }

  // ===== AGENDA =====
  renderAgenda() {
    const dateDisplay = document.getElementById('current-date-display');
    const formatter = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });

    if (dateDisplay) {
      dateDisplay.textContent = formatter.format(this.currentDate);
    }

    // Renderizar placeholder (Google Calendar será integrado depois)
    const content = document.getElementById('agenda-content');
    if (content) {
      content.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: #6B6868;">
          <p style="font-size: 1.1rem; margin-bottom: 8px;">📅 ${this.agendaMode.toUpperCase()}</p>
          <p>Sincronize sua Google Agenda para ver eventos aqui</p>
          <p style="font-size: 0.85rem; margin-top: 12px; color: #A0673A;">Próxima atualização: integração com Google Calendar API</p>
        </div>
      `;
    }
  }

  // ===== TELEPROMPTER =====
  renderTeleprompter() {
    const select = document.getElementById('script-select');
    if (select) {
      select.innerHTML = '<option value="">Selecione um roteiro...</option>';
      this.scripts.forEach(script => {
        const option = document.createElement('option');
        option.value = script.id;
        option.textContent = `${script.titulo} (${this.getFrente(script.frente)})`;
        select.appendChild(option);
      });
    }
  }

  loadScript(scriptId) {
    if (!scriptId) return;

    const script = this.scripts.find(s => s.id === scriptId);
    if (script) {
      const container = document.getElementById('teleprompter-container');
      if (container) {
        container.innerHTML = `
          <div class="teleprompter-content">${script.conteudo}</div>
        `;
      }

      this.teleprompterPlaying = false;
      document.getElementById('play-pause').textContent = '▶ Play';
    }
  }

  toggleTeleprompter() {
    const container = document.getElementById('teleprompter-container');
    if (!container || container.innerHTML.includes('teleprompter-empty')) return;

    this.teleprompterPlaying = !this.teleprompterPlaying;
    document.getElementById('play-pause').textContent = this.teleprompterPlaying ? '⏸ Pause' : '▶ Play';

    if (this.teleprompterPlaying) {
      this.autoScrollTeleprompter();
    }
  }

  autoScrollTeleprompter() {
    if (!this.teleprompterPlaying) return;

    const container = document.getElementById('teleprompter-container');
    if (container) {
      const scrollSpeed = 2 * this.teleprompterSpeed;
      container.scrollBy(0, scrollSpeed);
      setTimeout(() => this.autoScrollTeleprompter(), 50);
    }
  }

  enterFullscreenTeleprompter() {
    const container = document.getElementById('teleprompter-container');
    if (container && container.requestFullscreen) {
      container.requestFullscreen();
    }
  }

  createScript() {
    const titulo = document.getElementById('script-titulo').value;
    const conteudo = document.getElementById('script-conteudo').value;
    const frente = document.getElementById('script-frente').value;

    const script = {
      id: 'script-' + Date.now(),
      titulo,
      conteudo,
      frente,
      criado: new Date().toISOString()
    };

    this.scripts.push(script);
    this.saveData();
    this.renderTeleprompter();
    this.closeModal('modal-script');

    document.getElementById('form-script').reset();
  }

  // ===== UTILIDADES =====
  getFrente(frente) {
    const frentes = {
      'marca-pessoal': '👤 Pessoal',
      'escritorio': '⚖️ Escritório',
      'lex-aura': '✨ Lex Aura'
    };
    return frentes[frente] || frente;
  }

  getIdealType(tipo) {
    const types = {
      'insight': '💭 Insight',
      'link': '🔗 Link',
      'print': '📸 Print',
      'roteiro': '📄 Roteiro'
    };
    return types[tipo] || tipo;
  }

  getStatusDisplay(status) {
    const statuses = {
      'bruto': '📝 Ideia Bruta',
      'roteiro': '✍️ Em Roteiro',
      'gravar': '🎥 Para Gravar',
      'publicado': '✅ Publicado'
    };
    return statuses[status] || status;
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }
}

// ===== PWA INSTALL PROMPT =====
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('PWA pronto para instalar');

  // Mostrar botão de instalar se quiser (opcional)
  // Você pode adicionar um botão na UI
});

window.addEventListener('appinstalled', () => {
  console.log('PWA instalado com sucesso!');
  deferredPrompt = null;
});

// ===== INICIALIZAR APP =====
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new JGApp();
});

// Fechar modais ao clicar fora
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
  }

  if (e.key === ' ' && document.getElementById('teleprompter-container')?.offsetParent !== null) {
    e.preventDefault();
    app?.toggleTeleprompter();
  }
});

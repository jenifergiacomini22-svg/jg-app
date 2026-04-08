class JGApp {
  constructor() {
    this.currentScreen = 'dashboard';
    this.currentDate = new Date();
    this.ideas = [];
    this.scripts = [];
    this.tasks = [];
    this.events = [];
    this.habits = [];
    this.dreams = [];
    this.courses = [];
    this.currentAgendaTab = 'dia';
    this.currentMood = null;
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

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js').then(reg => {
        console.log('✅ Service Worker registrado');
        return reg.update();
      }).catch(err => {
        console.log('⚠️ Service Worker error:', err);
      });
    }
  }

  loadData() {
    const ideasData = localStorage.getItem('jgapp_ideas');
    const scriptsData = localStorage.getItem('jgapp_scripts');
    const tasksData = localStorage.getItem('jgapp_tasks');
    const eventsData = localStorage.getItem('jgapp_events');
    const habitsData = localStorage.getItem('jgapp_habits');
    const dreamsData = localStorage.getItem('jgapp_dreams');
    const coursesData = localStorage.getItem('jgapp_courses');

    this.ideas = ideasData ? JSON.parse(ideasData) : this.getDefaultIdeas();
    this.scripts = scriptsData ? JSON.parse(scriptsData) : this.getDefaultScripts();
    this.tasks = tasksData ? JSON.parse(tasksData) : this.getDefaultTasks();
    this.events = eventsData ? JSON.parse(eventsData) : [];
    this.habits = habitsData ? JSON.parse(habitsData) : this.getDefaultHabits();
    this.dreams = dreamsData ? JSON.parse(dreamsData) : [];
    this.courses = coursesData ? JSON.parse(coursesData) : [];

    this.saveData();
  }

  saveData() {
    localStorage.setItem('jgapp_ideas', JSON.stringify(this.ideas));
    localStorage.setItem('jgapp_scripts', JSON.stringify(this.scripts));
    localStorage.setItem('jgapp_tasks', JSON.stringify(this.tasks));
    localStorage.setItem('jgapp_events', JSON.stringify(this.events));
    localStorage.setItem('jgapp_habits', JSON.stringify(this.habits));
    localStorage.setItem('jgapp_dreams', JSON.stringify(this.dreams));
    localStorage.setItem('jgapp_courses', JSON.stringify(this.courses));
  }

  getDefaultIdeas() {
    return [{id:'idea-1',titulo:'Como escolher um advogado',descricao:'Principais critérios na hora de contratar',tipo:'roteiro',frente:'lex-aura',status:'bruto',link:'',imagem:'',criado:new Date().toISOString()},{id:'idea-2',titulo:'5 direitos que todo cliente tem',descricao:'Legislação sobre direitos de cliente',tipo:'insight',frente:'escritorio',status:'gravar',link:'',imagem:'',criado:new Date().toISOString()},{id:'idea-3',titulo:'Carreira em advocacia',descricao:'Dicas para começar na profissão',tipo:'roteiro',frente:'marca-pessoal',status:'roteiro',link:'',imagem:'',criado:new Date().toISOString()}];
  }

  getDefaultScripts() {
    return [{id:'script-1',titulo:'Lex Aura - Sem dançar',conteudo:'Oi, tudo bem? Você sabe que não precisa dançar para fazer conteúdo de qualidade? Neste vídeo vou mostrar como criar roteiros impactantes para sua advocacia.',frente:'lex-aura',criado:new Date().toISOString()},{id:'script-2',titulo:'Marca Pessoal - Quase desisti',conteudo:'Quase desisti de tudo. Mas encontrei a razão para continuar. Quer saber qual é? Acompanhe comigo essa jornada de transformação pessoal e profissional.',frente:'marca-pessoal',criado:new Date().toISOString()},{id:'script-3',titulo:'Escritório - 5 Direitos',conteudo:'Todo cliente tem direitos. Vou explicar os 5 principais: direito à informação clara, direito à confidencialidade, direito a segunda opinião, direito a bom atendimento, e direito ao resultado transparente.',frente:'escritorio',criado:new Date().toISOString()}];
  }

  getDefaultTasks() {
    return [{id:'task-1',titulo:'Gravar vídeo para Lex Aura',hora:'10:00',prioridade:'ALTA',nota:'Sobre escolha de advogado',concluido:false,criado:new Date().toISOString()}];
  }

  getDefaultHabits() {
    return [{id:'habit-1',nome:'🏃 Exercício',descricao:'Exercício físico diário',criado:new Date().toISOString(),registros:{}},{id:'habit-2',nome:'📖 Leitura',descricao:'Ler por 30 minutos',criado:new Date().toISOString(),registros:{}},{id:'habit-3',nome:'✍️ Escrever',descricao:'Escrever roteiros ou conteúdo',criado:new Date().toISOString(),registros:{}}];
  }

  setupEventListeners() {
    document.querySelectorAll('.topnav-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const screen = e.target.dataset.screen;
        this.goTo(screen);
      });
    });

    document.querySelectorAll('.agenda-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.agenda-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.agenda-tab-content').forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        this.currentAgendaTab = e.target.dataset.tab;
        document.getElementById(`tab-${this.currentAgendaTab}`)?.classList.add('active');
        this.renderAgenda();
      });
    });

    document.getElementById('btn-new-event')?.addEventListener('click', () => {
      this.openModal('modal-task');
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

    document.getElementById('form-task')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createTask();
    });

    document.getElementById('form-habit')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createHabit();
    });

    document.getElementById('form-dream')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createDream();
    });

    document.getElementById('form-course')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.createCourse();
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
    const frontesCount = {
      'marca-pessoal': this.ideas.filter(i => i.frente === 'marca-pessoal').length,
      'escritorio': this.ideas.filter(i => i.frente === 'escritorio').length,
      'lex-aura': this.ideas.filter(i => i.frente === 'lex-aura').length
    };

    document.querySelectorAll('.frente-stats span').forEach((el, idx) => {
      const frontes = ['marca-pessoal', 'escritorio', 'lex-aura'];
      el.textContent = frontesCount[frontes[idx]] + ' ideias';
    });

    const recentIdeas = this.ideas.slice(-3).reverse();
    const recentContainer = document.getElementById('recent-ideas');
    if (recentContainer) {
      if (recentIdeas.length === 0) {
        recentContainer.innerHTML = '<p class="empty-state">Nenhuma ideia ainda. <a href="#" onclick="app.goTo(\'ideias\'); return false;">Criar a primeira →</a></p>';
      } else {
        recentContainer.innerHTML = recentIdeas.map(idea => `<div style="padding: 12px; background: #f9f9f9; border-radius: 8px; margin-bottom: 8px; cursor: pointer;" onclick="app.viewIdea('${idea.id}')"><div style="font-weight: 600; color: #3A3736;">${idea.titulo}</div><div style="font-size: 0.75rem; color: #6B6868; margin-top: 4px;">${this.getFrente(idea.frente)} • ${idea.tipo}</div></div>`).join('');
      }
    }
  }

  saveIdea() {
    const titulo = document.getElementById('idea-titulo').value;
    const descricao = document.getElementById('idea-descricao').value;
    const tipo = document.getElementById('idea-tipo').value;
    const frente = document.getElementById('idea-frente').value;
    const link = document.getElementById('idea-link').value;
    const imagem = document.getElementById('idea-image').dataset.base64 || '';

    if (this.currentIdeaId) {
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
      const idea = {id:'idea-'+Date.now(),titulo,descricao,tipo,frente,status:'bruto',link,imagem,criado:new Date().toISOString()};
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
    let content = `<div class="idea-detail-section"><span class="idea-detail-label">Título</span><div class="idea-detail-value">${idea.titulo}</div></div><div class="idea-detail-section"><span class="idea-detail-label">Descrição</span><div class="idea-detail-value">${idea.descricao || 'Sem descrição'}</div></div><div class="idea-detail-section"><span class="idea-detail-label">Informações</span><div class="idea-detail-value"><div>Tipo: <strong>${this.getIdealType(idea.tipo)}</strong></div><div>Frente: <strong>${this.getFrente(idea.frente)}</strong></div><div>Status: <strong>${this.getStatusDisplay(idea.status)}</strong></div><div>Criada: <strong>${dateStr}</strong></div></div></div>`;

    if (idea.link) {
      content += `<div class="idea-detail-section"><span class="idea-detail-label">Link do Post</span><div class="idea-detail-value"><a href="${idea.link}" target="_blank">${idea.link}</a></div></div>`;
    }

    if (idea.imagem) {
      content += `<div class="idea-detail-section"><span class="idea-detail-label">Thumbnail</span><img src="${idea.imagem}" class="idea-detail-image" alt="Thumbnail"></div>`;
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
    const columns = ['bruto', 'roteiro', 'gravar', 'publicado

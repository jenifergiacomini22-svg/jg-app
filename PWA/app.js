// ===== JGAPP - APLICATIVO DE PRODUÇÃO DE CONTEÚDO =====

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

  // ===== SERVICE WORKER =====
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js')
        .then(reg => {
          console.log('✅ Service Worker registrado');
          return reg.update();
        })
        .catch(err => {
          console.log('⚠️ Service Worker error:', err);
        });
    }
  }

  // ===== DATA MANAGEMENT =====
  loadData() {
    const ideasData = localStorage.getItem('jgapp_ideas');
    const scriptsData = localStorage.getItem('jgapp_scripts');
    const tasksData = localStorage.getItem('jgapp_tasks');
    const eventsData = localStorage.getItem('jgapp_events');
    const habitsData = localStorage.getItem('jgapp_habits');
    const dreamsData = localStorage.getItem('jgapp_dreams');
    const coursesData = localStorage.getItem('jgapp_courses');

    this.ideas = ideasData ? JSON.parse(ideasData) : [];
    this.scripts = scriptsData ? JSON.parse(scriptsData) : [];
    this.tasks = tasksData ? JSON.parse(tasksData) : [];
    this.events = eventsData ? JSON.parse(eventsData) : [];
    this.habits = habitsData ? JSON.parse(habitsData) : [];
    this.dreams = dreamsData ? JSON.parse(dreamsData) : [];
    this.courses = coursesData ? JSON.parse(coursesData) : [];
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

  // ===== EVENT LISTENERS =====
  setupEventListeners() {
    // Topnav
    document.querySelectorAll('.topnav-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.goTo(e.target.dataset.screen);
      });
    });

    // Agenda tabs
    document.querySelectorAll('.agenda-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.switchAgendaTab(e.target.dataset.tab);
      });
    });

    // Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.filterIdeas(e.target.dataset.filter);
      });
    });

    // Forms
    document.getElementById('form-idea')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveIdea();
    });

    document.getElementById('form-task')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveTask();
    });

    document.getElementById('form-script')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveScript();
    });

    document.getElementById('form-habit')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveHabit();
    });

    document.getElementById('form-dream')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveDream();
    });

    document.getElementById('form-course')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCourse();
    });

    // Agenda nav
    document.getElementById('prev-date')?.addEventListener('click', () => {
      this.currentDate.setDate(this.currentDate.getDate() - 1);
      this.renderAgendaTab();
    });

    document.getElementById('next-date')?.addEventListener('click', () => {
      this.currentDate.setDate(this.currentDate.getDate() + 1);
      this.renderAgendaTab();
    });

    document.querySelector('.btn-today')?.addEventListener('click', () => {
      this.currentDate = new Date();
      this.renderAgendaTab();
    });

    // Action buttons
    document.getElementById('btn-new-event')?.addEventListener('click', () => {
      this.openModal('modal-task');
    });

    document.getElementById('btn-new-idea')?.addEventListener('click', () => {
      this.openModal('modal-idea');
    });

    document.getElementById('btn-new-script')?.addEventListener('click', () => {
      this.openModal('modal-script');
    });

    // Teleprompter
    document.getElementById('script-select')?.addEventListener('change', (e) => {
      if (e.target.value) {
        const script = this.scripts.find(s => s.id === e.target.value);
        this.loadTeleprompterScript(script);
      }
    });

    document.getElementById('play-pause')?.addEventListener('click', () => {
      this.toggleTeleprompter();
    });

    document.getElementById('speed-slider')?.addEventListener('input', (e) => {
      this.teleprompterSpeed = parseFloat(e.target.value);
      document.getElementById('speed-value').textContent = this.teleprompterSpeed + 'x';
    });

    document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
      const content = document.getElementById('teleprompter-content');
      if (content) {
        content.requestFullscreen().catch(err => console.log(err));
      }
    });

    // Image upload
    document.getElementById('idea-image')?.addEventListener('change', (e) => {
      this.previewImage(e, 'idea-image-preview');
    });

    // Close modals
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    });
  }

  // ===== NAVIGATION =====
  goTo(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screen).classList.add('active');
    document.querySelectorAll('.topnav-link').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-screen="${screen}"]`).classList.add('active');
    this.currentScreen = screen;

    if (screen === 'agenda') {
      setTimeout(() => this.renderAgendaTab(), 100);
    } else if (screen === 'ideias') {
      setTimeout(() => this.renderKanban(), 100);
    } else if (screen === 'teleprompter') {
      setTimeout(() => this.setupTeleprompter(), 100);
    }
  }

  // ===== DASHBOARD =====
  updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 12) greeting = '🌅 Bom dia, Jenifer!';
    else if (hour < 18) greeting = '☀️ Boa tarde, Jenifer!';
    else greeting = '🌙 Boa noite, Jenifer!';
    const el = document.getElementById('greeting');
    if (el) el.textContent = greeting;
  }

  updateDashboard() {
    // Today events
    const today = new Date().toDateString();
    const todayEvents = this.events.filter(e => new Date(e.date).toDateString() === today);
    const todayTasks = this.tasks.filter(t => new Date(t.date).toDateString() === today);

    let eventsHTML = '';
    if (todayEvents.length === 0 && todayTasks.length === 0) {
      eventsHTML = '<p class="empty-state">Nenhum evento para hoje</p>';
    } else {
      todayEvents.forEach(e => {
        eventsHTML += `<div class="event-item">📌 ${e.title}</div>`;
      });
      todayTasks.forEach(t => {
        eventsHTML += `<div class="task-item">✓ ${t.titulo}</div>`;
      });
    }
    const todayEl = document.getElementById('today-events');
    if (todayEl) todayEl.innerHTML = eventsHTML;

    // Recent ideas
    let ideasHTML = '';
    if (this.ideas.length === 0) {
      ideasHTML = '<p class="empty-state">Nenhuma ideia ainda</p>';
    } else {
      this.ideas.slice(-3).forEach(idea => {
        ideasHTML += `<div class="idea-preview"><strong>${idea.titulo}</strong><small>${idea.frente}</small></div>`;
      });
    }
    const ideasEl = document.getElementById('recent-ideas');
    if (ideasEl) ideasEl.innerHTML = ideasHTML;

    // Stats
    const marcaPessoal = this.ideas.filter(i => i.frente === 'marca-pessoal').length;
    const escritorio = this.ideas.filter(i => i.frente === 'escritorio').length;
    const lexAura = this.ideas.filter(i => i.frente === 'lex-aura').length;

    const statElements = document.querySelectorAll('.frente-stats span');
    if (statElements.length >= 3) {
      statElements[0].textContent = marcaPessoal + ' ideias';
      statElements[1].textContent = escritorio + ' ideias';
      statElements[2].textContent = lexAura + ' ideias';
    }
  }

  // ===== AGENDA =====
  switchAgendaTab(tab) {
    document.querySelectorAll('.agenda-tab').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.querySelectorAll('.agenda-tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`tab-${tab}`)?.classList.add('active');
    this.currentAgendaTab = tab;
    this.renderAgendaTab();
  }

  renderAgendaTab() {
    const tab = this.currentAgendaTab;
    if (tab === 'dia') this.renderDayView();
    else if (tab === 'semana') this.renderWeekView();
    else if (tab === 'mes') this.renderMonthView();
    else if (tab === 'habitos') this.renderHabits();
    else if (tab === 'sonhos') this.renderDreams();
    else if (tab === 'cursos') this.renderCourses();
  }

  renderDayView() {
    const dateStr = this.currentDate.toLocaleDateString('pt-BR');
    const dateDisplay = document.getElementById('current-date-display');
    if (dateDisplay) dateDisplay.textContent = dateStr;

    const dateKey = this.currentDate.toDateString();
    const dayTasks = this.tasks.filter(t => new Date(t.date).toDateString() === dateKey);
    const dayEvents = this.events.filter(e => new Date(e.date).toDateString() === dateKey);

    // Events
    let eventsHTML = '';
    dayEvents.forEach(e => {
      eventsHTML += `<div class="event-item">📌 ${e.title}</div>`;
    });
    if (dayEvents.length === 0) eventsHTML = '<p class="empty-state">Sem eventos</p>';
    const eventsEl = document.getElementById('day-events');
    if (eventsEl) eventsEl.innerHTML = eventsHTML;

    // Tasks
    let tasksHTML = '';
    dayTasks.forEach(t => {
      const checked = t.completed ? 'checked' : '';
      const color = t.prioridade === 'ALTA' ? '#ff6b6b' : t.prioridade === 'MÉDIA' ? '#ffd93d' : '#6bcf7f';
      tasksHTML += `
        <div class="task-item" style="border-left-color: ${color};">
          <input type="checkbox" ${checked} onchange="app.toggleTask('${t.id}')">
          <div>
            <strong>${t.titulo}</strong>
            ${t.hora ? `<small>🕐 ${t.hora}</small>` : ''}
            ${t.nota ? `<p>${t.nota}</p>` : ''}
          </div>
        </div>
      `;
    });
    if (dayTasks.length === 0) tasksHTML = '<p class="empty-state">Sem tarefas</p>';
    const tasksEl = document.getElementById('day-tasks');
    if (tasksEl) tasksEl.innerHTML = tasksHTML;
  }

  renderWeekView() {
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    let weekHTML = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px;">';
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      const dateStr = date.toDateString();
      const dayTasks = this.tasks.filter(t => new Date(t.date).toDateString() === dateStr);

      weekHTML += `
        <div style="border: 1px solid #ddd; padding: 8px; border-radius: 8px;">
          <strong>${days[i]}</strong>
          <p style="font-size: 12px; margin: 4px 0;">${date.getDate()}/${date.getMonth() + 1}</p>
          ${dayTasks.map(t => `<small>✓ ${t.titulo}</small>`).join('')}
        </div>
      `;
    }

    weekHTML += '</div>';
    const weekEl = document.getElementById('week-grid');
    if (weekEl) weekEl.innerHTML = weekHTML;
  }

  renderMonthView() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let monthHTML = '<div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">';

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    days.forEach(d => {
      monthHTML += `<div style="text-align: center; font-weight: bold; padding: 8px;">${d}</div>`;
    });

    for (let i = 0; i < firstDay; i++) monthHTML += '<div></div>';

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString() ? 'background-color: #C4A96B; color: white;' : '';
      monthHTML += `<div style="padding: 8px; border: 1px solid #ddd; text-align: center; cursor: pointer; ${isToday}" onclick="app.currentDate = new Date(${year}, ${month}, ${day}); app.switchAgendaTab('dia');">${day}</div>`;
    }

    monthHTML += '</div>';
    const monthEl = document.getElementById('month-calendar');
    if (monthEl) monthEl.innerHTML = monthHTML;
  }

  renderHabits() {
    const habitsEl = document.getElementById('habits-list');
    if (!habitsEl) return;

    let habitsHTML = '';
    this.habits.forEach(habit => {
      const trackedDays = habit.tracked || [];
      let gridHTML = '';
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        const done = trackedDays.includes(dateStr) ? 'background-color: #4CAF50;' : 'background-color: #f0f0f0;';
        gridHTML += `<div style="width: 20px; height: 20px; ${done} cursor: pointer; border-radius: 3px;" onclick="app.toggleHabitDay('${habit.id}', '${dateStr}')"></div>`;
      }

      habitsHTML += `
        <div style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 12px;">
          <strong>${habit.nome}</strong>
          <small>${habit.descricao}</small>
          <div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; margin-top: 8px;">
            ${gridHTML}
          </div>
        </div>
      `;
    });

    if (habitsHTML === '') habitsHTML = '<p class="empty-state">Nenhum hábito criado</p>';
    habitsEl.innerHTML = habitsHTML;
  }

  toggleHabitDay(habitId, dateStr) {
    const habit = this.habits.find(h => h.id === habitId);
    if (!habit) return;
    if (!habit.tracked) habit.tracked = [];

    if (habit.tracked.includes(dateStr)) {
      habit.tracked = habit.tracked.filter(d => d !== dateStr);
    } else {
      habit.tracked.push(dateStr);
    }

    this.saveData();
    this.renderHabits();
  }

  renderDreams() {
    const dreamsEl = document.getElementById('dreams-list');
    if (!dreamsEl) return;

    let dreamsHTML = '';
    this.dreams.forEach(dream => {
      dreamsHTML += `
        <div class="dream-card">
          <h3>${dream.titulo}</h3>
          <p><em>${dream.afirmacao}</em></p>
          <div style="background-color: #f5f5f5; padding: 8px; border-radius: 4px; font-size: 12px;">
            ${dream.objetivos}
          </div>
        </div>
      `;
    });

    if (dreamsHTML === '') dreamsHTML = '<p class="empty-state">Nenhum sonho criado</p>';
    dreamsEl.innerHTML = dreamsHTML;
  }

  renderCourses() {
    const coursesEl = document.getElementById('courses-list');
    if (!coursesEl) return;

    let coursesHTML = '';
    this.courses.forEach(course => {
      const progress = Math.min(100, (course.daysCompleted / course.duracao) * 100);
      coursesHTML += `
        <div style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 12px;">
          <strong>${course.nome}</strong>
          <div style="margin-top: 8px; background-color: #f0f0f0; height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="background-color: #4CAF50; height: 100%; width: ${progress}%; transition: width 0.3s;"></div>
          </div>
          <small>Dia ${course.daysCompleted} de ${course.duracao}</small>
          ${course.notas ? `<p style="margin-top: 8px; font-size: 12px;">${course.notas}</p>` : ''}
        </div>
      `;
    });

    if (coursesHTML === '') coursesHTML = '<p class="empty-state">Nenhum curso criado</p>';
    coursesEl.innerHTML = coursesHTML;
  }

  // ===== IDEAS / KANBAN =====
  renderKanban() {
    const statuses = ['bruto', 'roteiro', 'gravar', 'publicado'];
    statuses.forEach(status => {
      const ideas = this.ideas.filter(i => i.status === status);
      let cardsHTML = '';

      ideas.forEach(idea => {
        cardsHTML += `
          <div class="kanban-card" draggable="true" data-id="${idea.id}" onclick="app.viewIdea('${idea.id}')">
            ${idea.thumbnail ? `<img src="${idea.thumbnail}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` : ''}
            <strong>${idea.titulo}</strong>
            <small>${idea.tipo}</small>
            <div style="margin-top: 4px; font-size: 10px;">${idea.frente}</div>
          </div>
        `;
      });

      if (cardsHTML === '') cardsHTML = '<p style="color: #999; font-size: 12px;">Vazio</p>';

      const col = document.getElementById(`col-${status}`);
      if (col) col.innerHTML = cardsHTML;
    });

    this.setupDragAndDrop();
  }

  setupDragAndDrop() {
    const cards = document.querySelectorAll('.kanban-card');
    const columns = document.querySelectorAll('.column-cards');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.id);
      });
    });

    columns.forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        const ideaId = e.dataTransfer.getData('text/plain');
        const newStatus = col.parentElement.dataset.status;
        this.moveIdea(ideaId, newStatus);
      });
    });
  }

  moveIdea(ideaId, newStatus) {
    const idea = this.ideas.find(i => i.id === ideaId);
    if (idea) {
      idea.status = newStatus;
      this.saveData();
      this.renderKanban();
    }
  }

  saveIdea() {
    const titulo = document.getElementById('idea-titulo').value;
    const descricao = document.getElementById('idea-descricao').value;
    const tipo = document.getElementById('idea-tipo').value;
    const frente = document.getElementById('idea-frente').value;
    const link = document.getElementById('idea-link').value;
    const thumbnail = document.getElementById('idea-image-preview').dataset.base64 || '';

    const idea = {
      id: Date.now().toString(),
      titulo,
      descricao,
      tipo,
      frente,
      link,
      thumbnail,
      status: 'bruto',
      createdAt: new Date().toISOString()
    };

    this.ideas.push(idea);
    this.saveData();
    this.closeModal('modal-idea');
    document.getElementById('form-idea').reset();
    document.getElementById('idea-image-preview').innerHTML = '';
    delete document.getElementById('idea-image-preview').dataset.base64;
    this.renderKanban();
    this.updateDashboard();
  }

  viewIdea(ideaId) {
    const idea = this.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    this.currentIdeaId = ideaId;
    const content = document.getElementById('idea-detail-content');
    if (!content) return;

    content.innerHTML = `
      ${idea.thumbnail ? `<img src="${idea.thumbnail}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;">` : ''}
      <h3>${idea.titulo}</h3>
      <p><strong>Tipo:</strong> ${idea.tipo}</p>
      <p><strong>Frente:</strong> ${idea.frente}</p>
      <p><strong>Status:</strong> ${idea.status}</p>
      ${idea.link ? `<p><a href="${idea.link}" target="_blank">🔗 Ver post publicado</a></p>` : ''}
      <p>${idea.descricao}</p>
    `;

    this.openModal('modal-idea-detail');
  }

  filterIdeas(filter) {
    if (filter === 'all') {
      this.renderKanban();
    } else {
      const filtered = this.ideas.filter(i => i.frente === filter);
      const statuses = ['bruto', 'roteiro', 'gravar', 'publicado'];
      statuses.forEach(status => {
        let cardsHTML = '';
        filtered.filter(i => i.status === status).forEach(idea => {
          cardsHTML += `
            <div class="kanban-card" draggable="true" data-id="${idea.id}" onclick="app.viewIdea('${idea.id}')">
              ${idea.thumbnail ? `<img src="${idea.thumbnail}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">` : ''}
              <strong>${idea.titulo}</strong>
              <small>${idea.tipo}</small>
            </div>
          `;
        });
        if (cardsHTML === '') cardsHTML = '<p style="color: #999; font-size: 12px;">Vazio</p>';
        const col = document.getElementById(`col-${status}`);
        if (col) col.innerHTML = cardsHTML;
      });
      this.setupDragAndDrop();
    }
  }

  previewImage(e, previewId) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      const preview = document.getElementById(previewId);
      if (preview) {
        preview.innerHTML = `<img src="${base64}" style="max-width: 100%; max-height: 150px;">`;
        preview.dataset.base64 = base64;
      }
    };
    reader.readAsDataURL(file);
  }

  // ===== TASKS =====
  saveTask() {
    const titulo = document.getElementById('task-titulo').value;
    const hora = document.getElementById('task-hora').value;
    const prioridade = document.getElementById('task-prioridade').value;
    const nota = document.getElementById('task-nota').value;

    const task = {
      id: Date.now().toString(),
      titulo,
      hora,
      prioridade,
      nota,
      date: this.currentDate.toISOString(),
      completed: false
    };

    this.tasks.push(task);
    this.saveData();
    this.closeModal('modal-task');
    document.getElementById('form-task').reset();
    this.renderAgendaTab();
    this.updateDashboard();
  }

  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveData();
      this.renderAgendaTab();
    }
  }

  // ===== SCRIPTS / TELEPROMPTER =====
  saveScript() {
    const titulo = document.getElementById('script-titulo').value;
    const conteudo = document.getElementById('script-conteudo').value;
    const frente = document.getElementById('script-frente').value;

    const script = {
      id: Date.now().toString(),
      titulo,
      conteudo,
      frente,
      createdAt: new Date().toISOString()
    };

    this.scripts.push(script);
    this.saveData();
    this.closeModal('modal-script');
    document.getElementById('form-script').reset();
    this.setupTeleprompter();
  }

  setupTeleprompter() {
    const select = document.getElementById('script-select');
    if (!select) return;

    let optionsHTML = '<option value="">Selecione um roteiro...</option>';
    this.scripts.forEach(s => {
      optionsHTML += `<option value="${s.id}">${s.titulo}</option>`;
    });
    select.innerHTML = optionsHTML;
  }

  loadTeleprompterScript(script) {
    const container = document.getElementById('teleprompter-container');
    if (!container) return;

    container.innerHTML = `
      <div id="teleprompter-content" style="padding: 24px; background-color: #1a1a1a; color: #fff; font-size: 32px; line-height: 1.6; text-align: center; height: 500px; overflow-y: auto;">
        ${script.conteudo.split('\n').join('<br>')}
      </div>
    `;
  }

  toggleTeleprompter() {
    const container = document.getElementById('teleprompter-content');
    const btn = document.getElementById('play-pause');
    if (!container || !btn) return;

    if (this.teleprompterPlaying) {
      this.teleprompterPlaying = false;
      btn.textContent = '▶ Play';
    } else {
      this.teleprompterPlaying = true;
      btn.textContent = '⏸ Pause';
      this.autoScrollTeleprompter(container);
    }
  }

  autoScrollTeleprompter(container) {
    if (!this.teleprompterPlaying) return;

    const scrollSpeed = 2 / this.teleprompterSpeed;
    container.scrollTop += scrollSpeed;

    if (container.scrollTop < container.scrollHeight - container.clientHeight) {
      requestAnimationFrame(() => this.autoScrollTeleprompter(container));
    } else {
      this.teleprompterPlaying = false;
      document.getElementById('play-pause').textContent = '▶ Play';
    }
  }

  // ===== HABITS =====
  saveHabit() {
    const nome = document.getElementById('habit-nome').value;
    const descricao = document.getElementById('habit-descricao').value;

    const habit = {
      id: Date.now().toString(),
      nome,
      descricao,
      tracked: [],
      createdAt: new Date().toISOString()
    };

    this.habits.push(habit);
    this.saveData();
    this.closeModal('modal-habit');
    document.getElementById('form-habit').reset();
    this.renderHabits();
  }

  // ===== DREAMS =====
  saveDream() {
    const titulo = document.getElementById('dream-titulo').value;
    const afirmacao = document.getElementById('dream-afirmacao').value;
    const objetivos = document.getElementById('dream-objetivos').value;

    const dream = {
      id: Date.now().toString(),
      titulo,
      afirmacao,
      objetivos,
      createdAt: new Date().toISOString()
    };

    this.dreams.push(dream);
    this.saveData();
    this.closeModal('modal-dream');
    document.getElementById('form-dream').reset();
    this.renderDreams();
  }

  // ===== COURSES =====
  saveCourse() {
    const nome = document.getElementById('course-nome').value;
    const duracao = parseInt(document.getElementById('course-duracao').value);
    const notas = document.getElementById('course-notas').value;

    const course = {
      id: Date.now().toString(),
      nome,
      duracao,
      notas,
      daysCompleted: 0,
      createdAt: new Date().toISOString()
    };

    this.courses.push(course);
    this.saveData();
    this.closeModal('modal-course');
    document.getElementById('form-course').reset();
    this.renderCourses();
  }

  // ===== MODALS =====
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
  }
}

// ===== INIT =====
const app = new JGApp();
document.addEventListener('DOMContentLoaded', () => {
  // App já está inicializado no constructor
});

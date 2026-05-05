// Supabase 配置
const SUPABASE_URL = 'https://smdlwaoqfrrubiahnnh.client.co';
const SUPABASE_ANON_KEY = 'sb_publishable_UvNzTQcNqVDIywhcaYwaIQ_z5Hcv0p-';

// 初始化 Supabase
const client = client.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 应用状态
const app = {
  user: null,
  isLogin: true,
  email: '',
  password: '',
  error: '',
  currentPage: 'home',
  words: [],
  searchWord: '',
  showAddWord: false,
  editingWord: null,
  newWord: { word: '', phonetic: '', meaning: '', example: '' },
  studying: false,
  studyWords: [],
  currentIndex: 0,
  currentWord: null,
  showAnswer: false,
  errorWords: [],
  videoUrl: '',
  videoLoaded: false,
  playSpeed: 1,
  totalWords: 0,
  todayCount: 0,
  streakDays: 0,
  masteredWords: 0,
  calendarDays: []
};

// 渲染函数
function render() {
  const container = document.getElementById('app');
  
  if (!app.user) {
    container.innerHTML = `
      <div class="auth-form">
        <div class="logo">📚</div>
        <h1>英语学习助手</h1>
        <p class="subtitle">轻松背单词，快乐学英语</p>
        
        <div class="tabs">
          <button class="tab-btn ${app.isLogin ? 'active' : ''}" onclick="toggleAuth()">${app.isLogin ? '登录' : '注册'}</button>
          <button class="tab-btn ${!app.isLogin ? 'active' : ''}" onclick="toggleAuth()">${!app.isLogin ? '注册' : '登录'}</button>
        </div>

        <form onsubmit="handleAuth(event)">
          <div class="form-group">
            <input type="email" value="${app.email}" oninput="app.email = this.value" placeholder="邮箱地址" required>
          </div>
          <div class="form-group">
            <input type="password" value="${app.password}" oninput="app.password = this.value" placeholder="密码" required>
          </div>
          <button type="submit" class="btn-primary">
            ${app.isLogin ? '登录' : '注册'}
          </button>
        </form>

        ${app.error ? `<p class="error">${app.error}</p>` : ''}
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="main-content">
      <header class="header">
        <div class="header-left">
          <span class="logo-text">📚 英语学习助手</span>
        </div>
        <div class="header-right">
          <span class="user-info">👤 ${app.user.email}</span>
          <button class="btn-logout" onclick="logout()">退出</button>
        </div>
      </header>

      <nav class="nav">
        <button class="nav-btn ${app.currentPage === 'home' ? 'active' : ''}" onclick="navigate('home')">🏠 首页</button>
        <button class="nav-btn ${app.currentPage === 'words' ? 'active' : ''}" onclick="navigate('words')">📖 单词本</button>
        <button class="nav-btn ${app.currentPage === 'study' ? 'active' : ''}" onclick="navigate('study')">📝 背诵</button>
        <button class="nav-btn ${app.currentPage === 'errors' ? 'active' : ''}" onclick="navigate('errors')">❌ 错题本</button>
        <button class="nav-btn ${app.currentPage === 'video' ? 'active' : ''}" onclick="navigate('video')">🎬 视频跟读</button>
      </nav>

      ${renderHome()}
      ${renderWords()}
      ${renderStudy()}
      ${renderErrors()}
      ${renderVideo()}
    </div>
    ${renderModal()}
  `;
}

function renderHome() {
  if (app.currentPage !== 'home') return '';
  return `
    <div class="page-content">
      <h2>📊 学习统计</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${app.totalWords}</div>
          <div class="stat-label">单词总数</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${app.todayCount}</div>
          <div class="stat-label">今日学习</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${app.streakDays}</div>
          <div class="stat-label">连续打卡</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${app.masteredWords}</div>
          <div class="stat-label">已掌握</div>
        </div>
      </div>

      <h3>📅 学习记录</h3>
      <div class="calendar">
        ${app.calendarDays.map(day => `
          <div class="calendar-day ${day.studied ? 'active' : ''} ${day.isToday ? 'today' : ''}">
            <div class="day-date">${day.day}</div>
          </div>
        `).join('')}
      </div>

      <button class="btn-primary" onclick="navigate('study')">开始学习 🚀</button>
    </div>
  `;
}

function renderWords() {
  if (app.currentPage !== 'words') return '';
  const filtered = app.words.filter(w => 
    !app.searchWord || w.word.toLowerCase().includes(app.searchWord.toLowerCase())
  );
  return `
    <div class="page-content">
      <div class="search-bar">
        <input type="text" value="${app.searchWord}" oninput="app.searchWord = this.value; render()" placeholder="搜索单词...">
        <button class="btn-add" onclick="showAddWordModal()">+ 添加单词</button>
      </div>
      
      <div class="words-list">
        ${filtered.map(word => `
          <div class="word-card">
            <div class="word-header">
              <span class="word-text">${word.word}</span>
              ${word.phonetic ? `<span class="word-phonetic">${word.phonetic}</span>` : ''}
            </div>
            <p class="word-meaning">${word.meaning}</p>
            ${word.example ? `<p class="word-example">${word.example}</p>` : ''}
            <div class="word-actions">
              <button class="action-btn" onclick="toggleFavorite('${word.id}')">
                ${word.favorite ? '❤️' : '🤍'}
              </button>
              <button class="action-btn" onclick="editWord('${word.id}')">✏️</button>
              <button class="action-btn delete" onclick="deleteWord('${word.id}')">🗑️</button>
            </div>
          </div>
        `).join('')}
      </div>
      ${filtered.length === 0 ? '<p class="empty-state">暂无单词，点击上方按钮添加</p>' : ''}
    </div>
  `;
}

function renderStudy() {
  if (app.currentPage !== 'study') return '';
  
  if (!app.studying) {
    return `
      <div class="page-content">
        <div class="study-start">
          <h2>📝 背诵模式</h2>
          <p>选择背诵范围：</p>
          <div class="study-options">
            <button class="option-btn" onclick="startStudy('all')">全部单词</button>
            <button class="option-btn" onclick="startStudy('review')">需要复习</button>
            <button class="option-btn" onclick="startStudy('errors')">错题本</button>
          </div>
        </div>
      </div>
    `;
  }

  if (!app.currentWord) {
    return `
      <div class="page-content">
        <div class="study-complete">
          <h2>🎉 学习完成！</h2>
          <p>今日学习：${app.todayCount} 个单词</p>
          <button class="btn-primary" onclick="app.studying = false; app.currentIndex = 0; render()">返回</button>
        </div>
      </div>
    `;
  }

  const progress = Math.round((app.currentIndex / app.studyWords.length) * 100);
  return `
    <div class="page-content">
      <div class="study-card">
        <div class="card-flip" onclick="flipCard()">
          <div class="card-face ${app.showAnswer ? 'flipped' : ''}">
            <div class="word-display">
              <span class="big-word">${app.currentWord.word}</span>
              ${app.currentWord.phonetic ? `<span class="phonetic-text">${app.currentWord.phonetic}</span>` : ''}
            </div>
          </div>
          <div class="card-face answer ${!app.showAnswer ? 'flipped' : ''}">
            <div class="answer-display">
              <p class="meaning-text">${app.currentWord.meaning}</p>
              ${app.currentWord.example ? `<p class="example-text">${app.currentWord.example}</p>` : ''}
            </div>
          </div>
        </div>

        <div class="study-actions">
          <button class="btn-wrong" onclick="handleWrong()">❌ 记错了</button>
          <button class="btn-hard" onclick="handleHard()">😅 有点难</button>
          <button class="btn-easy" onclick="handleEasy()">✅ 记住了</button>
        </div>

        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <p class="progress-text">${app.currentIndex + 1} / ${app.studyWords.length}</p>
      </div>
    </div>
  `;
}

function renderErrors() {
  if (app.currentPage !== 'errors') return '';
  return `
    <div class="page-content">
      <h2>❌ 错题本</h2>
      ${app.errorWords.length === 0 ? `
        <div class="empty-state">
          <p>暂无错题，继续保持！</p>
        </div>
      ` : `
        <div class="words-list">
          ${app.errorWords.map(error => {
            const word = app.words.find(w => w.id === error.word_id);
            return `
            <div class="word-card error-card">
              <div class="word-header">
                <span class="word-text">${word?.word || '未知单词'}</span>
                <span class="error-badge">错误 ${error.error_count} 次</span>
              </div>
              <p class="word-meaning">${word?.meaning || ''}</p>
              <div class="word-actions">
                <button class="action-btn" onclick="removeFromErrors('${error.id}')">🗑️ 移除</button>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

function renderVideo() {
  if (app.currentPage !== 'video') return '';
  return `
    <div class="page-content">
      <h2>🎬 视频跟读</h2>
      <div class="video-input">
        <input type="text" value="${app.videoUrl}" oninput="app.videoUrl = this.value" placeholder="输入 YouTube 视频链接...">
        <button class="btn-primary" onclick="loadVideo()">加载视频</button>
      </div>
      
      ${app.videoLoaded ? `
        <div class="video-player">
          <div class="video-container">
            <iframe src="${getEmbedUrl()}" frameborder="0" allowfullscreen></iframe>
          </div>
          <div class="video-controls">
            <button onclick="app.playSpeed = 0.5; render()">0.5x</button>
            <button onclick="app.playSpeed = 0.75; render()">0.75x</button>
            <button class="speed-btn ${app.playSpeed === 1 ? 'active' : ''}" onclick="app.playSpeed = 1; render()">1x</button>
            <button onclick="app.playSpeed = 1.25; render()">1.25x</button>
            <button onclick="app.playSpeed = 1.5; render()">1.5x</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderModal() {
  if (!app.showAddWord) return '';
  return `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal" onclick="event.stopPropagation()">
        <h3>${app.editingWord ? '编辑单词' : '添加单词'}</h3>
        <form onsubmit="saveWord(event)">
          <input type="text" value="${app.newWord.word}" oninput="app.newWord.word = this.value" placeholder="单词" required>
          <input type="text" value="${app.newWord.phonetic}" oninput="app.newWord.phonetic = this.value" placeholder="音标（可选）">
          <textarea value="${app.newWord.meaning}" oninput="app.newWord.meaning = this.value" placeholder="释义" required></textarea>
          <textarea value="${app.newWord.example}" oninput="app.newWord.example = this.value" placeholder="例句（可选）"></textarea>
          <div class="modal-actions">
            <button type="button" class="btn-cancel" onclick="closeModal()">取消</button>
            <button type="submit" class="btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

// 辅助函数
function getEmbedUrl() {
  const match = app.videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
  const videoId = match ? match[1] : '';
  return `https://www.youtube.com/embed/${videoId}?autoplay=0`;
}

// 认证相关
function toggleAuth() {
  app.isLogin = !app.isLogin;
  app.error = '';
  render();
}

async function handleAuth(event) {
  event.preventDefault();
  app.error = '';
  
  try {
    if (app.isLogin) {
      const { data, error } = await client.auth.signInWithPassword({
        email: app.email,
        password: app.password
      });
      if (error) throw error;
      app.user = data.user;
    } else {
      const { data, error } = await client.auth.signUp({
        email: app.email,
        password: app.password
      });
      if (error) throw error;
      app.user = data.user;
    }
    await loadUserData();
  } catch (err) {
    app.error = err.message;
  }
  render();
}

async function logout() {
  await client.auth.signOut();
  app.user = null;
  app.email = '';
  app.password = '';
  app.error = '';
  app.currentPage = 'home';
  render();
}

// 导航
function navigate(page) {
  app.currentPage = page;
  if (page === 'words') loadWords();
  if (page === 'errors') loadErrorWords();
  if (page === 'home') loadStats();
  render();
}

// 单词管理
function showAddWordModal() {
  app.editingWord = null;
  app.newWord = { word: '', phonetic: '', meaning: '', example: '' };
  app.showAddWord = true;
  render();
}

function closeModal() {
  app.showAddWord = false;
  app.editingWord = null;
  app.newWord = { word: '', phonetic: '', meaning: '', example: '' };
  render();
}

async function saveWord(event) {
  event.preventDefault();
  
  try {
    if (app.editingWord) {
      await client.from('words').update({
        word: app.newWord.word,
        phonetic: app.newWord.phonetic,
        meaning: app.newWord.meaning,
        example: app.newWord.example
      }).eq('id', app.editingWord);
    } else {
      await client.from('words').insert({
        word: app.newWord.word,
        phonetic: app.newWord.phonetic,
        meaning: app.newWord.meaning,
        example: app.newWord.example,
        level: 0,
        favorite: false
      });
    }
    closeModal();
    await loadWords();
  } catch (err) {
    app.error = err.message;
  }
  render();
}

async function editWord(id) {
  const word = app.words.find(w => w.id === id);
  if (word) {
    app.editingWord = id;
    app.newWord = { ...word };
    app.showAddWord = true;
    render();
  }
}

async function deleteWord(id) {
  if (confirm('确定删除这个单词吗？')) {
    await client.from('words').delete().eq('id', id);
    await loadWords();
    render();
  }
}

async function toggleFavorite(id) {
  const word = app.words.find(w => w.id === id);
  if (word) {
    await client.from('words').update({ favorite: !word.favorite }).eq('id', id);
    word.favorite = !word.favorite;
    render();
  }
}

// 背诵功能
async function startStudy(type) {
  app.studying = true;
  app.currentIndex = 0;
  app.showAnswer = false;
  
  let tempWords = [...app.words];
  
  if (type === 'review') {
    const today = new Date().toISOString().split('T')[0];
    tempWords = tempWords.filter(w => !w.last_studied || w.last_studied !== today);
  } else if (type === 'errors') {
    const wordIds = app.errorWords.map(e => e.word_id);
    tempWords = tempWords.filter(w => wordIds.includes(w.id));
  }
  
  app.studyWords = tempWords.sort(() => Math.random() - 0.5).slice(0, 20);
  app.currentWord = app.studyWords[0];
  render();
}

function flipCard() {
  app.showAnswer = !app.showAnswer;
  render();
}

async function handleWrong() {
  await recordError(app.currentWord.id);
  await updateWordLevel(app.currentWord.id, -1);
  nextWord();
}

async function handleHard() {
  await updateWordLevel(app.currentWord.id, 0);
  nextWord();
}

async function handleEasy() {
  await updateWordLevel(app.currentWord.id, 1);
  await updateStudyLog();
  nextWord();
}

function nextWord() {
  app.currentIndex++;
  app.showAnswer = false;
  app.currentWord = app.studyWords[app.currentIndex];
  render();
}

async function updateWordLevel(wordId, delta) {
  const word = app.words.find(w => w.id === wordId);
  if (word) {
    const newLevel = Math.max(0, Math.min(5, (word.level || 0) + delta));
    await client.from('words').update({ 
      level: newLevel,
      last_studied: new Date().toISOString().split('T')[0]
    }).eq('id', wordId);
    word.level = newLevel;
  }
}

async function recordError(wordId) {
  const existing = app.errorWords.find(e => e.word_id === wordId);
  if (existing) {
    await client.from('error_words').update({
      error_count: existing.error_count + 1,
      last_error_date: new Date().toISOString().split('T')[0]
    }).eq('id', existing.id);
    existing.error_count++;
  } else {
    await client.from('error_words').insert({
      word_id: wordId,
      error_count: 1
    });
    await loadErrorWords();
  }
}

async function updateStudyLog() {
  const today = new Date().toISOString().split('T')[0];
  const { data: existing } = await supabase
    .from('study_log')
    .select('*')
    .eq('study_date', today)
    .single();
  
  if (existing) {
    await client.from('study_log').update({
      words_count: existing.words_count + 1,
      correct_count: existing.correct_count + 1
    }).eq('id', existing.id);
  } else {
    await client.from('study_log').insert({
      study_date: today,
      words_count: 1,
      correct_count: 1
    });
  }
  app.todayCount++;
}

async function removeFromErrors(id) {
  await client.from('error_words').delete().eq('id', id);
  await loadErrorWords();
  render();
}

// 视频功能
function loadVideo() {
  if (app.videoUrl.includes('youtube') || app.videoUrl.includes('youtu.be')) {
    app.videoLoaded = true;
  } else {
    alert('请输入有效的 YouTube 链接');
  }
  render();
}

// 数据加载
async function loadWords() {
  const { data } = await supabase
    .from('words')
    .select('*')
    .order('created_at', { ascending: false });
  app.words = data || [];
  app.totalWords = app.words.length;
  app.masteredWords = app.words.filter(w => (w.level || 0) >= 4).length;
}

async function loadErrorWords() {
  const { data } = await supabase
    .from('error_words')
    .select('*')
    .order('last_error_date', { ascending: false });
  app.errorWords = data || [];
}

async function loadStats() {
  await loadWords();
  
  const today = new Date().toISOString().split('T')[0];
  const { data: todayLog } = await supabase
    .from('study_log')
    .select('words_count')
    .eq('study_date', today)
    .single();
  app.todayCount = todayLog?.words_count || 0;
  
  const { data: logs } = await supabase
    .from('study_log')
    .select('study_date')
    .order('study_date', { ascending: false });
  
  let streak = 0;
  const todayDate = new Date();
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(todayDate);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    if (logs?.some(log => log.study_date === dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  app.streakDays = streak;
  
  generateCalendar();
}

function generateCalendar() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  app.calendarDays = [];
  for (let i = 0; i < firstDay.getDay(); i++) {
    app.calendarDays.push({ day: '', studied: false, isToday: false });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), i);
    const dateStr = date.toISOString().split('T')[0];
    const isToday = dateStr === today.toISOString().split('T')[0];
    
    app.calendarDays.push({
      day: i,
      date: dateStr,
      studied: Math.random() > 0.4,
      isToday
    });
  }
}

async function loadUserData() {
  await loadWords();
  await loadErrorWords();
  await loadStats();
}

// 初始化
async function init() {
  const { data: { user } } = await client.auth.getUser();
  if (user) {
    app.user = user;
    await loadUserData();
  }
  render();
  
  client.auth.onAuthStateChange((_event, session) => {
    app.user = session?.user || null;
    if (app.user) {
      loadUserData();
    }
    render();
  });
}

// 启动应用
init();
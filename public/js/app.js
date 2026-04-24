// app.js — Main application router and controller
const App = {
  currentPage: null,
  params: {},

  init() {
    // Check if user is logged in
    const token = API.getToken();
    if (token) {
      this.showApp();
      this.navigate('dashboard');
    } else {
      this.showAuth();
    }

    // Init Theme
    const savedTheme = localStorage.getItem('ll_theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      document.getElementById('btn-theme-toggle').textContent = '☀️';
    }

    // Bind nav events
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigate(link.dataset.page);
      });
    });

    // Brand click
    const brandLogo = document.getElementById('nav-brand-logo');
    if (brandLogo) {
      brandLogo.addEventListener('click', () => {
        if (API.getToken()) this.navigate('dashboard');
      });
    }

    // Upgrade to Pro click
    const btnUpgrade = document.getElementById('btn-upgrade-pro');
    if (btnUpgrade) {
      btnUpgrade.addEventListener('click', async () => {
        btnUpgrade.textContent = 'Upgrading...';
        btnUpgrade.disabled = true;
        try {
          await API.upgradeToPro();
          this.toast('🎉 Successfully upgraded to LinguaLearn Plus!', 'success');
          await this.updateProStatus();
          // Reload dashboard to show pro features
          if (this.currentPage === 'dashboard') {
            this.navigate('dashboard');
          }
        } catch (err) {
          this.toast('Upgrade failed: ' + err.message, 'error');
          btnUpgrade.textContent = '⭐ Upgrade to Pro';
          btnUpgrade.disabled = false;
        }
      });
    }

    // Theme toggle
    document.getElementById('btn-theme-toggle').addEventListener('click', (e) => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('ll_theme', isDark ? 'dark' : 'light');
      e.target.textContent = isDark ? '☀️' : '🌙';
    });

    // Lang toggle
    document.getElementById('btn-lang-toggle').addEventListener('click', () => {
      const newLang = I18n.locale === 'en' ? 'pl' : 'en';
      I18n.setLocale(newLang);
    });

    // Logout
    document.getElementById('btn-logout').addEventListener('click', () => {
      API.clearToken();
      this.showAuth();
    });

    // Initial Translation
    I18n.translatePage();
  },

  showAuth() {
    document.getElementById('navbar').classList.add('hidden');
    AuthView.render(document.getElementById('app-content'));
    this.currentPage = 'auth';
  },

  showApp() {
    document.getElementById('navbar').classList.remove('hidden');
    const user = API.getUser();
    if (user) {
      document.getElementById('nav-username').textContent = user.username;
    }
    this.updateProStatus();
  },

  async updateProStatus() {
    try {
      const user = await API.request('/users/me');
      // Update local storage user just in case
      localStorage.setItem('ll_user', JSON.stringify(user));
      const btnUpgrade = document.getElementById('btn-upgrade-pro');
      const badgePro = document.getElementById('nav-pro-badge');
      
      if (user.isPro) {
        if (btnUpgrade) btnUpgrade.style.display = 'none';
        if (badgePro) badgePro.style.display = 'inline';
      } else {
        if (btnUpgrade) {
          btnUpgrade.style.display = 'inline';
          btnUpgrade.textContent = '⭐ Upgrade to Pro';
          btnUpgrade.disabled = false;
        }
        if (badgePro) badgePro.style.display = 'none';
      }
    } catch (err) {
      console.error('Failed to fetch user pro status', err);
    }
  },

  onLogin() {
    this.showApp();
    this.navigate('dashboard');
    this.toast('Welcome to LinguaLearn!', 'success');
  },

  async navigate(page, params = {}) {
    this.currentPage = page;
    this.params = params;
    const container = document.getElementById('app-content');

    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page ||
        (page === 'course' && link.dataset.page === 'courses') ||
        (page === 'quiz' && link.dataset.page === 'courses'));
    });

    try {
      switch (page) {
        case 'dashboard':
          await DashboardView.render(container);
          break;
        case 'courses':
          // Show dashboard which includes courses
          await DashboardView.render(container);
          break;
        case 'course':
          await CourseView.render(container, params);
          break;
        case 'quiz':
          await QuizView.render(container, params);
          break;
        case 'vocabulary':
          await FlashcardsView.render(container, params);
          break;
        case 'leaderboard':
          await LeaderboardView.render(container, params);
          break;
        default:
          await DashboardView.render(container);
      }
      
      I18n.translatePage();
      
    } catch (err) {
      if (err.message.includes('Unauthorized') || err.message.includes('401')) {
        API.clearToken();
        this.showAuth();
        this.toast('Session expired. Please log in again.', 'error');
      }
    }
  },

  toast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },
};

// Start the app
document.addEventListener('DOMContentLoaded', () => App.init());

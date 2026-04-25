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
      btnUpgrade.addEventListener('click', () => this.showPricingModal());
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

  showPricingModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="pricing-modal">
        <button class="btn btn-sm btn-outline" style="position:absolute; top:1rem; right:1rem;" id="close-modal">✕</button>
        <div class="pricing-header">
          <h2>Choose Your Plan</h2>
          <p>Unlock your full potential with LinguaLearn Premium</p>
        </div>
        
        <div class="pricing-grid">
          <!-- Free Plan -->
          <div class="plan-card">
            <div class="plan-name">Free</div>
            <div class="plan-price">$0 <span>/ forever</span></div>
            <ul class="plan-features">
              <li>Basic courses</li>
              <li>Limited flashcards</li>
              <li>Community leaderboard</li>
            </ul>
            <button class="btn btn-outline btn-block" disabled>Current Plan</button>
          </div>

          <!-- Pro Plan -->
          <div class="plan-card popular">
            <div class="plan-badge">Best Value</div>
            <div class="plan-name">Pro</div>
            <div class="plan-price">$9.99 <span>/ month</span></div>
            <ul class="plan-features">
              <li>All Advanced Courses</li>
              <li>Advanced Analytics</li>
              <li>Unlimited Flashcards</li>
              <li>Priority Support</li>
            </ul>
            <button class="btn btn-primary btn-block" id="btn-buy-pro" data-tier="pro">Get Pro</button>
          </div>

          <!-- Plus Plan -->
          <div class="plan-card">
            <div class="plan-name">Ultra</div>
            <div class="plan-price">$19.99 <span>/ month</span></div>
            <ul class="plan-features">
              <li>Everything in Pro</li>
              <li>1-on-1 AI Tutoring</li>
              <li>Offline Mode</li>
              <li>Family Access (5 users)</li>
            </ul>
            <button class="btn btn-primary btn-block" id="btn-buy-plus" data-tier="plus">Get Ultra</button>
          </div>
        </div>

        <div style="border-top: 1px solid var(--border); padding-top: 1.5rem;">
          <h3 style="font-size: 1rem; margin-bottom: 0.5rem; text-align: center;">Or top up your Gems</h3>
          <div style="display: flex; gap: 1rem; justify-content: center; margin-bottom: 1.5rem;">
            <button class="btn btn-outline" id="btn-buy-gems-500">💎 500 Gems ($4.99)</button>
            <button class="btn btn-outline" id="btn-buy-gems-1200">💎 1200 Gems ($9.99)</button>
          </div>

          <h3 style="font-size: 0.9rem; margin-bottom: 0.5rem; text-align: center;">Payment Method</h3>
          <div class="payment-selection">
            <div class="payment-method selected" data-method="card">💳 Credit Card</div>
            <div class="payment-method" data-method="paypal">🅿️ PayPal</div>
            <div class="payment-method" data-method="crypto">₿ Crypto</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Bind events
    document.getElementById('close-modal').onclick = () => modal.remove();
    
    // Payment method selection
    modal.querySelectorAll('.payment-method').forEach(pm => {
      pm.onclick = () => {
        modal.querySelectorAll('.payment-method').forEach(p => p.classList.remove('selected'));
        pm.classList.add('selected');
      };
    });

    // Buy subscriptions
    const handleUpgrade = async (tier) => {
      const btn = document.querySelector(`#btn-buy-${tier}`);
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Processing...';
      
      try {
        await API.upgradeToPro(tier);
        this.toast(`🎉 Welcome to LinguaLearn ${tier.toUpperCase()}!`, 'success');
        modal.remove();
        await this.updateProStatus();
        if (this.currentPage === 'dashboard') this.navigate('dashboard');
      } catch (err) {
        this.toast(err.message, 'error');
        btn.disabled = false;
        btn.textContent = originalText;
      }
    };

    document.getElementById('btn-buy-pro').onclick = () => handleUpgrade('pro');
    document.getElementById('btn-buy-plus').onclick = () => handleUpgrade('plus');

    // Buy gems
    const handleGems = async (amount) => {
      try {
        const result = await API.purchaseGems(amount);
        this.toast(`💎 Added ${amount} gems to your account!`, 'success');
        modal.remove();
        if (this.currentPage === 'dashboard') this.navigate('dashboard');
      } catch (err) {
        this.toast(err.message, 'error');
      }
    };

    document.getElementById('btn-buy-gems-500').onclick = () => handleGems(500);
    document.getElementById('btn-buy-gems-1200').onclick = () => handleGems(1200);
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

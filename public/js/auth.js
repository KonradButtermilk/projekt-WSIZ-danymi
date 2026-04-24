// auth.js — Login/Register view
const AuthView = {
  render(container) {
    container.innerHTML = `
      <div class="auth-container">
        <div class="auth-card">
          <div class="auth-header">
            <div class="logo">📖</div>
            <h1>LinguaLearn</h1>
            <p>Your personal language learning platform</p>
          </div>

          <div class="auth-tabs">
            <button class="auth-tab active" data-tab="login">Sign In</button>
            <button class="auth-tab" data-tab="register">Create Account</button>
          </div>

          <!-- Login Form -->
          <form id="login-form">
            <div class="form-group">
              <label class="form-label" for="login-email">Email</label>
              <input class="form-input" type="email" id="login-email" placeholder="you@example.com" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="login-password">Password</label>
              <input class="form-input" type="password" id="login-password" placeholder="Your password" required minlength="6">
            </div>
            <div id="login-error" class="form-error" style="margin-bottom:1rem"></div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="login-btn">Sign In</button>
          </form>

          <!-- Register Form -->
          <form id="register-form" style="display:none">
            <div class="form-group">
              <label class="form-label" for="reg-email">Email</label>
              <input class="form-input" type="email" id="reg-email" placeholder="you@example.com" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-username">Username</label>
              <input class="form-input" type="text" id="reg-username" placeholder="Choose a username" required minlength="3" maxlength="30">
            </div>
            <div class="form-group">
              <label class="form-label" for="reg-password">Password</label>
              <input class="form-input" type="password" id="reg-password" placeholder="Min 6 characters" required minlength="6">
            </div>
            <div id="register-error" class="form-error" style="margin-bottom:1rem"></div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="register-btn">Create Account</button>
          </form>
        </div>
      </div>
    `;

    this.bindEvents();
  },

  bindEvents() {
    // Tab switching
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const isLogin = tab.dataset.tab === 'login';
        document.getElementById('login-form').style.display = isLogin ? 'block' : 'none';
        document.getElementById('register-form').style.display = isLogin ? 'none' : 'block';
      });
    });

    // Login
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('login-btn');
      const errorEl = document.getElementById('login-error');
      errorEl.textContent = '';
      btn.disabled = true;
      btn.textContent = 'Signing in...';

      try {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const result = await API.login(email, password);
        API.setToken(result.access_token);
        API.setUser(result.user);
        App.onLogin();
      } catch (err) {
        errorEl.textContent = err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });

    // Register
    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('register-btn');
      const errorEl = document.getElementById('register-error');
      errorEl.textContent = '';
      btn.disabled = true;
      btn.textContent = 'Creating account...';

      try {
        const email = document.getElementById('reg-email').value;
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const result = await API.register(email, username, password);
        API.setToken(result.access_token);
        API.setUser(result.user);
        App.onLogin();
      } catch (err) {
        errorEl.textContent = err.message;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Create Account';
      }
    });
  },
};

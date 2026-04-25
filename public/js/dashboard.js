// dashboard.js — Dashboard view with stats and course cards
const DashboardView = {
  async render(container) {
    container.innerHTML = `<div class="page-container"><div class="loading"><div class="spinner"></div> Loading dashboard...</div></div>`;

    try {
      const [stats, courses, goals, achievements, dbUser] = await Promise.all([
        API.getStats(),
        API.getCourses(),
        API.getTodayGoals(),
        API.getAchievements(),
        API.request('/users/me')
      ]);

      const user = dbUser || API.getUser();

      container.innerHTML = `
        <div class="page-container">
          <div class="page-header">
            <h1><span data-i18n="dashboard.welcome">Welcome back</span>${user ? ', ' + user.username : ''}!</h1>
            <p data-i18n="dashboard.subtitle">Continue learning and track your progress</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card accent">
              <span class="stat-label" data-i18n="dashboard.total_xp">Total XP</span>
              <span class="stat-value">${stats.xp}</span>
            </div>
            <div class="stat-card warning">
              <span class="stat-label" data-i18n="dashboard.streak">Daily Streak</span>
              <span class="stat-value">🔥 ${stats.streak}</span>
            </div>
            <div class="stat-card success">
              <span class="stat-label" data-i18n="dashboard.lessons_done">Lessons Done</span>
              <span class="stat-value">${stats.completedLessons}</span>
            </div>
            <div class="stat-card" style="border-color: #ffd700;">
              <span class="stat-label">Gems</span>
              <span class="stat-value">💎 ${user.gems || 0}</span>
            </div>
          </div>

          <div class="dashboard-widgets" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
            <!-- Daily Goals -->
            <div class="widget">
              <h2 class="section-title">🎯 <span data-i18n="dashboard.goals">Daily Goals</span></h2>
              <div class="goals-list" style="background: var(--surface-color); border-radius: 12px; padding: 1.5rem; border: 1px solid var(--border-color);">
                ${goals.map(g => `
                  <div class="goal-item" style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                      <span style="font-weight: 500; text-transform: capitalize;">${g.goalType} (${g.currentValue}/${g.targetValue})</span>
                      <span style="color: var(--accent); font-weight: 600;">+${g.rewardXp} XP</span>
                    </div>
                    <div class="progress-bar" style="background: var(--gray-100); height: 8px; border-radius: 4px; overflow: hidden;">
                      <div style="width: ${(g.currentValue/g.targetValue)*100}%; background: ${g.isCompleted ? 'var(--success)' : 'var(--accent)'}; height: 100%;"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Achievements -->
            <div class="widget">
              <h2 class="section-title">🏆 <span data-i18n="dashboard.achievements">Achievements</span></h2>
              <div class="achievements-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem;">
                ${achievements.length === 0 
                  ? '<p style="color: var(--text-secondary); grid-column: 1/-1;" data-i18n="dashboard.no_achievements">No achievements yet. Keep learning!</p>' 
                  : achievements.map(ua => `
                    <div class="achievement-card" style="background: var(--surface-color); border-radius: 12px; padding: 1rem; text-align: center; border: 1px solid var(--border-color);">
                      <div style="font-size: 2rem; margin-bottom: 0.5rem;">${ua.achievement.icon}</div>
                      <div style="font-size: 0.85rem; font-weight: 600;">${ua.achievement.title}</div>
                    </div>
                  `).join('')}
              </div>
            </div>
          </div>

          ${user.isPro ? `
          <!-- Advanced Analytics Widget (PREMIUM) -->
          <div class="analytics-widget">
            <div class="analytics-header">
              <h2 class="section-title">📊 Advanced Analytics</h2>
              <span class="plan-badge" style="position: static; transform: none; display: inline-block;">
                ${user.proTier === 'plus' ? 'ULTRA MEMBER' : 'PRO MEMBER'}
              </span>
            </div>
            <div class="analytics-grid">
              <div class="analytic-item">
                <div class="analytic-value">${Math.round(stats.xp / Math.max(1, stats.streak))}</div>
                <div class="analytic-label">Avg XP / Day</div>
              </div>
              <div class="analytic-item">
                <div class="analytic-value">Top ${Math.max(1, 100 - Math.floor(stats.xp / 100))}%</div>
                <div class="analytic-label">Global Rank</div>
              </div>
              <div class="analytic-item">
                <div class="analytic-value">${stats.completedLessons * 3}</div>
                <div class="analytic-label">Words Mastered</div>
              </div>
              <div class="analytic-item">
                <div class="analytic-value">${user.proTier === 'plus' ? 'UNLIMITED' : '500'}</div>
                <div class="analytic-label">Hint Capacity</div>
              </div>
            </div>
          </div>
          ` : ''}

          <h2 class="section-title" style="margin-top: 2rem;">📚 <span data-i18n="dashboard.courses">Your Courses</span></h2>
          <div class="course-grid">
            ${courses.length === 0
              ? '<div class="empty-state"><div class="icon">📭</div><p>No courses available yet.</p></div>'
              : courses.map(c => `
                <div class="course-card" data-course-id="${c.id}">
                  <span class="course-level">${c.level}</span>
                  <h3>${c.title}</h3>
                  <p class="course-lang">${c.language}</p>
                  <p class="course-desc">${c.description || 'Start learning today!'}</p>
                </div>
              `).join('')
            }
          </div>
        </div>
      `;

      // Update nav stats
      document.getElementById('nav-xp').textContent = `${stats.xp} XP`;
      document.getElementById('nav-streak').textContent = `🔥 ${stats.streak}`;

      // Bind course card clicks
      container.querySelectorAll('.course-card').forEach(card => {
        card.addEventListener('click', () => {
          App.navigate('course', { courseId: card.dataset.courseId });
        });
      });

    } catch (err) {
      container.innerHTML = `<div class="page-container"><div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div></div>`;
    }
  },
};

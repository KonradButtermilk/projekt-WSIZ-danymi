// leaderboard.js — Global XP Leaderboard View
const LeaderboardView = {
  async render(container) {
    container.innerHTML = `<div class="page-container"><div class="loading"><div class="spinner"></div> Loading leaderboard...</div></div>`;

    try {
      const topUsers = await API.getLeaderboard();
      const currentUser = API.getUser();

      container.innerHTML = `
        <div class="page-container">
          <div class="page-header">
            <h1>🌍 <span data-i18n="leaderboard.title">Global Leaderboard</span></h1>
            <p data-i18n="leaderboard.subtitle">See how you rank against other LinguaLearn students</p>
          </div>

          <div class="leaderboard-table" style="background: var(--surface-color); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); margin-top: 2rem;">
            ${topUsers.length === 0 ? '<div style="padding: 2rem; text-align: center;">No users yet.</div>' : ''}
            
            ${topUsers.map((u, i) => `
              <div style="display: flex; align-items: center; padding: 1.25rem 2rem; border-bottom: 1px solid var(--border-color); ${u.id === currentUser?.id ? 'background-color: var(--primary-light);' : ''}">
                <div style="width: 50px; font-weight: 700; font-size: 1.25rem; color: var(--text-secondary);">
                  ${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div style="flex: 1;">
                  <div style="font-weight: 600; font-size: 1.1rem; color: var(--text-main);">${u.username} ${u.id === currentUser?.id ? `<span style="font-size: 0.8rem; background: var(--primary); color: white; padding: 2px 6px; border-radius: 4px; margin-left: 8px;" data-i18n="leaderboard.you">${I18n.t('leaderboard.you')}</span>` : ''}</div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary);">🔥 ${u.streak}</div>
                </div>
                <div style="font-weight: 700; color: var(--accent); font-size: 1.1rem;">
                  ${u.xp} XP
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    } catch (err) {
      container.innerHTML = `<div class="page-container"><div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div></div>`;
    }
  }
};

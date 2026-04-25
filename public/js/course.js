// course.js — Course detail view with lesson list
const CourseView = {
  async render(container, params) {
    container.innerHTML = `<div class="page-container"><div class="loading"><div class="spinner"></div> Loading course...</div></div>`;

    try {
      const [course, lessons] = await Promise.all([
        API.getCourse(params.courseId),
        API.getCourseLessons(params.courseId),
      ]);

      const completed = lessons.filter(l => l.isCompleted).length;
      const progress = lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0;

      container.innerHTML = `
        <div class="page-container">
          <a class="back-btn" id="back-to-dashboard">← Back to Dashboard</a>

          <div class="course-info">
            <h2>${course.title}</h2>
            <p class="meta">${course.language} · Level ${course.level} · ${lessons.length} lessons</p>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width: ${progress}%"></div>
            </div>
            <p class="meta" style="margin-top:0.5rem">${completed} of ${lessons.length} completed (${progress}%)</p>
          </div>

          <h2 class="section-title">📝 Lessons</h2>
          <div class="lesson-list">
            ${lessons.map((lesson, i) => {
              const user = API.getUser();
              const isPro = user && user.isPro;
              const isPremiumLocked = lesson.isPremium && !isPro;
              
              const statusClass = lesson.isCompleted ? 'completed' : ((!lesson.isUnlocked || isPremiumLocked) ? 'locked' : '');
              let statusText = lesson.isCompleted ? '✓ Done' : (!lesson.isUnlocked ? '🔒 Locked' : 'Start →');
              if (isPremiumLocked) statusText = '⭐ PRO Only';

              return `
                <div class="lesson-item ${statusClass}" data-lesson-id="${lesson.id}" data-unlocked="${lesson.isUnlocked}" data-premium="${lesson.isPremium}">
                  <div style="display: flex; align-items: center; width: 100%; gap: 1.5rem;">
                    <div class="lesson-number">${i + 1}</div>
                    <div class="lesson-info">
                      <h4>${lesson.title} ${lesson.isPremium ? '<span class="badge" style="background:var(--accent); color:white; font-size:0.6rem; padding:2px 5px; border-radius:4px; margin-left:5px;">PRO</span>' : ''}</h4>
                      <p>${lesson.description || ''}</p>
                    </div>
                    <span class="lesson-status" style="margin-left: auto;">${statusText}</span>
                  </div>
                  ${lesson.culturalContext ? `
                  <div class="cultural-context-box" style="margin-top: 1rem; padding: 1rem; background: var(--accent-bg); border-left: 4px solid var(--accent); border-radius: 4px;">
                    <strong style="color: var(--accent); font-size: 0.9rem;">💡 Cultural Note:</strong>
                    <p style="font-size: 0.9rem; margin-top: 0.25rem;">${lesson.culturalContext}</p>
                  </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      // Back button
      document.getElementById('back-to-dashboard').addEventListener('click', (e) => {
        e.preventDefault();
        App.navigate('dashboard');
      });

      // Lesson click
      container.querySelectorAll('.lesson-item').forEach(item => {
        item.addEventListener('click', () => {
          const user = API.getUser();
          const isPro = user && user.isPro;
          const isPremium = item.dataset.premium === 'true';

          if (isPremium && !isPro) {
            App.toast('This lesson requires a PRO subscription.', 'info');
            App.showPricingModal();
            return;
          }

          if (item.dataset.unlocked === 'false') {
            App.toast('Complete the previous lesson first.', 'info');
            return;
          }
          App.navigate('quiz', {
            lessonId: item.dataset.lessonId,
            courseId: params.courseId,
          });
        });
      });

    } catch (err) {
      container.innerHTML = `<div class="page-container"><div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div></div>`;
    }
  },
};

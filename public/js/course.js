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
              const statusClass = lesson.isCompleted ? 'completed' : (!lesson.isUnlocked ? 'locked' : '');
              const statusText = lesson.isCompleted ? '✓ Done' : (!lesson.isUnlocked ? '🔒 Locked' : 'Start →');
              return `
                <div class="lesson-item ${statusClass}" data-lesson-id="${lesson.id}" data-unlocked="${lesson.isUnlocked}">
                  <div style="display: flex; align-items: center; width: 100%;">
                    <div class="lesson-number">${i + 1}</div>
                    <div class="lesson-info">
                      <h4>${lesson.title}</h4>
                      <p>${lesson.description || ''}</p>
                    </div>
                    <span class="lesson-status">${statusText}</span>
                  </div>
                  ${lesson.culturalContext ? `
                  <div class="cultural-context-box" style="margin-top: 1rem; padding: 1rem; background: rgba(255,154,158,0.1); border-left: 4px solid #ff9a9e; border-radius: 4px;">
                    <strong style="color: #ff9a9e; font-size: 0.9rem;">⛩️ Cultural Note:</strong>
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

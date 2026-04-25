// quiz.js — Quiz taking and results view
const QuizView = {
  quizData: null,
  answers: {},

  async render(container, params) {
    container.innerHTML = `<div class="page-container"><div class="loading"><div class="spinner"></div> Loading quiz...</div></div>`;

    try {
      const data = await API.getQuiz(params.lessonId);
      this.quizData = data;
      this.answers = {};
      this.renderQuiz(container, params);
    } catch (err) {
      container.innerHTML = `
        <div class="page-container">
          <a class="back-btn" id="back-to-course">← Back to Course</a>
          <div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div>
        </div>
      `;
      document.getElementById('back-to-course')?.addEventListener('click', (e) => {
        e.preventDefault();
        App.navigate('course', { courseId: params.courseId });
      });
    }
  },

  renderQuiz(container, params) {
    const { quiz, questions } = this.quizData;
    const totalQ = questions.length;

    container.innerHTML = `
      <div class="page-container">
        <a class="back-btn" id="back-to-course">← Back to Lessons</a>
        <div class="quiz-container">
          <div class="quiz-header">
            <h2>${quiz.title}</h2>
            <p style="color:var(--text-secondary);font-size:0.9rem">Answer all questions. You need ${quiz.passingScore}% to pass.</p>
            <div class="quiz-progress">
              <div class="quiz-progress-bar">
                <div class="quiz-progress-fill" id="quiz-progress-fill" style="width:0%"></div>
              </div>
              <span class="quiz-progress-text" id="quiz-progress-text">0 / ${totalQ}</span>
            </div>
          </div>

          <div id="questions-container">
            ${questions.map((q, i) => this.renderQuestion(q, i)).join('')}
          </div>

          <div class="quiz-actions">
            <button class="btn btn-primary btn-lg" id="submit-quiz-btn" disabled>
              Submit Answers
            </button>
          </div>
        </div>
      </div>
    `;

    // Back button
    document.getElementById('back-to-course').addEventListener('click', (e) => {
      e.preventDefault();
      App.navigate('course', { courseId: params.courseId });
    });

    // Bind answer selection
    this.bindAnswerEvents(questions);

    // Submit
    document.getElementById('submit-quiz-btn').addEventListener('click', async () => {
      await this.submitQuiz(container, params);
    });
  },

  renderQuestion(q, index) {
    let typeBadge = '';
    if (q.type === 'multiple_choice') typeBadge = '<span class="question-type-badge mc">Multiple Choice</span>';
    else if (q.type === 'text_input') typeBadge = '<span class="question-type-badge text">Type Your Answer</span>';
    else if (q.type === 'speaking_simulation') typeBadge = '<span class="question-type-badge speaking" style="background:#e0e7ff; color:#4f46e5;">🎙️ Speaking Practice</span>';
    else if (q.type === 'situational_chat') typeBadge = '<span class="question-type-badge chat" style="background:#fce7f3; color:#db2777;">💬 Situational Chat</span>';

    let answersHtml = '';
    if (q.type === 'multiple_choice' && q.answers) {
      answersHtml = `
        <div class="answer-options">
          ${q.answers.map(a => `
            <div class="answer-option" data-question-id="${q.id}" data-answer-id="${a.id}">
              <div class="radio"></div>
              <span>${a.text}</span>
            </div>
          `).join('')}
        </div>
      `;
    } else if (q.type === 'speaking_simulation') {
      answersHtml = `
        <div style="display: flex; flex-direction: column; align-items: center; padding: 2rem 0;">
          <button class="btn-mock-record" data-question-id="${q.id}" data-answer="${q.answers ? q.answers[0]?.text : q.text}" style="width: 80px; height: 80px; border-radius: 50%; background: var(--primary); border: none; color: white; font-size: 2rem; cursor: pointer; display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); transition: transform 0.2s;">🎙️</button>
          <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;" class="record-status-${q.id}">Click to speak</p>
          <input type="hidden" id="speak-input-${q.id}" data-question-id="${q.id}">
        </div>
      `;
    } else if (q.type === 'situational_chat') {
      answersHtml = `
        <div style="background: #f8fafc; border-radius: 8px; padding: 1rem; margin-top: 1rem; border: 1px solid #e2e8f0;">
          <div style="display: flex; gap: 10px; align-items: flex-start; margin-bottom: 1rem;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #ddd; display: flex; justify-content: center; align-items: center;">🧑</div>
            <div style="background: white; padding: 10px 15px; border-radius: 12px; border-top-left-radius: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-size: 0.9rem; max-width: 80%;">
              ${q.text}
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: flex-end; justify-content: flex-end;">
            <div style="background: var(--primary); padding: 10px 15px; border-radius: 12px; border-top-right-radius: 0; width: 100%; color: white;">
              <input type="text" class="text-answer-input" 
                   data-question-id="${q.id}" 
                   placeholder="Type your response here..."
                   autocomplete="off"
                   style="background: transparent; border: none; color: white; width: 100%; outline: none;">
            </div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; justify-content: center; align-items: center; flex-shrink: 0;">👤</div>
          </div>
        </div>
      `;
    } else {
      answersHtml = `
        <input type="text" class="text-answer-input" 
               data-question-id="${q.id}" 
               placeholder="Type your answer here..."
               autocomplete="off">
      `;
    }

    return `
      <div class="question-card" data-question-index="${index}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          ${typeBadge}
          <div>
            <button class="btn-play-audio" data-text="${q.text}" style="background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--primary);" title="Listen">🔊</button>
            <button class="btn-explain-ai" style="background: none; border: none; font-size: 1.25rem; cursor: pointer; color: #ff9a9e;" title="Explain with AI (Pro Feature)">✨</button>
          </div>
        </div>
        <p class="question-text">${q.text}</p>
        ${answersHtml}
      </div>
    `;
  },

  bindAnswerEvents(questions) {
    const totalQ = questions.length;

    // Multiple choice clicks
    document.querySelectorAll('.answer-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const qId = opt.dataset.questionId;
        // Deselect siblings
        document.querySelectorAll(`.answer-option[data-question-id="${qId}"]`)
          .forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        this.answers[qId] = opt.dataset.answerId;
        this.updateProgress(totalQ);
      });
    });

    // Text input (works for text_input and situational_chat)
    document.querySelectorAll('.text-answer-input').forEach(input => {
      input.addEventListener('input', () => {
        const qId = input.dataset.questionId;
        this.answers[qId] = input.value.trim();
        this.updateProgress(totalQ);
      });
    });

    // Mock Recording
    document.querySelectorAll('.btn-mock-record').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const qId = btn.dataset.questionId;
        const expectedAnswer = btn.dataset.answer;
        const statusEl = document.querySelector(`.record-status-${qId}`);
        const inputEl = document.getElementById(`speak-input-${qId}`);
        
        btn.style.transform = 'scale(0.9)';
        btn.style.background = '#ef4444'; // red for recording
        statusEl.textContent = 'Listening... (Mock AI Processing)';
        
        // Simulate waiting for user to speak
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
          btn.style.background = '#22c55e'; // green success
          statusEl.textContent = 'Speech recognized successfully!';
          this.answers[qId] = expectedAnswer; // Mocking correct answer from speech
          this.updateProgress(totalQ);
        }, 1500);
      });
    });

    // Audio TTS
    document.querySelectorAll('.btn-play-audio').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const utterance = new SpeechSynthesisUtterance(btn.dataset.text);
        window.speechSynthesis.speak(utterance);
      });
    });

    // AI Explain
    document.querySelectorAll('.btn-explain-ai').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const user = API.getUser();
        if (user && user.isPro) {
          App.toast('✨ AI: The grammar here follows standard subject-verb-object order. Keep up the good work!', 'success');
        } else {
          App.toast('⭐ Explain with AI is a LinguaLearn Plus feature. Upgrade today!', 'info');
        }
      });
    });
  },

  updateProgress(total) {
    const answered = Object.values(this.answers).filter(v => v && v.length > 0).length;
    const pct = Math.round((answered / total) * 100);
    const fill = document.getElementById('quiz-progress-fill');
    const text = document.getElementById('quiz-progress-text');
    if (fill) fill.style.width = pct + '%';
    if (text) text.textContent = `${answered} / ${total}`;

    const btn = document.getElementById('submit-quiz-btn');
    if (btn) btn.disabled = answered < total;
  },

  async submitQuiz(container, params) {
    const btn = document.getElementById('submit-quiz-btn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    try {
      const answersArray = Object.entries(this.answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      const result = await API.submitQuiz(this.quizData.quiz.id, answersArray);
      
      // Async trigger goals & achievements (don't wait)
      if (result.passed) {
        API.progressGoal('lessons', 1).catch(() => {});
        API.progressGoal('xp', result.xpEarned).catch(() => {});
        API.checkAchievements().catch(() => {});
      }
      
      this.renderResults(container, result, params);
    } catch (err) {
      App.toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Submit Answers';
    }
  },

  renderResults(container, result, params) {
    const icon = result.passed ? '🎉' : '📝';
    const scoreClass = result.passed ? 'pass' : 'fail';

    container.innerHTML = `
      <div class="page-container">
        <div class="results-container">
          <div class="results-card">
            <div class="results-icon">${icon}</div>
            <h2>${result.passed ? 'Great Job!' : 'Keep Practicing!'}</h2>
            <div class="score ${scoreClass}">${result.percentage}%</div>
            <div class="details">
              <p><strong>${result.correctAnswers}</strong> out of <strong>${result.totalQuestions}</strong> correct</p>
              ${result.passed ? `
                <p>XP Earned: <strong>+${result.xpEarned}</strong></p>
                <p>Total XP: <strong>${result.totalXp}</strong></p>
                <p>Streak: <strong>🔥 ${result.streak}</strong></p>
              ` : `
                <p>You need at least <strong>60%</strong> to pass.</p>
                <p>Review the material and try again!</p>
              `}
            </div>
          </div>
          <div class="results-actions">
            ${!result.passed ? `
              <button class="btn btn-primary btn-lg" id="retry-quiz-btn">Try Again</button>
            ` : ''}
            <button class="btn btn-outline btn-lg" id="back-to-course-btn">Back to Course</button>
          </div>
        </div>
      </div>
    `;

    // Update nav
    if (result.passed) {
      document.getElementById('nav-xp').textContent = `${result.totalXp} XP`;
      document.getElementById('nav-streak').textContent = `🔥 ${result.streak}`;
    }

    document.getElementById('back-to-course-btn').addEventListener('click', () => {
      App.navigate('course', { courseId: params.courseId });
    });

    document.getElementById('retry-quiz-btn')?.addEventListener('click', () => {
      App.navigate('quiz', params);
    });
  },
};

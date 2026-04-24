// api.js — API client for LinguaLearn
const API = {
  baseUrl: '/api',

  getToken() {
    return localStorage.getItem('ll_token');
  },

  setToken(token) {
    localStorage.setItem('ll_token', token);
  },

  clearToken() {
    localStorage.removeItem('ll_token');
    localStorage.removeItem('ll_user');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('ll_user') || 'null');
    } catch {
      return null;
    }
  },

  setUser(user) {
    localStorage.setItem('ll_user', JSON.stringify(user));
  },

  async request(path, options = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = data?.message || `Request failed (${response.status})`;
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }

      return data;
    } catch (error) {
      if (error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please try again.');
      }
      throw error;
    }
  },

  // Auth
  register(email, username, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { email, username, password },
    });
  },

  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  getProfile() {
    return this.request('/auth/profile');
  },

  // Users
  getStats() {
    return this.request('/users/me/stats');
  },

  updateUsername(username) {
    return this.request('/users/me', {
      method: 'PATCH',
      body: { username },
    });
  },

  upgradeToPro() {
    return this.request('/users/upgrade', {
      method: 'POST',
    });
  },

  // Courses
  getCourses() {
    return this.request('/courses');
  },

  getCourse(id) {
    return this.request(`/courses/${id}`);
  },

  getCourseLessons(courseId) {
    return this.request(`/courses/${courseId}/lessons`);
  },

  // Lessons
  getLesson(id) {
    return this.request(`/lessons/${id}`);
  },

  // Quizzes
  getQuiz(lessonId) {
    return this.request(`/quizzes/lesson/${lessonId}`);
  },

  submitQuiz(quizId, answers) {
    return this.request(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: { answers },
    });
  },

  // Flashcards
  createFlashcard(front, back) {
    return this.request('/flashcards', {
      method: 'POST',
      body: { front, back }
    });
  },

  getDueFlashcards() {
    return this.request('/flashcards/due');
  },

  reviewFlashcard(id, quality) {
    return this.request(`/flashcards/${id}/review`, {
      method: 'POST',
      body: { quality }
    });
  },

  // Achievements
  getAchievements() {
    return this.request('/achievements/me');
  },

  checkAchievements() {
    return this.request('/achievements/check', { method: 'POST' });
  },

  // Goals
  getTodayGoals() {
    return this.request('/goals/today');
  },

  progressGoal(goalType, amount = 1) {
    return this.request('/goals/progress', {
      method: 'POST',
      body: { goalType, amount }
    });
  },

  // Leaderboard
  getLeaderboard() {
    return this.request('/leaderboard');
  }
};

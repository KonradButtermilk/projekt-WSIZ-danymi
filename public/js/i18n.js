// i18n.js — Simple Localization Service
const translations = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.courses': 'Courses',
    'nav.vocabulary': 'Vocabulary',
    'nav.leaderboard': 'Leaderboard',
    'nav.logout': 'Log out',
    'dashboard.welcome': 'Welcome back',
    'dashboard.subtitle': 'Continue learning and track your progress',
    'dashboard.total_xp': 'Total XP',
    'dashboard.streak': 'Daily Streak',
    'dashboard.lessons_done': 'Lessons Done',
    'dashboard.goals': 'Daily Goals',
    'dashboard.achievements': 'Achievements',
    'dashboard.courses': 'Your Courses',
    'dashboard.no_achievements': 'No achievements yet. Keep learning!',
    'course.start': 'Start Lesson',
    'vocab.title': 'Vocabulary',
    'vocab.subtitle': 'Review your saved flashcards and words',
    'vocab.add': '+ Add New Word',
    'vocab.save': 'Save',
    'vocab.empty': 'You\'re all caught up! No words due for review right now.',
    'vocab.due': 'You have {count} cards due for review!',
    'vocab.show': 'Show Answer',
    'vocab.how_well': 'How well did you know this?',
    'vocab.forgot': 'Forgot (0)',
    'vocab.hard': 'Hard (2)',
    'vocab.good': 'Good (4)',
    'vocab.perfect': 'Perfect (5)',
    'leaderboard.title': 'Global Leaderboard',
    'leaderboard.subtitle': 'See how you rank against other LinguaLearn students',
    'leaderboard.you': 'YOU'
  },
  pl: {
    'nav.dashboard': 'Panel',
    'nav.courses': 'Kursy',
    'nav.vocabulary': 'Słownictwo',
    'nav.leaderboard': 'Ranking',
    'nav.logout': 'Wyloguj',
    'dashboard.welcome': 'Witaj ponownie',
    'dashboard.subtitle': 'Kontynuuj naukę i śledź swoje postępy',
    'dashboard.total_xp': 'Całkowite XP',
    'dashboard.streak': 'Dni z rzędu',
    'dashboard.lessons_done': 'Ukończone lekcje',
    'dashboard.goals': 'Cel Dnia',
    'dashboard.achievements': 'Osiągnięcia',
    'dashboard.courses': 'Twoje Kursy',
    'dashboard.no_achievements': 'Brak osiągnięć. Ucz się dalej!',
    'course.start': 'Rozpocznij lekcję',
    'vocab.title': 'Słownictwo (Pałac Pamięci)',
    'vocab.subtitle': 'Przejrzyj zapisane fiszki i słowa',
    'vocab.add': '+ Dodaj nowe słowo',
    'vocab.save': 'Zapisz',
    'vocab.empty': 'Wszystko nadrobione! Brak słów do powtórki.',
    'vocab.due': 'Masz {count} fiszek do powtórki!',
    'vocab.show': 'Pokaż Odpowiedź',
    'vocab.how_well': 'Jak dobrze to pamiętasz?',
    'vocab.forgot': 'Zapomniałem (0)',
    'vocab.hard': 'Trudne (2)',
    'vocab.good': 'Dobre (4)',
    'vocab.perfect': 'Idealnie (5)',
    'leaderboard.title': 'Globalny Ranking',
    'leaderboard.subtitle': 'Zobacz, jak wypadasz na tle innych uczniów LinguaLearn',
    'leaderboard.you': 'TY'
  }
};

const I18n = {
  locale: localStorage.getItem('ll_lang') || 'en',

  setLocale(lang) {
    if (translations[lang]) {
      this.locale = lang;
      localStorage.setItem('ll_lang', lang);
      this.translatePage();
      
      // Update toggle button text if exists
      const toggleBtn = document.getElementById('btn-lang-toggle');
      if (toggleBtn) {
        toggleBtn.textContent = lang === 'en' ? '🇵🇱 PL' : '🇬🇧 EN';
      }
    }
  },

  t(key, params = {}) {
    let str = translations[this.locale][key] || key;
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
    return str;
  },

  translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (translations[this.locale][key]) {
        if (el.tagName === 'INPUT' && el.type === 'button') {
           el.value = this.t(key);
        } else {
           el.innerHTML = this.t(key);
        }
      }
    });
  }
};

window.I18n = I18n;

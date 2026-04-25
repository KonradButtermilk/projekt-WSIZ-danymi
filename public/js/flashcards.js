// flashcards.js — Vocabulary and Spaced Repetition System
const FlashcardsView = {
  async render(container) {
    container.innerHTML = `<div class="page-container"><div class="loading"><div class="spinner"></div> Loading vocabulary...</div></div>`;

    try {
      const dueCards = await API.getDueFlashcards();

      container.innerHTML = `
        <div class="page-container">
          <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h1>📚 <span data-i18n="vocab.title">Vocabulary (Memory Palace)</span></h1>
              <p data-i18n="vocab.subtitle">Review your saved flashcards and words</p>
            </div>
            <button class="btn btn-primary" id="btn-add-word" data-i18n="vocab.add">+ Add New Word</button>
          </div>

          <div id="add-word-form" style="display: none; background: var(--surface-color); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid var(--border-color);">
            <h3 data-i18n="vocab.add">Add to Vocabulary (Memory Palace)</h3>
            <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
              <input type="text" id="input-front" class="form-input" placeholder="Foreign word/phrase" style="flex: 1; min-width: 200px;">
              <input type="text" id="input-back" class="form-input" placeholder="Meaning/Translation" style="flex: 1; min-width: 200px;">
              <input type="text" id="input-mnemonic" class="form-input" placeholder="Mnemonic association (optional)" style="flex: 1; min-width: 200px;">
              <input type="text" id="input-palace" class="form-input" placeholder="Memory Palace Location (optional)" style="flex: 1; min-width: 200px;">
              <button class="btn btn-primary" id="btn-save-word" data-i18n="vocab.save">Save</button>
            </div>
          </div>

          <div class="flashcards-section">
            ${dueCards.length === 0 
              ? `<div class="empty-state">
                   <div class="icon">🎉</div>
                   <p data-i18n="vocab.empty">You're all caught up! No words due for review right now.</p>
                 </div>`
              : `
                <div class="review-status" style="margin-bottom: 1rem;">
                  <span style="font-weight: 600; color: var(--primary);">${I18n.t('vocab.due', {count: dueCards.length})}</span>
                </div>
                <div id="card-reviewer" style="background: var(--surface-color); border-radius: 16px; padding: 3rem; text-align: center; border: 1px solid var(--border-color); box-shadow: var(--shadow-md); max-width: 600px; margin: 0 auto;">
                  <div class="flashcard-front" style="font-size: 2rem; font-weight: 600; margin-bottom: 2rem;">
                    ${dueCards[0].front}
                    <button class="btn-play-audio" data-text="${dueCards[0].front}" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; margin-left: 10px;">🔊</button>
                  </div>
                  <button id="btn-show-answer" class="btn btn-outline" style="width: 100%;" data-i18n="vocab.show">Show Answer</button>
                  
                  <div id="flashcard-back" style="display: none; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
                    <div style="font-size: 1.5rem; color: var(--text-secondary); margin-bottom: 1rem;">
                      ${dueCards[0].back}
                    </div>
                    ${dueCards[0].mnemonic || dueCards[0].palaceLocation ? `
                      <div style="background: var(--primary-light); color: var(--text-main); padding: 1rem; border-radius: 8px; margin-bottom: 2rem; text-align: left;">
                        <h4 style="margin-top: 0; color: var(--primary);">🏰 Memory Palace</h4>
                        ${dueCards[0].mnemonic ? `<p><strong>Mnemonic:</strong> ${dueCards[0].mnemonic}</p>` : ''}
                        ${dueCards[0].palaceLocation ? `<p><strong>Location:</strong> ${dueCards[0].palaceLocation}</p>` : ''}
                      </div>
                    ` : '<div style="margin-bottom: 2rem;"></div>'}
                    <p style="margin-bottom: 1rem; font-size: 0.9rem; color: var(--text-secondary);" data-i18n="vocab.how_well">How well did you know this?</p>
                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                      <button class="btn btn-review" data-quality="0" style="background: var(--danger); color: white;" data-i18n="vocab.forgot">Forgot (0)</button>
                      <button class="btn btn-review" data-quality="2" style="background: var(--warning); color: white;" data-i18n="vocab.hard">Hard (2)</button>
                      <button class="btn btn-review" data-quality="4" style="background: var(--primary); color: white;" data-i18n="vocab.good">Good (4)</button>
                      <button class="btn btn-review" data-quality="5" style="background: var(--success); color: white;" data-i18n="vocab.perfect">Perfect (5)</button>
                    </div>
                  </div>
                </div>
              `
            }
          </div>
        </div>
      `;

      // Event Listeners
      const btnAddWord = document.getElementById('btn-add-word');
      const addWordForm = document.getElementById('add-word-form');
      const btnSaveWord = document.getElementById('btn-save-word');
      
      if (btnAddWord) {
        btnAddWord.addEventListener('click', () => {
          addWordForm.style.display = addWordForm.style.display === 'none' ? 'block' : 'none';
        });
      }

      if (btnSaveWord) {
        btnSaveWord.addEventListener('click', async () => {
          const front = document.getElementById('input-front').value.trim();
          const back = document.getElementById('input-back').value.trim();
          const mnemonic = document.getElementById('input-mnemonic').value.trim();
          const palaceLocation = document.getElementById('input-palace').value.trim();

          if (!front || !back) return App.toast('Please fill both front and back fields', 'error');

          try {
            btnSaveWord.disabled = true;
            await API.request('/flashcards', {
              method: 'POST',
              body: { front, back, mnemonic, palaceLocation }
            });
            App.toast('Word saved!', 'success');
            App.navigate('vocabulary'); // Reload
          } catch (err) {
            App.toast(err.message, 'error');
            btnSaveWord.disabled = false;
          }
        });
      }

      if (dueCards.length > 0) {
        const btnShow = document.getElementById('btn-show-answer');
        const backArea = document.getElementById('flashcard-back');
        const activeCardId = dueCards[0].id;

        btnShow.addEventListener('click', () => {
          btnShow.style.display = 'none';
          backArea.style.display = 'block';
        });

        // Review buttons
        document.querySelectorAll('.btn-review').forEach(btn => {
          btn.addEventListener('click', async () => {
            const quality = parseInt(btn.dataset.quality, 10);
            try {
              document.querySelectorAll('.btn-review').forEach(b => b.disabled = true);
              await API.reviewFlashcard(activeCardId, quality);
              
              // Track goal progress
              App.trackGoalProgress('flashcards', 1);
              
              App.toast('Card reviewed', 'success');
              App.navigate('vocabulary'); // Reload next card
            } catch (err) {
              App.toast(err.message, 'error');
              document.querySelectorAll('.btn-review').forEach(b => b.disabled = false);
            }
          });
        });

        // Audio
        document.querySelectorAll('.btn-play-audio').forEach(btn => {
          btn.addEventListener('click', () => {
            const utterance = new SpeechSynthesisUtterance(btn.dataset.text);
            window.speechSynthesis.speak(utterance);
          });
        });
      }

      // Flashcard Manager
      const allCards = await API.getFlashcards() || [];
      const managerContainer = document.createElement('div');
      managerContainer.innerHTML = `
        <div style="margin-top: 3rem; border-top: 2px solid var(--border-color); padding-top: 2rem;">
          <h2 class="section-title">🗂️ Your Vocabulary (${allCards.length})</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin-top: 1rem;">
            ${allCards.length === 0 ? '<p style="color:var(--text-secondary);">No cards added yet.</p>' : allCards.map(card => `
              <div class="card" style="padding: 1.25rem; position: relative; display: flex; justify-content: space-between; align-items: center; background: var(--bg-card); border: 1px solid var(--border);">
                <div>
                  <div style="font-weight: 600; font-size: 1.1rem; color: var(--text-main);">${card.front}</div>
                  <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">${card.back}</div>
                  ${card.palaceLocation ? `<div style="font-size: 0.75rem; color: var(--accent); margin-top: 0.5rem;">🏰 ${card.palaceLocation}</div>` : ''}
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                  <button class="btn-play-audio-small" data-text="${card.front}" style="background: none; border: none; cursor: pointer; font-size: 1.2rem;" title="Listen">🔊</button>
                  <button class="btn-delete-card" data-card-id="${card.id}" style="background: none; border: none; cursor: pointer; color: var(--danger); font-size: 1.2rem;" title="Delete">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      container.querySelector('.page-container').appendChild(managerContainer);

      // Audio in manager
      document.querySelectorAll('.btn-play-audio-small').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const utterance = new SpeechSynthesisUtterance(btn.dataset.text);
          window.speechSynthesis.speak(utterance);
        };
      });

      // Bind delete events
      document.querySelectorAll('.btn-delete-card').forEach(btn => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          if (confirm('Are you sure you want to delete this word?')) {
            try {
              await API.deleteFlashcard(btn.dataset.cardId);
              App.toast('Word deleted', 'success');
              App.navigate('vocabulary');
            } catch (err) {
              App.toast(err.message, 'error');
            }
          }
        };
      });

    } catch (err) {
      container.innerHTML = `<div class="page-container"><div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div></div>`;
    }
  }
};

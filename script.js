// 1. SELECTORES DE ELEMENTOS
const btnAdd = document.querySelector('.btn-add');
const modalForm = document.getElementById('modal-form');
const closeModal = document.getElementById('close-modal');
const mediaForm = document.getElementById('media-form');
const searchBar = document.querySelector('.search-bar');

// 2. ABRIR Y CERRAR VENTANA FLOTANTE
btnAdd.addEventListener('click', () => modalForm.style.display = 'flex');
closeModal.addEventListener('click', () => modalForm.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === modalForm) modalForm.style.display = 'none'; });

// 3. CARGAR ÍTEMS DE LOCALSTORAGE AL INICIAR
document.addEventListener('DOMContentLoaded', () => {
    refreshDashboard();
});

// 4. FUNCIÓN PARA DIBUJAR LOS ÍTEMS EN LA PANTALLA
function renderItem(item, index) {
    // Si el ítem tiene calificación, la preparamos para el HTML
    const ratingHTML = item.rating ? `<span class="media-rating">${item.rating}</span>` : '';

    const newItemHTML = `
        <div class="media-card-horizontal" data-index="${index}">
            <img src="${item.image}" alt="${item.title}" class="media-cover-small">
            <div class="media-info">
                <span class="media-title">${item.title} ${ratingHTML}</span>
                <div class="progress-wrapper">
                    <button class="step-btn" onclick="adjustProgress(${index}, -5)">-</button>
                    <div class="progress-container">
                        <div class="progress-bar" id="bar-${index}" style="width: ${item.progress}%;"></div>
                    </div>
                    <button class="step-btn" onclick="adjustProgress(${index}, 5)">+</button>
                </div>
                <span class="percentage" id="text-${index}">${item.progress}%</span>
            </div>
            <button class="delete-item-btn" onclick="deleteJournalItem(${index})">🗑️</button>
        </div>
    `;

    let targetSection;
    if (item.category === 'cinema') {
        targetSection = document.getElementById('section-cinema');
    } else if (item.category === 'literature') {
        targetSection = document.getElementById('section-literature'); 
    } else if (item.category === 'series') {
        targetSection = document.getElementById('section-series');
    }

    if (targetSection) {
        targetSection.insertAdjacentHTML('beforeend', newItemHTML);
    }
}

// 5. FUNCIÓN INTERACTIVA PARA SUBIR O BAJAR PROGRESO
window.adjustProgress = function(index, amount) {
    let savedItems = JSON.parse(localStorage.getItem('myMediaJournal')) || [];
    let item = savedItems[index];

    if (item) {
        let newProgress = parseInt(item.progress) + amount;
        if (newProgress < 0) newProgress = 0;
        if (newProgress > 100) newProgress = 100;

        item.progress = newProgress;
        savedItems[index] = item;
        
        localStorage.setItem('myMediaJournal', JSON.stringify(savedItems));

        document.getElementById(`bar-${index}`).style.width = `${newProgress}%`;
        document.getElementById(`text-${index}`).innerText = `${newProgress}%`;
    }
}

// 6. ESCUCHAR EL FORMULARIO Y GUARDAR EN LA MEMORIA
mediaForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const progress = document.getElementById('progress').value;
    const rating = document.getElementById('rating').value; // Captura las estrellas
    let image = document.getElementById('image').value;

    if (!image) image = 'https://placeholder.com';

    const newItem = { category, title, progress, rating, image };

    const savedItems = JSON.parse(localStorage.getItem('myMediaJournal')) || [];
    savedItems.push(newItem);
    localStorage.setItem('myMediaJournal', JSON.stringify(savedItems));

    refreshDashboard();

    mediaForm.reset();
    modalForm.style.display = 'none';
});

// 7. ELIMINAR UN ELEMENTO ESPECÍFICO
window.deleteJournalItem = function(index) {
    let savedItems = JSON.parse(localStorage.getItem('myMediaJournal')) || [];
    savedItems.splice(index, 1);
    localStorage.setItem('myMediaJournal', JSON.stringify(savedItems));
    refreshDashboard();
}

// 8. REFRESCAR EL PANEL COMPLETO
function refreshDashboard() {
    document.querySelectorAll('.media-card-horizontal').forEach(el => el.remove());
    const savedItems = JSON.parse(localStorage.getItem('myMediaJournal')) || [];
    savedItems.forEach((item, index) => renderItem(item, index));
}

// 9. FUNCIÓN DEL BUSCADOR
searchBar.addEventListener('input', (e) => {
    const searchText = e.target.value.toLowerCase();
    const allCards = document.querySelectorAll('.media-card-horizontal');

    allCards.forEach(card => {
        const titleText = card.querySelector('.media-title').innerText.toLowerCase();
        if (titleText.includes(searchText)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
});

// 10. GESTIÓN DE NOTAS INTERACTIVAS ("NEW ENTRY")
const noteText = document.getElementById('note-text');
const btnSaveNote = document.getElementById('btn-save-note');
const savedNotesList = document.getElementById('saved-notes-list');

if (btnSaveNote) {
    btnSaveNote.addEventListener('click', () => {
        const text = noteText.value.trim();
        if (text === '') return;

        const savedNotes = JSON.parse(localStorage.getItem('myMediaNotes')) || [];
        savedNotes.push(text);
        localStorage.setItem('myMediaNotes', JSON.stringify(savedNotes));

        renderNotes();
        noteText.value = '';
    });
}

function renderNotes() {
    if (!savedNotesList) return;
    savedNotesList.innerHTML = '';
    const savedNotes = JSON.parse(localStorage.getItem('myMediaNotes')) || [];

    savedNotes.forEach((note, index) => {
        const noteHTML = `
            <div class="single-note">
                <span class="note-content">${note}</span>
                <button class="delete-note-btn" onclick="deleteNote(${index})">✕</button>
            </div>
        `;
        savedNotesList.insertAdjacentHTML('beforeend', noteHTML);
    });
}

window.deleteNote = function(index) {
    let savedNotes = JSON.parse(localStorage.getItem('myMediaNotes')) || [];
    savedNotes.splice(index, 1);
    localStorage.setItem('myMediaNotes', JSON.stringify(savedNotes));
    renderNotes();
}

document.addEventListener('DOMContentLoaded', () => {
    renderNotes();
});





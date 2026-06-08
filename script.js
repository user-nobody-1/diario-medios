// 1. SELECTORES DE ELEMENTOS
const btnAdd = document.querySelector('.btn-add');
const modalForm = document.getElementById('modal-form');
const closeModal = document.getElementById('close-modal');
const mediaForm = document.getElementById('media-form');
const searchBar = document.querySelector('.search-bar');

const bookColors = ['book-peach', 'book-mint', 'book-lavender', 'book-yellow', 'book-terracotta'];

// 2. ABRIR Y CERRAR VENTANA FLOTANTE
if (btnAdd && modalForm) {
    btnAdd.addEventListener('click', () => modalForm.style.display = 'flex');
}
if (closeModal && modalForm) {
    closeModal.addEventListener('click', () => modalForm.style.display = 'none');
}
window.addEventListener('click', (e) => { 
    if (modalForm && e.target === modalForm) modalForm.style.display = 'none'; 
});

// 3. CARGAR ÍTEMS AL INICIAR
document.addEventListener('DOMContentLoaded', () => {
    refreshDashboard();
    renderNotes();
    updateYearlyProgress();
});

// 4. FUNCIÓN PARA CALCULAR EL PROGRESO DEL AÑO
function updateYearlyProgress() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const totalDays = (now.getFullYear() % 4 === 0) ? 366 : 365;
    const percentage = Math.floor((dayOfYear / totalDays) * 100);

    const yearlyBar = document.getElementById('yearly-bar');
    const yearlyText = document.getElementById('yearly-text');

    if (yearlyBar) yearlyBar.style.width = `${percentage}%`;
    if (yearlyText) yearlyText.innerText = `${percentage}%`;
}

// 5. FUNCIÓN PARA DIBUJAR LOS ÍTEMS EN LA PANTALLA
function renderItem(item, index) {
    // REGLA 1: Si es un LIBRO con progreso 0, va a la estantería "Want to Read"
    if (parseInt(item.progress) === 0 && item.category === 'literature') {
        if (!item.colorClass) {
            item.colorClass = bookColors[Math.floor(Math.random() * bookColors.length)];
        }
        const bookHTML = `
            <div class="book-spine ${item.colorClass}" data-index="${index}" onclick="deleteJournalItem(${index})">
                <span class="book-title-vertical">${item.title}</span>
            </div>
        `;
        const bookshelfSection = document.querySelector('.bookshelf');
        if (bookshelfSection) bookshelfSection.insertAdjacentHTML('beforeend', bookHTML);
        return;
    }

    // REGLA 2: Si es CINE/SERIE con progreso 0, va a la galería "Want to View"
    if (parseInt(item.progress) === 0 && (item.category === 'cinema' || item.category === 'series')) {
        const galleryHTML = `
            <div class="gallery-card" data-index="${index}">
                <img src="${item.image}" alt="${item.title}">
                <button class="delete-btn-small" onclick="deleteJournalItem(${index})">&times;</button>
            </div>
        `;
        const gallerySection = document.getElementById('want-to-view-gallery');
        if (gallerySection) gallerySection.insertAdjacentHTML('beforeend', galleryHTML);
        return;
    }

    // REGLA 3: Tarjeta con progreso activo
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
    if (item.category === 'cinema') targetSection = document.getElementById('section-cinema');
    else if (item.category === 'literature') targetSection = document.getElementById('section-literature'); 
    else if (item.category === 'series') targetSection = document.getElementById('section-series');

    if (targetSection) targetSection.insertAdjacentHTML('beforeend', newItemHTML);
}

// 6. AJUSTAR PROGRESO (+ / -)
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
        refreshDashboard();
    }
}

// 7. GUARDAR DESDE EL FORMULARIO FLOTANTE
if (mediaForm) {
    mediaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('category').value;
        const title = document.getElementById('title').value;
        const progress = document.getElementById('progress').value;
        const rating = document.getElementById('rating').value; 
        let image = document.getElementById('image').value;

        if (!image) image = 'https://placeholder.com';

        let colorClass = '';
        if (parseInt(progress) === 0 && category === 'literature') {
            colorClass = bookColors[Math.floor(Math.random() * bookColors.length)];
        }

        const newItem = { category, title, progress, rating, image, colorClass };
        const savedItems = JSON.parse(localStorage.getItem('myMediaJournal')) || [];
        savedItems.push(newItem);
        localStorage.setItem('myMediaJournal', JSON.stringify(savedItems));

        refreshDashboard();
        mediaForm.reset();
        if (modalForm) modalForm.style.display = 'none';
    });
}

// 8. ELIMINAR ÍTEM
window.deleteJournalItem = function(index) {
    let savedItems = JSON.parse(localStorage.getItem('myMediaJournal')) || [];
    savedItems.splice(index, 1);
    localStorage.setItem('myMediaJournal', JSON.stringify(savedItems));
    refreshDashboard();
}

// 9. REFRESCAR PANEL
function refreshDashboard() {
    document.querySelectorAll('.media-card-horizontal').forEach(el => el.remove());
    const gallerySection = document.getElementById('want-to-view-gallery');
    if (gallerySection) gallerySection.innerHTML = '';
    const bookshelfSection = document.querySelector('.bookshelf');
    if (bookshelfSection) bookshelfSection.innerHTML = '';

    const savedItems = JSON.parse(localStorage.getItem('myMediaJournal')) || [];
    const completedCount = savedItems.filter(item => parseInt(item.progress) === 100).length;
    const counterElement = document.getElementById('completed-count');
    if (counterElement) counterElement.innerText = completedCount;

    savedItems.forEach((item, index) => renderItem(item, index));
}

// 10. BUSCADOR
if (searchBar) {
    searchBar.addEventListener('input', (e) => {
        const searchText = e.target.value.toLowerCase();
        document.querySelectorAll('.media-card-horizontal').forEach(card => {
            const titleText = card.querySelector('.media-title').innerText.toLowerCase();
            card.style.display = titleText.includes(searchText) ? 'flex' : 'none';
        });
        document.querySelectorAll('.gallery-card').forEach(card => {
            const imgAlt = card.querySelector('img').alt.toLowerCase();
            card.style.display = imgAlt.includes(searchText) ? 'block' : 'none';
        });
        document.querySelectorAll('.book-spine').forEach(book => {
            const bookTitle = book.querySelector('.book-title-vertical').innerText.toLowerCase();
            book.style.display = bookTitle.includes(searchText) ? 'flex' : 'none';
        });
    });
}

// 11. GESTIÓN DE NOTAS ("NEW ENTRY")
const noteText = document.getElementById('note-text');
const noteCategory = document.getElementById('note-category');
const btnSaveNote = document.getElementById('btn-save-note');
const savedNotesList = document.getElementById('saved-notes-list');

if (btnSaveNote) {
    btnSaveNote.addEventListener('click', () => {
        if (!noteText) return;
        const text = noteText.value.trim();
        const category = noteCategory ? noteCategory.value : 'review';
        if (text === '') return;
        
        const newNoteObj = { text: text, category: category };
        const savedNotes = JSON.parse(localStorage.getItem('myMediaNotes')) || [];
        savedNotes.push(newNoteObj);
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
        const textContent = typeof note === 'object' ? note.text : note;
        const categoryClass = typeof note === 'object' ? `note-${note.category}` : 'note-review';
        const noteHTML = `
            <div class="single-note ${categoryClass}">
                <span class="note-content">${textContent}</span>
                <button class="delete-note-btn" onclick="deleteNote(${index})">✕</button>
            </div>
        `;
        savedNotesList.insertAdjacentHTML('beforeend', noteHTML);
    });
}

window.deleteNote = function(index) {
    let savedNotes = JSON.parse(localStorage.getItem('myMediaNotes')) || [];
savedNotes.splice(index, 1);localStorage.setItem('myMediaNotes', JSON.stringify(savedNotes));renderNotes();}
// 12. COPIA DE SEGURIDAD
const btnExport = document.getElementById('btn-export');
const btnImport = document.getElementById('btn-import');
if (btnExport) 
    {btnExport.addEventListener('click', () => {
        const dataBackup = {
            journal: JSON.parse(localStorage.getItem('myMediaJournal')) || [],
            notes: JSON.parse(localStorage.getItem('myMediaNotes')) || []
        };
            const dataStr = "data:text/json;charset=utf-8," + 
            encodeURIComponent(JSON.stringify(dataBackup));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "mi_diario_respaldo.json");
            document.body.appendChild(downloadAnchor);downloadAnchor.click();
            downloadAnchor.remove();});}if (btnImport) {
                btnImport.addEventListener('change', (e) => {const fileReader = new FileReader();
                    if (!e.target.files || e.target.files.length === 0) return;
                    fileReader.onload = function(event) {
                        try {const parsedData = JSON.parse(event.target.result);
                            if (parsedData.journal && parsedData.notes) 
                                {localStorage.setItem('myMediaJournal', JSON.stringify(parsedData.journal));
                                    localStorage.setItem('myMediaNotes', JSON.stringify(parsedData.notes));
                                    refreshDashboard();renderNotes();
                                    alert("¡Datos importados con éxito!");
                                    if (modalForm) modalForm.style.display = 'none';} 
                                    else {alert("El archivo no tiene el formato correcto.");}} 
                                    catch (err) {alert("Error al leer el archivo.");}};
                                    fileReader.readAsText(e.target.files[0]);});
                                }
    

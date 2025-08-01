/**
 * DOCSTRING: ui.js
 * Handles user interface for Club Calendar
 * - Modal open/close
 * - Side panel updates
 * - Event saving (delegates storage to Storage)
 */

export const UI = {
  Storage: null,
  Calendar: null,
  selectedDate: null,
  bc: new BroadcastChannel('clubCalendarChannel'),

  init(Storage, Calendar) {
    this.Storage = Storage;
    this.Calendar = Calendar;
    document.getElementById('calendar').addEventListener('dblclick', (e) => {
      const dayCell = e.target.closest('.fc-daygrid-day');
      if (dayCell) {
        this.selectedDate = dayCell.getAttribute('data-date');
        this.openModal();
      }
    });
  },

  openModal() {
    document.getElementById('eventModal').style.display = 'flex';
    document.getElementById('eventTitle').focus();
  },

  closeModal() {
    document.getElementById('eventModal').style.display = 'none';
    ['eventTitle','eventStartTime','eventEndTime','eventFile'].forEach(id => {
      document.getElementById(id).value = '';
    });
  },

  async saveEvent() {
    const title = document.getElementById('eventTitle').value.trim();
    const startTime = document.getElementById('eventStartTime').value;
    const endTime = document.getElementById('eventEndTime').value;
    const fileInput = document.getElementById('eventFile');
    const file = fileInput.files[0];

    if (!title && !file) {
      alert('Please enter a title or upload a file.');
      return;
    }

    let fileName = null;
    if (file) {
      fileName = await this.Storage.saveFile(file);
    }

    const newEvent = {
      title: title || '(File Upload)',
      date: this.selectedDate,
      startTime: startTime || null,
      endTime: endTime || null,
      fileName
    };

    this.Storage.addEvent(newEvent);
    this.Calendar.addEvent(newEvent);
    this.Calendar.updateSidePanel(this.selectedDate);
    this.closeModal();
    this.bc.postMessage('refresh');
  }
};

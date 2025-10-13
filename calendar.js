/**
 * DOCSTRING: calendar.js
 * Initializes and renders FullCalendar for Club Calendar
 * - Loads events from backend via Storage
 * - Enables event editing/deletion via UI interaction
 * - Dynamically updates displayed events
 */

export const Calendar = {
  calendar: null,
  Storage: null,
  UI: null,

  async init(Storage, UI) {
    this.Storage = Storage;
    this.UI = UI;
    await this.Storage.loadEvents();
    this.UI.init(Storage, this);

    const calendarEl = document.getElementById('calendar');

    this.calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      selectable: true,
      editable: true,
      events: this.generateEvents(),
      eventClick: (info) => this.handleEventClick(info)
    });

    this.calendar.render();
    this.updateUpcomingEvents();

    const bc = new BroadcastChannel('clubCalendarChannel');
    bc.onmessage = () => this.refresh();
  },

  generateEvents() {
    return this.Storage.events.map(e => ({
      id: e.id,
      title: e.title,
      start: e.startTime ? `${e.date}T${e.startTime}` : e.date,
      end: e.endTime ? `${e.date}T${e.endTime}` : undefined,
      allDay: !e.startTime
    }));
  },

  handleEventClick(info) {
    const id = info.event.id;

    if (confirm("Would you like to edit this event?")) {
      const newTitle = prompt("Enter new event title:", info.event.title);
      const newDate = prompt("Enter new date (YYYY-MM-DD):", info.event.startStr.split('T')[0]);
      if (newTitle && newDate) {
        this.Storage.updateEvent(id, { title: newTitle, date: newDate });
        info.event.setProp('title', newTitle);
        info.event.setStart(newDate);
        alert("Event updated.");
      }
    }

    if (confirm("Would you like to delete this event?")) {
      this.Storage.deleteEvent(id);
      info.event.remove();
      alert("Event deleted.");
    }

    this.updateUpcomingEvents();
  },

  updateUpcomingEvents() {
    const upcomingDiv = document.getElementById('upcomingEvents');
    upcomingDiv.innerHTML = '';
    const sorted = [...this.Storage.events].sort((a,b)=> new Date(a.date)-new Date(b.date));

    sorted.forEach(e => {
      const time = e.startTime ? ` (${e.startTime}${e.endTime ? `-${e.endTime}`:''})` : '';
      upcomingDiv.innerHTML += `<p>${e.date}${time}: ${e.title}</p>`;
    });
  },

  refresh() {
    this.Storage.loadEvents().then(() => {
      this.calendar.removeAllEvents();
      this.calendar.addEventSource(this.generateEvents());
      this.updateUpcomingEvents();
    });
  }
};

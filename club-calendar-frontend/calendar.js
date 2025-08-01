/*
 * DOCSTRING: calendar.js
 * Handles FullCalendar initialization and event rendering
 * - Loads events from Storage
 * - Adds incremental updates
 * - Updates side panel and upcoming events
 */

export const Calendar = {
  calendar: null,
  Storage: null,
  UI: null,

  async init(Storage, UI) {
    this.Storage = Storage;
    this.UI = UI;
    await this.Storage.init();
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
      eventClick: (info) => {
        const date = info.event.startStr.split('T')[0];
        this.updateSidePanel(date);
      }
    });

    this.calendar.render();
    this.updateUpcomingEvents();

    // BroadcastChannel listener for auto-refresh
    const bc = new BroadcastChannel('clubCalendarChannel');
    bc.onmessage = () => this.refresh();
  },

  generateEvents() {
    return this.Storage.events.map(e => {
      const start = e.startTime ? `${e.date}T${e.startTime}` : e.date;
      const end = e.endTime ? `${e.date}T${e.endTime}` : null;
      let displayTitle = e.title;
      if (e.startTime && e.endTime) displayTitle += ` (${e.startTime}-${e.endTime})`;
      else if (e.startTime) displayTitle += ` (${e.startTime})`;
      return { title: displayTitle, start, end: end || undefined, allDay: !e.startTime };
    });
  },

  addEvent(event) {
    const newFCEvent = {
      title: event.title,
      start: event.startTime ? `${event.date}T${event.startTime}` : event.date,
      end: event.endTime ? `${event.date}T${event.endTime}` : undefined,
      allDay: !event.startTime
    };
    this.calendar.addEvent(newFCEvent);
    this.updateUpcomingEvents();
  },

  updateSidePanel(dateStr) {
    const selectedDiv = document.getElementById('selectedEvent');
    const dayEvents = this.Storage.events.filter(e => e.date === dateStr);

    if (dayEvents.length === 0) {
      selectedDiv.innerHTML = `<p>No events for ${dateStr}</p>`;
      return;
    }

    selectedDiv.innerHTML = `<h3>${dateStr}</h3>`;
    dayEvents.forEach(e => {
      const time = e.startTime ? ` (${e.startTime}${e.endTime ? `-${e.endTime}` : ''})` : '';
      const fileLink = e.fileName ? `<a href="#" class="download-link" onclick="Calendar.downloadFile('${e.fileName}')">[Download]</a>` : '';
      selectedDiv.innerHTML += `<p>${e.title}${time} ${fileLink}</p>`;
    });
  },

  async downloadFile(name) {
    const file = await this.Storage.getFile(name);
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  },

  updateUpcomingEvents() {
    const upcomingDiv = document.getElementById('upcomingEvents');
    upcomingDiv.innerHTML = '';
    const sorted = [...this.Storage.events].sort((a,b)=> new Date(a.date+'T'+(a.startTime||'00:00'))-new Date(b.date+'T'+(b.startTime||'00:00')));

    sorted.forEach(e => {
      const time = e.startTime ? ` (${e.startTime}${e.endTime ? `-${e.endTime}`:''})` : '';
      upcomingDiv.innerHTML += `<p>${e.date}${time}: ${e.title}</p>`;
    });
  },

  refresh() {
    this.Storage.loadFromLocal();
    this.calendar.removeAllEvents();
    this.calendar.addEventSource(this.generateEvents());
    this.updateUpcomingEvents();
  }
};

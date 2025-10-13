// /**
//  * Club Calendar - Single File Script
//  * Features:
//  *  - Renders FullCalendar
//  *  - Double-click on a date to add an event or upload a file
//  *  - Stores events in localStorage and files in IndexedDB
//  *  - Updates side panel and upcoming events automatically
//  *  - Downloadable event file links
//  *  - Auto-refresh with BroadcastChannel
//  */

// let calendar;
// let selectedDate = null;
// let eventsWithFiles = [];
// let db = null;

// // BroadcastChannel for multi-tab syncing
// const bc = new BroadcastChannel('clubCalendarChannel');
// bc.onmessage = () => refreshCalendar();

// /* ---------- IndexedDB Init ---------- */
// function initDB() {
//   return new Promise((resolve) => {
//     const request = indexedDB.open("ClubCalendarDB", 1);
//     request.onupgradeneeded = (e) => {
//       const db = e.target.result;
//       if (!db.objectStoreNames.contains('files')) {
//         db.createObjectStore('files');
//       }
//     };
//     request.onsuccess = (e) => {
//       db = e.target.result;
//       resolve();
//     };
//   });
// }

// /* ---------- Local Storage ---------- */
// function loadEvents() {
//   const stored = localStorage.getItem('clubEvents');
//   eventsWithFiles = stored ? JSON.parse(stored) : [];
// }

// function saveEvents() {
//   localStorage.setItem('clubEvents', JSON.stringify(eventsWithFiles));
// }

// /* ---------- Calendar Initialization ---------- */
// document.addEventListener('DOMContentLoaded', async function () {
//   await initDB();
//   loadEvents();

//   const calendarEl = document.getElementById('calendar');
//   let lastClickTime = 0;

//   calendar = new FullCalendar.Calendar(calendarEl, {
//     initialView: 'dayGridMonth',
//     headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
//     selectable: true,
//     editable: true,
//     events: generateCalendarEvents(),
//     eventClick: function(info) {
//       const date = info.event.startStr.split('T')[0];
//       showDayDetails(date);
//     },
//     dateClick: function(info) {
//       const now = Date.now();
//       if (now - lastClickTime < 400) { // double-click within 400ms
//         selectedDate = info.dateStr;
//         openModal();
//       }
//       lastClickTime = now;
//     }
//   });

//   calendar.render();
//   updateUpcomingEvents();
// });

// /* ---------- Event Functions ---------- */
// function generateCalendarEvents() {
//   return eventsWithFiles.map(e => {
//     const start = e.startTime ? `${e.date}T${e.startTime}` : e.date;
//     const end = e.endTime ? `${e.date}T${e.endTime}` : null;
//     let title = e.title;
//     if (e.startTime && e.endTime) title += ` (${e.startTime}-${e.endTime})`;
//     else if (e.startTime) title += ` (${e.startTime})`;
//     return { title, start, end: end || undefined, allDay: !e.startTime };
//   });
// }

// function addEventToCalendar(event) {
//   const start = event.startTime ? `${event.date}T${event.startTime}` : event.date;
//   const end = event.endTime ? `${event.date}T${event.endTime}` : undefined;
//   calendar.addEvent({ title: event.title, start, end, allDay: !event.startTime });
//   updateUpcomingEvents();
// }

// /* ---------- Modal Functions ---------- */
// function openModal() {
//   document.getElementById('eventModal').style.display = 'flex';
//   document.getElementById('eventTitle').focus();
// }

// function closeModal() {
//   document.getElementById('eventModal').style.display = 'none';
//   ['eventTitle','eventStartTime','eventEndTime','eventFile'].forEach(id => document.getElementById(id).value = '');
// }

// function saveEvent() {
//   const title = document.getElementById('eventTitle').value.trim();
//   const startTime = document.getElementById('eventStartTime').value;
//   const endTime = document.getElementById('eventEndTime').value;
//   const file = document.getElementById('eventFile').files[0];

//   if (!title && !file) return alert('Please add a title or file');

//   const eventInfo = { 
//     title: title || '(File Upload)', 
//     date: selectedDate, 
//     startTime: startTime || null, 
//     endTime: endTime || null, 
//     fileName: file ? file.name : null 
//   };

//   if (file) {
//     const reader = new FileReader();
//     reader.onload = async function() {
//       const tx = db.transaction('files', 'readwrite');
//       tx.objectStore('files').put(file, file.name);
//       eventsWithFiles.push(eventInfo);
//       saveEvents();
//       addEventToCalendar(eventInfo);
//       showDayDetails(selectedDate);
//       closeModal();
//       bc.postMessage('refresh');
//     };
//     reader.readAsArrayBuffer(file);
//   } else {
//     eventsWithFiles.push(eventInfo);
//     saveEvents();
//     addEventToCalendar(eventInfo);
//     showDayDetails(selectedDate);
//     closeModal();
//     bc.postMessage('refresh');
//   }
// }

// /* ---------- Side Panel Functions ---------- */
// function showDayDetails(dateStr) {
//   const eventDiv = document.getElementById('selectedEvent');
//   const dayEvents = eventsWithFiles.filter(e => e.date === dateStr);

//   if (dayEvents.length === 0) {
//     eventDiv.innerHTML = `<p>No events for ${dateStr}</p>`;
//     return;
//   }

//   eventDiv.innerHTML = `<h3>${dateStr}</h3>`;
//   dayEvents.forEach(e => {
//     const time = e.startTime ? ` (${e.startTime}${e.endTime ? `-${e.endTime}` : ''})` : '';
//     const fileLink = e.fileName ? `<a href="#" onclick="downloadFile('${e.fileName}')" class="download-link">[Download]</a>` : '';
//     eventDiv.innerHTML += `<p>${e.title}${time} ${fileLink}</p>`;
//   });
// }

// function updateUpcomingEvents() {
//   const upcomingDiv = document.getElementById('upcomingEvents');
//   upcomingDiv.innerHTML = '';
//   const sorted = [...eventsWithFiles].sort((a,b)=> new Date(a.date+'T'+(a.startTime||'00:00'))-new Date(b.date+'T'+(b.startTime||'00:00')));
//   sorted.forEach(e => {
//     const time = e.startTime ? ` (${e.startTime}${e.endTime ? `-${e.endTime}`:''})` : '';
//     upcomingDiv.innerHTML += `<p>${e.date}${time}: ${e.title}</p>`;
//   });
// }

// async function downloadFile(name) {
//   const tx = db.transaction('files', 'readonly');
//   const store = tx.objectStore('files');
//   const request = store.get(name);
//   request.onsuccess = (e) => {
//     const file = e.target.result;
//     if (!file) return alert('File not found');
//     const url = URL.createObjectURL(file);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = name;
//     a.click();
//     URL.revokeObjectURL(url);
//   };
// }

// /* ---------- Auto-Refresh Calendar ---------- */
// function refreshCalendar() {
//   loadEvents();
//   calendar.removeAllEvents();
//   calendar.addEventSource(generateCalendarEvents());
//   updateUpcomingEvents();
// }

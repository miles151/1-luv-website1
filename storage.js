/**
 * DOCSTRING: storage.js
 * Handles loading and sending events for One1LuvMCPhoenix Calendar
 * - Fetches events from backend server (Express)
 * - Sends SMS via backend endpoint (optional)
 */

export const Storage = {
  events: [],

  async loadEvents() {
    try {
      const response = await fetch('http://localhost:5000/events');
      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
      this.events = await response.json();
      console.log('Events loaded:', this.events);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      alert('Backend not running. Please start server.js');
      this.events = []; // fallback to empty
    }
  },

  async sendEventsSMS(phoneNumber) {
    alert(`SMS feature placeholder. Would send events to ${phoneNumber}`);
  }
};

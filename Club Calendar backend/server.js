/**
 * DOCSTRING: server.js
 * Simple Express backend for One1LuvMCPhoenix Calendar
 * - Serves events from SQLite or in-memory array
 * - Allows GET /events for fetching events
 * - Add CORS to allow frontend to fetch from Live Server
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Temporary in-memory events
let events = [
  { id: 1, title: "Club Ride", date: "2025-08-05", startTime: "10:00", endTime: "12:00" },
  { id: 2, title: "Meeting", date: "2025-08-10", startTime: "18:00", endTime: "20:00" }
];

// API to get events
app.get('/events', (req, res) => {
  res.json(events);
});

// Server start
const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

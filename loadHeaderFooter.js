/**
 * DOCSTRING: load-header-footer.js
 * Dynamically loads reusable header and footer into all pages.
 * - Fetches header.html into <div id="header">
 * - Fetches footer.html into <div id="footer">
 * - Eliminates the need to edit multiple pages when updating layout
 */

document.addEventListener("DOMContentLoaded", () => {
  // Load Header
  fetch("header.html")
    .then(response => {
      if (!response.ok) throw new Error("Header not found");
      return response.text();
    })
    .then(data => document.getElementById("header").innerHTML = data)
    .catch(err => console.error("Error loading header:", err));

  // Load Footer
  fetch("footer.html")
    .then(response => {
      if (!response.ok) throw new Error("Footer not found");
      return response.text();
    })
    .then(data => document.getElementById("footer").innerHTML = data)
    .catch(err => console.error("Error loading footer:", err));
});


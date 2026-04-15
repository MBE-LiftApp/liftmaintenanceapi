const express = require("express");

const app = express();
app.use(express.json());

// Health check (for browser + Heroku)
app.get("/", (req, res) => res.send("LiftMaintenanceAPI is running ✅"));
app.get("/health", (req, res) => res.json({ ok: true }));

// Example API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from LiftMaintenanceAPI" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

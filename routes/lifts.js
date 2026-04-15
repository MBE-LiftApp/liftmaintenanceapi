const express = require("express");
const router = express.Router();
const { Lift } = require("../models");

// GET /lifts   (or /api/lifts depending on how mounted)
router.get("/", async (req, res) => {
  try {
    const lifts = await Lift.findAll({ order: [["id", "ASC"]] });
    res.json(lifts);
  } catch (err) {
    console.error("GET lifts error:", err);
    res.status(500).json({ message: "Failed to load lifts" });
  }
});

// POST /lifts/seed   (temporary)
router.post("/seed", async (req, res) => {
  try {
    const count = await Lift.count();
    if (count > 0) return res.json({ message: "Already has data", count });

    const created = await Lift.bulkCreate([
      { building: "Building A", liftCode: "LIFT-A-001", location: "Lobby", status: "ACTIVE" },
      { building: "Building B", liftCode: "LIFT-B-001", location: "Block 2", status: "MAINTENANCE" },
    ]);

    res.json(created);
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ message: "Failed to seed lifts", error: err.message });
  }
});

module.exports = router;

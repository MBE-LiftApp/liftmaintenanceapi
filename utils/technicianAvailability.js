// utils/technicianAvailability.js

const { Op } = require("sequelize");
const { TechnicianLeave } = require("../models");

async function isTechnicianAvailable(technicianId, date = new Date()) {
  const d = new Date(date).toISOString().slice(0, 10);

  const leave = await TechnicianLeave.findOne({
    where: {
      technician_id: technicianId,
      status: "APPROVED",
      from_date: { [Op.lte]: d },
      to_date: { [Op.gte]: d },
    },
  });

  return !leave;
}

module.exports = { isTechnicianAvailable };
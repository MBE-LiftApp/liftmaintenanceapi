require('dotenv').config();

const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require("bcryptjs");
const { Op } = require('sequelize');
const {
  sequelize,
  Customer, Site, Lift, Contract, ServiceLog,
  Technician, TechnicianSession,
  Project, ProjectLift, ProjectLiftAssignment
} = require('./models');

const JobTechnician = sequelize.define('ProjectLiftJobTechnician', {
  id: { type: require('sequelize').DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  assignmentId: { type: require('sequelize').DataTypes.BIGINT, allowNull: false, field: 'assignment_id' },
  technicianId: { type: require('sequelize').DataTypes.BIGINT, allowNull: false, field: 'technician_id' },
  teamRole: { type: require('sequelize').DataTypes.TEXT, allowNull: false, field: 'team_role' },
  assignedAt: { type: require('sequelize').DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('NOW()'), field: 'assigned_at' },
  startedAt: { type: require('sequelize').DataTypes.DATE, allowNull: true, field: 'started_at' },
  completedAt: { type: require('sequelize').DataTypes.DATE, allowNull: true, field: 'completed_at' },
  notes: { type: require('sequelize').DataTypes.TEXT, allowNull: true },
}, { tableName: 'project_lift_job_technicians', timestamps: false });

ProjectLiftAssignment.hasMany(JobTechnician, { foreignKey: 'assignmentId' });
JobTechnician.belongsTo(ProjectLiftAssignment, { foreignKey: 'assignmentId' });
JobTechnician.belongsTo(Technician, { foreignKey: 'technicianId' });
Technician.hasMany(JobTechnician, { foreignKey: 'technicianId' });

const { DataTypes } = require('sequelize');

const AssignmentChecklistItem = sequelize.define('AssignmentChecklistItem', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  assignmentId: { type: DataTypes.BIGINT, allowNull: false, field: 'assignment_id' },
  templateItemId: { type: DataTypes.BIGINT, allowNull: true, field: 'template_item_id' },
  sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1, field: 'sort_order' },
  itemText: { type: DataTypes.TEXT, allowNull: false, field: 'item_text' },
  isRequired: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_required' },
  itemType: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'BOOLEAN', field: 'item_type' },
  isDone: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_done' },
  textValue: { type: DataTypes.TEXT, allowNull: true, field: 'text_value' },
  numberValue: { type: DataTypes.DECIMAL(18, 2), allowNull: true, field: 'number_value' },
  doneByTechnicianId: { type: DataTypes.BIGINT, allowNull: true, field: 'done_by_technician_id' },
  doneAt: { type: DataTypes.DATE, allowNull: true, field: 'done_at' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('NOW()'), field: 'created_at' },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('NOW()'), field: 'updated_at' },
}, { tableName: 'assignment_checklist_items', timestamps: false });

const AssignmentServiceReport = sequelize.define('AssignmentServiceReport', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  assignmentId: { type: DataTypes.BIGINT, allowNull: false, unique: true, field: 'assignment_id' },
  projectLiftId: { type: DataTypes.BIGINT, allowNull: false, field: 'project_lift_id' },
  overallCondition: { type: DataTypes.TEXT, allowNull: true, field: 'overall_condition' },
  faultsObserved: { type: DataTypes.TEXT, allowNull: true, field: 'faults_observed' },
  actionTaken: { type: DataTypes.TEXT, allowNull: true, field: 'action_taken' },
  recommendations: { type: DataTypes.TEXT, allowNull: true, field: 'recommendations' },
  followUpRequired: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'follow_up_required' },
  technicianRemarks: { type: DataTypes.TEXT, allowNull: true, field: 'technician_remarks' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('NOW()'), field: 'created_at' },
  updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('NOW()'), field: 'updated_at' },
}, { tableName: 'assignment_service_reports', timestamps: false });

const AssignmentServicePart = sequelize.define('AssignmentServicePart', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  reportId: { type: DataTypes.BIGINT, allowNull: false, field: 'report_id' },
  itemName: { type: DataTypes.TEXT, allowNull: false, field: 'item_name' },
  qty: { type: DataTypes.DECIMAL(18, 2), allowNull: false, defaultValue: 1 },
  remarks: { type: DataTypes.TEXT, allowNull: true },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('NOW()'), field: 'created_at' },
}, { tableName: 'assignment_service_parts', timestamps: false });

ProjectLiftAssignment.hasOne(AssignmentServiceReport, { foreignKey: 'assignmentId' });
AssignmentServiceReport.belongsTo(ProjectLiftAssignment, { foreignKey: 'assignmentId' });

AssignmentServiceReport.hasMany(AssignmentServicePart, { foreignKey: 'reportId' });
AssignmentServicePart.belongsTo(AssignmentServiceReport, { foreignKey: 'reportId' });

const AssignmentChecklistNote = sequelize.define('AssignmentChecklistNote', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  assignmentId: { type: DataTypes.BIGINT, allowNull: false, field: 'assignment_id' },
  technicianId: { type: DataTypes.BIGINT, allowNull: true, field: 'technician_id' },
  noteText: { type: DataTypes.TEXT, allowNull: false, field: 'note_text' },
  createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: sequelize.literal('NOW()'), field: 'created_at' },
}, { tableName: 'assignment_checklist_notes', timestamps: false });

ProjectLiftAssignment.hasMany(AssignmentChecklistItem, { foreignKey: 'assignmentId' });
AssignmentChecklistItem.belongsTo(ProjectLiftAssignment, { foreignKey: 'assignmentId' });

ProjectLiftAssignment.hasMany(AssignmentChecklistNote, { foreignKey: 'assignmentId' });
AssignmentChecklistNote.belongsTo(ProjectLiftAssignment, { foreignKey: 'assignmentId' });

AssignmentChecklistNote.belongsTo(Technician, { foreignKey: 'technicianId' });
Technician.hasMany(AssignmentChecklistNote, { foreignKey: 'technicianId' });

function getChecklistTemplateByAssignmentRole(role) {
  const r = String(role || '').toUpperCase();

  if (r === 'INSTALL') {
    return [
      { sortOrder: 1, itemText: 'Site access confirmed', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 2, itemText: 'Material/tools checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 3, itemText: 'Installation area safety checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 4, itemText: 'Mechanical installation completed', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 5, itemText: 'Electrical wiring completed', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 6, itemText: 'Alignment and fixing checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 7, itemText: 'Housekeeping completed', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 8, itemText: 'Installation remarks entered', isRequired: false, itemType: 'TEXT' },
    ];
  }

  if (r === 'TEST') {
    return [
      { sortOrder: 1, itemText: 'Power supply confirmed', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 2, itemText: 'Door operation tested', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 3, itemText: 'Leveling checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 4, itemText: 'Emergency devices tested', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 5, itemText: 'Safety gear tested', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 6, itemText: 'Trial run completed', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 7, itemText: 'Testing remarks entered', isRequired: true, itemType: 'TEXT' },
    ];
  }

  if (r === 'AMC SERVICE') {
    return [
      { sortOrder: 1, itemText: 'Machine room checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 2, itemText: 'Controller checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 3, itemText: 'Door sensors checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 4, itemText: 'Brake and safety checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 5, itemText: 'Lubrication completed', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 6, itemText: 'Ride quality checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 7, itemText: 'Service remarks entered', isRequired: true, itemType: 'TEXT' },
    ];
  }

  if (r === 'WARRANTY SERVICE') {
    return [
      { sortOrder: 1, itemText: 'Machine room checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 2, itemText: 'Controller checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 3, itemText: 'Door operation checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 4, itemText: 'Safety devices checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 5, itemText: 'Ride quality checked', isRequired: true, itemType: 'BOOLEAN' },
      { sortOrder: 6, itemText: 'Faults rectified if any', isRequired: false, itemType: 'TEXT' },
      { sortOrder: 7, itemText: 'Warranty service remarks entered', isRequired: true, itemType: 'TEXT' },
    ];
  }
  return [];
}

function addMonthsSafe(dateValue, months) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;

  const out = new Date(d);
  out.setMonth(out.getMonth() + Number(months || 0));
  return Number.isNaN(out.getTime()) ? null : out;
}

async function buildServiceHistoryForLift(pl, rawAssignments, { today, warrantyInfo, amcInfo }) {
  const history = [];

  for (const a of rawAssignments || []) {
    const role = String(a.assignment_role || '').toUpperCase();
    const status = String(a.status || '').toUpperCase();

    if (!['WARRANTY SERVICE', 'AMC SERVICE'].includes(role)) continue;
    if (status !== 'DONE') continue;

    const serviceDate = a.completed_at || a.started_at || a.assigned_at || a.due_date || null;
    if (!serviceDate) continue;

    history.push({
      date: serviceDate,
      role,
      status,
      remarks: a.notes || '',
      assignmentId: a.id,
    });
  }

  history.sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return tb - ta;
  });

  const latest = history.length ? history[0] : null;

  let lastServiceDate = latest ? latest.date : null;
  let nextDue = null;
  let dueStatus = 'NO HISTORY';

  if (latest && latest.date) {
    const baseDate = new Date(latest.date);

    if (!Number.isNaN(baseDate.getTime())) {
      let intervalMonths = 3;

      if (latest.role === 'AMC SERVICE') {
        const amcInterval =
          Number(amcInfo?.serviceIntervalMonths) ||
          Number(amcInfo?.intervalMonths) ||
          Number(pl?.service_interval_months) ||
          3;

        intervalMonths = amcInterval;
      } else if (latest.role === 'WARRANTY SERVICE') {
        const warrantyInterval =
          Number(warrantyInfo?.serviceIntervalMonths) ||
          Number(pl?.warranty_service_interval_months) ||
          3;

        intervalMonths = warrantyInterval;
      }

      nextDue = addMonthsSafe(baseDate, intervalMonths);

      if (nextDue) {
        const todayDate = new Date(today);
        todayDate.setHours(0, 0, 0, 0);

        const dueDate = new Date(nextDue);
        dueDate.setHours(0, 0, 0, 0);

        if (dueDate.getTime() < todayDate.getTime()) {
          dueStatus = 'OVERDUE';
        } else {
          dueStatus = 'OK';
        }
      } else {
        dueStatus = 'OK';
      }
    }
  }

  return {
    history,
    lastServiceDate,
    nextDue,
    dueStatus,
  };
}

async function ensureChecklistForAssignment(assignment) {
  if (!assignment?.id) return [];

  const existing = await AssignmentChecklistItem.findAll({
    where: { assignmentId: assignment.id },
    order: [['sortOrder', 'ASC'], ['id', 'ASC']],
  });

  if (existing.length) {
    return existing;
  }

  const role = isAmcServiceAssignment(assignment) ? 'AMC SERVICE' : String(assignment.assignment_role || '').toUpperCase();
  const template = getChecklistTemplateByAssignmentRole(role);

  if (!template.length) return [];

  const rows = template.map((x) => ({
    assignmentId: assignment.id,
    templateItemId: null,
    sortOrder: x.sortOrder,
    itemText: x.itemText,
    isRequired: x.isRequired,
    itemType: x.itemType,
    isDone: false,
    textValue: null,
    numberValue: null,
    doneByTechnicianId: null,
    doneAt: null,
  }));

  await AssignmentChecklistItem.bulkCreate(rows);

  return AssignmentChecklistItem.findAll({
    where: { assignmentId: assignment.id },
    order: [['sortOrder', 'ASC'], ['id', 'ASC']],
  });
}

async function getChecklistSummary(assignmentId) {
  const items = await AssignmentChecklistItem.findAll({
    where: { assignmentId: assignmentId },
    order: [['sortOrder', 'ASC'], ['id', 'ASC']],
  });

  const requiredItems = items.filter((x) => !!x.isRequired);
  const doneRequired = requiredItems.filter((x) => !!x.isDone).length;
  const totalRequired = requiredItems.length;
  const percent = totalRequired ? Math.round((doneRequired / totalRequired) * 100) : 0;

  let status = 'NOT_STARTED';
  if (items.some((x) => !!x.isDone)) status = 'IN_PROGRESS';
  if (totalRequired > 0 && doneRequired >= totalRequired) status = 'COMPLETED';

  await ProjectLiftAssignment.update(
    {
      checklist_status: status,
      checklist_completion_percent: percent,
    },
    { where: { id: assignmentId } }
  );

  return {
    totalItems: items.length,
    totalRequired,
    doneRequired,
    percent,
    status,
  };
}
async function getDueAmcProjectLifts() {
  const data = await buildServiceDashboardData();
  const rows = data.rows || [];

  const result = rows.filter((l) =>
    ['AMC ACTIVE', 'AMC EXPIRING SOON', 'AMC EXPIRED'].includes(l.amcStatus) &&
    l.amcIsDueNow &&
    (
      !l.amcActiveServiceAssignment ||
      ['ASSIGNED'].includes(
        String(l.amcActiveServiceAssignment.status || '').toUpperCase()
      )
    )
  );

  console.log(
    'DUE AMC PROJECT LIFTS FINAL',
    result.map((x) => ({
      lift: x.liftCode,
      amcStatus: x.amcStatus,
      amcIsDueNow: x.amcIsDueNow,
      activeStatus: x.amcActiveServiceAssignment?.status || null,
    }))
  );

  return result;
}

async function getDueWarrantyProjectLifts() {
  const data = await buildServiceDashboardData();
  const rows = data.rows || [];

  console.log("==== WARRANTY DEBUG ====");

  rows.forEach((l) => {
    console.log({
      lift: l.liftCode,
      status: l.warrantyStatus,
      isDueNow: l.warrantyIsDueNow,
      nextDue: l.warrantyNextServiceDue,
      createFrom: l.warrantyCreateJobFromDate,
      active: l.warrantyActiveServiceAssignment,
    });
  });

  return rows.filter((l) =>
    l.warrantyStatus === "WARRANTY ACTIVE" &&
    l.warrantyIsDueNow === true &&
    !l.warrantyActiveServiceAssignment
  );
}

async function handleServiceCompletion(assignment) {
  if (!assignment) return;

  const role = String(assignment.assignment_role || '').toUpperCase();

  if (!['AMC SERVICE', 'WARRANTY SERVICE'].includes(role)) return;

  const pl = await ProjectLift.findByPk(assignment.project_lift_id);
  if (!pl || !pl.lift_id) return;

  const completedDate = formatDateOnly(assignment.completed_at || new Date());

  // Prevent duplicate log
  const existing = await ServiceLog.findOne({
    where: {
      liftId: pl.lift_id,
      serviceDate: completedDate,
      remarks: { [Op.iLike]: `%Assignment ${assignment.id}%` },
    },
  });

  if (existing) return;

  await ServiceLog.create({
    liftId: pl.lift_id,
    serviceDate: completedDate,
    technician: 'Service Team',
    workDone: role,
    remarks: `Assignment ${assignment.id} completed`,
    cost: null,
  });
}

async function assertChecklistCompleteOrThrow(assignmentId) {
  const summary = await getChecklistSummary(assignmentId);
  if (summary.totalRequired > 0 && summary.doneRequired < summary.totalRequired) {
    const err = new Error('Checklist incomplete. Complete all required checklist items before marking this job done.');
    err.statusCode = 400;
    err.payload = { checklist: summary };
    throw err;
  }
  return summary;
}
const app = express();
app.use(express.json());

// Serve frontend
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

// --------------------
// Helpers
// --------------------

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseDateOnly(s) {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return startOfDay(d);
}

function daysBetween(a, b) {
  const MS = 1000 * 60 * 60 * 24;
  const da = startOfDay(a);
  const db = startOfDay(b);
  return Math.floor((db - da) / MS);
}

function addMonths(dateOnlyStrOrDate, months) {
  const d = typeof dateOnlyStrOrDate === 'string'
    ? new Date(dateOnlyStrOrDate)
    : new Date(dateOnlyStrOrDate);
  if (Number.isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();
  return new Date(year, month + Number(months || 0), day);
}

function clampMin1(n, fallback = 1) {
  const x = Number(n);
  return Number.isFinite(x) && x >= 1 ? Math.floor(x) : fallback;
}

function toDateOnlyValue(d) {
  return d ? formatDateOnly(startOfDay(new Date(d))) : null;
}

function dateDiffDays(a, b) {
  const da = parseDateOnly(a);
  const db = parseDateOnly(b);
  if (!da || !db) return null;
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}

function computeAmcStatus(amcStartDate, amcEndDate, today) {
  const start = parseDateOnly(amcStartDate);
  const end = parseDateOnly(amcEndDate);

  if (!start || !end) return { amcStatus: 'NO_AMC_DATES', daysToExpiry: null };

  if (today < start) {
    return { amcStatus: 'NOT_STARTED', daysToExpiry: daysBetween(today, end) };
  }
  if (today > end) {
    return { amcStatus: 'EXPIRED', daysToExpiry: -daysBetween(end, today) };
  }

  const left = daysBetween(today, end);
  if (left <= 30) return { amcStatus: 'EXPIRING_SOON', daysToExpiry: left };
  return { amcStatus: 'ACTIVE', daysToExpiry: left };
}


function formatDateOnly(dateObj) {
  if (!dateObj) return null;
  const d = startOfDay(dateObj);
  return d.toISOString().slice(0, 10);
}

function addDays(dateOnlyStrOrDate, days) {
  const d = typeof dateOnlyStrOrDate === 'string'
    ? new Date(dateOnlyStrOrDate)
    : new Date(dateOnlyStrOrDate);
  if (Number.isNaN(d.getTime())) return null;
  d.setDate(d.getDate() + Number(days || 0));
  return d;
}

function isAmcServiceAssignment(assignment) {
  const role = String(assignment?.assignment_role || assignment?.role || '').toUpperCase().trim();
  return role === 'AMC SERVICE' || role === 'AMC';
}

function normUpper(v) {
  return String(v || '').toUpperCase();
}

function makePairKey(a, b) {
  const x = Number(a);
  const y = Number(b);
  if (!x || !y) return null;
  return x < y ? `${x}:${y}` : `${y}:${x}`;
}

function technicianCanDoService(tech) {
  return technicianHasRequiredSkill(tech, 'AMC SERVICE') || technicianHasRequiredSkill(tech, 'WARRANTY SERVICE');
}

function isAssignmentActive(a) {
  const s = String(a?.status || '').toUpperCase().trim();
  return s === 'ASSIGNED' || s === 'IN_PROGRESS';
}

function isAssignmentDone(a) {
  const s = String(a?.status || '').toUpperCase().trim();
  return s === 'DONE';
}

function isAssignmentApproved(a) {
  const sup = String(a?.supervisor_status || a?.supervisorStatus || '').toUpperCase().trim();
  return sup === 'APPROVED';
}

function stripAmcServiceMarker(notes) {
  return String(notes || '').replace('[AMC_SERVICE]', '').trim();
}

function buildEvenlySpacedDates(startDate, endDate, visitCount) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const count = clampMin1(visitCount, 1);

  if (!start || !end || end < start) return [];

  const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));

  if (count === 1) {
    return [formatDateOnly(end)];
  }

  const out = [];
  for (let i = 1; i <= count; i++) {
    const dayOffset = Math.round((totalDays * i) / count);
    out.push(formatDateOnly(addDays(start, dayOffset)));
  }

  return out;
}

function getWarrantyServiceVisitCount(row, fallback = 5) {
  const raw =
    row?.warranty_service_visits ??
    row?.warrantyServiceVisits ??
    fallback;

  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? n : fallback;
}

function buildAmcVisitDates(startDate, endDate, visitCount) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const count = clampMin1(visitCount, 1);

  if (!start || !end || end < start) return [];

  const firstVisit = formatDateOnly(addDays(start, 1));

  if (count === 1) {
    return [firstVisit];
  }

  const remainingStart = parseDateOnly(firstVisit);
  const remaining = buildEvenlySpacedDates(remainingStart, end, count - 1);

  return [firstVisit, ...remaining];
}

function countCompletedVisits(assignments = [], role) {
  const target = String(role || '').toUpperCase().trim();

  return (assignments || []).filter((a) => {
    const r = String(a.assignment_role || a.role || '').toUpperCase().trim();
    return r === target && isAssignmentDone(a) && isAssignmentApproved(a);
  }).length;
}

function findActiveVisitAssignment(assignments = [], role) {
  const target = String(role || '').toUpperCase().trim();

  return (assignments || []).find((a) => {
    const r = String(a.assignment_role || a.role || '').toUpperCase().trim();
    return r === target && isAssignmentActive(a);
  }) || null;
}

function getNextVisitState(visitDates = [], completedCount = 0, today = startOfDay(new Date())) {
  const totalVisits = visitDates.length;
  const done = Math.max(0, Math.min(completedCount, totalVisits));

  if (done >= totalVisits) {
    return {
      totalVisits,
      completedVisits: done,
      pendingVisits: 0,
      nextVisitNumber: null,
      nextVisitDate: null,
      createJobFromDate: null,
      isDueNow: false,
      isOverdue: false,
      overdueDays: 0,
      allCompleted: true,
    };
  }

  const nextVisitNumber = done + 1;
  const nextVisitDate = visitDates[done] || null;
  const createJobFromDate = nextVisitDate ? formatDateOnly(addDays(nextVisitDate, -7)) : null;

  let isDueNow = false;
  let isOverdue = false;
  let overdueDays = 0;

  const due = parseDateOnly(nextVisitDate);
  const openFrom = parseDateOnly(createJobFromDate);

  if (due && openFrom) {
    isDueNow = today >= openFrom;
    isOverdue = today > due;
    overdueDays = isOverdue ? dateDiffDays(due, today) : 0;
  }

  return {
    totalVisits,
    completedVisits: done,
    pendingVisits: totalVisits - done,
    nextVisitNumber,
    nextVisitDate,
    createJobFromDate,
    isDueNow,
    isOverdue,
    overdueDays,
    allCompleted: false,
  };
}

function buildWarrantyInfo(projectLift, assignments = [], today = startOfDay(new Date())) {
  const startDate = projectLift?.handover_actual_date || projectLift?.warranty_start_date || null;
  const endDate = projectLift?.warranty_end_date || null;
  const visitCount = getWarrantyServiceVisitCount(projectLift, 5);

  if (!startDate || !endDate) {
    return {
      status: 'NO WARRANTY',
      startDate: null,
      endDate: null,
      serviceVisitCount: visitCount,
      visitDates: [],
      completedVisits: 0,
      nextVisitNumber: null,
      nextServiceDue: null,
      createJobFromDate: null,
      isDueNow: false,
      isOverdue: false,
      overdueDays: 0,
      allCompleted: false,
      activeServiceAssignment: null,
    };
  }

  const visitDates = buildEvenlySpacedDates(startDate, endDate, visitCount);
  const completedVisits = countCompletedVisits(assignments, 'WARRANTY SERVICE');
  const active = findActiveVisitAssignment(assignments, 'WARRANTY SERVICE');
  const next = getNextVisitState(visitDates, completedVisits, today);

  const warrantyEnd = parseDateOnly(endDate);

  let status = 'WARRANTY ACTIVE';
  if (warrantyEnd && today > warrantyEnd) {
    status = 'WARRANTY EXPIRED';
  }

  return {
    status,
    startDate,
    endDate,
    serviceVisitCount: visitCount,
    visitDates,
    completedVisits,
    nextVisitNumber: next.nextVisitNumber,
    nextServiceDue: next.nextVisitDate,
    createJobFromDate: next.createJobFromDate,
    isDueNow: !active && next.isDueNow,
    isOverdue: !active && next.isOverdue,
    overdueDays: !active ? next.overdueDays : 0,
    allCompleted: next.allCompleted,
    activeServiceAssignment: active
      ? {
          id: active.id,
          technicianId: active.technician_id || active.technicianId || null,
          status: active.status || null,
          dueDate: active.due_date || active.dueDate || null,
          notes: active.notes || '',
        }
      : null,
  };
}

function buildAmcInfo(contract, today = startOfDay(new Date()), options = {}) {
  const activeServiceAssignment = options.activeServiceAssignment || null;
  const assignments = Array.isArray(options.assignments) ? options.assignments : [];

  if (!contract) {
    return {
      status: 'NO AMC',
      amcType: null,
      startDate: null,
      endDate: null,
      serviceVisitCount: 0,
      serviceIntervalDays: null,
      serviceIntervalMonths: 3,
      visitDates: [],
      completedVisits: 0,
      nextVisitNumber: null,
      nextServiceDue: null,
      createJobFromDate: null,
      billingCycle: null,
      contractValue: null,
      amcNotes: null,
      canCreate: false,
      activeServiceAssignment: null,
      lastServiceDate: null,
      isDueNow: false,
      isOverdue: false,
      overdueDays: 0,
      allCompleted: false,
      dueStatus: 'NO HISTORY',
    };
  }

  const startDate = contract.startDate || contract.start_date || null;
  const endDate = contract.endDate || contract.end_date || null;

  const serviceVisitCount = clampMin1(
    contract.service_visit_count ?? contract.serviceVisitCount ?? 5,
    1
  );

  const serviceIntervalDays = Number(contract.serviceIntervalDays || contract.service_interval_days || 0) || null;

  let serviceIntervalMonths = Number(
    contract.serviceIntervalMonths || contract.service_interval_months || 0
  ) || 0;

  if (!serviceIntervalMonths) {
    if (serviceIntervalDays && serviceIntervalDays > 0) {
      serviceIntervalMonths = Math.max(1, Math.round(serviceIntervalDays / 30));
    } else {
      serviceIntervalMonths = 3;
    }
  }

  const visitDates = buildAmcVisitDates(startDate, endDate, serviceVisitCount);

  const completedServices = assignments
    .filter((a) => isAmcServiceAssignment(a) && isAssignmentDone(a) && isAssignmentApproved(a))
    .sort((a, b) => new Date(b.completed_at || b.completedAt || 0) - new Date(a.completed_at || a.completedAt || 0));

  const completedVisits = completedServices.length;

  const lastServiceDate = completedServices.length
    ? formatDateOnly(new Date(completedServices[0].completed_at || completedServices[0].completedAt))
    : null;

  const baseDate = lastServiceDate || startDate || null;

  const nextServiceDue = baseDate
    ? formatDateOnly(addMonths(baseDate, serviceIntervalMonths))
    : null;

  const createJobFromDate = nextServiceDue
    ? formatDateOnly(addDays(nextServiceDue, -7))
    : null;

  let isDueNow = false;
  let isOverdue = false;
  let overdueDays = 0;
  let dueStatus = 'NO HISTORY';

  const due = parseDateOnly(nextServiceDue);
  const openFrom = parseDateOnly(createJobFromDate);

  if (due) {
    dueStatus = 'NOT DUE';

    if (openFrom && today >= openFrom) {
      isDueNow = true;
      dueStatus = 'DUE SOON';
    }

    if (today > due) {
      isDueNow = true;
      isOverdue = true;
      overdueDays = dateDiffDays(due, today) || 0;
      dueStatus = 'OVERDUE';
    }
  }

  let status = 'NO AMC';

if (startDate) {
  if (!endDate) {
    // ✅ FIX: Treat no end date as ACTIVE AMC
    status = 'AMC ACTIVE';
  } else {
    const computed = computeAmcStatus(startDate, endDate, today);

    if (computed.amcStatus === 'EXPIRING_SOON') status = 'AMC EXPIRING SOON';
    else if (computed.amcStatus === 'ACTIVE') status = 'AMC ACTIVE';
    else if (computed.amcStatus === 'EXPIRED') status = 'AMC EXPIRED';
    else if (computed.amcStatus === 'NOT_STARTED') status = 'AMC NOT STARTED';
  }
}

  const resolvedActive =
  activeServiceAssignment ||
  findActiveVisitAssignment(assignments, 'AMC SERVICE') ||
  null;

// ✅ ADD THIS
const hasBlockingActive =
  resolvedActive &&
  ['IN_PROGRESS'].includes(String(resolvedActive.status || '').toUpperCase());

return {
  status,
  amcType: contract.amcType || contract.amc_type || null,
  startDate,
  endDate,
  serviceVisitCount,
  serviceIntervalDays,
  serviceIntervalMonths,
  visitDates,
  completedVisits,
  nextVisitNumber: nextServiceDue ? completedVisits + 1 : null,
  nextServiceDue,
  createJobFromDate,
  billingCycle: contract.billingCycle || contract.billing_cycle || null,
  contractValue: contract.contractValue ?? contract.contract_value ?? null,
  amcNotes: contract.amcNotes || contract.amc_notes || null,
  canCreate: false,
  activeServiceAssignment: resolvedActive,
  lastServiceDate,

  // 🔥 FIXED LOGIC HERE
  isDueNow: !hasBlockingActive && isDueNow,
  isOverdue: !hasBlockingActive && isOverdue,
  overdueDays: !hasBlockingActive ? overdueDays : 0,

  allCompleted: false,
  dueStatus,
};
}

async function buildLatestAmcServiceDateMap(liftIds = []) {
  const cleanLiftIds = (liftIds || []).filter(Boolean);
  if (!cleanLiftIds.length) return new Map();

  const logs = await ServiceLog.findAll({
    where: {
      liftId: cleanLiftIds,
      [Op.or]: [
        { workDone: { [Op.iLike]: '%AMC SERVICE%' } },
        { remarks: { [Op.iLike]: '%AMC SERVICE%' } },
      ],
    },
    order: [['serviceDate', 'DESC'], ['id', 'DESC']],
  });

  const map = new Map();
  logs.forEach((log) => {
    const key = Number(log.liftId);
    if (!map.has(key) && log.serviceDate) map.set(key, log.serviceDate);
  });
  return map;
}

function computeProjectLiftWorkflow(projectLift, assignmentsInput = []) {
  const assignments = Array.isArray(assignmentsInput) ? assignmentsInput : [];
  const norm = (v) => String(v || '').toUpperCase();

  const hasRoleStatus = (role, statuses) =>
    assignments.some(
      (a) =>
        norm(a.assignment_role || a.role) === role &&
        statuses.includes(norm(a.status))
    );

  const hasRoleSupervisorStatus = (role, statuses) =>
    assignments.some(
      (a) =>
        norm(a.assignment_role || a.role) === role &&
        statuses.includes(norm(a.supervisor_status))
    );

  const hasInstallApproved = hasRoleSupervisorStatus('INSTALL', ['APPROVED']);
  const hasInstallDonePendingApproval =
    hasRoleStatus('INSTALL', ['DONE']) && !hasInstallApproved;
  const hasInstallActive = hasRoleStatus('INSTALL', ['ASSIGNED', 'IN_PROGRESS']);

  const hasTestApproved = hasRoleSupervisorStatus('TEST', ['APPROVED']);
  const hasTestDonePendingApproval =
    hasRoleStatus('TEST', ['DONE']) && !hasTestApproved;
  const hasTestActive = hasRoleStatus('TEST', ['ASSIGNED', 'IN_PROGRESS']);

  const hasSupportActive =
    hasRoleStatus('SUPPORT', ['ASSIGNED', 'IN_PROGRESS']) ||
    hasRoleStatus('AMC SERVICE', ['ASSIGNED', 'IN_PROGRESS']) ||
    hasRoleStatus('WARRANTY SERVICE', ['ASSIGNED', 'IN_PROGRESS']);

  const hasAnyAssignments = assignments.length > 0;
  const hasActualHandover = !!projectLift?.handover_actual_date;

  if (hasActualHandover) {
    return { workflowStatus: 'HANDED OVER', actionHint: 'Track service lifecycle' };
  }

  if (hasTestApproved) {
    return { workflowStatus: 'READY FOR HANDOVER', actionHint: 'Complete handover' };
  }

  if (hasTestDonePendingApproval) {
    return { workflowStatus: 'TEST AWAITING APPROVAL', actionHint: 'Supervisor approval pending' };
  }

  if (hasTestActive) {
    return { workflowStatus: 'TESTING', actionHint: 'Track testing' };
  }

  if (hasInstallApproved && !hasTestActive && !hasTestDonePendingApproval) {
    return { workflowStatus: 'READY FOR TEST ASSIGNMENT', actionHint: 'Assign test job' };
  }

  if (hasInstallDonePendingApproval) {
    return { workflowStatus: 'INSTALL AWAITING APPROVAL', actionHint: 'Supervisor approval pending' };
  }

  if (hasInstallActive) {
    return { workflowStatus: 'INSTALLING', actionHint: 'Track installation' };
  }

  if (hasSupportActive) {
    return { workflowStatus: 'SERVICE IN PROGRESS', actionHint: 'Track assigned service work' };
  }

  if (!hasAnyAssignments) {
    return { workflowStatus: 'NOT STARTED', actionHint: 'Assign install job' };
  }

  return { workflowStatus: 'ASSIGNED', actionHint: 'Start assigned work' };
}

async function buildTeamLoadRows() {
  const techs = await Technician.findAll({
    where: { isActive: true },
    order: [['name', 'ASC']],
  });

  const assignments = await ProjectLiftAssignment.findAll({
    where: {
      status: ['ASSIGNED', 'IN_PROGRESS'],
    },
    include: [
      {
        model: JobTechnician,
        include: [
          {
            model: Technician,
            attributes: ['id', 'name', 'phone', 'role', 'skills', 'isActive'],
          },
        ],
      },
    ],
    order: [['id', 'DESC']],
  });

  const today = new Date().toISOString().slice(0, 10);
  const map = new Map();

  for (const t of techs) {
    map.set(Number(t.id), {
      technicianId: Number(t.id),
      name: t.name || '',
      phone: t.phone || '',
      role: t.role || '',
      skills: t.skills || '',
      assignedJobs: 0,
      inProgressJobs: 0,
      totalJobs: 0,
      dueToday: 0,
      overdue: 0,
      leadJobs: 0,
      supportJobs: 0,
    });
  }

  for (const a of assignments) {
    const due = a.due_date ? String(a.due_date).slice(0, 10) : null;
    const status = String(a.status || '').toUpperCase();
    const members = Array.isArray(a.ProjectLiftJobTechnicians)
      ? a.ProjectLiftJobTechnicians
      : [];

    for (const m of members) {
      const techId = Number(m.technicianId || 0);
      const row = map.get(techId);
      if (!row) continue;

      if (status === 'ASSIGNED') row.assignedJobs += 1;
      if (status === 'IN_PROGRESS') row.inProgressJobs += 1;
      row.totalJobs += 1;

      if (due && due === today) row.dueToday += 1;
      if (due && due < today) row.overdue += 1;

      const teamRole = String(m.teamRole || '').toUpperCase();
      if (teamRole === 'LEAD') row.leadJobs += 1;
      if (teamRole === 'SUPPORT') row.supportJobs += 1;
    }
  }

  return Array.from(map.values()).map((r) => ({
    ...r,
    loadScore:
      (r.overdue || 0) * 5 +
      (r.inProgressJobs || 0) * 3 +
      (r.totalJobs || 0),
  }));
}

async function buildJobTeamMap(assignmentIds) {
  const ids = (assignmentIds || []).map(Number).filter(Boolean);
  if (!ids.length) return new Map();
  const rows = await JobTechnician.findAll({
    where: { assignmentId: { [Op.in]: ids } },
    include: [{ model: Technician, attributes: ['id', 'name', 'phone', 'role'] }],
    order: [['id', 'ASC']],
  });
  const map = new Map();
  for (const row of rows) {
    const arr = map.get(Number(row.assignmentId)) || [];
    arr.push({
      id: row.id,
      technicianId: row.technicianId,
      teamRole: row.teamRole,
      assignedAt: row.assignedAt,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      notes: row.notes || '',
      technician: row.Technician ? { id: row.Technician.id, name: row.Technician.name, phone: row.Technician.phone, role: row.Technician.role } : null,
    });
    map.set(Number(row.assignmentId), arr);
  }
  return map;
}

function normalizeJobTeamRows(headerAssignment, teamRows) {
  const rows = Array.isArray(teamRows) ? [...teamRows] : [];
  const hasLead = rows.some((r) => String(r.teamRole || '').toUpperCase() === 'LEAD');

  if (!hasLead && headerAssignment?.Technician) {
    rows.unshift({
      id: null,
      technicianId: headerAssignment.technician_id,
      teamRole: 'LEAD',
      assignedAt: headerAssignment.assigned_at,
      startedAt: headerAssignment.started_at,
      completedAt: headerAssignment.completed_at,
      notes: '',
      isFallbackLead: true,
      technician: {
        id: headerAssignment.Technician.id,
        name: headerAssignment.Technician.name,
        phone: headerAssignment.Technician.phone,
        role: headerAssignment.Technician.role,
      },
    });
  }

  return rows;
}

function summarizeJobTeam(headerAssignment, teamRows) {
  const team = normalizeJobTeamRows(headerAssignment, teamRows);
  const lead = team.find((r) => String(r.teamRole || '').toUpperCase() === 'LEAD') || null;
  const supports = team.filter((r) => String(r.teamRole || '').toUpperCase() === 'SUPPORT');
  return { team, lead, supports };
}

async function buildOpenAssignmentCountByTechnician() {
  const rows = await JobTechnician.findAll({
    include: [
      {
        model: ProjectLiftAssignment,
        attributes: ['id', 'status'],
        where: {
          status: ['ASSIGNED', 'IN_PROGRESS'],
        },
      },
    ],
  });

  const map = new Map();

  for (const row of rows) {
    const techId = Number(row.technicianId || 0);
    if (!techId) continue;
    map.set(techId, (map.get(techId) || 0) + 1);
  }

  return map;
}

async function buildInProgressCountByTechnician() {
  const rows = await JobTechnician.findAll({
    include: [
      {
        model: ProjectLiftAssignment,
        attributes: ['id', 'assignment_role', 'status'],
        where: {
          status: 'IN_PROGRESS',
        },
      },
    ],
  });

  const map = new Map();

  for (const row of rows) {
    const techId = Number(row.technicianId || 0);
    if (!techId) continue;
    map.set(techId, (map.get(techId) || 0) + 1);
  }

  return map;
}

async function buildSameDayAssignmentCountByTechnician(dueDate) {
  const rows = await JobTechnician.findAll({
    include: [
      {
        model: ProjectLiftAssignment,
        attributes: ['id', 'due_date', 'assignment_role', 'status'],
        where: {
          assignment_role: ['WARRANTY SERVICE', 'AMC SERVICE'],
        },
      },
    ],
  });

  const map = new Map();
  const target = new Date(dueDate).toISOString().slice(0, 10);

  for (const row of rows) {
    const a = row.ProjectLiftAssignment;
    if (!a) continue;

    const d = a.due_date ? new Date(a.due_date).toISOString().slice(0, 10) : null;
    if (d !== target) continue;

    const techId = Number(row.technicianId || 0);
    if (!techId) continue;

    map.set(techId, (map.get(techId) || 0) + 1);
  }

  return map;
}

async function buildLastAssignmentDateByTechnician() {
  const rows = await JobTechnician.findAll({
    attributes: ['technicianId', 'assignedAt'],
    order: [['assignedAt', 'DESC']],
  });

  const map = new Map();
  for (const row of rows) {
    const techId = Number(row.technicianId || 0);
    if (!techId) continue;
    if (!map.has(techId)) {
      map.set(techId, row.assignedAt || null);
    }
  }
  return map;
}

async function getExistingTechnicianPairs() {
  const assignments = await ProjectLiftAssignment.findAll({
    where: {
      assignment_role: ['INSTALL', 'TEST', 'AMC SERVICE', 'WARRANTY SERVICE'],
    },
    include: [
      {
        model: JobTechnician,
        include: [
          {
            model: Technician,
            attributes: ['id', 'name', 'phone', 'role', 'skills', 'isActive'],
          },
        ],
      },
    ],
    order: [['id', 'DESC']],
  });

  const pairs = [];

  for (const a of assignments) {
    const members = Array.isArray(a.ProjectLiftJobTechnicians)
      ? a.ProjectLiftJobTechnicians
          .filter((m) => m.Technician && m.Technician.isActive !== false)
          .map((m) => ({
            technicianId: Number(m.technicianId),
            teamRole: normUpper(m.teamRole),
            technician: m.Technician,
          }))
      : [];

    if (members.length < 2) continue;

    const lead = members.find((m) => m.teamRole === 'LEAD') || members[0];
    const support = members.find((m) => m.teamRole === 'SUPPORT') || members[1];
    if (!lead || !support) continue;

    const pairKey = makePairKey(lead.technicianId, support.technicianId);
    if (!pairKey) continue;

    pairs.push({
      pairKey,
      sourceRole: normUpper(a.assignment_role),
      assignmentId: a.id,
      status: normUpper(a.status),
      leadTechnicianId: lead.technicianId,
      supportTechnicianId: support.technicianId,
      leadTechnician: lead.technician,
      supportTechnician: support.technician,
      assignedAt: a.assigned_at || null,
    });
  }

  return pairs;
}

function rankPairSource(sourceRole, status) {
  const active = ['ASSIGNED', 'IN_PROGRESS'].includes(normUpper(status));
  const role = normUpper(sourceRole);

  if (active && (role === 'INSTALL' || role === 'TEST')) return 1;
  if (role === 'AMC SERVICE' || role === 'WARRANTY SERVICE') return 2;
  if (role === 'INSTALL' || role === 'TEST') return 3;
  return 9;
}

function collapseBestPairs(rows = []) {
  const best = new Map();

  for (const row of rows) {
    const current = best.get(row.pairKey);
    const score = rankPairSource(row.sourceRole, row.status);

    if (!current) {
      best.set(row.pairKey, { ...row, _rank: score });
      continue;
    }

    const currentTime = current.assignedAt ? new Date(current.assignedAt).getTime() : 0;
    const rowTime = row.assignedAt ? new Date(row.assignedAt).getTime() : 0;

    if (score < current._rank || (score === current._rank && rowTime > currentTime)) {
      best.set(row.pairKey, { ...row, _rank: score });
    }
  }

  return Array.from(best.values());
}

async function getActiveServiceTechnicians() {
  const rows = await Technician.findAll({
    where: { isActive: true },
    order: [['name', 'ASC']],
  });

  return rows.filter((t) => technicianCanDoService(t));
}

function buildFallbackPairs(techs = []) {
  const out = [];

  for (let i = 0; i < techs.length; i++) {
    for (let j = i + 1; j < techs.length; j++) {
      const a = techs[i];
      const b = techs[j];
      const pairKey = makePairKey(a.id, b.id);
      if (!pairKey) continue;

      out.push({
        pairKey,
        sourceRole: 'FALLBACK',
        status: 'AVAILABLE',
        leadTechnicianId: Number(a.id),
        supportTechnicianId: Number(b.id),
        leadTechnician: a,
        supportTechnician: b,
        assignedAt: null,
        _rank: 8,
      });
    }
  }

  return out;
}

function scorePair(pair, openCountMap, lastAssignedMap, sameDayMap, inProgressMap) {
  const a = Number(pair.leadTechnicianId || 0);
  const b = Number(pair.supportTechnicianId || 0);

  const openA = openCountMap.get(a) || 0;
  const openB = openCountMap.get(b) || 0;
  const totalOpen = openA + openB;

  const sameDayA = sameDayMap.get(a) || 0;
  const sameDayB = sameDayMap.get(b) || 0;
  const sameDayTotal = sameDayA + sameDayB;

  const inProgA = inProgressMap.get(a) || 0;
  const inProgB = inProgressMap.get(b) || 0;
  const inProgressTotal = inProgA + inProgB;

  const lastA = lastAssignedMap.get(a) ? new Date(lastAssignedMap.get(a)).getTime() : 0;
  const lastB = lastAssignedMap.get(b) ? new Date(lastAssignedMap.get(b)).getTime() : 0;
  const lastRecent = Math.max(lastA, lastB);

  return {
    sourceRank: pair._rank ?? rankPairSource(pair.sourceRole, pair.status),
    sameDayTotal,
    totalOpen,
    inProgressTotal,
    lastRecent,

    score:
      (sameDayTotal * 100) +     // strongest factor: same-day service spread
      (inProgressTotal * 20) +   // penalize but do not block ongoing install/test/service load
      (totalOpen * 10) +         // general open workload
      (pair._rank ?? rankPairSource(pair.sourceRole, pair.status)), // slight source preference
  };
}

async function pickBestServicePair(targetDueDate = null) {
  const existingPairsRaw = await getExistingTechnicianPairs();
  const existingPairs = collapseBestPairs(existingPairsRaw);

  const serviceTechs = await getActiveServiceTechnicians();
  const fallbackPairs = buildFallbackPairs(serviceTechs);

  const allByKey = new Map();

  for (const p of existingPairs) {
    if (technicianCanDoService(p.leadTechnician) && technicianCanDoService(p.supportTechnician)) {
      allByKey.set(p.pairKey, p);
    }
  }

  for (const p of fallbackPairs) {
    if (!allByKey.has(p.pairKey)) {
      allByKey.set(p.pairKey, p);
    }
  }

  const pairs = Array.from(allByKey.values());
  if (!pairs.length) return null;

  const openCountMap = await buildOpenAssignmentCountByTechnician();
  const lastAssignedMap = await buildLastAssignmentDateByTechnician();
  const sameDayMap = await buildSameDayAssignmentCountByTechnician(targetDueDate || new Date());
  const inProgressMap = await buildInProgressCountByTechnician();

  pairs.sort((x, y) => {
    const sx = scorePair(x, openCountMap, lastAssignedMap, sameDayMap, inProgressMap);
    const sy = scorePair(y, openCountMap, lastAssignedMap, sameDayMap, inProgressMap);

    // 1. weighted dynamic workload
    if (sx.score !== sy.score) {
      return sx.score - sy.score;
    }

    // 2. least recently assigned
    if (sx.lastRecent !== sy.lastRecent) {
      return sx.lastRecent - sy.lastRecent;
    }

    return String(x.pairKey).localeCompare(String(y.pairKey));
  });

  return pairs[0];
}

async function createServiceAssignmentWithPair({
  projectLiftId,
  role,
  dueDate,
  notes,
  pair,
}) {
  const leadId = Number(pair?.leadTechnicianId || 0);
  const supportId = Number(pair?.supportTechnicianId || 0);

  if (!leadId || !supportId) {
    throw new Error('A valid 2-member pair is required');
  }

  if (leadId === supportId) {
    throw new Error('Lead and support technician cannot be the same person');
  }

  console.log('PAIR DEBUG', {
    projectLiftId,
    role,
    dueDate: dueDate || null,
    pairKey: pair?.pairKey || null,
    leadTechnicianId: leadId,
    supportTechnicianId: supportId,
    leadSkills: pair?.leadTechnician?.skills || '',
    supportSkills: pair?.supportTechnician?.skills || '',
  });

  let a;

  try {
    a = await ProjectLiftAssignment.create({
  project_lift_id: projectLiftId,
  technician_id: leadId,
  assignment_role: String(role || '').trim(),
  status: 'ASSIGNED',
  due_date: dueDate || null,
  notes: notes ? String(notes).trim() : null,
  assigned_at: new Date(),
});
    console.log('ASSIGNMENT CREATE OK', { assignmentId: a.id, role, projectLiftId });
  } catch (err) {
    console.error('ASSIGNMENT CREATE FAILED', {
      message: err.message,
      name: err.name,
      details: err.errors?.map((e) => ({
        message: e.message,
        path: e.path,
        value: e.value,
      })) || [],
      stack: err.stack,
    });
    throw err;
  }

  try {
    await JobTechnician.findOrCreate({
      where: { assignmentId: a.id, technicianId: leadId },
      defaults: {
        assignmentId: a.id,
        technicianId: leadId,
        teamRole: 'LEAD',
        assignedAt: new Date(),
        notes: `Auto-assigned ${role} lead`,
      },
    });

    await JobTechnician.findOrCreate({
      where: { assignmentId: a.id, technicianId: supportId },
      defaults: {
        assignmentId: a.id,
        technicianId: supportId,
        teamRole: 'SUPPORT',
        assignedAt: new Date(),
        notes: `Auto-assigned ${role} support`,
      },
    });

    console.log('JOB TEAM CREATE OK', {
      assignmentId: a.id,
      leadId,
      supportId,
    });
  } catch (err) {
    console.error('JOB TEAM CREATE FAILED', {
      message: err.message,
      name: err.name,
      details: err.errors?.map((e) => ({
        message: e.message,
        path: e.path,
        value: e.value,
      })) || [],
      stack: err.stack,
    });
    throw err;
  }

  try {
    await ensureChecklistForAssignment(a);
    const checklistSummary = await getChecklistSummary(a.id);
    console.log('CHECKLIST CREATE OK', { assignmentId: a.id, checklistSummary });
    return { assignment: a, checklistSummary };
  } catch (err) {
    console.error('CHECKLIST CREATE FAILED', {
      message: err.message,
      name: err.name,
      details: err.errors?.map((e) => ({
        message: e.message,
        path: e.path,
        value: e.value,
      })) || [],
      stack: err.stack,
    });
    throw err;
  }
}

async function resolveLiftId(rawIdOrCode) {
  const raw = String(rawIdOrCode || '').trim();
  if (!raw) return null;

  const n = Number(raw);
  if (Number.isFinite(n) && !Number.isNaN(n)) return n;

  const lift = await Lift.findOne({ where: { liftCode: raw } });
  return lift ? lift.id : null;
}

function normalizeCost(v) {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isValidPin(pin) {
  return /^[0-9]{4,8}$/.test(String(pin || '').trim());
}

function hashPinPBKDF2(pin, salt) {
  return crypto.pbkdf2Sync(String(pin), String(salt), 120000, 32, 'sha256').toString('hex');
}

function newToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Serial Project Code PRJ-0001, PRJ-0002...
function fmtProjectCode(n) {
  return `PRJ-${String(n).padStart(4, "0")}`;
}

async function nextProjectCode() {
  // sequence was created/reset by you; also ensured by ensureSchema() below
  const [rows] = await sequelize.query("SELECT nextval('public.project_code_seq') AS seq");
  const nextNo = Number(rows[0].seq);
  return fmtProjectCode(nextNo);
}

// --------------------
// Health
// --------------------
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/api/hello', (req, res) => res.json({ message: 'Hello from LiftMaintenanceAPI' }));

// --------------------
// TECHNICIANS + Mobile login + Assignments
// --------------------

// List technicians
app.get('/api/technicians', async (req, res) => {
  try {
    const rows = await Technician.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });

    res.json(
      rows.map((t) => ({
        id: t.id,
        name: t.name,
        phone: t.phone,
        email: t.email,
        skills: t.skills || '',
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Create technician
app.post('/api/technicians', async (req, res) => {
  try {
    const { name, phone, email, skills, pin } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: 'Technician name is required' });
    }

    const cleanPin = pin != null && String(pin).trim() !== '' ? String(pin).trim() : null;
    const cleanSkills = String(skills || '')
      .split(',')
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean)
      .join(',');

    let pinSalt = null;
    let pinHash = null;
    let mustChangePin = true;

    if (cleanPin) {
      if (!isValidPin(cleanPin)) {
        return res.status(400).json({ error: 'PIN must be 4 to 8 digits' });
      }
      pinHash = await bcrypt.hash(cleanPin, 10);
      pinSalt = null;
      mustChangePin = false;
    }

    const tech = await Technician.create({
      name: String(name).trim(),
      phone: phone ? String(phone).trim() : null,
      email: email ? String(email).trim() : null,
      skills: cleanSkills || null,
      isActive: true,
      pinSalt,
      pinHash,
      mustChangePin,
    });

    res.json({
      id: tech.id,
      name: tech.name,
      phone: tech.phone,
      email: tech.email,
      skills: tech.skills || '',
      mustChangePin: tech.mustChangePin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/technicians/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, phone, email, skills } = req.body || {};

    const tech = await Technician.findByPk(id);
    if (!tech) return res.status(404).json({ error: 'Technician not found' });

    const cleanSkills = String(skills || '')
      .split(',')
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean)
      .join(',');

    await tech.update({
      name: name != null ? String(name).trim() : tech.name,
      phone: phone != null ? String(phone).trim() : tech.phone,
      email: email != null ? String(email).trim() : tech.email,
      skills: cleanSkills,
    });

    res.json({
      id: tech.id,
      name: tech.name,
      phone: tech.phone,
      email: tech.email,
      skills: tech.skills || '',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to update technician' });
  }
});

async function handleSetTechnicianPin(req, res) {
  try {
    const id = Number(req.params.id);
    const { pin } = req.body || {};

    if (!isValidPin(pin)) {
      return res.status(400).json({ error: 'PIN must be 4 to 8 digits' });
    }

    const tech = await Technician.findByPk(id);
    if (!tech) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    const pinHash = await bcrypt.hash(String(pin).trim(), 10);

    await tech.update({
      pinSalt: null,
      pinHash,
      mustChangePin: false,
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Set technician PIN failed:', err);
    return res.status(500).json({ error: err.message || 'Failed to set PIN' });
  }
}

app.put('/api/technicians/:id/set-pin', handleSetTechnicianPin);
app.put('/api/technicians/:id/pin', handleSetTechnicianPin);

// Technician login
app.post('/api/tech/login', async (req, res) => {
  try {
    const { phone, pin } = req.body || {};
    const p = String(phone || '').trim();
    const rawPin = String(pin || '').trim();

    if (!p) return res.status(400).json({ error: 'phone is required' });
    if (!isValidPin(rawPin)) return res.status(400).json({ error: 'PIN must be 4 to 8 digits' });

    const tech = await Technician.findOne({ where: { phone: p, isActive: true } });
    if (!tech) return res.status(401).json({ error: 'Invalid phone or PIN' });

    if (!tech.pinHash) {
  return res.status(401).json({ error: 'PIN not set. Ask management to set your PIN.' });
}

let ok = false;
if (tech.pinSalt) {
  const h = hashPinPBKDF2(rawPin, tech.pinSalt);
  ok = (h === tech.pinHash);
} else {
  ok = await bcrypt.compare(rawPin, tech.pinHash);
}

    if (!ok) return res.status(401).json({ error: 'Invalid phone or PIN' });

    const token = newToken();
    const now = new Date();
    const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);

    await TechnicianSession.create({
      technician_id: tech.id,
      token,
      created_at: now,
      expires_at: expires,
      last_seen_at: now,
    });

    res.json({
      token,
      technician: {
  id: tech.id,
  name: tech.name,
  phone: tech.phone,
  skills: tech.skills || '',
},
      expiresAt: expires,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

async function authTech(req, res, next) {
  try {
    const auth = String(req.headers.authorization || '');
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) return res.status(401).json({ error: 'Missing Bearer token' });

    const token = m[1].trim();
    const session = await TechnicianSession.findOne({ where: { token } });
    if (!session) return res.status(401).json({ error: 'Invalid session' });

    const now = new Date();
    if (session.expires_at && now > session.expires_at) return res.status(401).json({ error: 'Session expired' });

    session.last_seen_at = now;
    await session.save();

    const tech = await Technician.findByPk(session.technician_id);
    if (!tech || !tech.isActive) return res.status(401).json({ error: 'Technician inactive' });

    req.tech = { id: tech.id, name: tech.name, phone: tech.phone, role: tech.role };
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

app.get('/api/tech/me', authTech, async (req, res) => {
  res.json({ technician: req.tech });
});

// Tech assignments
app.get('/api/tech/assignments', authTech, async (req, res) => {
  try {
    const status = req.query.status ? String(req.query.status).toUpperCase() : null;
    const limit = Math.min(Math.max(Number(req.query.limit || 200), 1), 500);

    const teamRows = await JobTechnician.findAll({
      where: { technicianId: req.tech.id },
      include: [
        {
          model: ProjectLiftAssignment,
          include: [
            {
              model: ProjectLift,
              include: [
                { model: Project, attributes: ['id', 'project_name', 'project_code'] },
              ],
            },
            { model: Technician, attributes: ['id', 'name', 'phone', 'role'] },
          ],
        },
      ],
      order: [['id', 'DESC']],
      limit,
    });

    const assignmentIds = teamRows
      .map((r) => r.assignmentId)
      .filter(Boolean);

    const teamMap = await buildJobTeamMap(assignmentIds);

    const out = [];

    for (const row of teamRows) {
      const a = row.ProjectLiftAssignment;
      if (!a) continue;
      if (status && String(a.status || '').toUpperCase() !== status) continue;

      const summary = summarizeJobTeam(a, teamMap.get(Number(a.id)) || []);

      await ensureChecklistForAssignment(a);
      const checklistSummary = await getChecklistSummary(a.id);

      out.push({
        id: a.id,
        projectLiftId: a.project_lift_id,
        role: isAmcServiceAssignment(a) ? 'AMC SERVICE' : a.assignment_role,
        teamRole: row.teamRole,
        status: a.status,
        resubmissionRequired: !!a.resubmission_required,
        dueDate: a.due_date,
        assignedAt: a.assigned_at,
        startedAt: a.started_at,
        completedAt: a.completed_at,
        notes: a.notes || '',

        technician: a.Technician
          ? {
              id: a.Technician.id,
              name: a.Technician.name,
              phone: a.Technician.phone,
              role: a.Technician.role,
            }
          : null,

        leadTechnician: summary.lead
          ? summary.lead.technician
          : (a.Technician
              ? {
                  id: a.Technician.id,
                  name: a.Technician.name,
                  phone: a.Technician.phone,
                  role: a.Technician.role,
                }
              : null),

        supportTechnicians: summary.supports
          .map((m) => m.technician)
          .filter(Boolean),

        team: summary.team,

        lift: a.ProjectLift
          ? {
              id: a.ProjectLift.id,
              liftCode: a.ProjectLift.lift_code || '',
              location: a.ProjectLift.location_label || '',
            }
          : null,

        project: a.ProjectLift?.Project
          ? {
              id: a.ProjectLift.Project.id,
              projectName: a.ProjectLift.Project.project_name,
              projectCode: a.ProjectLift.Project.project_code || '',
            }
          : null,

        checklistSummary,
      });
    }

    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

async function ensureServiceReportForAssignment(assignment) {
  if (!assignment?.id) return null;

  let report = await AssignmentServiceReport.findOne({
    where: { assignmentId: assignment.id },
  });

  if (!report) {
    report = await AssignmentServiceReport.create({
      assignmentId: assignment.id,
      projectLiftId: assignment.project_lift_id,
      overallCondition: null,
      faultsObserved: null,
      actionTaken: null,
      recommendations: null,
      followUpRequired: false,
      technicianRemarks: null,
    });
  }

  return report;
}

async function assertServiceReportCompleteOrThrow(assignment) {
  const role = String(assignment?.assignment_role || '').toUpperCase();

  if (!['AMC SERVICE', 'WARRANTY SERVICE'].includes(role)) {
    return null;
  }

  const report = await AssignmentServiceReport.findOne({
    where: { assignmentId: assignment.id },
  });

  if (!report) {
    const err = new Error('Service report is required before marking this job done.');
    err.statusCode = 400;
    throw err;
  }

  const hasActionTaken = !!String(report.actionTaken || '').trim();
  const hasRemarks = !!String(report.technicianRemarks || '').trim();

  if (!hasActionTaken && !hasRemarks) {
    const err = new Error('Enter action taken or technician remarks before marking this job done.');
    err.statusCode = 400;
    throw err;
  }

  return report;
}

app.get('/api/tech/assignments/:id/service-report', authTech, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const a = await ProjectLiftAssignment.findByPk(id);
    if (!a) return res.status(404).json({ error: 'Assignment not found' });

    const report = await ensureServiceReportForAssignment(a);

    const parts = await AssignmentServicePart.findAll({
      where: { reportId: report.id },
      order: [['id', 'ASC']],
    });

    res.json({
      report: {
        id: report.id,
        assignmentId: report.assignmentId,
        projectLiftId: report.projectLiftId,
        overallCondition: report.overallCondition || '',
        faultsObserved: report.faultsObserved || '',
        actionTaken: report.actionTaken || '',
        recommendations: report.recommendations || '',
        followUpRequired: !!report.followUpRequired,
        technicianRemarks: report.technicianRemarks || '',
      },
      parts: parts.map((p) => ({
        id: p.id,
        itemName: p.itemName || '',
        qty: p.qty,
        remarks: p.remarks || '',
      })),
    });
  } catch (err) {
    console.error('GET /api/tech/assignments/:id/service-report failed', err);
    res.status(500).json({ error: err.message || 'Failed to load service report' });
  }
});

app.put('/api/tech/assignments/:id/service-report', authTech, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      overallCondition,
      faultsObserved,
      actionTaken,
      recommendations,
      followUpRequired,
      technicianRemarks,
    } = req.body || {};

    const a = await ProjectLiftAssignment.findByPk(id);
    if (!a) return res.status(404).json({ error: 'Assignment not found' });

    const report = await ensureServiceReportForAssignment(a);

    await report.update({
      overallCondition: overallCondition ?? null,
      faultsObserved: faultsObserved ?? null,
      actionTaken: actionTaken ?? null,
      recommendations: recommendations ?? null,
      followUpRequired: !!followUpRequired,
      technicianRemarks: technicianRemarks ?? null,
      updatedAt: new Date(),
    });

    res.json({ success: true, reportId: report.id });
  } catch (err) {
    console.error('PUT /api/tech/assignments/:id/service-report failed', err);
    res.status(500).json({ error: err.message || 'Failed to save service report' });
  }
});

app.post('/api/tech/assignments/:id/service-report/parts', authTech, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { itemName, qty, remarks } = req.body || {};

    const a = await ProjectLiftAssignment.findByPk(id);
    if (!a) return res.status(404).json({ error: 'Assignment not found' });

    const cleanItemName = String(itemName || '').trim();
    if (!cleanItemName) {
      return res.status(400).json({ error: 'Part / material name is required' });
    }

    const nQty = Number(qty || 1);
    if (!Number.isFinite(nQty) || nQty <= 0) {
      return res.status(400).json({ error: 'Qty must be greater than 0' });
    }

    const report = await ensureServiceReportForAssignment(a);

    const part = await AssignmentServicePart.create({
      reportId: report.id,
      itemName: cleanItemName,
      qty: nQty,
      remarks: remarks ? String(remarks).trim() : null,
    });

    res.json({
      success: true,
      part: {
        id: part.id,
        itemName: part.itemName,
        qty: part.qty,
        remarks: part.remarks || '',
      },
    });
  } catch (err) {
    console.error('POST /api/tech/assignments/:id/service-report/parts failed', err);
    res.status(500).json({ error: err.message || 'Failed to add part' });
  }
});

app.put('/api/tech/service-parts/:id', authTech, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { itemName, qty, remarks } = req.body || {};

    const part = await AssignmentServicePart.findByPk(id);
    if (!part) return res.status(404).json({ error: 'Part not found' });

    const patch = {};

    if (itemName !== undefined) {
      const cleanItemName = String(itemName || '').trim();
      if (!cleanItemName) {
        return res.status(400).json({ error: 'Part / material name is required' });
      }
      patch.itemName = cleanItemName;
    }

    if (qty !== undefined) {
      const nQty = Number(qty);
      if (!Number.isFinite(nQty) || nQty <= 0) {
        return res.status(400).json({ error: 'Qty must be greater than 0' });
      }
      patch.qty = nQty;
    }

    if (remarks !== undefined) {
      patch.remarks = remarks ? String(remarks).trim() : null;
    }

    await part.update(patch);

    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/tech/service-parts/:id failed', err);
    res.status(500).json({ error: err.message || 'Failed to update part' });
  }
});

app.delete('/api/tech/service-parts/:id', authTech, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const part = await AssignmentServicePart.findByPk(id);
    if (!part) return res.status(404).json({ error: 'Part not found' });

    await part.destroy();

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/tech/service-parts/:id failed', err);
    res.status(500).json({ error: err.message || 'Failed to delete part' });
  }
});

app.get('/api/amc/due-jobs', async (req, res) => {
  try {
    const rows = await getDueAmcProjectLifts();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/project-lifts/:projectLiftId/warranty-service-assign', async (req, res) => {
  try {
    const projectLiftId = Number(req.params.projectLiftId);
    const { leadTechnicianId, supportTechnicianId, dueDate, notes } = req.body || {};

    const pl = await ProjectLift.findByPk(projectLiftId, {
  include: [
    
    {
      model: ProjectLiftAssignment,
      as: 'assignments',
      include: [{ model: Technician, attributes: ['id', 'name', 'phone', 'role', 'skills', 'isActive'] }],
    },
  ],
});

    if (!pl) return res.status(404).json({ error: 'Project lift not found' });
    if (!pl.handover_actual_date) {
      return res.status(400).json({ error: 'Warranty service can only be assigned after actual handover' });
    }

    const rawAssignments = Array.isArray(pl.assignments)
  ? pl.assignments
  : [];
    const warrantyInfo = buildWarrantyInfo(pl, rawAssignments, startOfDay(new Date()));

    if (warrantyInfo.status !== 'WARRANTY ACTIVE') {
      return res.status(400).json({ error: 'Warranty is not active for this lift' });
    }

    const existing = rawAssignments.find((a) => {
      const role = String(a.assignment_role || '').toUpperCase();
      return role === 'WARRANTY SERVICE' && isAssignmentActive(a);
    });

    if (existing) {
      return res.status(409).json({
        error: 'An active WARRANTY SERVICE assignment already exists for this lift',
        assignment: {
          id: existing.id,
          role: 'WARRANTY SERVICE',
          status: existing.status,
          dueDate: existing.due_date,
        },
      });
    }

    const scheduledDueDate = dueDate || warrantyInfo.nextServiceDue || formatDateOnly(new Date());

    let pair = null;

    // Supervisor-selected manual pair
    if (leadTechnicianId && supportTechnicianId) {
      const lead = await Technician.findByPk(Number(leadTechnicianId));
      const support = await Technician.findByPk(Number(supportTechnicianId));

      if (!lead || !support) {
        return res.status(404).json({ error: 'Selected lead/support technician not found' });
      }

      if (!technicianCanDoService(lead) || !technicianCanDoService(support)) {
        return res.status(400).json({ error: 'Selected technicians must both have SERVICE capability' });
      }

      pair = {
        pairKey: makePairKey(lead.id, support.id),
        sourceRole: 'MANUAL',
        status: 'SELECTED',
        leadTechnicianId: Number(lead.id),
        supportTechnicianId: Number(support.id),
        leadTechnician: lead,
        supportTechnician: support,
        assignedAt: null,
        _rank: 0,
      };
    } else {
      // Default automatic pair selection
      pair = await pickBestServicePair(scheduledDueDate);
      if (!pair) {
        return res.status(400).json({ error: 'No valid 2-member service pair is available' });
      }
    }

    const assignmentNotes = notes
      ? String(notes).trim()
      : `Scheduled warranty visit ${warrantyInfo.nextVisitNumber || ''}`.trim();

    const { assignment: a, checklistSummary } = await createServiceAssignmentWithPair({
      projectLiftId: pl.id,
      role: 'WARRANTY SERVICE',
      dueDate: scheduledDueDate,
      notes: assignmentNotes,
      pair,
    });

    res.json({
      id: a.id,
      role: 'WARRANTY SERVICE',
      status: a.status,
      dueDate: a.due_date,
      nextVisitNumber: warrantyInfo.nextVisitNumber,
      technicianMode: (leadTechnicianId && supportTechnicianId) ? 'MANUAL_PAIR' : 'AUTO_PAIR',
      pair: {
        pairKey: pair.pairKey,
        sourceRole: pair.sourceRole,
        lead: {
          id: pair.leadTechnician.id,
          name: pair.leadTechnician.name,
          phone: pair.leadTechnician.phone,
          role: pair.leadTechnician.role,
          skills: pair.leadTechnician.skills || '',
        },
        support: {
          id: pair.supportTechnician.id,
          name: pair.supportTechnician.name,
          phone: pair.supportTechnician.phone,
          role: pair.supportTechnician.role,
          skills: pair.supportTechnician.skills || '',
        },
      },
      checklistSummary,
    });
  } catch (err) {
    console.error('POST /api/project-lifts/:projectLiftId/warranty-service-assign error:', err);
    res.status(500).json({ error: err.message || 'Failed to assign warranty service' });
  }
});

app.post('/api/service/create-all-due-jobs', async (req, res) => {
  try {
    const today = startOfDay(new Date());

    const warrantyDue = await getDueWarrantyProjectLifts();
    const amcDue = await getDueAmcProjectLifts();

    const created = [];
    const skipped = [];
    const errors = [];

    // WARRANTY
    for (const row of warrantyDue) {
      try {
        const pl = await ProjectLift.findByPk(row.projectLiftId, {
          include: [
            {
              model: ProjectLiftAssignment,
              as: 'assignments',
              include: [{ model: Technician, attributes: ['id', 'name', 'phone', 'role', 'skills', 'isActive'] }],
            },
          ],
        });

        if (!pl) {
          skipped.push({
            type: 'WARRANTY SERVICE',
            projectLiftId: row.projectLiftId,
            liftCode: row.liftCode || '',
            reason: 'Project lift not found',
          });
          continue;
        }

        const rawAssignments = Array.isArray(pl.assignments) ? pl.assignments : [];
        const warrantyInfo = buildWarrantyInfo(pl, rawAssignments, today);

        if (warrantyInfo.activeServiceAssignment) {
          skipped.push({
            type: 'WARRANTY SERVICE',
            projectLiftId: row.projectLiftId,
            liftCode: row.liftCode || '',
            reason: 'Active warranty service job already exists',
          });
          continue;
        }

        if (!warrantyInfo.isDueNow || !warrantyInfo.nextServiceDue) {
          skipped.push({
            type: 'WARRANTY SERVICE',
            projectLiftId: row.projectLiftId,
            liftCode: row.liftCode || '',
            reason: 'Warranty service not currently due',
          });
          continue;
        }

        const pair = await pickBestServicePair(warrantyInfo.nextServiceDue);
        if (!pair) {
          skipped.push({
            type: 'WARRANTY SERVICE',
            projectLiftId: row.projectLiftId,
            liftCode: row.liftCode || '',
            reason: 'No valid 2-member service pair available',
          });
          continue;
        }

        const { assignment, checklistSummary } = await createServiceAssignmentWithPair({
          projectLiftId: pl.id,
          role: 'WARRANTY SERVICE',
          dueDate: warrantyInfo.nextServiceDue,
          notes: `Auto-created warranty visit ${warrantyInfo.nextVisitNumber || ''}`.trim(),
          pair,
        });

        created.push({
          id: assignment.id,
          type: 'WARRANTY SERVICE',
          projectLiftId: pl.id,
          liftCode: row.liftCode || '',
          dueDate: assignment.due_date,
          nextVisitNumber: warrantyInfo.nextVisitNumber,
          pair: {
            pairKey: pair.pairKey,
            sourceRole: pair.sourceRole,
            lead: pair.leadTechnician?.name || '',
            support: pair.supportTechnician?.name || '',
          },
          checklistSummary,
        });
      } catch (err) {
        console.error("WARRANTY CREATE ERROR:", {
  message: err.message,
  name: err.name,
  details: err.errors?.map((e) => ({
    message: e.message,
    path: e.path,
    value: e.value,
  })),
  stack: err.stack,
});

        errors.push({
  type: 'WARRANTY SERVICE',
  projectLiftId: row.projectLiftId,
  liftCode: row.liftCode || '',
  error: err.message || String(err),
  name: err.name || null,
  details: Array.isArray(err.errors)
    ? err.errors.map((e) => ({
        message: e.message,
        path: e.path,
        value: e.value,
      }))
    : [],
  stack: err.stack || null,
});
      }
    }

    // AMC
    for (const row of amcDue) {
      try {
        const pl = await ProjectLift.findByPk(row.projectLiftId, {
          include: [
            {
              model: ProjectLiftAssignment,
              as: 'assignments',
              include: [{ model: Technician, attributes: ['id', 'name', 'phone', 'role', 'skills', 'isActive'] }],
            },
          ],
        });

        const resolvedLiftId = Number((pl && (pl.lift_id || pl.liftId)) || 0);

if (!pl || !resolvedLiftId) {
  skipped.push({
    type: 'AMC SERVICE',
    projectLiftId: row.projectLiftId,
    liftCode: row.liftCode || '',
    reason: 'Project lift is not linked to a lift record',
  });
  continue;
}

const contract = await Contract.findOne({
  where: { liftId: resolvedLiftId, contractType: 'AMC', status: 'ACTIVE' },
});

        if (!contract) {
          skipped.push({
            type: 'AMC SERVICE',
            projectLiftId: row.projectLiftId,
            liftCode: row.liftCode || '',
            reason: 'No active AMC contract found',
          });
          continue;
        }

        const rawAssignments = Array.isArray(pl.assignments) ? pl.assignments : [];

        const amcInfo = buildAmcInfo(contract, today, {
          assignments: rawAssignments,
          activeServiceAssignment: null,
        });

        const hasActiveAmc = rawAssignments.some((a) =>
          isAmcServiceAssignment(a) && isAssignmentActive(a)
        );

        console.log("==== AMC DEBUG ====");
        console.log({
          lift: row.liftCode || pl.lift_code || '',
          projectLiftId: pl.id,
          hasContract: !!contract,
          contractId: contract.id,
          rawAssignmentsCount: rawAssignments.length,
          hasActiveAmc,
          amcInfo,
        });

        if (hasActiveAmc) {
          skipped.push({
            type: 'AMC SERVICE',
            projectLiftId: row.projectLiftId,
            liftCode: row.liftCode || '',
            reason: 'Active AMC service job already exists',
          });
          continue;
        }

        if (!amcInfo.isDueNow || !amcInfo.nextServiceDue) {
          skipped.push({
            type: 'AMC SERVICE',
            projectLiftId: row.projectLiftId,
            liftCode: row.liftCode || '',
            reason: 'AMC service not currently due',
          });
          continue;
        }

        const pair = await pickBestServicePair(amcInfo.nextServiceDue);
        if (!pair) {
          skipped.push({
            type: 'AMC SERVICE',
            projectLiftId: row.projectLiftId,
            liftCode: row.liftCode || '',
            reason: 'No valid 2-member service pair available',
          });
          continue;
        }

        const { assignment, checklistSummary } = await createServiceAssignmentWithPair({
          projectLiftId: pl.id,
          role: 'AMC SERVICE',
          dueDate: amcInfo.nextServiceDue,
          notes: `Auto-created AMC visit ${amcInfo.nextVisitNumber || ''}`.trim(),
          pair,
        });

        created.push({
          id: assignment.id,
          type: 'AMC SERVICE',
          projectLiftId: pl.id,
          liftCode: row.liftCode || '',
          dueDate: assignment.due_date,
          nextVisitNumber: amcInfo.nextVisitNumber,
          pair: {
            pairKey: pair.pairKey,
            sourceRole: pair.sourceRole,
            lead: pair.leadTechnician?.name || '',
            support: pair.supportTechnician?.name || '',
          },
          checklistSummary,
        });
      } catch (err) {
        console.error("AMC CREATE ERROR:", {
  message: err.message,
  name: err.name,
  details: err.errors?.map((e) => ({
    message: e.message,
    path: e.path,
    value: e.value,
  })),
  stack: err.stack,
});

       errors.push({
  type: 'AMC SERVICE',
  projectLiftId: row.projectLiftId,
  liftCode: row.liftCode || '',
  error: err.message || String(err),
  name: err.name || null,
  details: Array.isArray(err.errors)
    ? err.errors.map((e) => ({
        message: e.message,
        path: e.path,
        value: e.value,
      }))
    : [],
  stack: err.stack || null,
});
      }
    }

    res.json({
      ok: true,
      summary: {
        warrantyDueCount: warrantyDue.length,
        amcDueCount: amcDue.length,
        createdCount: created.length,
        skippedCount: skipped.length,
        errorCount: errors.length,
      },
      created,
      skipped,
      errors,
    });
  } catch (err) {
    console.error('POST /api/service/create-all-due-jobs error:', err);
    res.status(500).json({ error: err.message || 'Failed to create due service jobs' });
  }
});

app.post('/api/project-lifts/:projectLiftId/auto-amc-job', async (req, res) => {
  try {
    const projectLiftId = Number(req.params.projectLiftId);
    const { notes } = req.body || {};

    const pl = await ProjectLift.findByPk(projectLiftId, {
      include: [
        
        {
          model: ProjectLiftAssignment,
          as: 'assignments',
          include: [{ model: Technician, attributes: ['id', 'name', 'phone', 'role', 'skills', 'isActive'] }],
        },
      ],
    });

    if (!pl) return res.status(404).json({ error: 'Project lift not found' });

    const resolvedLiftId = Number(pl.lift_id || pl.liftId || 0);
    if (!resolvedLiftId) {
      return res.status(400).json({ error: 'Project lift is not linked to a lift record' });
    }

    const rawAssignments = Array.isArray(pl.assignments) ? pl.assignments : [];

    const hasActiveAmc = rawAssignments.some((a) =>
      isAmcServiceAssignment(a) && isAssignmentActive(a)
    );

    if (hasActiveAmc) {
      return res.status(409).json({ error: 'Active AMC SERVICE job already exists for this lift' });
    }

    const contract = await Contract.findOne({
      where: { liftId: resolvedLiftId, contractType: 'AMC', status: 'ACTIVE' },
    });

    if (!contract) {
      return res.status(400).json({ error: 'No active AMC contract found for this lift' });
    }

    const amcInfo = buildAmcInfo(contract, startOfDay(new Date()), {
      assignments: rawAssignments,
      activeServiceAssignment: null,
    });

    if (!amcInfo.nextServiceDue) {
      return res.status(400).json({ error: 'No next service due date could be calculated' });
    }

    if (!amcInfo.isDueNow) {
      return res.status(400).json({ error: 'AMC service is not yet due for job creation' });
    }

    const pair = await pickBestServicePair(amcInfo.nextServiceDue);
    if (!pair) {
      return res.status(400).json({ error: 'No valid 2-member service pair is available' });
    }

    const { assignment: a, checklistSummary } = await createServiceAssignmentWithPair({
      projectLiftId: pl.id,
      role: 'AMC SERVICE',
      dueDate: amcInfo.nextServiceDue,
      notes: notes
        ? String(notes).trim()
        : `Auto-created AMC visit ${amcInfo.nextVisitNumber || ''}`.trim(),
      pair,
    });

    res.json({
      id: a.id,
      role: 'AMC SERVICE',
      status: a.status,
      dueDate: a.due_date,
      nextVisitNumber: amcInfo.nextVisitNumber,
      createJobFromDate: amcInfo.createJobFromDate,
      pair: {
        pairKey: pair.pairKey,
        sourceRole: pair.sourceRole,
        lead: {
          id: pair.leadTechnician.id,
          name: pair.leadTechnician.name,
          phone: pair.leadTechnician.phone,
          role: pair.leadTechnician.role,
          skills: pair.leadTechnician.skills || '',
        },
        support: {
          id: pair.supportTechnician.id,
          name: pair.supportTechnician.name,
          phone: pair.supportTechnician.phone,
          role: pair.supportTechnician.role,
          skills: pair.supportTechnician.skills || '',
        },
      },
      checklistSummary,
    });
  } catch (err) {
    console.error('POST /api/project-lifts/:projectLiftId/auto-amc-job error:', err);
    res.status(500).json({ error: err.message || 'Failed to auto-create AMC service job' });
  }
});

app.put('/api/jobs/:id/team', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { leadTechnicianId, supportTechnicianIds } = req.body || {};

    const a = await ProjectLiftAssignment.findByPk(id);
    if (!a) return res.status(404).json({ error: 'Job not found' });

    // Update lead
    await a.update({
      technician_id: leadTechnicianId
    });

    // Remove existing team
    await JobTechnician.destroy({ where: { assignmentId: id } });

    // Add lead
    await JobTechnician.create({
      assignmentId: id,
      technicianId: leadTechnicianId,
      teamRole: 'LEAD',
      assignedAt: new Date()
    });

    // Add supports
    for (const sid of (supportTechnicianIds || [])) {
      await JobTechnician.create({
        assignmentId: id,
        technicianId: sid,
        teamRole: 'SUPPORT',
        assignedAt: new Date()
      });
    }

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// PROJECTS
// --------------------

app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: Customer, attributes: ['id', 'name'] },
        { model: Site, attributes: ['id', 'name'] },
        { model: ProjectLift, attributes: ['id'] },
      ],
      order: [['id', 'DESC']],
    });

    const out = projects.map((p) => ({
      id: p.id,
      projectCode: p.project_code || '',
      projectName: p.project_name,
      status: p.status,
      customer: p.Customer ? { id: p.Customer.id, name: p.Customer.name } : null,
      site: p.Site ? { id: p.Site.id, name: p.Site.name } : null,
      liftCount: Array.isArray(p.ProjectLifts) ? p.ProjectLifts.length : 0,
      notes: p.notes || '',
    }));

    res.json(out);
  } catch (err) {
    console.error('GET /api/projects error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create project (serial code from backend)
app.post('/api/projects', async (req, res) => {
  try {
    const body = req.body || {};

    const projectName = String(body.projectName || body.project_name || '').trim();
    const customerName = String(body.customerName || body.customer_name || '').trim();
    const siteName = String(body.building || body.site_name || body.siteName || '').trim();
    const notes = body.notes != null ? String(body.notes).trim() : null;

    if (!projectName) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    if (!customerName) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    let customer = null;
    const [customerRows] = await sequelize.query(
      `
      SELECT id, name
      FROM customers
      WHERE name = :name
      LIMIT 1
      `,
      {
        replacements: { name: customerName },
      }
    );

    customer = customerRows[0] || null;

    if (!customer) {
      const [insertedCustomerRows] = await sequelize.query(
        `
        INSERT INTO customers (name)
        VALUES (:name)
        RETURNING id, name
        `,
        {
          replacements: { name: customerName },
        }
      );

      customer = insertedCustomerRows[0] || null;
    }

    if (!customer || !customer.id) {
      return res.status(500).json({ error: 'Failed to create or load customer' });
    }

    let site = null;
    if (siteName) {
      const [siteRows] = await sequelize.query(
        `
        SELECT id, name
        FROM sites
        WHERE name = :name
        LIMIT 1
        `,
        {
          replacements: { name: siteName },
        }
      );

      site = siteRows[0] || null;

      if (!site) {
        const [insertedSiteRows] = await sequelize.query(
          `
          INSERT INTO sites (name)
          VALUES (:name)
          RETURNING id, name
          `,
          {
            replacements: { name: siteName },
          }
        );

        site = insertedSiteRows[0] || null;
      }
    }

    const projectCode = await nextProjectCode();

    const [projectRows] = await sequelize.query(
      `
      INSERT INTO projects
        (project_code, project_name, customer_id, site_id, status, notes)
      VALUES
        (:projectCode, :projectName, :customerId, :siteId, :status, :notes)
      RETURNING
        id,
        project_code,
        project_name,
        customer_id,
        site_id,
        status,
        notes
      `,
      {
        replacements: {
          projectCode,
          projectName,
          customerId: customer.id,
          siteId: site ? site.id : null,
          status: 'OPEN',
          notes: notes || null,
        },
      }
    );

    const project = projectRows[0];

    res.json({
      id: project.id,
      projectCode: project.project_code || '',
      projectName: project.project_name || '',
      status: project.status || 'OPEN',
      customer: {
        id: customer.id,
        name: customer.name,
      },
      site: site
        ? {
            id: site.id,
            name: site.name,
          }
        : null,
      liftCount: 0,
      notes: project.notes || '',
    });
  } catch (err) {
    console.error('POST /api/projects error:', err);
    res.status(500).json({ error: err.message || 'Failed to create project' });
  }
});

// Project detail (includes lifts + assignments)
app.get('/api/projects/:projectId', async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);

    const project = await Project.findByPk(projectId, {
      include: [
        { model: Customer, attributes: ['id', 'name'] },
        { model: Site, attributes: ['id', 'name', 'gps_lat', 'gps_lng'] },
        {
          model: ProjectLift,
          include: [
            
            {
              model: ProjectLiftAssignment,
              as: 'assignments',
              include: [{ model: Technician, attributes: ['id', 'name', 'phone', 'role'] }],
            },
          ],
        },
      ],
      order: [[ProjectLift, 'id', 'ASC']],
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const liftIds = (project.ProjectLifts || [])
      .map((pl) => pl.lift_id)
      .filter(Boolean);

    const activeAmcContracts = liftIds.length
  ? await Contract.findAll({
      where: {
        liftId: liftIds,
        contractType: 'AMC',
        status: 'ACTIVE',
      },
    })
  : [];

// 🔥 ADD THIS HERE
console.log('AMC CONTRACTS FOUND:', activeAmcContracts);
console.log('LIFT IDS:', liftIds);

    const amcByLiftId = new Map(
  activeAmcContracts.map((c) => [Number(c.liftId || c.lift_id), c])
);

    const today = startOfDay(new Date());

    const assignmentIds = (project.ProjectLifts || []).flatMap((pl) =>
  (pl.assignments || []).map((a) => Number(a.id || a.assignment_id))
);

    const teamMap = await buildJobTeamMap(assignmentIds);

    const lifts = await Promise.all(
      (project.ProjectLifts || []).map(async (pl) => {
        const rawAssignments = pl.assignments || [];

        const activeAmcServiceAssignmentRaw = rawAssignments.find(
          (a) => isAmcServiceAssignment(a) && isAssignmentActive(a)
        );

        const activeAmcServiceAssignment = activeAmcServiceAssignmentRaw
          ? {
              id: activeAmcServiceAssignmentRaw.id,
              technicianName: activeAmcServiceAssignmentRaw.Technician
                ? activeAmcServiceAssignmentRaw.Technician.name
                : null,
              technicianId: activeAmcServiceAssignmentRaw.technician_id,
              dueDate: activeAmcServiceAssignmentRaw.due_date || null,
              status: activeAmcServiceAssignmentRaw.status,
              notes: stripAmcServiceMarker(activeAmcServiceAssignmentRaw.notes),
            }
          : null;

        const warrantyInfo = buildWarrantyInfo(pl, rawAssignments, today);

        const amcInfo = buildAmcInfo(
          amcByLiftId.get(Number(pl.lift_id || pl.liftId)) || null,
          today,
          {
            assignments: rawAssignments,
            activeServiceAssignment: activeAmcServiceAssignment,
          }
        );

        const serviceHistory = await buildServiceHistoryForLift(pl, rawAssignments, {
          today,
          warrantyInfo,
          amcInfo,
        });

        const assignments = rawAssignments.map((a) => {
  console.log('MAP KEYS:', [...teamMap.keys()]);
  console.log('CURRENT ASSIGNMENT ID:', a.id, typeof a.id);

  const rawTeamRows = teamMap.get(Number(a.id)) || [];
  console.log('RAW TEAM ROWS:', rawTeamRows);

  const normalizedTeam = normalizeJobTeamRows(a, rawTeamRows);
  console.log('NORMALIZED TEAM:', normalizedTeam);

  const leadRow =
    normalizedTeam.find((m) => String(m.teamRole || '').toUpperCase() === 'LEAD') || null;

  const supportRows =
    normalizedTeam.filter((m) => String(m.teamRole || '').toUpperCase() === 'SUPPORT');

  console.log('SUPPORT ROWS:', supportRows);

  return {
    id: a.id,
    role: isAmcServiceAssignment(a) ? 'AMC SERVICE' : a.assignment_role,
    technician: a.Technician
      ? {
          id: a.Technician.id,
          name: a.Technician.name,
          phone: a.Technician.phone,
          role: a.Technician.role,
        }
      : null,
    leadTechnician: leadRow
      ? leadRow.technician
      : a.Technician
      ? {
          id: a.Technician.id,
          name: a.Technician.name,
          phone: a.Technician.phone,
          role: a.Technician.role,
        }
      : null,
    supportTechnicians: supportRows.map((m) => m.technician).filter(Boolean),
    team: normalizedTeam,
    status: a.status,
    supervisorStatus: a.supervisor_status || null,
    supervisorRemarks: a.supervisor_remarks || null,
    dueDate: a.due_date,
    assignedAt: a.assigned_at,
    startedAt: a.started_at,
    completedAt: a.completed_at,
    notes: a.notes || '',
  };
});

        const workflow = computeProjectLiftWorkflow(pl, rawAssignments);

        const canCreateAmc =
          !!pl.handover_actual_date &&
          !!pl.warranty_end_date &&
          today >= parseDateOnly(pl.warranty_end_date) &&
          !amcByLiftId.get(Number(pl.lift_id));

        amcInfo.canCreate = canCreateAmc;

        return {
          id: pl.id,
          projectLiftId: pl.id,
          liftId: pl.lift_id,
          liftCode: pl.lift_code,
          location: pl.location_label || (pl.Lift ? pl.Lift.location : '') || '',
          passengerCapacity: pl.passenger_capacity ?? null,
          liftType: pl.lift_type ?? null,
          numberOfFloors: pl.number_of_floors ?? null,
          installationStartDate: pl.installation_start_date,
          installationEndDate: pl.installation_end_date,
          testingStartDate: pl.testing_start_date,
          testingEndDate: pl.testing_end_date,
          handoverDate: pl.handover_date,
          handoverActualDate: pl.handover_actual_date,
          warrantyMonths: pl.warranty_months,
          warrantyStartDate: pl.warranty_start_date,
          warrantyEndDate: pl.warranty_end_date,
          warrantyServiceVisits: getWarrantyServiceVisitCount(pl, 5),
          warranty: warrantyInfo,
          notes: pl.notes || '',
          workflowStatus: workflow.workflowStatus,
          actionHint: workflow.actionHint,
          activeAssignmentsCount: assignments.filter((a) =>
            ['ASSIGNED', 'IN_PROGRESS'].includes(String(a.status || '').toUpperCase())
          ).length,
          completedAssignmentsCount: assignments.filter(
            (a) => String(a.status || '').toUpperCase() === 'DONE'
          ).length,
          service: {
            history: serviceHistory.history,
            lastServiceDate: serviceHistory.lastServiceDate,
            nextDue: serviceHistory.nextDue,
            dueStatus: serviceHistory.dueStatus,
          },
          amc: amcInfo,
          canCreateAmc,
          assignments,
        };
      })
    );

        res.json({
      id: project.id,
      projectCode: project.project_code || '',
      projectName: project.project_name,
      status: project.status,
      notes: project.notes || '',
      customer: project.Customer
  ? {
      id: project.Customer.id,
      name: project.Customer.name,
    }
  : null,
      site: project.Site
  ? {
      id: project.Site.id,
      name: project.Site.name,
      gps_lat: project.Site.gps_lat,
      gps_lng: project.Site.gps_lng,
    }
  : null,
      lifts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Add a lift to a project (creates lift master if needed)
// NOTE: AMC fields are NOT here (AMC is contract lifecycle, handled in /api/lifts)
app.post('/api/projects/:projectId/lifts', async (req, res) => {
  try {
    const projectId = Number(req.params.projectId);
    const body = req.body || {};

    const liftCode = body.liftCode || body.lift_code;
    const location = body.location || body.location_label;
    const passengerCapacity = body.passengerCapacity ?? body.passenger_capacity;
    const liftType = body.liftType ?? body.lift_type;
    const numberOfFloors = body.numberOfFloors ?? body.number_of_floors;
    const warrantyMonths = body.warrantyMonths ?? body.warranty_months;
    const warrantyServiceVisits = body.warrantyServiceVisits ?? body.warranty_service_visits;
    const notes = body.notes;

    if (!liftCode || !String(liftCode).trim()) {
      return res.status(400).json({ error: 'Lift Code is required' });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const code = String(liftCode).trim();

    // prevent duplicate lift code within this project
    const existing = await ProjectLift.findOne({
      where: {
        project_id: project.id,
        lift_code: code,
      },
    });

    if (existing) {
      return res.status(409).json({ error: 'This lift code already exists in the project.' });
    }

    const pl = await ProjectLift.create({
      project_id: project.id,
      lift_id: null, // intentionally not using Lift master table for now
      lift_code: code,
      location_label: location ? String(location).trim() : null,
      passenger_capacity: Number.isFinite(Number(passengerCapacity)) ? Number(passengerCapacity) : null,
      lift_type: liftType ? String(liftType).trim().toUpperCase() : null,
      number_of_floors: Number.isFinite(Number(numberOfFloors)) ? Number(numberOfFloors) : null,
      warranty_months: Number.isFinite(Number(warrantyMonths)) ? Number(warrantyMonths) : 12,
      warranty_service_visits: Number.isFinite(Number(warrantyServiceVisits)) ? Number(warrantyServiceVisits) : 5,
      notes: notes ? String(notes).trim() : null,
    });

    res.json({
      id: pl.id,
      projectId: project.id,
      liftId: pl.lift_id,
      liftCode: pl.lift_code,
      location: pl.location_label || '',
      passengerCapacity: pl.passenger_capacity ?? null,
      liftType: pl.lift_type ?? null,
      numberOfFloors: pl.number_of_floors ?? null,
      warrantyMonths: pl.warranty_months,
      warrantyServiceVisits: pl.warranty_service_visits ?? 5,
      notes: pl.notes || '',
    });
  } catch (err) {
    console.error('POST /api/projects/:projectId/lifts error:', err);
    res.status(500).json({ error: err.message || 'Failed to add lift to project' });
  }
});

// Update milestones (installation/testing/handover). On handover, auto-create WARRANTY contract.
app.put('/api/project-lifts/:projectLiftId/milestones', async (req, res) => {
  try {
    const id = Number(req.params.projectLiftId);
    const pl = await ProjectLift.findByPk(id);
    if (!pl) return res.status(404).json({ error: 'Project lift not found' });

    const body = req.body || {};

    const fields = {
      installation_start_date: body.installationStartDate || null,
      installation_end_date: body.installationEndDate || null,
      testing_start_date: body.testingStartDate || null,
      testing_end_date: body.testingEndDate || null,

      handover_date: body.handoverDate || null,

      warranty_months: Number.isFinite(Number(body.warrantyMonths))
        ? Number(body.warrantyMonths)
        : (pl.warranty_months ?? pl.warrantyMonths ?? 12),

      warrantyServiceVisits: Number.isFinite(Number(body.warrantyServiceVisits))
        ? Number(body.warrantyServiceVisits)
        : (pl.warrantyServiceVisits ?? pl.warranty_service_visits ?? 5),

      notes: body.notes != null ? String(body.notes) : pl.notes,
    };

    await pl.update(fields);
    await pl.reload();

    res.json({
      id: pl.id,
      liftId: pl.lift_id,
      liftCode: pl.lift_code,
      installationStartDate: pl.installation_start_date,
      installationEndDate: pl.installation_end_date,
      testingStartDate: pl.testing_start_date,
      testingEndDate: pl.testing_end_date,
      handoverDate: pl.handover_date,
      handoverActualDate: pl.handover_actual_date,
      warrantyMonths: pl.warranty_months ?? pl.warrantyMonths ?? 12,
      warrantyStartDate: pl.warranty_start_date,
      warrantyEndDate: pl.warranty_end_date,
      warrantyServiceVisits: pl.warrantyServiceVisits ?? pl.warranty_service_visits ?? 5,
      notes: pl.notes || '',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/project-lifts/:projectLiftId/auto-warranty-job', async (req, res) => {
  try {
    const projectLiftId = Number(req.params.projectLiftId);
    const { notes } = req.body || {};

    const pl = await ProjectLift.findByPk(projectLiftId, {
  include: [
    
    {
      model: ProjectLiftAssignment,
      as: 'assignments',
      include: [{ model: Technician, attributes: ['id', 'name', 'phone', 'role', 'skills', 'isActive'] }],
    },
  ],
});

    if (!pl) return res.status(404).json({ error: 'Project lift not found' });

    const rawAssignments = Array.isArray(pl.assignments) ? pl.assignments : [];
    const warrantyInfo = buildWarrantyInfo(pl, rawAssignments, startOfDay(new Date()));

    if (warrantyInfo.status !== 'WARRANTY ACTIVE') {
      return res.status(400).json({ error: 'Warranty is not active for this lift' });
    }

    if (!warrantyInfo.nextServiceDue) {
      return res.status(400).json({ error: 'No next warranty visit could be calculated' });
    }

    if (!warrantyInfo.isDueNow) {
      return res.status(400).json({ error: 'Warranty service is not yet due for job creation' });
    }

    if (warrantyInfo.activeServiceAssignment) {
      return res.status(409).json({ error: 'Active WARRANTY SERVICE job already exists for this lift' });
    }

    const pair = await pickBestServicePair(warrantyInfo.nextServiceDue);
    if (!pair) {
      return res.status(400).json({ error: 'No valid 2-member service pair is available' });
    }

    const { assignment: a, checklistSummary } = await createServiceAssignmentWithPair({
      projectLiftId: pl.id,
      role: 'WARRANTY SERVICE',
      dueDate: warrantyInfo.nextServiceDue,
      notes: notes
        ? String(notes).trim()
        : `Auto-created warranty visit ${warrantyInfo.nextVisitNumber || ''}`.trim(),
      pair,
    });

    res.json({
      id: a.id,
      role: 'WARRANTY SERVICE',
      status: a.status,
      dueDate: a.due_date,
      nextVisitNumber: warrantyInfo.nextVisitNumber,
      createJobFromDate: warrantyInfo.createJobFromDate,
      pair: {
        pairKey: pair.pairKey,
        sourceRole: pair.sourceRole,
        lead: {
          id: pair.leadTechnician.id,
          name: pair.leadTechnician.name,
          phone: pair.leadTechnician.phone,
          role: pair.leadTechnician.role,
          skills: pair.leadTechnician.skills || '',
        },
        support: {
          id: pair.supportTechnician.id,
          name: pair.supportTechnician.name,
          phone: pair.supportTechnician.phone,
          role: pair.supportTechnician.role,
          skills: pair.supportTechnician.skills || '',
        },
      },
      checklistSummary,
    });
  } catch (err) {
    console.error('POST /api/project-lifts/:projectLiftId/auto-warranty-job error:', err);
    res.status(500).json({ error: err.message || 'Failed to auto-create warranty service job' });
  }
});

// Create or update AMC for a project lift after warranty
app.post('/api/project-lifts/:projectLiftId/amc', async (req, res) => {
  try {
    const projectLiftId = Number(req.params.projectLiftId);
    const {
  amcType,
  startDate,
  durationMonths,
  serviceIntervalDays,
  serviceVisitCount,
  billingCycle,
  contractValue,
  amcNotes,
} = req.body || {};

    const pl = await ProjectLift.findByPk(projectLiftId);
    if (!pl) return res.status(404).json({ error: 'Project lift not found' });
    if (!pl.lift_id) return res.status(400).json({ error: 'Project lift is not linked to a lift record' });
    if (!pl.handover_date || !pl.warranty_end_date) return res.status(400).json({ error: 'Handover and warranty must be completed before AMC creation' });

    const start = parseDateOnly(startDate || pl.warranty_end_date);
    if (!start) return res.status(400).json({ error: 'Valid AMC start date is required' });

    const months = Number(durationMonths || 12);
    const interval = Number(serviceIntervalDays || 90);
    if (!Number.isFinite(months) || months <= 0) return res.status(400).json({ error: 'Duration months must be greater than zero' });
    if (!Number.isFinite(interval) || interval <= 0) return res.status(400).json({ error: 'Service interval days must be greater than zero' });

    const end = addMonths(start, months);
    const [contract, created] = await Contract.findOrCreate({
      where: { liftId: pl.lift_id, contractType: 'AMC' },
      defaults: {
        liftId: pl.lift_id,
        contractType: 'AMC',
        status: 'ACTIVE',
        startDate: formatDateOnly(start),
        endDate: formatDateOnly(end),
        amcType: String(amcType || 'LABOUR_ONLY').toUpperCase(),
        billingCycle: billingCycle ? String(billingCycle).toUpperCase() : 'ANNUAL',
        contractValue: normalizeCost(contractValue) ?? 0,
        serviceIntervalDays: interval,
        amcNotes: amcNotes ? String(amcNotes) : null,
service_visit_count: Number.isFinite(Number(serviceVisitCount)) ? Number(serviceVisitCount) : 5,
        remarks: `Created from Project Lift ${projectLiftId}`,
      },
    });

    if (!created) {
      await contract.update({
        status: 'ACTIVE',
        startDate: formatDateOnly(start),
        endDate: formatDateOnly(end),
        amcType: String(amcType || contract.amcType || 'LABOUR_ONLY').toUpperCase(),
        billingCycle: billingCycle ? String(billingCycle).toUpperCase() : (contract.billingCycle || 'ANNUAL'),
        contractValue: contractValue !== undefined ? (normalizeCost(contractValue) ?? 0) : (contract.contractValue ?? 0),
        serviceIntervalDays: interval,
        amcNotes: amcNotes !== undefined ? (amcNotes ? String(amcNotes) : null) : contract.amcNotes,
        remarks: `Updated from Project Lift ${projectLiftId}`,
service_visit_count: Number.isFinite(Number(serviceVisitCount))
  ? Number(serviceVisitCount)
  : (contract.service_visit_count ?? 5),
      });
    }

    const fresh = created ? contract : await Contract.findByPk(contract.id);
    const amcInfo = buildAmcInfo(fresh);
    res.json({
      ok: true,
      contractId: fresh.id,
      amc: amcInfo,
      created,
    });
  } catch (err) {
    console.error('POST /api/project-lifts/:projectLiftId/amc error:', err);
    res.status(500).json({ error: err.message || 'Failed to create AMC' });
  }
});

app.get('/api/dashboard/team-load', async (req, res) => {
  try {
    const rows = await buildTeamLoadRows();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/technicians/:id/jobs', async (req, res) => {
  try {
    const technicianId = Number(req.params.id);

    const jobs = await ProjectLiftAssignment.findAll({
  where: {
    status: ['ASSIGNED', 'IN_PROGRESS']
  },
  include: [
    {
      model: JobTechnician,
      where: { technicianId }, // ✅ THIS IS THE FIX
      required: true,
    },
    {
      model: ProjectLift,
      include: [
        
        { model: Project, attributes: ['project_name', 'project_code'] }
      ]
    }
  ],
  order: [['due_date', 'ASC']]
});

    res.json(
      jobs.map((j) => ({
        id: j.id,
        role: j.assignment_role,
        status: j.status,
        dueDate: j.due_date,
        liftCode: j.ProjectLift?.Lift?.liftCode || '',
        projectName: j.ProjectLift?.Project?.project_name || '',
        projectCode: j.ProjectLift?.Project?.project_code || '',
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/jobs/:id/reassign-options', async (req, res) => {
  try {
    const jobId = Number(req.params.id);

    const job = await ProjectLiftAssignment.findByPk(jobId, {
      include: [
        {
          model: JobTechnician,
          include: [
            {
              model: Technician,
              attributes: ['id', 'name', 'phone', 'role', 'skills', 'isActive'],
            },
          ],
        },
      ],
    });

    if (!job) return res.status(404).json({ error: 'Job not found' });

    const role = String(job.assignment_role || '').toUpperCase();
    const loads = await buildTeamLoadRows();

    const currentTeamIds = new Set(
      Array.isArray(job.ProjectLiftJobTechnicians)
        ? job.ProjectLiftJobTechnicians.map((m) => Number(m.technicianId))
        : [Number(job.technician_id || 0)]
    );

    const techs = await Technician.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });

    const suggestions = techs
      .filter((t) => technicianHasRequiredSkill(t, role))
      .map((t) => {
        const load = loads.find((x) => Number(x.technicianId) === Number(t.id)) || {};

        return {
          id: t.id,
          name: t.name || '',
          skills: t.skills || '',
          currentTeam: currentTeamIds.has(Number(t.id)),
          totalJobs: load.totalJobs || 0,
          assignedJobs: load.assignedJobs || 0,
          inProgressJobs: load.inProgressJobs || 0,
          overdue: load.overdue || 0,
          loadScore: load.loadScore || 0,
        };
      })
      .sort((a, b) => {
        if (a.currentTeam !== b.currentTeam) return a.currentTeam ? 1 : -1;
        return a.loadScore - b.loadScore;
      });

    res.json({
      jobId,
      role,
      suggestions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jobs/:id/reassign', async (req, res) => {
  try {
    const jobId = Number(req.params.id);
    const { technicianId } = req.body;

    const job = await ProjectLiftAssignment.findByPk(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // 🔥 update lead technician
    await job.update({ technician_id: technicianId });

    // 🔥 reset team
    await JobTechnician.destroy({ where: { assignmentId: jobId } });

    await JobTechnician.create({
      assignmentId: jobId,
      technicianId,
      teamRole: 'LEAD'
    });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/project-lifts/:projectLiftId/complete-handover', async (req, res) => {
  try {
    const id = Number(req.params.projectLiftId);
    const pl = await ProjectLift.findByPk(id);
    if (!pl) return res.status(404).json({ error: 'Project lift not found' });

    const body = req.body || {};
    const actualHandoverDate = body.actualHandoverDate || null;
    const notes = body.notes != null ? String(body.notes) : pl.notes;

    if (!actualHandoverDate) {
      return res.status(400).json({ error: 'Actual handover date is required' });
    }

    const warrantyMonths = Number.isFinite(Number(body.warrantyMonths))
      ? Number(body.warrantyMonths)
      : (pl.warranty_months || 12);

    const warrantyStartDate = actualHandoverDate;
    const end = addMonths(actualHandoverDate, warrantyMonths);
    const warrantyEndDate = end ? startOfDay(end) : null;

const warrantyServiceVisits = Number.isFinite(Number(body.warrantyServiceVisits))
  ? Number(body.warrantyServiceVisits)
  : (pl.warranty_service_visits ?? 5);

    await pl.update({
      handover_actual_date: actualHandoverDate,
      warranty_months: warrantyMonths,
      warranty_start_date: warrantyStartDate,
      warranty_end_date: warrantyEndDate,
warranty_service_visits: warrantyServiceVisits,
      notes,
    });

    if (pl.lift_id && warrantyStartDate && warrantyEndDate) {
      const [w, created] = await Contract.findOrCreate({
        where: { liftId: pl.lift_id, contractType: 'WARRANTY' },
        defaults: {
          liftId: pl.lift_id,
          contractType: 'WARRANTY',
          startDate: warrantyStartDate,
          endDate: warrantyEndDate,
          status: 'ACTIVE',
          remarks: 'Auto-created from actual handover date',
        },
      });

      if (!created) {
        await w.update({
          startDate: warrantyStartDate,
          endDate: warrantyEndDate,
          status: 'ACTIVE',
          remarks: 'Updated from actual handover date',
        });
      }
    }

    res.json({
      ok: true,
      id: pl.id,
      liftId: pl.lift_id,
      liftCode: pl.lift_code,
      handoverDate: pl.handover_date,
      handoverActualDate: pl.handover_actual_date,
      warrantyMonths: pl.warranty_months,
      warrantyStartDate: pl.warranty_start_date,
      warrantyEndDate: pl.warranty_end_date,
warrantyServiceVisits: pl.warranty_service_visits ?? 5,
      notes: pl.notes || '',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Assign AMC service visit to a technician using the existing jobs/assignments engine
app.post('/api/project-lifts/:projectLiftId/amc-service-assign', async (req, res) => {
  try {
    const projectLiftId = Number(req.params.projectLiftId);
    const { leadTechnicianId, supportTechnicianId, dueDate, notes } = req.body || {};

    const pl = await ProjectLift.findByPk(projectLiftId, {
      include: [
        
        {
          model: ProjectLiftAssignment,
          as: 'assignments',
          include: [{ model: Technician, attributes: ['id', 'name', 'phone', 'role', 'skills', 'isActive'] }],
        },
      ],
    });

    if (!pl) return res.status(404).json({ error: 'Project lift not found' });

const resolvedLiftId = Number(pl.lift_id || pl.liftId || 0);
if (!resolvedLiftId) {
  return res.status(400).json({ error: 'Project lift is not linked to a lift record' });
}

const contract = await Contract.findOne({
  where: { liftId: resolvedLiftId, contractType: 'AMC', status: 'ACTIVE' },
});
    if (!contract) return res.status(400).json({ error: 'No active AMC exists for this lift' });

    const rawAssignments = Array.isArray(pl.assignments) ? pl.assignments : [];

    const existing = rawAssignments.find((a) =>
      isAmcServiceAssignment(a) && isAssignmentActive(a)
    );

    if (existing) {
      return res.status(409).json({
        error: 'An active AMC service assignment already exists for this lift',
        assignment: {
          id: existing.id,
          role: 'AMC SERVICE',
          status: existing.status,
          dueDate: existing.due_date,
        },
      });
    }

    const amcInfo = buildAmcInfo(contract, startOfDay(new Date()), {
      assignments: rawAssignments,
      activeServiceAssignment: null,
    });

    const scheduledDueDate = dueDate || amcInfo.nextServiceDue || formatDateOnly(new Date());

    let pair = null;

    // Supervisor-selected pair override
    if (leadTechnicianId && supportTechnicianId) {
      const lead = await Technician.findByPk(Number(leadTechnicianId));
      const support = await Technician.findByPk(Number(supportTechnicianId));

      if (!lead || !support) {
        return res.status(404).json({ error: 'Selected lead/support technician not found' });
      }

      if (!technicianCanDoService(lead) || !technicianCanDoService(support)) {
        return res.status(400).json({ error: 'Selected technicians must both have SERVICE capability' });
      }

      pair = {
        pairKey: makePairKey(lead.id, support.id),
        sourceRole: 'MANUAL',
        status: 'SELECTED',
        leadTechnicianId: Number(lead.id),
        supportTechnicianId: Number(support.id),
        leadTechnician: lead,
        supportTechnician: support,
        assignedAt: null,
        _rank: 0,
      };
    } else {
      // Default automatic pair selection
      pair = await pickBestServicePair(scheduledDueDate);
      if (!pair) {
        return res.status(400).json({ error: 'No valid 2-member service pair is available' });
      }
    }

    const assignmentNotes = notes
      ? String(notes).trim()
      : `Scheduled AMC visit ${amcInfo.nextVisitNumber || ''}`.trim();

    const { assignment: a, checklistSummary } = await createServiceAssignmentWithPair({
      projectLiftId: pl.id,
      role: 'AMC SERVICE',
      dueDate: scheduledDueDate,
      notes: assignmentNotes,
      pair,
    });

    res.json({
      id: a.id,
      role: 'AMC SERVICE',
      status: a.status,
      dueDate: a.due_date,
      nextVisitNumber: amcInfo.nextVisitNumber,
      technicianMode: (leadTechnicianId && supportTechnicianId) ? 'MANUAL_PAIR' : 'AUTO_PAIR',
      pair: {
        pairKey: pair.pairKey,
        sourceRole: pair.sourceRole,
        lead: {
          id: pair.leadTechnician.id,
          name: pair.leadTechnician.name,
          phone: pair.leadTechnician.phone,
          role: pair.leadTechnician.role,
          skills: pair.leadTechnician.skills || '',
        },
        support: {
          id: pair.supportTechnician.id,
          name: pair.supportTechnician.name,
          phone: pair.supportTechnician.phone,
          role: pair.supportTechnician.role,
          skills: pair.supportTechnician.skills || '',
        },
      },
      checklistSummary,
    });
  } catch (err) {
    console.error('POST /api/project-lifts/:projectLiftId/amc-service-assign error:', err);
    res.status(500).json({ error: err.message || 'Failed to assign AMC service' });
  }
});

// Assign technician to a project lift
function parseSkillsServer(skills) {
  return String(skills || '')
    .split(',')
    .map((x) => x.trim().toUpperCase())
    .filter(Boolean);
}

function getRequiredSkillForAssignmentRole(role) {
  const r = String(role || '').toUpperCase();
  if (r === 'INSTALL') return 'INSTALL';
  if (r === 'TEST') return 'TEST';
  if (r === 'AMC SERVICE') return 'SERVICE';
  if (r === 'WARRANTY SERVICE') return 'SERVICE';
  return '';
}

function technicianHasRequiredSkill(tech, role) {
  const required = getRequiredSkillForAssignmentRole(role);
  if (!required) return true;
  return parseSkillsServer(tech?.skills).includes(required);
}

app.post('/api/project-lifts/:projectLiftId/assign', async (req, res) => {
  try {
    const projectLiftId = Number(req.params.projectLiftId);
    const { technicianId, leadTechnicianId, role, notes, dueDate } = req.body || {};
    const leadId = Number(leadTechnicianId || technicianId || 0);
    if (!leadId) return res.status(400).json({ error: 'leadTechnicianId is required' });

    const r = String(role || 'INSTALL').toUpperCase();
    if (!['INSTALL', 'TEST', 'AMC SERVICE'].includes(r)) {
      return res.status(400).json({ error: 'role must be INSTALL, TEST, or AMC SERVICE' });
    }

    const pl = await ProjectLift.findByPk(projectLiftId);
    if (!pl) return res.status(404).json({ error: 'Project lift not found' });

    const tech = await Technician.findByPk(leadId);
    if (!tech) return res.status(404).json({ error: 'Lead technician not found' });

    const requiredSkill = getRequiredSkillForAssignmentRole(r);
    if (!technicianHasRequiredSkill(tech, r)) {
      return res.status(400).json({
        error: `Selected technician does not have required ${requiredSkill} skill for ${r}`,
      });
    }

    const openStatuses = ['ASSIGNED', 'IN_PROGRESS'];
    const existing = await ProjectLiftAssignment.findOne({
      where: { project_lift_id: pl.id, assignment_role: r, status: openStatuses },
      order: [['id', 'DESC']],
    });

    if (existing) {
      return res.status(409).json({ error: `${r} already has an active job on this lift. Complete or cancel it first.` });
    }

    const a = await ProjectLiftAssignment.create({
  project_lift_id: pl.id,
  technician_id: tech.id,
  assignment_role: String(r || '').trim(),
  due_date: dueDate || null,
  status: 'ASSIGNED',
  notes: notes ? String(notes).trim() : null,
  assigned_at: new Date(),
});

    await JobTechnician.findOrCreate({
      where: { assignmentId: a.id, technicianId: tech.id },
      defaults: { assignmentId: a.id, technicianId: tech.id, teamRole: 'LEAD', notes: null },
    });

    await ensureChecklistForAssignment(a);
    const checklistSummary = await getChecklistSummary(a.id);

    const summary = summarizeJobTeam(
      { ...a.toJSON(), Technician: tech },
      [{
        technician: {
          id: tech.id,
          name: tech.name,
          phone: tech.phone,
          role: tech.role,
          skills: tech.skills || '',
        },
        technicianId: tech.id,
        teamRole: 'LEAD'
      }]
    );

    res.json({
      id: a.id,
      role: isAmcServiceAssignment(a) ? 'AMC SERVICE' : a.assignment_role,
      technician: {
        id: tech.id,
        name: tech.name,
        phone: tech.phone,
        role: tech.role,
        skills: tech.skills || '',
      },
      leadTechnician: summary.lead ? summary.lead.technician : null,
      supportTechnicians: [],
      team: summary.team,
      status: a.status,
      dueDate: a.due_date,
      assignedAt: a.assigned_at,
      startedAt: a.started_at,
      completedAt: a.completed_at,
      checklistSummary,
      checklistLocked: checklistSummary.totalRequired > 0 && checklistSummary.doneRequired < checklistSummary.totalRequired,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const a = await ProjectLiftAssignment.findByPk(id, {
      include: [
        { model: Technician, attributes: ['id', 'name', 'phone', 'role'] },
        {
          model: ProjectLift,
          include: [
            { model: Project, attributes: ['id', 'project_name', 'project_code', 'status'] },
            
          ],
        },
      ],
    });

    if (!a) return res.status(404).json({ error: 'Job not found' });

    const teamMap = await buildJobTeamMap([a.id]);
    const summary = summarizeJobTeam(a, teamMap.get(Number(a.id)) || []);

    await ensureChecklistForAssignment(a);
    const checklistSummary = await getChecklistSummary(a.id);

    res.json({
      id: a.id,
      status: a.status,
      role: isAmcServiceAssignment(a) ? 'AMC SERVICE' : a.assignment_role,
      dueDate: a.due_date,
      notes: a.notes || '',

      leadTechnician: summary.lead?.technician
        ? {
            id: summary.lead.technician.id,
            name: summary.lead.technician.name,
            phone: summary.lead.technician.phone,
            role: summary.lead.technician.role,
          }
        : a.Technician
        ? {
            id: a.Technician.id,
            name: a.Technician.name,
            phone: a.Technician.phone,
            role: a.Technician.role,
          }
        : null,

      supportTechnicians: summary.supports
        .map((m) => m.technician)
        .filter(Boolean)
        .map((t) => ({
          id: t.id,
          name: t.name,
          phone: t.phone,
          role: t.role,
        })),

      team: Array.isArray(summary.team)
        ? summary.team.map((m) => ({
            id: m.id ?? null,
            technicianId: m.technicianId ?? null,
            teamRole: String(m.teamRole || '').toUpperCase(),
            assignedAt: m.assignedAt || null,
            startedAt: m.startedAt || null,
            completedAt: m.completedAt || null,
            notes: m.notes || '',
            isFallbackLead: !!m.isFallbackLead,
            technician: m.technician
              ? {
                  id: m.technician.id,
                  name: m.technician.name,
                  phone: m.technician.phone,
                  role: m.technician.role,
                }
              : null,
          }))
        : [],

      project: a.ProjectLift?.Project
        ? {
            id: a.ProjectLift.Project.id,
            projectName: a.ProjectLift.Project.project_name,
            projectCode: a.ProjectLift.Project.project_code || '',
            status: a.ProjectLift.Project.status,
          }
        : null,

      lift: {
        id: a.ProjectLift?.lift_id || null,
        liftCode: a.ProjectLift?.lift_code || a.ProjectLift?.Lift?.liftCode || '',
        location: a.ProjectLift?.location_label || a.ProjectLift?.Lift?.location || '',
        status: a.ProjectLift?.Lift?.status || '',
      },

      checklistSummary,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tech/assignments/:id/checklist', authTech, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const a = await ProjectLiftAssignment.findByPk(id);
    if (!a) return res.status(404).json({ error: 'Assignment not found' });

    const member = await JobTechnician.findOne({
      where: { assignmentId: id, technicianId: req.tech.id }
    });

    const isLegacyDirectTech = Number(a.technician_id) === Number(req.tech.id);
    if (!member && !isLegacyDirectTech) {
      return res.status(403).json({ error: 'Not your assignment' });
    }
const myTeamRole =
  member
    ? String(member.teamRole || '').toUpperCase()
    : (isLegacyDirectTech ? 'LEAD' : null);
    
await ensureChecklistForAssignment(a);

    const items = await AssignmentChecklistItem.findAll({
      where: { assignmentId: id },
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });

    const notes = await AssignmentChecklistNote.findAll({
      where: { assignmentId: id },
      include: [{ model: Technician, attributes: ['id', 'name', 'phone', 'role'] }],
      order: [['id', 'DESC']],
    });

    const summary = await getChecklistSummary(id);

    res.json({
  assignmentId: id,
  myTeamRole,

  supervisorStatus: a.supervisor_status || 'PENDING',
  supervisorRemarks: a.supervisor_remarks || '',

  items: items.map((x) => ({
    id: x.id,
    sortOrder: x.sortOrder,
    itemText: x.itemText,
    isRequired: x.isRequired,
    itemType: x.itemType,
    isDone: x.isDone,
    textValue: x.textValue,
    numberValue: x.numberValue,
    doneByTechnicianId: x.doneByTechnicianId,
    doneAt: x.doneAt,
  })),

  notes: notes.map((n) => ({
    id: n.id,
    noteText: n.noteText,
    createdAt: n.createdAt,
    technician: n.Technician ? {
      id: n.Technician.id,
      name: n.Technician.name,
      phone: n.Technician.phone,
      role: n.Technician.role,
    } : null,
  })),

  summary,
});
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      error: err.message,
      ...(err.payload || {}),
    });
  }
});

app.put('/api/tech/assignments/:jobId/checklist/:itemId', authTech, async (req, res) => {
  try {
    const jobId = Number(req.params.jobId);
    const itemId = Number(req.params.itemId);

    const a = await ProjectLiftAssignment.findByPk(jobId);
    if (!a) return res.status(404).json({ error: 'Assignment not found' });

    const member = await JobTechnician.findOne({
  where: { assignmentId: jobId, technicianId: req.tech.id }
});

const isLegacyDirectTech = Number(a.technician_id) === Number(req.tech.id);
if (!member && !isLegacyDirectTech) {
  return res.status(403).json({ error: 'Not your assignment' });
}

// ✅ NEW: restrict to LEAD only
const isLead =
  (member && String(member.teamRole || '').toUpperCase() === 'LEAD') ||
  (!member && isLegacyDirectTech);

if (!isLead) {
  return res.status(403).json({ error: 'Only the lead technician can update checklist items' });
}

    const item = await AssignmentChecklistItem.findOne({
      where: { id: itemId, assignmentId: jobId }
    });
    if (!item) return res.status(404).json({ error: 'Checklist item not found' });

    const body = req.body || {};
    const patch = {};

    if (item.itemType === 'BOOLEAN') {
      patch.isDone = !!body.isDone;
      if (!patch.isDone) {
        patch.textValue = null;
        patch.numberValue = null;
      }
    } else if (item.itemType === 'TEXT') {
      patch.textValue = String(body.textValue || '').trim() || null;
      patch.isDone = !!patch.textValue;
    } else if (item.itemType === 'NUMBER') {
      const v = body.numberValue === '' || body.numberValue == null ? null : Number(body.numberValue);
      patch.numberValue = Number.isFinite(v) ? v : null;
      patch.isDone = patch.numberValue != null;
    } else {
      patch.isDone = !!body.isDone;
    }

    patch.doneByTechnicianId = patch.isDone ? req.tech.id : null;
    patch.doneAt = patch.isDone ? new Date() : null;
    patch.updatedAt = new Date();

    await item.update(patch);
// 🔥 CLEAR resubmission requirement after lead makes changes
await ProjectLiftAssignment.update(
  { resubmission_required: false },
  { where: { id: jobId } }
);
    const summary = await getChecklistSummary(jobId);

    res.json({ ok: true, summary });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      error: err.message,
      ...(err.payload || {}),
    });
  }
});

app.post('/api/tech/assignments/:jobId/checklist-notes', authTech, async (req, res) => {
  try {
    const jobId = Number(req.params.jobId);
    const noteText = String(req.body?.noteText || '').trim();
    if (!noteText) return res.status(400).json({ error: 'noteText is required' });

    const a = await ProjectLiftAssignment.findByPk(jobId);
    if (!a) return res.status(404).json({ error: 'Assignment not found' });

    const member = await JobTechnician.findOne({
      where: { assignmentId: jobId, technicianId: req.tech.id }
    });

    const isLegacyDirectTech = Number(a.technician_id) === Number(req.tech.id);
    if (!member && !isLegacyDirectTech) {
      return res.status(403).json({ error: 'Not your assignment' });
    }

    await AssignmentChecklistNote.create({
      assignmentId: jobId,
      technicianId: req.tech.id,
      noteText,
    });

// 🔥 ADD THIS BLOCK HERE
    await ProjectLiftAssignment.update(
      { resubmission_required: false },
      { where: { id: jobId } }
    );

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      error: err.message,
      ...(err.payload || {}),
    });
  }
});

app.post('/api/jobs/:jobId/team', async (req, res) => {
  try {
    const jobId = Number(req.params.jobId);
    const { technicianId, teamRole, notes } = req.body || {};

    if (!jobId || !technicianId || !teamRole) {
      return res.status(400).json({ error: 'jobId, technicianId and teamRole are required' });
    }

    const role = String(teamRole || '').toUpperCase();
    if (!['LEAD', 'SUPPORT'].includes(role)) {
      return res.status(400).json({ error: 'teamRole must be LEAD or SUPPORT' });
    }

    const job = await ProjectLiftAssignment.findByPk(jobId, {
      include: [{ model: Technician, attributes: ['id', 'name', 'phone', 'role'] }],
    });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const tech = await Technician.findByPk(Number(technicianId));
    if (!tech) {
      return res.status(404).json({ error: 'Technician not found' });
    }

    // sync legacy lead into JobTechnician if needed
    if (job.technician_id) {
      const legacyLead = await JobTechnician.findOne({
        where: {
          assignmentId: jobId,
          technicianId: Number(job.technician_id),
        },
      });

      if (!legacyLead) {
        await JobTechnician.create({
          assignmentId: jobId,
          technicianId: Number(job.technician_id),
          teamRole: 'LEAD',
          notes: null,
        });
      }
    }

    const existing = await JobTechnician.findOne({
      where: {
        assignmentId: jobId,
        technicianId: Number(technicianId),
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Technician already assigned' });
    }

    if (role === 'LEAD') {
      await JobTechnician.update(
        { teamRole: 'SUPPORT' },
        { where: { assignmentId: jobId, teamRole: 'LEAD' } }
      );
    }

    const member = await JobTechnician.create({
      assignmentId: jobId,
      technicianId: Number(technicianId),
      teamRole: role,
      notes: notes || null,
    });

    return res.json({ ok: true, member });
  } catch (e) {
    console.error('ADD TEAM ERROR:', e);
    return res.status(500).json({ error: e.message || 'Failed to add team member' });
  }
});

app.put('/api/tech/assignments/:id/status', authTech, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    const s = String(status || '').toUpperCase();

    if (!['ASSIGNED', 'IN_PROGRESS', 'DONE', 'CANCELLED'].includes(s)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const a = await ProjectLiftAssignment.findByPk(id);
    if (!a) return res.status(404).json({ error: 'Assignment not found' });

    const now = new Date();
    const update = { status: s };

    if (s === 'IN_PROGRESS' && !a.started_at) {
      update.started_at = now;
    }

    if (s === 'DONE') {
      await ensureChecklistForAssignment(a);
      await assertChecklistCompleteOrThrow(a.id);
      await assertServiceReportCompleteOrThrow(a);

      if (!a.started_at) {
        update.started_at = now;
      }

      update.completed_at = now;
      update.supervisor_status = 'PENDING';
      update.supervisor_approved_at = null;
    }

    if (s === 'CANCELLED') {
      update.completed_at = now;
    }

    await a.update(update);

    const pl = await ProjectLift.findByPk(a.project_lift_id);
    if (pl) {
      const role = String(a.assignment_role || '').toUpperCase();

      if (role === 'INSTALL') {
        if (s === 'IN_PROGRESS' && !pl.installation_actual_start_date) {
          await pl.update({ installation_actual_start_date: now });
        }
        if (s === 'DONE') {
          await pl.update({ installation_actual_end_date: now });
        }
      }

      if (role === 'TEST') {
        if (s === 'IN_PROGRESS' && !pl.testing_actual_start_date) {
          await pl.update({ testing_actual_start_date: now });
        }
        if (s === 'DONE') {
          await pl.update({ testing_actual_end_date: now });
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      error: err.message,
      ...(err.payload || {}),
    });
  }
});

app.put('/api/tech/assignments/:id/status', authTech, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    const s = String(status || '').toUpperCase();

    if (!['ASSIGNED', 'IN_PROGRESS', 'DONE', 'CANCELLED'].includes(s)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const a = await ProjectLiftAssignment.findByPk(id);
    if (!a) return res.status(404).json({ error: 'Assignment not found' });

    const now = new Date();
    const update = { status: s };

    if (s === 'IN_PROGRESS' && !a.started_at) {
      update.started_at = now;
    }

    if (s === 'DONE') {
      await ensureChecklistForAssignment(a);
      await assertChecklistCompleteOrThrow(a.id);
      await assertServiceReportCompleteOrThrow(a);

      if (!a.started_at) {
        update.started_at = now;
      }

      update.completed_at = now;
      update.supervisor_status = 'PENDING';
      update.supervisor_approved_at = null;
    }

    if (s === 'CANCELLED') {
      update.completed_at = now;
    }

    await a.update(update);

    const pl = await ProjectLift.findByPk(a.project_lift_id);
    if (pl) {
      const role = String(a.assignment_role || '').toUpperCase();

      if (role === 'INSTALL') {
        if (s === 'IN_PROGRESS' && !pl.installation_actual_start_date) {
          await pl.update({ installation_actual_start_date: now });
        }
        if (s === 'DONE') {
          await pl.update({ installation_actual_end_date: now });
        }
      }

      if (role === 'TEST') {
        if (s === 'IN_PROGRESS' && !pl.testing_actual_start_date) {
          await pl.update({ testing_actual_start_date: now });
        }
        if (s === 'DONE') {
          await pl.update({ testing_actual_end_date: now });
        }
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      error: err.message,
      ...(err.payload || {}),
    });
  }
});

app.put('/api/job-team/:id', async (req, res) => {
  // your existing job-team route here
});

app.delete('/api/job-team/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const member = await JobTechnician.findByPk(id);
    if (!member) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    await member.destroy();

    res.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/job-team/:id failed', err);
    res.status(500).json({ error: err.message || 'Failed to remove team member' });
  }
});

// Office: list assignments across all projects (canonical endpoint)
app.get('/api/jobs', async (req, res) => {
  try {
    const status = (req.query.status ? String(req.query.status) : '').toUpperCase();
    const where = {};
    if (status) where.status = status;

    const limit = Math.min(Math.max(Number(req.query.limit || 200), 1), 500);

    const rows = await ProjectLiftAssignment.findAll({
      where,
      include: [
        { model: Technician, attributes: ['id', 'name', 'phone', 'role'] },
        {
          model: ProjectLift,
          include: [
            { model: Project, attributes: ['id', 'project_name', 'project_code', 'status'] },
            
          ],
        },
      ],
      order: [['id', 'DESC']],
      limit,
    });

    const teamMap = await buildJobTeamMap(rows.map((a) => a.id));

    const out = [];
    for (const a of rows) {
      const summary = summarizeJobTeam(a, teamMap.get(Number(a.id)) || []);
      await ensureChecklistForAssignment(a);
      const checklistSummary = await getChecklistSummary(a.id);

      out.push({
        id: a.id,
        status: a.status,
        supervisorStatus: a.supervisor_status,
        supervisorRemarks: a.supervisor_remarks || "",
        resubmissionRequired: !!a.resubmission_required,
        role: isAmcServiceAssignment(a) ? 'AMC SERVICE' : a.assignment_role,
        dueDate: a.due_date,
        assignedAt: a.assigned_at,
        startedAt: a.started_at,
        completedAt: a.completed_at,
        notes: a.notes || '',

        technician: a.Technician
          ? {
              id: a.Technician.id,
              name: a.Technician.name,
              phone: a.Technician.phone,
              role: a.Technician.role,
            }
          : null,

        leadTechnician: summary.lead?.technician
          ? {
              id: summary.lead.technician.id,
              name: summary.lead.technician.name,
              phone: summary.lead.technician.phone,
              role: summary.lead.technician.role,
            }
          : a.Technician
          ? {
              id: a.Technician.id,
              name: a.Technician.name,
              phone: a.Technician.phone,
              role: a.Technician.role,
            }
          : null,

        supportTechnicians: summary.supports
          .map((m) => m.technician)
          .filter(Boolean)
          .map((t) => ({
            id: t.id,
            name: t.name,
            phone: t.phone,
            role: t.role,
          })),

        team: Array.isArray(summary.team)
          ? summary.team.map((m) => ({
              id: m.id ?? null,
              technicianId: m.technicianId ?? null,
              teamRole: String(m.teamRole || '').toUpperCase(),
              assignedAt: m.assignedAt || null,
              startedAt: m.startedAt || null,
              completedAt: m.completedAt || null,
              notes: m.notes || '',
              isFallbackLead: !!m.isFallbackLead,
              technician: m.technician
                ? {
                    id: m.technician.id,
                    name: m.technician.name,
                    phone: m.technician.phone,
                    role: m.technician.role,
                  }
                : null,
            }))
          : [],

        project: a.ProjectLift?.Project
          ? {
              id: a.ProjectLift.Project.id,
              projectName: a.ProjectLift.Project.project_name,
              projectCode: a.ProjectLift.Project.project_code || '',
              status: a.ProjectLift.Project.status,
            }
          : null,

        lift: {
          id: a.ProjectLift?.lift_id || null,
          liftCode: a.ProjectLift?.lift_code || a.ProjectLift?.Lift?.liftCode || '',
          location: a.ProjectLift?.location_label || a.ProjectLift?.Lift?.location || '',
          status: a.ProjectLift?.Lift?.status || '',
        },

        checklistSummary,
      });
    }

    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/supervisor/assignments/:id/approve', async (req, res) => {
  try {
    const id = Number(req.params.id);
    console.log('APPROVE HIT id =', id);

    const a = await ProjectLiftAssignment.findByPk(id);
    if (!a) {
      console.log('APPROVE NOT FOUND id =', id);
      return res.status(404).json({ error: 'Not found' });
    }

    console.log('BEFORE APPROVE', {
      id: a.id,
      status: a.status,
      supervisor_status: a.supervisor_status,
      supervisor_approved_at: a.supervisor_approved_at
    });

    await a.update({
  supervisor_status: 'APPROVED',
  supervisor_approved_at: new Date()
});

// 🔥 ADD THIS LINE
await handleServiceCompletion(a);

await a.reload();

    console.log('AFTER APPROVE', {
      id: a.id,
      status: a.status,
      supervisor_status: a.supervisor_status,
      supervisor_approved_at: a.supervisor_approved_at
    });

    res.json({ success: true, id: a.id, supervisorStatus: a.supervisor_status });
  } catch (e) {
    console.error('APPROVE ERROR', e);
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/supervisor/assignments/:id/reject', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { remarks } = req.body || {};

    const a = await ProjectLiftAssignment.findByPk(id);
    if (!a) return res.status(404).json({ error: 'Not found' });

    await a.update({
      supervisor_status: 'REJECTED',
      supervisor_remarks: remarks || '',
      supervisor_rejected_at: new Date(),
      resubmission_required: true,
      status: 'IN_PROGRESS',
      supervisor_approved_at: null
    });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Alias: some UI versions call /api/assignments
app.get('/api/assignments', async (req, res) => {
  req.url = '/api/jobs';
  return app._router.handle(req, res, () => {});
});

// Office updates assignment status
app.put('/api/assignments/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    const s = String(status || '').toUpperCase();

    if (!['ASSIGNED', 'IN_PROGRESS', 'DONE', 'CANCELLED'].includes(s)) {
      return res.status(400).json({ error: 'status must be ASSIGNED, IN_PROGRESS, DONE, or CANCELLED' });
    }

    const a = await ProjectLiftAssignment.findByPk(id);
    if (!a) return res.status(404).json({ error: 'Assignment not found' });

    const now = new Date();
    const wasCompleted = !!a.completed_at;
    const patch = { status: s };

    if (s === 'IN_PROGRESS' && !a.started_at) {
      patch.started_at = now;
    }

    if (s === 'DONE') {
  await ensureChecklistForAssignment(a);
  await assertChecklistCompleteOrThrow(a.id);

  if (!a.started_at) patch.started_at = now;
  patch.completed_at = now;

  patch.supervisor_status = 'PENDING';   // ✅ ADD THIS
}

    if (s === 'CANCELLED') {
      patch.completed_at = now;
    }

    await a.update(patch);
    
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(err.statusCode || 500).json({
      error: err.message,
      ...(err.payload || {}),
    });
  }
});

// --------------------
// LIFTS
// --------------------

async function findOrCreateCustomerByName(name) {
  const clean = String(name || '').trim();
  if (!clean) return null;
  const [customer] = await Customer.findOrCreate({ where: { name: clean }, defaults: { name: clean } });
  return customer;
}

async function findOrCreateSiteByName(name) {
  const clean = String(name || '').trim();
  if (!clean) return null;
  const [site] = await Site.findOrCreate({ where: { name: clean }, defaults: { name: clean } });
  return site;
}

function pickAmcContract(contracts) {
  if (!Array.isArray(contracts)) return null;

  return contracts
    .filter(c => String(c.contractType || c.contract_type || '').toUpperCase() === 'AMC')
    .sort((a, b) => new Date(b.startDate || b.start_date) - new Date(a.startDate || a.start_date))[0] || null;
}

async function getOrCreateAmcContract(liftId, defaults = {}) {
  let c = await Contract.findOne({ where: { liftId, contractType: 'AMC' } });
  if (c) return c;
  c = await Contract.create({
    liftId,
    contractType: 'AMC',
    status: 'ACTIVE',
    startDate: null,
    endDate: null,
    amcType: defaults.amcType || null,
    billingCycle: defaults.billingCycle || 'ANNUAL',
    contractValue: defaults.contractValue ?? 0,
    serviceIntervalDays: defaults.serviceIntervalDays ?? 30,
    amcNotes: defaults.amcNotes || null,
    remarks: null,
  });
  return c;
}

app.get('/api/lifts', async (req, res) => {
  try {
    const projectLifts = await ProjectLift.findAll({
      include: [
        {
          model: Project,
          attributes: ['id', 'project_name', 'project_code', 'status'],
          include: [
            { model: Customer, attributes: ['id', 'name'] },
            { model: Site, attributes: ['id', 'name'] },
          ],
        },
      ],
      order: [['id', 'ASC']],
    });

    const today = startOfDay(new Date());

    const result = projectLifts.map((pl) => {
      const project = pl.Project || null;

      const warrantyStartDate = pl.warranty_start_date || null;
      const warrantyEndDate = pl.warranty_end_date || null;
      const handoverActualDate = pl.handover_actual_date || null;

      let warrantyStatus = 'NO WARRANTY';
      const warrantyEndOnly = parseDateOnly(warrantyEndDate);

      if (handoverActualDate && warrantyEndOnly) {
        warrantyStatus = today > warrantyEndOnly ? 'WARRANTY EXPIRED' : 'WARRANTY ACTIVE';
      }

      let warrantyDaysRemaining = null;
      if (warrantyStatus === 'WARRANTY ACTIVE' && warrantyEndOnly) {
        warrantyDaysRemaining = Math.max(0, daysBetween(today, warrantyEndOnly));
      }

      return {
        id: pl.id,
        projectLiftId: pl.id,
        projectId: project?.id || null,
        projectCode: project?.project_code || '',
        projectName: project?.project_name || '',
        liftCode: pl.lift_code || '',
        customerName: project?.Customer?.name || '',
        building: project?.Site?.name || '',
        location: pl.location_label || '',
        passengerCapacity: pl.passenger_capacity ?? null,
        liftType: pl.lift_type ?? null,
        numberOfFloors: pl.number_of_floors ?? null,
        status: String(project?.status || 'OPEN').toUpperCase(),

        warrantyStatus,
        warrantyStartDate,
        warrantyEndDate,
        handoverActualDate,
        warrantyDaysRemaining,

        hasAmcContract: false,
        amcType: null,
        amcStartDate: null,
        amcEndDate: null,
        billingCycle: null,
        contractValue: null,
        serviceIntervalDays: null,
        amcNotes: null,
        amcLastServiceDate: null,
        amcNextServiceDue: null,
        amcOverdueDays: 0,
        totalCost: 0,
        amcStatus: 'NO AMC',
        daysToExpiry: null,
      };
    });

    res.json(result);
  } catch (err) {
    console.error('GET /api/lifts error:', err);
    res.status(500).json({ error: err.message || 'Failed to load lifts' });
  }
});

app.post('/api/lifts', async (req, res) => {
  try {
    const { customerName, building, liftCode, location, status, amcType } = req.body;

    if (!customerName || !building || !liftCode) {
      return res.status(400).json({ error: 'Customer Name, Building and Lift Code are required' });
    }

    const customer = await findOrCreateCustomerByName(customerName);
    const site = await findOrCreateSiteByName(building);

    const lift = await Lift.create({
      liftCode: String(liftCode).trim(),
      customerId: customer.id,
      siteId: site.id,
      location: location ? String(location).trim() : null,
      status: (status || 'ACTIVE').toUpperCase(),
    });

    await getOrCreateAmcContract(lift.id, { amcType: amcType || 'LABOUR_ONLY' });

    res.status(201).json({ id: lift.id });
  } catch (err) {
    console.error('POST /api/lifts error:', err);
    res.status(500).json({ error: err.message || 'Failed to create lift' });
  }
});

app.put('/api/lifts/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const lift = await Lift.findByPk(req.params.id);
    if (!lift) return res.status(404).json({ error: 'Lift not found' });

    lift.status = (status || lift.status || 'ACTIVE').toUpperCase();
    await lift.save();
    res.json(lift);
  } catch (err) {
    console.error('PUT /api/lifts/:id/status error:', err);
    res.status(500).json({ error: err.message || 'Failed to update status' });
  }
});

app.put('/api/lifts/:id/amc-type', async (req, res) => {
  try {
    const { amcType } = req.body;
    const lift = await Lift.findByPk(req.params.id);
    if (!lift) return res.status(404).json({ error: 'Lift not found' });

    const c = await Contract.findOne({
      where: { liftId: lift.id, contractType: 'AMC' },
      order: [['id', 'DESC']],
    });

    if (!c) {
      return res.status(400).json({ error: 'No AMC contract exists for this lift yet' });
    }

    c.amcType = amcType || 'LABOUR_ONLY';
    await c.save();

    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/lifts/:id/amc-type error:', err);
    res.status(500).json({ error: err.message || 'Failed to update AMC type' });
  }
});

app.put('/api/lifts/:id/amc', async (req, res) => {
  try {
    const lift = await Lift.findByPk(req.params.id);
    if (!lift) return res.status(404).json({ error: 'Lift not found' });

    const {
      amcType,
      amcStartDate,
      amcEndDate,
      billingCycle,
      contractValue,
      serviceIntervalDays,
      amcNotes,
    } = req.body;

    const c = await getOrCreateAmcContract(lift.id, {
      amcType: amcType || 'LABOUR_ONLY',
      billingCycle: billingCycle || 'ANNUAL',
      contractValue: normalizeCost(contractValue) ?? 0,
      serviceIntervalDays: Number(serviceIntervalDays) || 30,
      amcNotes: amcNotes || null,
    });

    if (amcType !== undefined) c.amcType = amcType || 'LABOUR_ONLY';
    if (amcStartDate !== undefined) c.startDate = amcStartDate || null;
    if (amcEndDate !== undefined) c.endDate = amcEndDate || null;
    if (billingCycle !== undefined) c.billingCycle = billingCycle || 'ANNUAL';
    if (contractValue !== undefined) c.contractValue = normalizeCost(contractValue) ?? 0;
    if (serviceIntervalDays !== undefined) {
      const n = Number(serviceIntervalDays);
      c.serviceIntervalDays = Number.isFinite(n) ? n : 30;
    }
    if (amcNotes !== undefined) c.amcNotes = amcNotes || null;

    await c.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/lifts/:id/amc error:', err);
    res.status(500).json({ error: err.message || 'Failed to save AMC contract' });
  }
});

app.post('/api/lifts/seed', async (req, res) => {
  try {
    const count = await Lift.count();
    if (count > 0) return res.json({ message: 'Already seeded', count });

    const cust = await findOrCreateCustomerByName('Existing Customer');
    const siteA = await findOrCreateSiteByName('Building A');
    const siteB = await findOrCreateSiteByName('Building B');

    const lift1 = await Lift.create({
      liftCode: 'LIFT-A-001',
      customerId: cust.id,
      siteId: siteA.id,
      location: 'Lobby',
      status: 'ACTIVE',
    });
    

    const lift2 = await Lift.create({
      liftCode: 'LIFT-B-001',
      customerId: cust.id,
      siteId: siteB.id,
      location: 'Block 2',
      status: 'MAINTENANCE',
    });
    

    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/lifts/seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

// --------------------
// SERVICE LOGS
// --------------------

app.get('/api/lifts/:id/service-logs', async (req, res) => {
  try {
    const liftId = await resolveLiftId(req.params.id);
    if (!liftId) return res.status(404).json({ error: 'Lift not found' });

    const logs = await ServiceLog.findAll({
      where: { liftId },
      order: [['serviceDate', 'DESC'], ['id', 'DESC']],
    });
    res.json(logs);
  } catch (err) {
    console.error('GET /api/lifts/:id/service-logs error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch service logs' });
  }
});

app.post('/api/lifts/:id/service-logs', async (req, res) => {
  try {
    const liftId = await resolveLiftId(req.params.id);
    if (!liftId) return res.status(404).json({ error: 'Lift not found' });

    const serviceDate = req.body.serviceDate;
    const technician = (req.body.technician ?? req.body.technicianName ?? '').toString().trim();
    const workDone = req.body.workDone ?? null;
    const remarks = req.body.remarks ?? null;
    const cost = normalizeCost(req.body.cost);

    if (!serviceDate || !technician) {
      return res.status(400).json({ error: 'serviceDate and technician are required' });
    }

    const log = await ServiceLog.create({
      liftId,
      serviceDate,
      technician,
      workDone,
      remarks,
      cost,
    });

    res.status(201).json(log);
  } catch (err) {
    console.error('POST /api/lifts/:id/service-logs error:', err);
    res.status(500).json({ error: err.message || 'Failed to create service log' });
  }
});

async function buildServiceDashboardData() {
  const today = startOfDay(new Date());

  const projects = await Project.findAll({
    include: [
      {
        model: ProjectLift,
        include: [
          
          {
            model: ProjectLiftAssignment,
            as: 'assignments',
            include: [{ model: Technician, attributes: ['id', 'name', 'phone', 'role'] }],
          },
        ],
      },
    ],
    order: [['id', 'DESC']],
  });

  const liftIds = projects.flatMap((p) =>
    (p.ProjectLifts || []).map((pl) => pl.lift_id || pl.liftId).filter(Boolean)
  );
  
// 🔥 FETCH ALL contracts first (no filtering)
const allAmcCandidates = liftIds.length
  ? await Contract.findAll({
      where: { liftId: liftIds },
    })
  : [];

// 🔥 FILTER manually (robust against snake_case / casing)
const activeAmcContracts = allAmcCandidates.filter((c) =>
  String(c.contractType || c.contract_type || '').toUpperCase() === 'AMC' &&
  String(c.status || '').toUpperCase() === 'ACTIVE'
);

console.log('ALL AMC CANDIDATES RAW', allAmcCandidates.map((c) => ({
  id: c.id,
  liftId: c.liftId,
  lift_id: c.lift_id,
  contractType: c.contractType,
  contract_type: c.contract_type,
  status: c.status,
  startDate: c.startDate,
  start_date: c.start_date,
  endDate: c.endDate,
  end_date: c.end_date,
})));

// 🔥 BUILD MAP (handle liftId vs lift_id)
const amcByLiftId = new Map(
  activeAmcContracts.map((c) => [Number(c.liftId || c.lift_id), c])
);

// 🔥 DEBUG LOG
console.log(
  'SERVICE DASHBOARD AMC CONTRACTS',
  activeAmcContracts.map((c) => ({
    id: c.id,
    liftId: c.liftId || c.lift_id,
    contractType: c.contractType || c.contract_type,
    status: c.status,
    startDate: c.startDate || c.start_date,
  }))
);

  const rows = [];

  for (const p of projects) {
    for (const pl of (p.ProjectLifts || [])) {
      const rawAssignments = Array.isArray(pl.assignments) ? pl.assignments : [];

      const activeAmcServiceAssignmentRaw = rawAssignments.find((a) =>
        isAmcServiceAssignment(a) && isAssignmentActive(a)
      );

      const activeAmcServiceAssignment = activeAmcServiceAssignmentRaw
        ? {
            id: activeAmcServiceAssignmentRaw.id,
            technicianId: activeAmcServiceAssignmentRaw.technician_id || activeAmcServiceAssignmentRaw.technicianId || null,
            dueDate: activeAmcServiceAssignmentRaw.due_date || activeAmcServiceAssignmentRaw.dueDate || null,
            status: activeAmcServiceAssignmentRaw.status || null,
            notes: stripAmcServiceMarker(activeAmcServiceAssignmentRaw.notes),
          }
        : null;

      const liftKey = Number(pl.lift_id || pl.liftId);

      const amcInfo = buildAmcInfo(
  amcByLiftId.get(Number(pl.lift_id || pl.liftId)) || null,
  today,
  {
    assignments: rawAssignments,
    activeServiceAssignment: activeAmcServiceAssignment,
  }
);

// 🔥 ADD THIS BLOCK
console.log('AMC DEBUG', {
  lift: pl.lift_code || pl.liftId,
  contract: amcByLiftId.get(Number(pl.lift_id || pl.liftId)) || null,
  amcInfo,
  today,
});

      const warrantyInfo = buildWarrantyInfo(pl, rawAssignments, today);

      rows.push({
        projectId: String(p.id),
        projectName: p.project_name || '',
        customerName: p.customer_name || '',
        projectLiftId: String(pl.id),
        liftId: String(pl.lift_id || pl.liftId || ''),
        liftCode: pl.lift_code || '',
        location: pl.location_label || (pl.Lift ? pl.Lift.location : '') || '',

        warrantyMonths: pl.warranty_months ?? null,
        warrantyStartDate: warrantyInfo.startDate,
        warrantyEndDate: warrantyInfo.endDate,
        warrantyStatus: warrantyInfo.status,
        warrantyServiceVisits: warrantyInfo.serviceVisitCount,
        warrantyCompletedVisits: warrantyInfo.completedVisits,
        warrantyNextVisitNumber: warrantyInfo.nextVisitNumber,
        warrantyNextServiceDue: warrantyInfo.nextServiceDue,
        warrantyCreateJobFromDate: warrantyInfo.createJobFromDate,
        warrantyIsDueNow: warrantyInfo.isDueNow,
        warrantyIsOverdue: warrantyInfo.isOverdue,
        warrantyOverdueDays: warrantyInfo.overdueDays || 0,
        warrantyActiveServiceAssignment: warrantyInfo.activeServiceAssignment,

        amc: amcInfo,
        amcStatus: amcInfo.status || 'NO AMC',
        amcServiceVisits: amcInfo.serviceVisitCount,
        amcCompletedVisits: amcInfo.completedVisits,
        amcNextVisitNumber: amcInfo.nextVisitNumber,
        lastServiceDate: amcInfo.lastServiceDate || null,
        nextServiceDue: amcInfo.nextServiceDue || warrantyInfo.nextServiceDue || null,
        amcNextServiceDue: amcInfo.nextServiceDue || null,
        amcCreateJobFromDate: amcInfo.createJobFromDate || null,
        amcIsDueNow: amcInfo.isDueNow,
        amcIsOverdue: amcInfo.isOverdue,
        amcOverdueDays: amcInfo.overdueDays || 0,
        amcActiveServiceAssignment: amcInfo.activeServiceAssignment,

        serviceIsDueNow: !!(warrantyInfo.isDueNow || amcInfo.isDueNow),
        overdueDays: Math.max(
          Number(warrantyInfo.overdueDays || 0),
          Number(amcInfo.overdueDays || 0)
        ),
      });
    }
  }

  const summary = {
    warrantyActive: rows.filter((x) => x.warrantyStatus === 'WARRANTY ACTIVE').length,
    warrantyExpired: rows.filter((x) => x.warrantyStatus === 'WARRANTY EXPIRED').length,
    amcActive: rows.filter((x) => x.amcStatus === 'AMC ACTIVE').length,
    amcExpired: rows.filter((x) => x.amcStatus === 'AMC EXPIRED').length,
    dueSoon: rows.filter((x) =>
      x.serviceIsDueNow &&
      Number(x.overdueDays || 0) <= 0 &&
      !x.warrantyActiveServiceAssignment &&
      !x.amcActiveServiceAssignment
    ).length,
    overdue: rows.filter((x) =>
      Number(x.overdueDays || 0) > 0 &&
      !x.warrantyActiveServiceAssignment &&
      !x.amcActiveServiceAssignment
    ).length,
  };

  return { summary, rows };
}

app.get('/api/service/dashboard', async (req, res) => {
  try {
    const data = await buildServiceDashboardData();
    res.json(data);
  } catch (err) {
    console.error('GET /api/service/dashboard error:', err);
    res.status(500).json({ error: err.message || 'Failed to load service dashboard' });
  }
});

app.post('/api/project-lifts/:projectLiftId/jobs', async (req, res) => {
  try {
    const projectLiftId = Number(req.params.projectLiftId);
    const { jobType, technicianId, role, dueDate, notes } = req.body || {};
    const normalizedRole = String(role || jobType || 'INSTALL').toUpperCase();
    const allowedMap = {
  INSTALL: 'INSTALL',
  TEST: 'TEST',
  SUPPORT: 'SUPPORT',
  'AMC SERVICE': 'AMC SERVICE',
  AMC: 'AMC SERVICE',
  'WARRANTY SERVICE': 'WARRANTY SERVICE',
  WARRANTY: 'WARRANTY SERVICE'
};
    const mappedRole = allowedMap[normalizedRole];
    if (!mappedRole) {
      return res.status(400).json({ error: 'jobType/role must resolve to INSTALL, TEST, SUPPORT, AMC SERVICE, or WARRANTY SERVICE' });
}
    req.params.projectLiftId = String(projectLiftId);
    req.body = { technicianId, role: mappedRole, dueDate, notes };
    return app._router.handle(req, res, () => {});
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
});

app.post('/api/lifts/:liftId/jobs', async (req, res) => {
  return res.status(400).json({
    error: 'Option A uses project-lift assignments for execution jobs. Open the project and assign work from the project lift screen.',
  });
});

// --------------------
// DASHBOARD KPIs
// --------------------
app.get('/api/dashboard', async (req, res) => {
  try {
    const today = startOfDay(new Date());

    const projects = await Project.findAll({
      include: [
        {
          model: ProjectLift,
          include: [
            {
              model: ProjectLiftAssignment,
              as: 'assignments',
            },
          ],
        },
      ],
      order: [['id', 'DESC']],
    });

    let total = 0;
    let active = 0;
    let maintenance = 0;
    let breakdown = 0;
    let totalCost = 0;
    let overdueServices = 0;
    let amcActive = 0;
    let amcExpiringSoon = 0;
    let amcExpired = 0;

    for (const p of projects) {
      for (const pl of (p.ProjectLifts || [])) {
        total++;

        const status = String(p.status || 'OPEN').toUpperCase();
        if (status === 'ACTIVE' || status === 'OPEN') active++;
        else if (status === 'MAINTENANCE') maintenance++;
        else if (status === 'BREAKDOWN') breakdown++;

        const warrantyEnd = parseDateOnly(pl.warranty_end_date || null);
        if (warrantyEnd && today > warrantyEnd) {
          overdueServices++;
        }
      }
    }

    res.json({
      total,
      active,
      maintenance,
      breakdown,
      totalCost: Number(totalCost.toFixed(2)),
      overdueServices,
      amcActive,
      amcExpiringSoon,
      amcExpired,
    });
  } catch (err) {
    console.error('GET /api/dashboard error:', err);
    res.status(500).json({ error: err.message || 'Failed to load dashboard' });
  }
});

app.get('/api/dashboard/workflow-readiness', async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: ProjectLift,
          include: [
            {
              model: ProjectLiftAssignment,
              as: 'assignments',
            },
          ],
        },
        { model: Customer, attributes: ['id', 'name'] },
        { model: Site, attributes: ['id', 'name'] },
      ],
      order: [['id', 'DESC']],
    });

    const norm = (v) => String(v || '').toUpperCase();

    const rows = [];
    let readyForTestAssignment = 0;
    let readyForHandover = 0;
    let handedOver = 0;

    for (const p of projects) {
      for (const pl of (p.ProjectLifts || [])) {
        const assignments = Array.isArray(pl.assignments) ? pl.assignments : [];
        const hasActualHandover = !!pl.handover_actual_date;

        const hasInstallApproved = assignments.some(
          (a) =>
            norm(a.assignment_role) === 'INSTALL' &&
            norm(a.supervisor_status) === 'APPROVED'
        );

        const hasInstallDonePendingApproval = assignments.some(
          (a) =>
            norm(a.assignment_role) === 'INSTALL' &&
            norm(a.status) === 'DONE' &&
            norm(a.supervisor_status) !== 'APPROVED'
        );

        const hasAssignedOrInProgressTest = assignments.some(
          (a) =>
            norm(a.assignment_role) === 'TEST' &&
            ['ASSIGNED', 'IN_PROGRESS'].includes(norm(a.status))
        );

        const hasTestApproved = assignments.some(
          (a) =>
            norm(a.assignment_role) === 'TEST' &&
            norm(a.supervisor_status) === 'APPROVED'
        );

        const hasTestDonePendingApproval = assignments.some(
          (a) =>
            norm(a.assignment_role) === 'TEST' &&
            norm(a.status) === 'DONE' &&
            norm(a.supervisor_status) !== 'APPROVED'
        );

        const baseRow = {
          projectId: p.id,
          projectCode: p.project_code || '',
          projectName: p.project_name || '',
          customerName: p.Customer?.name || '',
          building: p.Site?.name || '',
          projectLiftId: pl.id,
          liftCode: pl.lift_code || '',
          location: pl.location_label || '',
        };

        if (hasActualHandover) {
          handedOver++;
          rows.push({
            ...baseRow,
            workflowStatus: 'HANDED OVER',
            actionHint: 'Track service lifecycle',
          });
          continue;
        }

        if (hasTestApproved) {
          readyForHandover++;
          rows.push({
            ...baseRow,
            workflowStatus: 'READY FOR HANDOVER',
            actionHint: 'Complete Handover',
          });
          continue;
        }

        if (hasTestDonePendingApproval) {
          rows.push({
            ...baseRow,
            workflowStatus: 'TEST AWAITING APPROVAL',
            actionHint: 'Supervisor approval pending',
          });
          continue;
        }

        if (hasInstallApproved && !hasAssignedOrInProgressTest && !hasTestApproved && !hasTestDonePendingApproval) {
          readyForTestAssignment++;
          rows.push({
            ...baseRow,
            workflowStatus: 'READY FOR TEST ASSIGNMENT',
            actionHint: 'Assign Test Job',
          });
          continue;
        }

        if (hasInstallDonePendingApproval) {
          rows.push({
            ...baseRow,
            workflowStatus: 'INSTALL AWAITING APPROVAL',
            actionHint: 'Supervisor approval pending',
          });
        }
      }
    }

    res.json({
      readyForTestAssignment,
      readyForHandover,
      handedOver,
      unassignedWorkflowActions: readyForTestAssignment + readyForHandover,
      rows,
    });
  } catch (err) {
    console.error('GET /api/dashboard/workflow-readiness error:', err);
    res.status(500).json({ error: err.message || 'Failed to load workflow readiness' });
  }
});
// --------------------
// Start
// --------------------
process.on('unhandledRejection', (reason) => console.error('❌ Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => console.error('❌ Uncaught Exception:', err));

const PORT = Number(process.env.PORT || 5000);

// --------------------
// Lightweight DB auto-migration (idempotent)
// --------------------
async function ensureSchema() {
  // Sequence for serial Project Codes
  await sequelize.query(`CREATE SEQUENCE IF NOT EXISTS public.project_code_seq START 1;`);

  // Projects table
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id BIGSERIAL PRIMARY KEY,
      project_code TEXT,
      project_name TEXT NOT NULL,
      customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
      site_id BIGINT REFERENCES sites(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_code TEXT;`);
  await sequelize.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_name TEXT;`);
  await sequelize.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS customer_id BIGINT;`);
  await sequelize.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_id BIGINT;`);
  await sequelize.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT;`);
  await sequelize.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS notes TEXT;`);

  // Project lifts
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS project_lifts (
      id BIGSERIAL PRIMARY KEY,
      project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      lift_id BIGINT REFERENCES lifts(id) ON DELETE SET NULL,
      lift_code TEXT NOT NULL,
      location_label TEXT,

      passenger_capacity INTEGER,
      lift_type TEXT,
      number_of_floors INTEGER,

      installation_start_date DATE,
      installation_end_date DATE,
      testing_start_date DATE,
      testing_end_date DATE,
      handover_date DATE,
      warranty_months INTEGER NOT NULL DEFAULT 12,
      warranty_start_date DATE,
      warranty_end_date DATE,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS lift_code TEXT;`);
  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS location_label TEXT;`);

  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS passenger_capacity INTEGER;`);
  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS lift_type TEXT;`);
  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS number_of_floors INTEGER;`);

  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS warranty_months INTEGER;`);
await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS warranty_service_visits INTEGER NOT NULL DEFAULT 5;`);
await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS handover_actual_date DATE;`);
  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS warranty_start_date DATE;`);
  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS warranty_end_date DATE;`);
  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS handover_date DATE;`);
  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS installation_start_date DATE;`);
  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS installation_end_date DATE;`);
  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS testing_start_date DATE;`);
  await sequelize.query(`ALTER TABLE project_lifts ADD COLUMN IF NOT EXISTS testing_end_date DATE;`);

  await sequelize.query(`CREATE UNIQUE INDEX IF NOT EXISTS ux_project_lifts_lift_code ON project_lifts(lift_code);`);

// Contracts (AMC)
await sequelize.query(`
  CREATE TABLE IF NOT EXISTS contracts (
    id BIGSERIAL PRIMARY KEY,
    project_lift_id BIGINT NOT NULL REFERENCES project_lifts(id) ON DELETE CASCADE,
    amc_type TEXT,
    start_date DATE,
    end_date DATE,
    service_interval_days INTEGER,
    service_visit_count INTEGER NOT NULL DEFAULT 5,
    billing_cycle TEXT,
    contract_value NUMERIC,
    amc_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`);

await sequelize.query(`ALTER TABLE contracts ADD COLUMN IF NOT EXISTS service_visit_count INTEGER NOT NULL DEFAULT 5;`);

  // Assignments
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS project_lift_assignments (
      id BIGSERIAL PRIMARY KEY,
      project_lift_id BIGINT NOT NULL REFERENCES project_lifts(id) ON DELETE CASCADE,
      technician_id BIGINT NOT NULL REFERENCES technicians(id) ON DELETE RESTRICT,
      assignment_role TEXT NOT NULL,
      assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      unassigned_at TIMESTAMPTZ,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'ASSIGNED',
      due_date DATE,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ
    );
  `);

  await sequelize.query(`ALTER TABLE project_lift_assignments ADD COLUMN IF NOT EXISTS status TEXT;`);
  await sequelize.query(`ALTER TABLE project_lift_assignments ADD COLUMN IF NOT EXISTS due_date DATE;`);
  await sequelize.query(`ALTER TABLE project_lift_assignments ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;`);
  await sequelize.query(`ALTER TABLE project_lift_assignments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;`);

  // Multi-technician job members
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS project_lift_job_technicians (
      id BIGSERIAL PRIMARY KEY,
      assignment_id BIGINT NOT NULL REFERENCES project_lift_assignments(id) ON DELETE CASCADE,
      technician_id BIGINT NOT NULL REFERENCES technicians(id) ON DELETE RESTRICT,
      team_role TEXT NOT NULL,
      assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      notes TEXT
    );
  `);
  await sequelize.query(`ALTER TABLE project_lift_job_technicians ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;`);
  await sequelize.query(`ALTER TABLE project_lift_job_technicians ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;`);
  await sequelize.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_project_lift_job_technicians_unique_member ON project_lift_job_technicians(assignment_id, technician_id);`);
  await sequelize.query(`CREATE UNIQUE INDEX IF NOT EXISTS uq_project_lift_job_technicians_one_lead ON project_lift_job_technicians(assignment_id) WHERE team_role = 'LEAD';`);

  // Technicians + sessions
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS technicians (
      id BIGSERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      role TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      pin_salt TEXT,
      pin_hash TEXT,
      must_change_pin BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await sequelize.query(`ALTER TABLE technicians ADD COLUMN IF NOT EXISTS pin_salt TEXT;`);
  await sequelize.query(`ALTER TABLE technicians ADD COLUMN IF NOT EXISTS pin_hash TEXT;`);
  await sequelize.query(`ALTER TABLE technicians ADD COLUMN IF NOT EXISTS must_change_pin BOOLEAN NOT NULL DEFAULT TRUE;`);
  await sequelize.query(`ALTER TABLE technicians ADD COLUMN IF NOT EXISTS skills TEXT;`);
  
        await sequelize.query(`
    CREATE TABLE IF NOT EXISTS technician_sessions (
      id BIGSERIAL PRIMARY KEY,
      technician_id BIGINT NOT NULL REFERENCES technicians(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      last_seen_at TIMESTAMPTZ
    );
  `);
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await ensureSchema();
    console.log('✅ Schema checked');

    if (String(process.env.DB_SYNC || '').toLowerCase() === 'true') {
      const alter = String(process.env.DB_SYNC_ALTER || '').toLowerCase() === 'true';
      await sequelize.sync({ alter });
      console.log(`✅ Tables synced (alter=${alter})`);
    }

    app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
})();
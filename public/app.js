// Phase 2 UI Shell (Theme 3) — Technician Dashboard + Job Status Buttons
const LS_TOKEN = "liftapp.tech.token";
const LS_TECH = "liftapp.tech.profile";
const LS_USER_TOKEN = "liftapp.user.token";
const LS_USER = "liftapp.user.profile";

let breakdownFilter = "open";

function getCurrentUser() {
  try {
    const officeUser = JSON.parse(localStorage.getItem(LS_USER) || 'null');
    if (officeUser) return officeUser;

    const technician = JSON.parse(localStorage.getItem(LS_TECH) || 'null');
    if (technician) return technician;

    return null;
  } catch {
    return null;
  }
}

function can(permissionCode) {
  const user = getCurrentUser();
  const role = String(user?.role || '').trim().toUpperCase();

  // temporary role-based fallback for office users
  if (['ADMIN', 'MANAGER', 'SUPERVISOR'].includes(role)) {
    return true;
  }

  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  return permissions.includes(permissionCode);
}

function isLoggedIn() {
  return !!localStorage.getItem(LS_TOKEN);
}

function setSession(token, technician) {
  state.techToken = token || null;
  state.tech = technician || null;

  if (state.techToken) {
    localStorage.setItem(LS_TOKEN, state.techToken);
  } else {
    localStorage.removeItem(LS_TOKEN);
  }

  localStorage.setItem(LS_TECH, JSON.stringify(state.tech || null));
}

function clearSession() {
  state.userToken = null;
  state.user = null;
  state.techToken = null;
  state.tech = null;
  state.currentProjectId = null;
  state.currentProject = null;

  localStorage.removeItem(LS_USER_TOKEN);
  localStorage.removeItem(LS_USER);
  localStorage.removeItem(LS_TOKEN);
  localStorage.removeItem(LS_TECH);

  setSidebarVisible(false);
}

const state = {
  view: "dashboard",

  // office session
  userToken:
    localStorage.getItem(LS_USER_TOKEN) ||
    sessionStorage.getItem(LS_USER_TOKEN) ||
    null,

  user: (() => {
    try {
      return JSON.parse(
        localStorage.getItem(LS_USER) ||
        sessionStorage.getItem(LS_USER) ||
        "null"
      );
    } catch {
      return null;
    }
  })(),

  // technician session
  techToken: localStorage.getItem(LS_TOKEN) || null,
  tech: (() => {
    try { return JSON.parse(localStorage.getItem(LS_TECH) || "null"); }
    catch { return null; }
  })(),

  // project workflow state
  currentProjectId: null,
  currentProject: null,
};

let serviceJobsView = "open";
let projectJobsView = "open";

const el = (id) => document.getElementById(id);
function setActiveNav(view) {
  [...document.querySelectorAll("#nav a")].forEach((a) =>
    a.classList.toggle("active", a.dataset.view === view)
  );
}

function showToast(message, type = "success") {
  let toast = document.getElementById("appToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 16px";
    toast.style.borderRadius = "10px";
    toast.style.fontWeight = "600";
    toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
    toast.style.zIndex = "9999";
    toast.style.transition = "opacity 0.3s ease";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.background = type === "success" ? "#16a34a" : "#dc2626";
  toast.style.color = "#fff";
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
}

function setTitle(text) {
  el("pageTitle").textContent = text;
}

function setToolbar(nodes = []) {
  const tb = el("toolbar");
  tb.innerHTML = "";
  nodes.forEach((n) => tb.appendChild(n));
}

function setViewMode(isDashboard = false) {
  const root = el("viewRoot");
  root.classList.toggle("dashboardView", !!isDashboard);
  return root;
}

function hideModal(modalEl) {
  if (!modalEl) return;
  modalEl.style.display = "none";
}

function showModal(modalEl) {
  if (!modalEl) return;
  modalEl.style.display = "";
}

function removeModal(modalEl) {
  if (!modalEl) return;
  modalEl.remove();
}

function badge(text) {
  const t = String(text || "").toUpperCase();

  let cls = "badge";
  let icon = "";

  if (t.includes("NOT") || t.includes("PENDING")) {
    cls += " badge-gray";
    icon = "⚪";
  } else if (t.includes("INSTALL")) {
    cls += " badge-yellow";
    icon = "🟡";
  } else if (t.includes("TEST")) {
    cls += " badge-blue";
    icon = "🔵";
  } else if (t.includes("HANDOVER") || t.includes("COMPLETE") || t.includes("DONE")) {
    cls += " badge-green";
    icon = "🟢";
  } else if (t.includes("IN PROGRESS")) {
    cls += " badge-orange";
    icon = "🟠";
  } else {
    cls += " badge-gray";
    icon = "⚪";
  }

  const span = document.createElement("span");
  span.className = cls;
  span.textContent = `${icon} ${text}`;
  return span;
}

function renderLiftProgress(l) {
  const status = String(getLiftExecutionStatus(l) || "").toUpperCase();

  let percent = 0;

  if (status === "NOT STARTED") percent = 0;

  else if (status === "ASSIGNED" || status === "INSTALL ASSIGNED") percent = 15;
  else if (status === "INSTALLING") percent = 25;
  else if (status === "READY FOR TEST ASSIGNMENT") percent = 50;

  else if (status === "TEST ASSIGNED") percent = 60;
  else if (status === "TESTING") percent = 70;

  else if (status === "READY FOR HANDOVER") percent = 90;
  else if (status === "HANDED OVER") percent = 100;

  else if (status === "AMC SERVICE IN PROGRESS") percent = 100;

  return `
    <div class="liftProgress">
      <div class="liftProgressBar">
        <div class="liftProgressFill" style="width:${percent}%"></div>
      </div>
      <div class="liftProgressText">${percent}%</div>
    </div>
  `;
}

function formatDateRange(a, b) {
  if (!a && !b) return '—';
  return `${a || '—'} → ${b || '—'}`;
}

function infoLine(label, value) {
  return `<div><span class="muted">${label}:</span> ${value || '—'}</div>`;
}

function formatInputDate(value) {
  return value ? String(value).slice(0, 10) : "";
}

function getSuggestedDueDateForJob(lift, jobType) {
  const type = String(jobType || '').toUpperCase();
  if (!lift) return '';
  if (type === 'INSTALL') return formatInputDate(lift.installationEndDate);
  if (type === 'TEST') return formatInputDate(lift.testingEndDate);
  if (type === 'AMC SERVICE') return formatInputDate(lift?.amc?.nextServiceDate);
  return '';
}

function getTargetLabelForJob(jobType) {
  const type = String(jobType || '').toUpperCase();
  if (type === 'INSTALL') return 'Installation End Date';
  if (type === 'TEST') return 'Testing End Date';
  if (type === 'AMC SERVICE') return 'Next Service Date';
  return 'Target Date';
}

function compareDateOnly(a, b) {
  if (!a || !b) return 0;
  const da = new Date(a);
  const db = new Date(b);
  da.setHours(0,0,0,0);
  db.setHours(0,0,0,0);
  if (da < db) return -1;
  if (da > db) return 1;
  return 0;
}

function updateDueDateGuidance(messageEl, lift, jobType, dueDate) {
  if (!messageEl) return;
  const targetDate = getSuggestedDueDateForJob(lift, jobType);
  const targetLabel = getTargetLabelForJob(jobType);

  if (!targetDate) {
    messageEl.className = 'muted dueDateHint';
    messageEl.textContent = `No ${targetLabel.toLowerCase()} found. Set the due date manually.`;
    return;
  }

  if (!dueDate) {
    messageEl.className = 'muted dueDateHint';
    messageEl.textContent = `Suggested due date from ${targetLabel}: ${targetDate}`;
    return;
  }

  const cmp = compareDateOnly(dueDate, targetDate);
  if (cmp > 0) {
    messageEl.className = 'warnText dueDateHint';
    messageEl.textContent = `Warning: due date is later than ${targetLabel} (${targetDate}). Save is still allowed.`;
    return;
  }

  if (cmp < 0) {
    messageEl.className = 'goodText dueDateHint';
    messageEl.textContent = `Due date is earlier than ${targetLabel} (${targetDate}).`;
    return;
  }

  messageEl.className = 'goodText dueDateHint';
  messageEl.textContent = `Due date matches ${targetLabel} (${targetDate}).`;
}

function getLeadName(job) {
  const team = Array.isArray(job?.team) ? job.team : [];
  const lead = team.find((m) => String(m.teamRole || '').toUpperCase() === 'LEAD');
  return lead?.technician?.name || job?.technician?.name || '—';
}

function getSupportNames(job) {
  const fromSupportTechnicians = (job?.supportTechnicians || [])
    .map((t) => t?.name)
    .filter(Boolean);

  if (fromSupportTechnicians.length) return fromSupportTechnicians;

  const fromTeam = (Array.isArray(job?.team) ? job.team : [])
    .filter((m) => String(m.teamRole || '').toUpperCase() === 'SUPPORT')
    .map((m) => m?.technician?.name || m?.name || '')
    .filter(Boolean);

  return fromTeam;
}

function renderJobSummaryHtml(job) {
  const supportNames = getSupportNames(job);
console.log('PROJECT JOB CARD', job);
  return `
    <div><b>${job.role || 'JOB'}</b> - ${(job.status || '').replaceAll('_', ' ')}</div>
    <div><span class="muted">Lead:</span> ${getLeadName(job)}</div>
    ${
      supportNames.length
        ? `<div><span class="muted">Support:</span> ${supportNames.join(', ')}</div>`
        : ''
    }
  `;
}

function renderAmcStatusBlock(lift) {
  const amc = lift?.amc || null;
  const status = amc?.status || 'NO AMC';
  let statusHtml = '';
  if (status === 'AMC ACTIVE') statusHtml = '<span class="badge badge-green">AMC ACTIVE</span>';
  else if (status === 'AMC EXPIRING SOON') statusHtml = '<span class="badge badge-orange">AMC EXPIRING SOON</span>';
  else if (status === 'AMC EXPIRED') statusHtml = '<span class="badge badge-gray">AMC EXPIRED</span>';
  else if (status === 'AMC NOT STARTED') statusHtml = '<span class="badge badge-blue">AMC NOT STARTED</span>';
  else statusHtml = '<span class="badge badge-gray">NO AMC</span>';

  const nextDue = amc?.nextServiceDue || '—';
  const lastService = amc?.lastServiceDate || '—';
  const amcType = amc?.amcType ? amc.amcType.replaceAll('_', ' ') : '—';
  const activeService = amc?.activeServiceAssignment || null;
  const activeServiceLine = activeService
    ? `<div class="muted">Assigned: ${(activeService.technicianName || 'Technician')} (${String(activeService.status || '').replaceAll('_', ' ')})</div><div class="muted">Service Due: ${activeService.dueDate || nextDue}</div>`
    : `<div class="muted">Next Service: ${nextDue}</div>`;

  return `${statusHtml}<div class="muted" style="margin-top:6px">AMC Type: ${amcType}</div><div class="muted">Last Service: ${lastService}</div>${activeServiceLine}`;
}

function smallBtn(text, kind = "secondary") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = kind === "primary" ? "btn" : "btn secondary";
  b.textContent = text;
  b.style.padding = "8px 10px";
  return b;
}

function isProjectJobRole(role) {
  const r = String(role || "").toUpperCase();
  return ["INSTALL", "TEST"].includes(r);
}

function isServiceJobRole(role) {
  const r = String(role || "").toUpperCase();
  return ["WARRANTY SERVICE", "AMC SERVICE"].includes(r);
}

const ROLE_DEFAULT_PERMISSIONS = {
  ADMIN: {
    "dashboard.view": true,
    "projects.view": true,
    "projects.create": true,
    "projects.edit": true,
    "projects.delete": true,
    "lifts.view": true,
    "lifts.create": true,
    "lifts.edit": true,
    "lifts.delete": true,
    "jobs.view": true,
    "jobs.create": true,
    "jobs.edit": true,
    "jobs.assign": true,
    "jobs.close": true,
    "jobs.delete": true,
"breakdowns.view": true,
"breakdowns.create": true,
"breakdowns.assign": true,
"breakdowns.edit": true,
"breakdowns.close": true,
"breakdowns.escalate": true,
"breakdowns.delete": true,
    "technicians.view": true,
    "technicians.create": true,
    "technicians.edit": true,
    "technicians.deactivate": true,
    "service.view": true,
    "service.update": true,
    "service.approve": true,
    "amc.view": true,
    "amc.create": true,
    "amc.edit": true,
    "amc.close": true,
    "reports.view": true,
    "reports.export": true,
    "users.view": true,
    "users.create": true,
    "users.edit": true,
    "users.deactivate": true,
    "users.permissions": true,
  },

  MANAGER: {
    "dashboard.view": true,
    "projects.view": true,
    "projects.create": true,
    "projects.edit": true,
    "projects.delete": false,
    "lifts.view": true,
    "lifts.create": true,
    "lifts.edit": true,
    "lifts.delete": false,
    "jobs.view": true,
    "jobs.create": true,
    "jobs.edit": true,
    "jobs.assign": true,
    "jobs.close": true,
    "jobs.delete": false,
"breakdowns.view": true,
"breakdowns.create": true,
"breakdowns.assign": true,
"breakdowns.edit": true,
"breakdowns.close": true,
"breakdowns.escalate": true,
"breakdowns.delete": false,
    "technicians.view": true,
    "technicians.create": true,
    "technicians.edit": true,
    "technicians.deactivate": false,
    "service.view": true,
    "service.update": true,
    "service.approve": true,
    "amc.view": true,
    "amc.create": true,
    "amc.edit": true,
    "amc.close": false,
    "reports.view": true,
    "reports.export": true,
    "users.view": false,
    "users.create": false,
    "users.edit": false,
    "users.deactivate": false,
    "users.permissions": false,
  },

  SUPERVISOR: {
    "dashboard.view": true,
    "projects.view": true,
    "projects.create": false,
    "projects.edit": true,
    "projects.delete": false,
    "lifts.view": true,
    "lifts.create": false,
    "lifts.edit": true,
    "lifts.delete": false,
    "jobs.view": true,
    "jobs.create": false,
    "jobs.edit": true,
    "jobs.assign": false,
    "jobs.close": true,
    "jobs.delete": false,
"breakdowns.view": true,
"breakdowns.create": false,
"breakdowns.assign": true,
"breakdowns.edit": true,
"breakdowns.close": true,
"breakdowns.escalate": true,
"breakdowns.delete": false,
    "technicians.view": true,
    "technicians.create": false,
    "technicians.edit": false,
    "technicians.deactivate": false,
    "service.view": true,
    "service.update": true,
    "service.approve": false,
    "amc.view": false,
    "amc.create": false,
    "amc.edit": false,
    "amc.close": false,
    "reports.view": false,
    "reports.export": false,
    "users.view": false,
    "users.create": false,
    "users.edit": false,
    "users.deactivate": false,
    "users.permissions": false,
  },
};

function getOfficePermissions() {
  const user = state.user || {};
  const role = String(user.role || "").trim().toUpperCase();
  const base = ROLE_DEFAULT_PERMISSIONS[role] || {};
  const overrides = user.permissions || {};
  return { ...base, ...overrides };
}

function hasPermission(code) {
  return !!getOfficePermissions()[code];
}

const PERMISSION_GROUPS = [
  {
    module: "Dashboard",
    items: [
      { code: "dashboard.view", label: "View Dashboard" },
    ],
  },
  {
    module: "Projects",
    items: [
      { code: "projects.view", label: "View Projects" },
      { code: "projects.create", label: "Create Projects" },
      { code: "projects.edit", label: "Edit Projects" },
      { code: "projects.delete", label: "Delete Projects" },
    ],
  },
  {
    module: "Lifts",
    items: [
      { code: "lifts.view", label: "View Lifts" },
      { code: "lifts.create", label: "Create Lifts" },
      { code: "lifts.edit", label: "Edit Lifts" },
      { code: "lifts.delete", label: "Delete Lifts" },
    ],
  },
  {
    module: "Jobs",
    items: [
      { code: "jobs.view", label: "View Jobs" },
      { code: "jobs.create", label: "Create Jobs" },
      { code: "jobs.edit", label: "Edit Jobs" },
      { code: "jobs.assign", label: "Assign Jobs" },
      { code: "jobs.close", label: "Close Jobs" },
      { code: "jobs.delete", label: "Delete Jobs" },
    ],
  },
{
  module: "Breakdown Calls",
  items: [
    { code: "breakdowns.view", label: "View Breakdown Calls" },
    { code: "breakdowns.create", label: "Create Breakdown Calls" },
    { code: "breakdowns.assign", label: "Assign Breakdown Calls" },
    { code: "breakdowns.edit", label: "Edit Breakdown Calls" },
    { code: "breakdowns.close", label: "Close Breakdown Calls" },
    { code: "breakdowns.escalate", label: "Escalate Breakdown Calls" },
    { code: "breakdowns.delete", label: "Delete Breakdown Calls" },
  ],
},
  {
    module: "Technicians",
    items: [
      { code: "technicians.view", label: "View Technicians" },
      { code: "technicians.create", label: "Create Technicians" },
      { code: "technicians.edit", label: "Edit Technicians" },
      { code: "technicians.deactivate", label: "Deactivate Technicians" },
    ],
  },
  {
    module: "Service",
    items: [
      { code: "service.view", label: "View Service" },
      { code: "service.update", label: "Update Service" },
      { code: "service.approve", label: "Approve Service / Jobs" },
    ],
  },
  {
    module: "AMC",
    items: [
      { code: "amc.view", label: "View AMC" },
      { code: "amc.create", label: "Create AMC" },
      { code: "amc.edit", label: "Edit AMC" },
      { code: "amc.close", label: "Close AMC" },
      { code: "amc.delete", label: "Delete AMC" },
    ],
  },
  {
    module: "Reports",
    items: [
      { code: "reports.view", label: "View Reports" },
      { code: "reports.export", label: "Export Reports" },
    ],
  },
  {
    module: "Users",
    items: [
      { code: "users.view", label: "View Users" },
      { code: "users.create", label: "Create Users" },
      { code: "users.edit", label: "Edit Users" },
      { code: "users.deactivate", label: "Deactivate Users" },
      { code: "users.permissions", label: "Manage Permissions" },
    ],
  },
];

function getRoleBasePermissions(role) {
  const r = normalizeRole(role);
  return ROLE_DEFAULT_PERMISSIONS[r] || {};
}

function getUserPermissionOverrides(user) {
  return user?.permissions && typeof user.permissions === "object"
    ? user.permissions
    : {};
}

function getEffectivePermissionsForUser(user) {
  return {
    ...getRoleBasePermissions(user?.role),
    ...getUserPermissionOverrides(user),
  };
}

function buildPermissionOverrides(role, effectivePermissions) {
  const base = getRoleBasePermissions(role);
  const overrides = {};

  Object.keys(effectivePermissions || {}).forEach((code) => {
    const baseValue = !!base[code];
    const currentValue = !!effectivePermissions[code];
    if (baseValue !== currentValue) {
      overrides[code] = currentValue;
    }
  });

  return overrides;
}

// ===== Technician Skill Helpers (ADD HERE) =====

function getActiveProfile() {
  return state.user || state.tech || null;
}

function getActiveRole() {
  return String(state.user?.role || state.tech?.role || "").trim().toUpperCase();
}

function setSidebarVisible(show) {
  const sidebar = document.querySelector(".side");
  if (sidebar) {
    sidebar.style.display = show ? "" : "none";
  }
}

function parseSkills(skills) {
  return String(skills || "")
    .split(",")
    .map((x) => x.trim().toUpperCase())
    .filter(Boolean);
}

function technicianHasSkill(tech, requiredSkill) {
  const need = String(requiredSkill || "").trim().toUpperCase();
  if (!need) return true;
  return parseSkills(tech?.skills).includes(need);
}

function getRequiredSkillForJob(jobType) {
  const t = String(jobType || "").toUpperCase();
  if (t === "INSTALL") return "INSTALL";
  if (t === "TEST") return "TEST";
  if (t === "AMC SERVICE") return "SERVICE";
  if (t === "WARRANTY SERVICE") return "SERVICE";
  return "";
}

function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function escapeHtml(v) {
  return String(v || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function dueBadgeClass(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'OVERDUE') return 'badge danger';
  if (s === 'DUE SOON') return 'badge warn';
  if (s === 'NOT DUE' || s === 'OK') return 'badge ok';
  if (s === 'NO HISTORY') return 'badge';
  return 'badge';
}

function renderTechResponseBadge(status) {
  const s = String(status || "PENDING").toUpperCase();

  if (s === "ACKNOWLEDGED") {
    return `<span class="badge bSuccess" style="margin-left:6px;">ACKNOWLEDGED</span>`;
  }

  if (s === "PENDING") {
    return `<span class="badge bWarn" style="margin-left:6px;">PENDING</span>`;
  }

  return `<span class="badge" style="margin-left:6px;">${escapeHtml(s)}</span>`;
}

function showModalShell(title, bodyNode) {
  const overlay = document.createElement('div');
  overlay.className = 'modalOverlay';

  const modal = document.createElement('div');
  modal.className = 'modalCard modalLg';

  const head = document.createElement('div');
  head.className = 'modalHead';
  head.innerHTML = `
    <div class="modalTitle">${escapeHtml(title)}</div>
    <button class="iconBtn" type="button" aria-label="Close">✕</button>
  `;

  const body = document.createElement('div');
  body.className = 'modalBody';
  body.appendChild(bodyNode);

  modal.appendChild(head);
  modal.appendChild(body);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();

  head.querySelector('button').onclick = close;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  return { overlay, modal, close };
}

function showServiceHistoryModal(lift) {
  const service = lift?.service || {};
  const history = Array.isArray(service.history) ? service.history : [];
  const dueStatus = service?.dueStatus || 'NO HISTORY';

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="serviceHistoryTopGrid">
      <div class="miniStatCard">
        <div class="miniStatLabel">Lift Code</div>
        <div class="miniStatValue">${escapeHtml(lift?.liftCode || '—')}</div>
      </div>
      <div class="miniStatCard">
        <div class="miniStatLabel">Last Service</div>
        <div class="miniStatValue">${escapeHtml(fmtDate(service.lastServiceDate))}</div>
      </div>
      <div class="miniStatCard">
        <div class="miniStatLabel">Next Due</div>
        <div class="miniStatValue">${escapeHtml(fmtDate(service.nextDue))}</div>
      </div>
      <div class="miniStatCard">
        <div class="miniStatLabel">Due Status</div>
        <div class="miniStatValue">
          <span class="${dueBadgeClass(dueStatus)}">${escapeHtml(dueStatus)}</span>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:14px;">
      <div class="sectionTitle">Service History</div>
      <div class="tableWrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width:140px;">Date</th>
              <th style="width:160px;">Role</th>
              <th style="width:140px;">Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody id="serviceHistoryRows"></tbody>
        </table>
      </div>
    </div>
  `;

  const tb = wrap.querySelector('#serviceHistoryRows');

  if (!history.length) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="4" class="muted">No completed service history found for this lift.</td>`;
    tb.appendChild(tr);
  } else {
    history.forEach((row) => {
      const tr = document.createElement('tr');
      const statusText = String(row.status || '—').replaceAll('_', ' ');

      tr.innerHTML = `
        <td>${escapeHtml(fmtDate(row.date))}</td>
        <td>${escapeHtml(row.role || '—')}</td>
        <td><span class="badge ok">${escapeHtml(statusText)}</span></td>
        <td>${escapeHtml(row.remarks || '—')}</td>
      `;
      tb.appendChild(tr);
    });
  }

  const btnClose = smallBtn('Close', 'secondary');
  btnClose.onclick = closeModal;

  openModal({
    title: `Service History — ${lift?.liftCode || ''}`,
    bodyNode: wrap,
    footerNodes: [btnClose],
  });
}

function showAssignWarrantyTechModal(projectLiftId, techs = []) {
  const body = document.createElement("div");
  body.innerHTML = `
    <div class="formGrid">
      <div class="field">
        <label>Lead Technician</label>
        <select id="warrantyLeadTech"></select>
      </div>

      <div class="field">
        <label>Due Date</label>
        <input type="date" id="warrantyDueDate" />
      </div>

      <div class="field" style="grid-column:1/-1">
        <label>Notes</label>
        <textarea id="warrantyNotes" placeholder="Warranty service notes..."></textarea>
      </div>
    </div>
  `;

  const techSelect = body.querySelector("#warrantyLeadTech");

  const filteredTechs = (techs || []).filter((t) => technicianHasSkill(t, "SERVICE"));

  if (!filteredTechs.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No technicians with SERVICE skill found";
    techSelect.appendChild(opt);
  } else {
    filteredTechs.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.name}${t.skills ? ` (${parseSkills(t.skills).join(", ")})` : ""}`;
      techSelect.appendChild(opt);
    });
  }

  body.querySelector("#warrantyDueDate").value = new Date().toISOString().slice(0, 10);

  const btnCancel = smallBtn("Cancel", "secondary");
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn("Assign Warranty Job", "primary");
  btnSave.onclick = async () => {
    try {
      if (!techSelect.value) throw new Error("Please select a lead technician");

      await API.assignWarrantyService(projectLiftId, {
        leadTechnicianId: Number(techSelect.value),
        dueDate: body.querySelector("#warrantyDueDate").value || null,
        notes: body.querySelector("#warrantyNotes").value || "",
      });

      closeModal();
      await renderServiceDashboard();
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  openModal({
    title: "Assign Warranty Service",
    bodyNode: body,
    footerNodes: [btnCancel, btnSave],
  });
}
  function openProjectFromDashboard(projectId) {
  if (!projectId) return;

  openProject(Number(projectId)); // ✅ actual navigation
}

window.openProjectFromDashboard = openProjectFromDashboard;

function makeScrollableTableWrap(innerHtml, maxHeight = "420px") {
  const wrap = document.createElement("div");
  wrap.className = "tableWrap";
  wrap.style.maxHeight = maxHeight;
  wrap.style.overflowY = "auto";
  wrap.style.overflowX = "auto";
  wrap.innerHTML = innerHtml;
  return wrap;
}

// ---------- Modal ----------
const modalStack = [];

function openModal({ title, bodyNode, footerNodes = [] }) {
  const modalBack = el("modalBack");
  const modalTitle = el("modalTitle");
  const modalBody = el("modalBody");
  const modalFoot = el("modalFoot");

  // If a modal is already open, save the LIVE nodes, not innerHTML
  if (modalBack.style.display === "flex") {
    modalStack.push({
      title: modalTitle.textContent,
      bodyChildren: Array.from(modalBody.childNodes),
      footChildren: Array.from(modalFoot.childNodes),
    });
  }

  modalTitle.textContent = title || "";

  modalBody.innerHTML = "";
  if (bodyNode) {
    modalBody.appendChild(bodyNode);
  }

  modalFoot.innerHTML = "";
  (footerNodes || []).forEach((n) => {
    if (n) modalFoot.appendChild(n);
  });

  modalBack.style.display = "flex";

  const closeBtn = el("btnModalClose");
  if (closeBtn) closeBtn.onclick = closeModal;
}

function closeModal() {
  const modalBack = el("modalBack");
  const modalTitle = el("modalTitle");
  const modalBody = el("modalBody");
  const modalFoot = el("modalFoot");

  // If there is a previous modal, restore the LIVE nodes
  if (modalStack.length > 0) {
    const prev = modalStack.pop();

    modalTitle.textContent = prev.title || "";

    modalBody.innerHTML = "";
    prev.bodyChildren.forEach((node) => modalBody.appendChild(node));

    modalFoot.innerHTML = "";
    prev.footChildren.forEach((node) => modalFoot.appendChild(node));

    modalBack.style.display = "flex";

    const closeBtn = el("btnModalClose");
    if (closeBtn) closeBtn.onclick = closeModal;
    return;
  }

  modalTitle.textContent = "";
  modalBody.innerHTML = "";
  modalFoot.innerHTML = "";
  modalBack.style.display = "none";
}

el("btnModalClose").onclick = closeModal;
el("modalBack").onclick = (e) => {
  if (e.target === el("modalBack")) closeModal();
};

function getOfficeAuthHeaders(extra = {}) {
  const token =
    state.userToken ||
    localStorage.getItem("liftapp.user.token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
    ...extra,
  };
}

function getTechAuthHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${state.techToken}`,
    ...extra,
  };
}

function normalizeRole(role) {
  return String(role || "").trim().toUpperCase();
}

function getCurrentRole() {
  return normalizeRole(state.user?.role || state.tech?.role || "");
}

async function showWarningModal(message) {
  return new Promise((resolve) => {
    const wrap = document.createElement("div");
    wrap.style.position = "fixed";
    wrap.style.inset = "0";
    wrap.style.background = "rgba(0,0,0,0.4)";
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.justifyContent = "center";
    wrap.style.zIndex = "9999";

    wrap.innerHTML = `
      <div class="card" style="max-width:420px;">
        <div class="label">Warning</div>
        <div class="hr"></div>
        <div style="margin-bottom:16px;">
          ${escapeHtml(message)}
        </div>
        <div style="display:flex;justify-content:flex-end;">
          <button class="btn primary">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);

    wrap.querySelector("button").onclick = () => {
      wrap.remove();
      resolve();
    };
  });
}
// ---------- API ----------

const API = {
  async getDashboardKpis() {
    const r = await fetch("/api/dashboard");
    if (!r.ok) throw new Error("Failed to load dashboard");
    return r.json();
  },

async getServiceDashboard() {
  const r = await fetch('/api/service/dashboard');
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'Failed to load service dashboard');
  return j;
},

async userMe() {
  const r = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${state.userToken}` },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Failed to load office user");
  return j;
},

async listUsers() {
  const r = await fetch('/api/users', {
    headers: getOfficeAuthHeaders({}),
  });
  const j = await r.json().catch(() => ([]));
  if (!r.ok) throw new Error(j?.error || 'Failed to load users');
  return j;
},

async createUser(payload) {
  const r = await fetch('/api/users', {
    method: 'POST',
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || 'Failed to create user');
  return j;
},

async updateUser(userId, payload) {
  const r = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || 'Failed to update user');
  return j;
},

async updateUserPermissions(userId, permissions) {
  const r = await fetch(`/api/users/${userId}/permissions`, {
    method: "PUT",
    headers: getOfficeAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ permissions }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Failed to update permissions");
  return j;
},

async createAllDueServiceJobs() {
    const r = await fetch('/api/service/create-all-due-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || 'Failed to create due service jobs');

    return j;
  },

  async getWorkflowReadiness() {
    const r = await fetch("/api/dashboard/workflow-readiness");
    if (!r.ok) throw new Error("Failed to load workflow readiness");
    return r.json();
  },

  async getJobs() {
    const r = await fetch("/api/jobs?limit=200");
    if (!r.ok) throw new Error("Failed to load jobs");
    return r.json();
  },

async getTeamLoad() {
  const r = await fetch("/api/dashboard/team-load");
  const j = await r.json().catch(() => ([]));
  if (!r.ok) throw new Error(j?.error || "Failed to load team load");
  return j;
},

async getReassignOptions(jobId) {
  const r = await fetch(`/api/jobs/${jobId}/reassign-options`);
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Failed to load suggestions");
  return j;
},

async reassignJob(jobId, technicianId) {
  const r = await fetch(`/api/jobs/${jobId}/reassign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ technicianId })
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Reassign failed");
  return j;
},

async getChecklist(jobId) {
  const r = await fetch(`/api/assignments/${jobId}/checklist`, {
    headers: getOfficeAuthHeaders(),
  });

  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || 'Failed to load checklist');
  return j;
},

async getServiceReport(jobId) {
  const r = await fetch(`/api/assignments/${jobId}/service-report`, {
    headers: getOfficeAuthHeaders(),
  });

  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || 'Failed to load service report');
  return j;
},

  async getTechChecklist(jobId) {
    const r = await fetch(`/api/tech/assignments/${jobId}/checklist`, {
      headers: { Authorization: `Bearer ${state.techToken}` },
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || 'Failed to load checklist');
    return j;
  },

  async updateTechChecklistItem(jobId, itemId, payload) {
    const r = await fetch(`/api/tech/assignments/${jobId}/checklist/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.techToken}`,
      },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || 'Failed to update checklist item');
    return j;
  },

  async addTechChecklistNote(jobId, noteText) {
    const r = await fetch(`/api/tech/assignments/${jobId}/checklist-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.techToken}`,
      },
      body: JSON.stringify({ noteText }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || 'Failed to add checklist note');
    return j;
  },
  
  async getTechServiceReport(jobId) {
    const r = await fetch(`/api/tech/assignments/${jobId}/service-report`, {
      headers: { Authorization: `Bearer ${state.techToken}` },
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || 'Failed to load service report');
    return j;
  },

  async saveTechServiceReport(jobId, payload) {
    const r = await fetch(`/api/tech/assignments/${jobId}/service-report`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.techToken}`,
      },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || 'Failed to save service report');
    return j;
  },

  async addTechServicePart(jobId, payload) {
    const r = await fetch(`/api/tech/assignments/${jobId}/service-report/parts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.techToken}`,
      },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || 'Failed to add part');
    return j;
  },

  async updateTechServicePart(partId, payload) {
    const r = await fetch(`/api/tech/service-parts/${partId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.techToken}`,
      },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || 'Failed to update part');
    return j;
  },

  async deleteTechServicePart(partId) {
    const r = await fetch(`/api/tech/service-parts/${partId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${state.techToken}`,
      },
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || 'Failed to delete part');
    return j;
  },

async updateJobStatusOffice(id, status) {
  const r = await fetch(`/api/assignments/${id}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  const text = await r.text();
  let j = {};
  try {
    j = text ? JSON.parse(text) : {};
  } catch {
    j = { raw: text };
  }

  if (!r.ok) {
    console.error("updateJobStatusOffice failed", { statusCode: r.status, body: j });
    throw new Error(j?.error || j?.message || j?.raw || `Failed to update job status (${r.status})`);
  }

  return j;
},

    async techLogin(phone, pin) {
    const r = await fetch("/api/tech/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, pin }),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || "Login failed");
    return j;
  },

  async userLogin(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    return data;
  },

  async techMyJobs(status = "") {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    const r = await fetch(`/api/tech/assignments${qs}`, {
      headers: { Authorization: `Bearer ${state.techToken}` },
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || "Failed to load technician jobs");
    return j;
  },

async updateTechnician(id, payload) {
  const r = await fetch(`/api/technicians/${id}`, {
    method: "PUT",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const text = await r.text();
  let j = {};
  try { j = text ? JSON.parse(text) : {}; } catch { j = { raw: text }; }

  if (!r.ok) {
    throw new Error(j?.error || j?.message || j?.raw || "Failed to update technician");
  }

  return j;
},

  async updateJobStatusTech(id, status) {
  const r = await fetch(`/api/tech/assignments/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${state.techToken}`,
    },
    body: JSON.stringify({ status }),
  });

  const text = await r.text();
  let j = {};
  try {
    j = text ? JSON.parse(text) : {};
  } catch {
    j = { raw: text };
  }

  if (!r.ok) {
    console.error("updateJobStatusTech failed", { statusCode: r.status, body: j });
    throw new Error(j?.error || j?.message || j?.raw || `Failed to update status (${r.status})`);
  }

  return j;
},

  async listProjects() {
  const r = await fetch('/api/projects', {
    headers: getOfficeAuthHeaders({}),
  });
  const j = await r.json().catch(() => ([]));
  if (!r.ok) throw new Error(j?.error || 'Failed to load projects');
  return j;
},

  async listLifts() {
    const r = await fetch("/api/lifts");
    if (!r.ok) throw new Error("Failed to load lifts");
    return r.json();
  },

  async listTechnicians() {
  const r = await fetch("/api/technicians", {
    headers: getOfficeAuthHeaders(),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Failed to load technicians");
  return j;
},

updateJobTeam(jobId, payload) {
  return fetch(`/api/jobs/${jobId}/team`, {
    method: "PUT",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  }).then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Failed to update team");
    return j;
  });
},

updateBreakdownTeam(jobId, payload) {
  return fetch(`/api/breakdown-calls/${jobId}/team`, {
    method: "PUT",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  }).then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Failed to reassign breakdown team");
    return j;
  });
},

async getTechnicianJobs(id) {
  const r = await fetch(`/api/technicians/${id}/jobs`);
  const j = await r.json().catch(() => ([]));
  if (!r.ok) throw new Error(j?.error || "Failed to load technician jobs");
  return j;
},
 
async createTechnician(payload) {
  const r = await fetch("/api/technicians", {
    method: "POST",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Failed to create technician");
  return j;
},

async setTechnicianPin(id, pin) {
  const r = await fetch(`/api/technicians/${id}/pin`, {
    method: "PUT",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify({ pin }),
  });
  const text = await r.text();
  let j = {};
  try { j = text ? JSON.parse(text) : {}; } catch { j = { raw: text }; }
  if (!r.ok) throw new Error(j?.error || j?.message || j?.raw || "Failed to set technician PIN");
  return j;
},

async deleteTechnician(id) {
  const r = await fetch(`/api/technicians/${id}`, {
    method: "DELETE",
    headers: getOfficeAuthHeaders(),
  });

  const text = await r.text();
  let j = {};
  try { j = text ? JSON.parse(text) : {}; } catch { j = { raw: text }; }

  if (!r.ok) {
    throw new Error(j?.error || j?.message || j?.raw || "Failed to delete technician");
  }

  return j;
},

listTechnicianLeaves(technicianId) {
  return fetch(`/api/technicians/${technicianId}/leaves`, {
    headers: getOfficeAuthHeaders(),
  }).then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Failed to load leave records");
    return j;
  });
},

createTechnicianLeave(technicianId, payload) {
  return fetch(`/api/technicians/${technicianId}/leaves`, {
    method: "POST",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  }).then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Failed to create leave");
    return j;
  });
},

cancelTechnicianLeave(leaveId) {
  return fetch(`/api/technician-leaves/${leaveId}/cancel`, {
    method: "PUT",
    headers: getOfficeAuthHeaders(),
  }).then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Failed to cancel leave");
    return j;
  });
},

async deleteJob(id) {
  const r = await fetch(`/api/jobs/${id}`, {
    method: "DELETE",
    headers: getOfficeAuthHeaders(),
  });

  const text = await r.text();
  let j = {};
  try { j = text ? JSON.parse(text) : {}; } catch { j = { raw: text }; }

  if (!r.ok) {
    throw new Error(j?.error || j?.message || j?.raw || "Failed to delete job");
  }

  return j;
},

async deleteProjectLift(id) {
  const r = await fetch(`/api/project-lifts/${id}`, {
    method: "DELETE",
    headers: getOfficeAuthHeaders(),
  });

  const text = await r.text();
  let j = {};
  try { j = text ? JSON.parse(text) : {}; } catch { j = { raw: text }; }

  if (!r.ok) {
    throw new Error(j?.error || j?.message || j?.raw || "Failed to delete lift");
  }

  return j;
},

async deleteProject(id) {
  const r = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
    headers: getOfficeAuthHeaders(),
  });

  const text = await r.text();
  let j = {};
  try { j = text ? JSON.parse(text) : {}; } catch { j = { raw: text }; }

  if (!r.ok) {
    throw new Error(j?.error || j?.message || j?.raw || "Failed to delete project");
  }

  return j;
},

async deleteAmc(id) {
  const r = await fetch(`/api/amc/${id}`, {
    method: "DELETE",
    headers: getOfficeAuthHeaders(),
  });

  const text = await r.text();
  let j = {};
  try { j = text ? JSON.parse(text) : {}; } catch { j = { raw: text }; }

  if (!r.ok) {
    throw new Error(j?.error || j?.message || j?.raw || "Failed to delete AMC");
  }

  return j;
},

  async createProject(payload) {
  const r = await fetch("/api/projects", {
    method: "POST",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Create project failed");
  return j;
},


  async assignTechToProjectLift(projectLiftId, payload) {
  console.log("THIS MODAL VERSION 2 RUNNING");

  const r = await fetch(`/api/project-lifts/${projectLiftId}/assign`, {
    method: "POST",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const j = await r.json().catch(() => ({}));

  console.log("ASSIGN API RESPONSE:", j);

  if (!r.ok) throw new Error(j?.error || "Create job failed");

  const warning = j?.leaveWarning || j?.debugLeaveWarning;

  if (warning) {
    await showWarningModal(warning);
  }

  return j;
},

async assignWarrantyService(projectLiftId, payload) {
  const r = await fetch(`/api/project-lifts/${projectLiftId}/warranty-service-assign`, {
    method: "POST",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Failed to assign warranty service");
  return j;
},
  
async assignAmcService(projectLiftId, payload) {
  const r = await fetch(`/api/project-lifts/${projectLiftId}/amc-service-assign`, {
    method: "POST",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Failed to assign AMC service");
  return j;
},

async dueAmcJobs() {
  const r = await fetch('/api/amc/due-jobs');
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'Failed to load due AMC jobs');
  return j;
},

async getServiceDashboard() {
  const r = await fetch('/api/service/dashboard');
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'Failed to load service dashboard');
  return j;
},

async autoCreateAmcJob(projectLiftId, payload) {
  const r = await fetch(`/api/project-lifts/${projectLiftId}/auto-amc-job`, {
    method: "POST",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Failed to create AMC job");
  return j;
},

  async saveProjectLiftMilestones(projectLiftId, payload) {
  const r = await fetch(`/api/project-lifts/${projectLiftId}/milestones`, {
    method: "PUT",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Failed to save milestones");
  return j;
},

async completeProjectLiftHandover(projectLiftId, payload) {
  const r = await fetch(`/api/project-lifts/${projectLiftId}/complete-handover`, {
    method: "PUT",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Failed to complete handover");
  return j;
},

  async getJob(jobId) {
    const r = await fetch(`/api/jobs/${jobId}`);
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || "Failed to load job");
    return j;
  },

getJobs: async (view = "open") => {
  const r = await fetch(`/api/jobs?view=${encodeURIComponent(view)}`);
  return r.json();
},

  async addJobTeamMember(jobId, payload) {
  const r = await fetch(`/api/jobs/${jobId}/team`, {
    method: "POST",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Failed to add team member");
  return j;
},

 async updateJobTeamMember(memberId, payload) {
  const r = await fetch(`/api/job-team/${memberId}`, {
    method: "PUT",
    headers: getOfficeAuthHeaders(),
    body: JSON.stringify(payload),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Failed to update team member");
  return j;
},

  async removeJobTeamMember(memberId) {
  const r = await fetch(`/api/job-team/${memberId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${state.userToken}`,
    },
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error || "Failed to remove team member");
  return j;
  },
};

// ---------- Side actions ----------

const SIDE_ACTIONS = [
  {
    key: "tech",
    label: "My Jobs",
    roles: ["TECHNICIAN"],
  },
  {
    key: "jobs",
    label: "Jobs",
    roles: ["SUPERVISOR", "MANAGER", "ADMIN"],
  },
  {
    key: "serviceJobs",
    label: "Service Jobs",
    roles: ["TECHNICIAN", "SUPERVISOR", "MANAGER", "ADMIN"],
  },
  {
    key: "reports",
    label: "Reports",
    roles: ["MANAGER", "ADMIN"],
  },
  {
    key: "settings",
    label: "Settings",
    roles: ["ADMIN"],
  },
];

function canAccess(view, role) {
  const r = normalizeRole(role);

  const viewRoles = {
    dashboard: ["TECHNICIAN", "SUPERVISOR", "MANAGER", "ADMIN"],
    projects: ["SUPERVISOR", "MANAGER", "ADMIN"],
    lifts: ["SUPERVISOR", "MANAGER", "ADMIN"],
    jobs: ["SUPERVISOR", "MANAGER", "ADMIN"],
    technicians: ["MANAGER", "ADMIN"],
    reports: ["MANAGER", "ADMIN"],
    service: ["TECHNICIAN", "SUPERVISOR", "MANAGER", "ADMIN"],
    tech: ["TECHNICIAN"],
    amc: ["MANAGER", "ADMIN"],
    users: ["ADMIN"],
  };

  const allowed = viewRoles[view];
  if (!allowed) return true;

  return allowed.includes(r);
}

function getViewPermission(view) {
  const map = {
    dashboard: "dashboard.view",
    projects: "projects.view",
    lifts: "lifts.view",
    jobs: "jobs.view",
    breakdowns: "jobs.view",
    technicians: "technicians.view",
    service: "service.view",
    amc: "amc.view",
    reports: "reports.view",
    users: "users.view",
    tech: null, // technician shell stays separate
  };

  return map[view] || null;
}

function getOfficeMenuItems() {
  return [
    { key: "dashboard", label: "Dashboard", perm: "dashboard.view" },
    { key: "projects", label: "Projects", perm: "projects.view" },
    { key: "lifts", label: "Lifts", perm: "lifts.view" },
    { key: "jobs", label: "Jobs", perm: "jobs.view" },

    // ✅ ADD THIS
    { key: "breakdowns", label: "Breakdown Calls", perm: "jobs.view" },

    { key: "technicians", label: "Technicians", perm: "technicians.view" },
    { key: "service", label: "Service", perm: "service.view" },
    { key: "amc", label: "AMC", perm: "amc.view" },
    { key: "reports", label: "Reports", perm: "reports.view" },
    { key: "users", label: "Users", perm: "users.view" },
  ];
}

function renderSideActions() {
  const box = el("sideActions");
  if (!box) return;

  box.innerHTML = "";

  if (!state.techToken && !state.userToken) {
    const b1 = document.createElement("button");
    b1.className = "btn secondary";
    b1.type = "button";
    b1.textContent = "Technician Login";
    b1.onclick = showTechLoginModal;

    const b2 = document.createElement("button");
    b2.className = "btn";
    b2.type = "button";
    b2.style.marginTop = "8px";
    b2.textContent = "Office Login";
    b2.onclick = showUserLoginModal;

    box.appendChild(b1);
    box.appendChild(b2);
    return;
  }

  const profile = getActiveProfile();
  const role = normalizeRole(getActiveRole());
  const currentView = currentViewFromHash();

  const info = document.createElement("div");
  info.className = "muted";
  info.style.fontSize = "12px";
  info.style.marginBottom = "10px";
  info.innerHTML = `
    Logged in as <b>${escapeHtml(profile?.name || "User")}</b>
    <br><span style="opacity:.75">${escapeHtml(role || "UNKNOWN ROLE")}</span>
  `;
  box.appendChild(info);

  let items = [];

  if (role === "TECHNICIAN") {
    items = [
      { key: "tech", label: "My Jobs", allowed: true },
      { key: "service", label: "Service", allowed: true },
    ];
  } else {
    items = getOfficeMenuItems().map((item) => ({
      ...item,
      allowed: hasPermission(item.perm),
    }));
  }

  items.forEach((item, index) => {
    const b = document.createElement("button");
    b.className = "btn";
    b.type = "button";
    if (index > 0) b.style.marginTop = "8px";

    if (item.key === currentView) {
      b.classList.add("secondary");
    }

    b.textContent = item.label;

    if (!item.allowed) {
      b.style.opacity = "0.55";
      b.title = "Access restricted";
    }

    b.onclick = () => {
      location.hash = item.key;
    };

    box.appendChild(b);
  });

  const lo = document.createElement("button");
  lo.className = "btn secondary";
  lo.type = "button";
  lo.style.marginTop = "10px";
  lo.textContent = "Logout";
  lo.onclick = () => {
    clearSession();
    renderOpeningLogin();
  };

  box.appendChild(lo);
}

function techLogout() {
  clearSession();
  renderSideActions();
  renderOpeningLogin();   // 👈 THIS is important
}

function showUserLoginModal() {
  const wrap = document.createElement('div');

  wrap.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;">
      <input id="loginEmail" placeholder="Email" />
      <input id="loginPassword" type="password" placeholder="Password" />
    </div>
  `;

  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.textContent = 'Login';

  btn.onclick = async () => {
    try {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      const data = await API.userLogin(email, password);

      state.userToken = data.token;
      state.user = data.user;

      localStorage.setItem(LS_USER_TOKEN, data.token);
      localStorage.setItem(LS_USER, JSON.stringify(data.user));

      closeModal();
      renderSideActions();
      render('dashboard');
    } catch (e) {
      alert(e.message);
    }
  };

  openModal({
    title: 'Office Login',
    bodyNode: wrap,
    footerNodes: [btn],
  });
}

function showTechLoginModal() {
  const body = document.createElement("div");
  body.innerHTML = `
    <div class="formGrid">
      <div class="field">
        <label>Phone</label>
        <input id="techPhone" placeholder="17xxxxxx" />
      </div>
      <div class="field">
        <label>PIN</label>
        <input id="techPin" placeholder="4-8 digits" />
      </div>
      <div class="field" style="grid-column:1/-1">
        <div class="muted" style="font-size:12px">
          PIN is required for technician login.
        </div>
      </div>
    </div>
  `;

  const btnCancel = smallBtn("Cancel", "secondary");
  btnCancel.onclick = closeModal;

  const btnLogin = smallBtn("Login", "primary");
  btnLogin.onclick = async () => {
    try {
      const phone = body.querySelector("#techPhone").value.trim();
      const pin = body.querySelector("#techPin").value.trim();
      const res = await API.techLogin(phone, pin);

      setSession(res.token, res.technician);

      closeModal();
      renderSideActions();
      location.hash = "tech";
    } catch (e) {
      alert(e.message);
    }
  };

  openModal({
    title: "Technician Login",
    bodyNode: body,
    footerNodes: [btnCancel, btnLogin]
  });
}

function showEditTechnicianModal(tech) {
  const selectedSkills = String(tech.skills || "")
    .split(",")
    .map((x) => x.trim().toUpperCase())
    .filter(Boolean);

  const body = document.createElement("div");
  body.innerHTML = `
    <div class="formGrid">
      <div class="field">
        <label>Name</label>
        <input id="editTechName" value="${tech.name || ""}" />
      </div>

      <div class="field">
        <label>Phone</label>
        <input id="editTechPhone" value="${tech.phone || ""}" />
      </div>

      <div class="field">
        <label>Email</label>
        <input id="editTechEmail" value="${tech.email || ""}" />
      </div>

      <div class="field">
        <label>Skill Set</label>
        <select id="editTechSkills" multiple size="3">
          <option value="INSTALL" ${selectedSkills.includes("INSTALL") ? "selected" : ""}>INSTALL</option>
          <option value="TEST" ${selectedSkills.includes("TEST") ? "selected" : ""}>TEST</option>
          <option value="SERVICE" ${selectedSkills.includes("SERVICE") ? "selected" : ""}>SERVICE</option>
        </select>
      </div>

      <div class="field" style="grid-column:1/-1">
        <div class="muted" style="font-size:12px">
          Hold Ctrl (or Cmd on Mac) to select multiple skills.
        </div>
      </div>

      <div class="field" style="grid-column:1/-1">
        <label>New PIN (optional)</label>
        <input id="editTechPin" placeholder="Leave blank to keep current PIN" />
      </div>
    </div>
  `;

  const btnCancel = smallBtn("Cancel", "secondary");
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn("Save Changes", "primary");
  btnSave.onclick = async () => {
    try {
      const name = body.querySelector("#editTechName").value.trim();
      const phone = body.querySelector("#editTechPhone").value.trim();
      const email = body.querySelector("#editTechEmail").value.trim();
      const skills = Array.from(body.querySelector("#editTechSkills").selectedOptions)
        .map((o) => o.value)
        .join(",");
      const pin = body.querySelector("#editTechPin").value.trim();

      if (!name) throw new Error("Technician name is required");
      if (!skills) throw new Error("At least one skill is required");

      await API.updateTechnician(tech.id, {
        name,
        phone,
        email,
        skills,
      });

      if (pin) {
        if (!/^[0-9]{4,8}$/.test(pin)) {
          throw new Error("PIN must be 4 to 8 digits");
        }
        await API.setTechnicianPin(tech.id, pin);
      }

      closeModal();
await renderTechnicians();
if (pin) {
  showToast("Technician & PIN updated successfully");
} else {
  showToast("Technician updated successfully");
}
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  const btnDelete = smallBtn("Delete", "danger");

btnDelete.onclick = async () => {
  if (!confirm(`Delete technician "${tech.name}"?`)) return;

  try {
    await API.deleteTechnician(tech.id);

    closeModal();
    await renderTechnicians();

    showToast("Technician deleted successfully");
  } catch (e) {
    alert(e.message || "Failed to delete technician");
  }
};

openModal({
  title: "Edit Technician",
  bodyNode: body,
  footerNodes: [btnDelete, btnCancel, btnSave],
});
}

async function filterAvailableTechnicians(technicians, date = new Date()) {
  const d = new Date(date).toISOString().slice(0, 10);

  const leaves = await TechnicianLeave.findAll({
    where: {
      status: "APPROVED",
      from_date: { [Op.lte]: d },
      to_date: { [Op.gte]: d },
    },
    attributes: ["technician_id"],
  });

  const leaveSet = new Set(leaves.map((l) => l.technician_id));

  return technicians.filter(
    (t) =>
      t.isActive &&
      t.availability_status === "AVAILABLE" &&
      !leaveSet.has(t.id)
  );
}

function showMilestoneModal(projectLiftId, lift) {
  const body = document.createElement("div");
  body.innerHTML = `
    <div class="formGrid">
      <div class="field" style="grid-column:1/-1">
        <label>Lift Code</label>
        <input value="${lift.liftCode || ""}" disabled />
      </div>

      <div class="field">
        <label>Installation Start Date</label>
        <input type="date" id="installationStartDate" value="${lift.installationStartDate || ""}" />
      </div>

      <div class="field">
        <label>Installation End Date</label>
        <input type="date" id="installationEndDate" value="${lift.installationEndDate || ""}" />
      </div>

      <div class="field">
        <label>Testing Start Date</label>
        <input type="date" id="testingStartDate" value="${lift.testingStartDate || ""}" />
      </div>

      <div class="field">
        <label>Testing End Date</label>
        <input type="date" id="testingEndDate" value="${lift.testingEndDate || ""}" />
      </div>

      <div class="field">
        <label>Handover Target Date</label>
        <input type="date" id="handoverDate" value="${lift.handoverDate || ""}" />
      </div>

      <div class="field">
        <label>Warranty Months</label>
        <input type="number" min="1" step="1" id="warrantyMonths" value="${lift.warrantyMonths ?? 12}" required />
      </div>

      <div class="field">
        <label>Warranty Service Visits</label>
        <input type="number" min="1" step="1" id="warrantyServiceVisits" value="${lift.warrantyServiceVisits ?? 5}" required />
      </div>

      <div class="field" style="grid-column:1/-1">
        <label>Notes</label>
        <textarea id="milestoneNotes" placeholder="Installation / testing / handover notes...">${lift.notes || ""}</textarea>
      </div>

      <div class="field" style="grid-column:1/-1">
        <div id="milestoneValidationBox" class="muted" style="font-size:12px;"></div>
      </div>

      <div class="field" style="grid-column:1/-1">
        <div class="muted" style="font-size:12px">
          This is the planned handover target date for tracking. Actual handover is recorded separately through Complete Handover.
        </div>
      </div>
    </div>
  `;

  const installationStartEl = body.querySelector("#installationStartDate");
  const installationEndEl = body.querySelector("#installationEndDate");
  const testingStartEl = body.querySelector("#testingStartDate");
  const testingEndEl = body.querySelector("#testingEndDate");
  const handoverDateEl = body.querySelector("#handoverDate");
  const warrantyMonthsEl = body.querySelector("#warrantyMonths");
  const warrantyVisitsEl = body.querySelector("#warrantyServiceVisits");
  const validationBox = body.querySelector("#milestoneValidationBox");

  function parseDateOnly(v) {
    if (!v) return null;
    const d = new Date(`${v}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function compareDateOnly(a, b) {
    if (!a || !b) return 0;
    const da = parseDateOnly(a);
    const db = parseDateOnly(b);
    if (!da || !db) return 0;
    if (da < db) return -1;
    if (da > db) return 1;
    return 0;
  }

  function validateMilestones() {
    const errors = [];
    const warnings = [];

    const installationStartDate = installationStartEl.value || null;
    const installationEndDate = installationEndEl.value || null;
    const testingStartDate = testingStartEl.value || null;
    const testingEndDate = testingEndEl.value || null;
    const handoverDate = handoverDateEl.value || null;
    const warrantyMonths = Number(warrantyMonthsEl.value);
    const warrantyServiceVisits = Number(warrantyVisitsEl.value);

    if (!Number.isFinite(warrantyMonths) || warrantyMonths < 1) {
      errors.push("Warranty Months must be at least 1.");
    }

    if (!Number.isFinite(warrantyServiceVisits) || warrantyServiceVisits < 1) {
      errors.push("Warranty Service Visits must be at least 1.");
    }

    if (installationStartDate && installationEndDate && compareDateOnly(installationEndDate, installationStartDate) < 0) {
      errors.push("Installation End Date cannot be earlier than Installation Start Date.");
    }

    if (installationEndDate && testingStartDate && compareDateOnly(testingStartDate, installationEndDate) < 0) {
      errors.push("Testing Start Date cannot be earlier than Installation End Date.");
    }

    if (testingStartDate && testingEndDate && compareDateOnly(testingEndDate, testingStartDate) < 0) {
      errors.push("Testing End Date cannot be earlier than Testing Start Date.");
    }

    if (testingEndDate && handoverDate && compareDateOnly(handoverDate, testingEndDate) < 0) {
      errors.push("Handover Target Date cannot be earlier than Testing End Date.");
    }

    if (installationEndDate && testingStartDate && compareDateOnly(testingStartDate, installationEndDate) > 0) {
      warnings.push("Testing starts after installation end, which is fine if intentional.");
    }

    if (testingEndDate && handoverDate && compareDateOnly(handoverDate, testingEndDate) > 0) {
      warnings.push("Handover target is later than testing end, which is fine if intentional.");
    }

    if (errors.length) {
      validationBox.className = "warnText";
      validationBox.innerHTML = errors.map(x => `• ${x}`).join("<br>");
    } else if (warnings.length) {
      validationBox.className = "muted";
      validationBox.innerHTML = warnings.map(x => `• ${x}`).join("<br>");
    } else {
      validationBox.className = "goodText";
      validationBox.textContent = "Milestone sequence looks valid.";
    }

    return { errors, warnings };
  }

  [
    installationStartEl,
    installationEndEl,
    testingStartEl,
    testingEndEl,
    handoverDateEl,
    warrantyMonthsEl,
    warrantyVisitsEl,
  ].forEach((el) => {
    if (el) el.addEventListener("change", validateMilestones);
    if (el) el.addEventListener("input", validateMilestones);
  });

  validateMilestones();

  const btnCancel = smallBtn("Cancel", "secondary");
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn("Save Milestones", "primary");
  btnSave.onclick = async () => {
    try {
      const check = validateMilestones();
      if (check.errors.length) {
        throw new Error(check.errors[0]);
      }

      const payload = {
        installationStartDate: installationStartEl.value || null,
        installationEndDate: installationEndEl.value || null,
        testingStartDate: testingStartEl.value || null,
        testingEndDate: testingEndEl.value || null,
        handoverDate: handoverDateEl.value || null,
        warrantyMonths: Number(warrantyMonthsEl.value),
        warrantyServiceVisits: Number(warrantyVisitsEl.value),
        notes: body.querySelector("#milestoneNotes").value || "",
      };

      await API.saveProjectLiftMilestones(projectLiftId, payload);

      closeModal();
      alert("Milestones saved successfully");
      await openProject(state.currentProjectId);
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  openModal({
    title: `Milestones - ${lift.liftCode || ""}`,
    bodyNode: body,
    footerNodes: [btnCancel, btnSave],
  });
}

function renderAmcAssignmentPanel(rows = []) {
  if (!Array.isArray(rows)) rows = [];

  return `
    <div class="card">
      <div class="label">AMC Auto Job Assignment</div>
      <div class="muted">Lifts ready for AMC service but not yet assigned</div>
      <div class="hr"></div>

      ${
        !rows.length
          ? `<div class="muted">All AMC services are assigned.</div>`
          : rows.slice(0, 10).map((l) => `
              <div class="listRow">
                <div>
                  <b>${l.liftCode || ""}</b>
                  <div class="muted">
                    ${[l.customerName, l.building].filter(Boolean).join(" - ")}
                  </div>
                </div>

                <div class="rowActions">
                  <button
                    class="btn"
                    data-action="assign-amc"
                    data-lift='${escapeHtml(JSON.stringify(l))}'>
                    Assign
                  </button>

                  <button
                    class="btn secondary"
                    data-action="open-project"
                    data-project-id="${l.projectId || ""}">
                    Project
                  </button>

                  <button
                    class="btn secondary"
                    data-action="open-lift"
                    data-lift-id="${l.projectLiftId || ""}">
                    Lift
                  </button>
                </div>
              </div>
            `).join("")
      }
    </div>
  `;
}
// ---------- Views ----------
const sidebar = document.querySelector(".side");
if (sidebar) sidebar.style.display = "none";

function renderOpeningLogin() {
  const root = setViewMode(false);

  setTitle("Login");
  setToolbar([]);
  setSidebarVisible(false);

  document.querySelectorAll("#nav a").forEach(a => a.classList.remove("active"));

  root.innerHTML = `
    <div class="office-login-page">
      <div class="office-login-overlay"></div>

      <div class="office-login-brand">
        <div class="brand-kicker">Modern</div>
        <div class="brand-title">Building Services</div>
        <div class="brand-line"></div>

        <h1>Lift Management System</h1>
        <p>Smart maintenance. Safer buildings. Better service.</p>

        <div class="brand-features">
          <div>
            <span>⚙</span>
            <div>
              <b>Breakdown Management</b>
              <small>Raise, assign & resolve faster</small>
            </div>
          </div>

          <div>
            <span>👷</span>
            <div>
              <b>Technician Tracking</b>
              <small>Real-time technician status</small>
            </div>
          </div>

          <div>
            <span>🛡</span>
            <div>
              <b>AMC & Warranty</b>
              <small>Track contracts and expiries</small>
            </div>
          </div>

          <div>
            <span>📊</span>
            <div>
              <b>Reports & Insights</b>
              <small>Data-driven maintenance</small>
            </div>
          </div>
        </div>
      </div>

      <div class="office-login-card-wrap">
        <div class="office-login-card">
          <div class="login-logo-mark">MBS</div>

          <h2>Modern Building Services</h2>
          <div class="login-subtitle">Lift Management System</div>

          <div class="login-form-title">Office Login</div>

          <div class="login-field">
            <label>Email Address</label>
            <input id="loginEmail" type="email" placeholder="admin@liftapp.com" autocomplete="username" />
          </div>

          <div class="login-field">
            <label>Password</label>
            <div class="password-wrap">
              <input id="loginPassword" type="password" placeholder="Password" autocomplete="current-password" />
              <button id="togglePasswordBtn" type="button">Show</button>
            </div>
          </div>

<div class="remember-row">
  <label class="remember-check">
    <input id="rememberMe" type="checkbox" checked />
    <span>Remember Me</span>
  </label>
</div>
          <button id="btnOfficeLogin" class="office-login-btn" type="button">
            Sign In
          </button>

          <div id="loginMsg" class="login-message"></div>
        </div>

        <div class="login-footer">
          © 2026 Modern Building Services<br />
          <span>Office Management Portal</span>
        </div>
      </div>
    </div>
  `;

  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");
  const btn = document.getElementById("btnOfficeLogin");
  const msg = document.getElementById("loginMsg");
  const toggleBtn = document.getElementById("togglePasswordBtn");
  const rememberMe = document.getElementById("rememberMe");

  toggleBtn.onclick = () => {
    const showPassword = passwordInput.type === "password";
    passwordInput.type = showPassword ? "text" : "password";
    toggleBtn.textContent = showPassword ? "Hide" : "Show";
  };

  async function submitOfficeLogin() {
    try {
      const email = String(emailInput?.value || "").trim();
      const password = String(passwordInput?.value || "").trim();

      msg.className = "login-message";

      if (!email) {
        msg.textContent = "Email is required";
        msg.classList.add("error");
        return;
      }

      if (!password) {
        msg.textContent = "Password is required";
        msg.classList.add("error");
        return;
      }

      btn.disabled = true;
      btn.textContent = "Signing in...";
      msg.textContent = "";

      const res = await API.userLogin(email, password);

      state.userToken = res.token;
      state.user = res.user;

      const storage = rememberMe?.checked ? localStorage : sessionStorage;

localStorage.removeItem(LS_USER_TOKEN);
localStorage.removeItem(LS_USER);
sessionStorage.removeItem(LS_USER_TOKEN);
sessionStorage.removeItem(LS_USER);

storage.setItem(LS_USER_TOKEN, res.token);
storage.setItem(LS_USER, JSON.stringify(res.user));

      // Important: clear technician session because this is office login only
      state.techToken = null;
      state.tech = null;
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_TECH);

      msg.textContent = "";

      setViewMode(true);
      setSidebarVisible(true);
      renderSideActions();

      location.hash = "dashboard";
      await render(currentViewFromHash());
    } catch (e) {
      msg.textContent = e.message || "Login failed";
      msg.className = "login-message error";

      btn.disabled = false;
      btn.textContent = "Sign In";
    }
  }

  btn.onclick = submitOfficeLogin;

  emailInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitOfficeLogin();
  });

  passwordInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitOfficeLogin();
  });
}

async function renderDashboard() {
  const root = setViewMode(false);
  setTitle("Dashboard");
  setToolbar([]);

  root.innerHTML = `<div class="card"><div class="label">Loading...</div></div>`;

  try {
    const [kpi, workflow, jobsData] = await Promise.all([
      API.getDashboardKpis(),
      API.getWorkflowReadiness(),
      API.getJobs("open"),
    ]);

    const jobs = Array.isArray(jobsData?.rows) ? jobsData.rows : [];

    const rows = Array.isArray(jobs) ? jobs : [];
    const workflowRows = Array.isArray(workflow?.rows) ? workflow.rows : [];

    const activeJobs = rows.filter((j) =>
      ["ASSIGNED", "IN_PROGRESS"].includes(String(j.status || "").toUpperCase())
    ).length;

    const overdueJobs = rows.filter((j) => {
      if (!j.dueDate) return false;
      const due = new Date(j.dueDate);
      const checkToday = new Date();
      due.setHours(0, 0, 0, 0);
      checkToday.setHours(0, 0, 0, 0);
      return due < checkToday && !["DONE", "CANCELLED"].includes(String(j.status || "").toUpperCase());
    }).length;

    const assignedNotStarted = rows.filter((j) =>
      String(j.status || "").toUpperCase() === "ASSIGNED"
    ).length;

    const technicianMap = {};
    rows.forEach((j) => {
      const techName = j.leadTechnician?.name || j.technician?.name || "Unassigned";

      if (!technicianMap[techName]) {
        technicianMap[techName] = { total: 0, inProgress: 0, overdue: 0 };
      }

      technicianMap[techName].total += 1;

      if (String(j.status || "").toUpperCase() === "IN_PROGRESS") {
        technicianMap[techName].inProgress += 1;
      }

      if (j.dueDate) {
        const due = new Date(j.dueDate);
        const checkToday = new Date();
        due.setHours(0, 0, 0, 0);
        checkToday.setHours(0, 0, 0, 0);
        if (due < checkToday && !["DONE", "CANCELLED"].includes(String(j.status || "").toUpperCase())) {
          technicianMap[techName].overdue += 1;
        }
      }
    });

    const techRowsHtml = Object.entries(technicianMap)
      .map(([name, v]) => `
        <tr>
          <td>${name}</td>
          <td>${v.total}</td>
          <td>${v.inProgress}</td>
          <td>${v.overdue}</td>
        </tr>
      `)
      .join("");

    root.innerHTML = `
      <div class="dashboardGrid">
        <div class="card kpiCard">
          <div class="label">Total Lifts</div>
          <div class="kpiValue">${kpi.total ?? 0}</div>
        </div>
        <div class="card kpiCard">
          <div class="label">Active Jobs</div>
          <div class="kpiValue">${activeJobs}</div>
        </div>
        <div class="card kpiCard">
          <div class="label">Overdue Jobs</div>
          <div class="kpiValue">${overdueJobs}</div>
        </div>
        <div class="card kpiCard">
          <div class="label">Ready for Test</div>
          <div class="kpiValue">${workflow.readyForTestAssignment ?? 0}</div>
        </div>
        <div class="card kpiCard">
          <div class="label">Ready for Handover</div>
          <div class="kpiValue">${workflow.readyForHandover ?? 0}</div>
        </div>
        <div class="card kpiCard">
          <div class="label">Assigned Not Started</div>
          <div class="kpiValue">${assignedNotStarted}</div>
        </div>
      </div>

      <div class="dashboardGrid twoCols" style="margin-top:16px">
        <div class="card">
          <div class="label">Workflow Attention</div>
          <div class="hr"></div>
          ${
            !workflowRows.length
              ? `<div class="muted">No workflow actions pending.</div>`
              : workflowRows.slice(0, 6).map((r) => `
                  <div class="listRow clickableRow" data-project-id="${r.projectId || ''}">
                    <div>
                      <b>${r.liftCode || ""}</b>
                      <div class="muted">${[r.projectCode, r.projectName].filter(Boolean).join(" - ")}</div>
                    </div>
                    <div>${r.workflowStatus || ""}</div>
                  </div>
                `).join("")
          }
        </div>

        <div class="card">
          <div class="label">Jobs Needing Attention</div>
          <div class="hr"></div>
          ${
            !rows.length
              ? `<div class="muted">No jobs found.</div>`
              : rows
                  .filter((j) => {
                    const s = String(j.status || "").toUpperCase();
                    if (s === "ASSIGNED") return true;
                    if (!j.dueDate) return false;
                    const due = new Date(j.dueDate);
                    const checkToday = new Date();
                    due.setHours(0, 0, 0, 0);
                    checkToday.setHours(0, 0, 0, 0);
                    return due < checkToday && !["DONE", "CANCELLED"].includes(s);
                  })
                  .slice(0, 6)
                  .map((j) => `
                    <div class="listRow">
                      <div>
                        <b>${j.role || ""}</b>
                        <div class="muted">${j.lift?.liftCode || ""}</div>
                      </div>
                      <div>${j.status || ""}</div>
                    </div>
                  `)
                  .join("") || `<div class="muted">No jobs need attention.</div>`
          }
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <div class="label">Technician Workload</div>
        <div class="hr"></div>
        <div class="tableWrap" style="margin-top:0">
          <table>
            <thead>
              <tr>
                <th>Technician</th>
                <th>Total Jobs</th>
                <th>In Progress</th>
                <th>Overdue</th>
              </tr>
            </thead>
            <tbody>
              ${techRowsHtml || `<tr><td colspan="4" class="muted">No technician data</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    root.querySelectorAll(".clickableRow").forEach((row) => {
      row.addEventListener("click", () => {
        const projectId = row.dataset.projectId;
        if (!projectId) {
          alert("No projectId found");
          return;
        }
        openProjectFromDashboard(projectId);
      });
    });

    root.querySelectorAll("[data-action='open-project']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.projectId;
        if (id) openProjectFromDashboard(id);
      });
    });

    root.querySelectorAll("[data-action='open-lift']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.liftId;
        if (typeof openProjectLiftDetails === "function" && id) {
          openProjectLiftDetails(id);
        } else {
          alert("Lift view not connected yet");
        }
      });
    });
  } catch (e) {
    console.error(e);
    root.innerHTML = `
      <div class="card">
        <div class="label">Dashboard failed</div>
        <div class="hr"></div>
        <div class="muted">${String(e.message || e)}</div>
      </div>
    `;
  }
} 

async function renderUsers() {
  const root = setViewMode(true);

  if (!hasPermission("users.view")) {
    setTitle("Access Denied");
    setToolbar([]);
    root.innerHTML = `<div class="card"><div class="muted">You do not have access to Users.</div></div>`;
    return;
  }

  setTitle("Users");
  setToolbar([]);

  root.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:12px;flex-wrap:wrap;">
      <div class="label">Office Users</div>
      <button id="btnCreateUser" class="btn primary">+ Create User</button>
    </div>

    <div class="card">
      <div style="overflow:auto;">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th style="width:180px;">Actions</th>
            </tr>
          </thead>
          <tbody id="usersTableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  const btn = document.getElementById("btnCreateUser");
  if (btn) {
    btn.style.display = hasPermission("users.create") ? "" : "none";
    btn.onclick = showCreateUserModal;
  }

  const tb = document.getElementById("usersTableBody");

  try {
    const users = await API.listUsers();
    const rows = Array.isArray(users) ? users : (users.users || []);

    if (!rows.length) {
      tb.innerHTML = `
        <tr>
          <td colspan="5" class="muted" style="text-align:center;padding:20px;">
            No users found
          </td>
        </tr>
      `;
      return;
    }

    tb.innerHTML = "";

    rows.forEach((u) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${escapeHtml(u.name || "")}</td>
        <td>${escapeHtml(u.email || "—")}</td>
        <td>${escapeHtml(u.role || "")}</td>
        <td>
          <span class="statusBadge ${u.isActive ? "active" : "inactive"}">
            <span class="dot"></span>
            ${u.isActive ? "Active" : "Inactive"}
          </span>
        </td>
        <td>
  <div style="display:flex;gap:6px;flex-direction:column;">
    <button class="btn secondary btnEditUser">Edit</button>
    <button class="btn secondary btnPermUser">Permissions</button>
    <button class="btn ${u.isActive ? "secondary" : "primary"} btnToggleUser">
      ${u.isActive ? "Deactivate" : "Activate"}
    </button>
  </div>
</td>
      `;
      
      const btnPerm = tr.querySelector(".btnPermUser");
      const btnEdit = tr.querySelector(".btnEditUser");
      const btnToggle = tr.querySelector(".btnToggleUser");
      const currentUser = getActiveProfile();
      
if (btnPerm) {
  if (!hasPermission("users.permissions")) {
    btnPerm.style.display = "none";
  } else {
    btnPerm.onclick = () => showUserPermissionsModal(u);
  }
}
      if (btnEdit) {
        if (!hasPermission("users.edit")) {
          btnEdit.style.display = "none";
        } else {
          btnEdit.onclick = () => showEditUserModal(u);
        }
      }

      if (btnToggle) {
        if (!hasPermission("users.deactivate")) {
          btnToggle.style.display = "none";
        } else if (currentUser?.id === u.id) {
          btnToggle.disabled = true;
          btnToggle.title = "You cannot deactivate yourself";
        } else {
          btnToggle.onclick = async () => {
            try {
              if (u.isActive) {
                const ok = confirm(`Deactivate ${u.name}?`);
                if (!ok) return;
              }

              btnToggle.disabled = true;
              btnToggle.textContent = "Working...";

              await API.updateUser(u.id, {
                isActive: !u.isActive,
              });

              await renderUsers();
            } catch (e) {
              btnToggle.disabled = false;
              btnToggle.textContent = u.isActive ? "Deactivate" : "Activate";
              alert(e.message || "Failed to update user");
            }
          };
        }
      }

      tb.appendChild(tr);
    });
  } catch (e) {
    tb.innerHTML = `
      <tr>
        <td colspan="5" class="muted" style="text-align:center;padding:20px;">
          ${escapeHtml(e.message || "Failed to load users")}
        </td>
      </tr>
    `;
  }
}

function showUserPermissionsModal(user) {
  const effective = getEffectivePermissionsForUser(user);

  const body = document.createElement("div");
  body.style.maxHeight = "70vh";
  body.style.overflow = "auto";

  const role = normalizeRole(user?.role);
  const currentUser = getActiveProfile();
  const isSelf = currentUser?.id === user?.id;

  let html = `
    <div class="card" style="margin-bottom:12px;">
      <div class="label">Permissions for ${escapeHtml(user?.name || "User")}</div>
      <div class="muted" style="margin-top:6px;">
        Role: <b>${escapeHtml(role)}</b>
      </div>
      <div class="muted" style="margin-top:4px;">
        Toggle permissions below. Only differences from the role default will be saved.
      </div>
    </div>
  `;

  PERMISSION_GROUPS.forEach((group, groupIndex) => {
    html += `
      <div class="card" style="margin-bottom:12px;">
        <div class="label">${escapeHtml(group.module)}</div>
        <div style="margin-top:10px;display:grid;grid-template-columns:1fr auto auto;gap:8px 12px;align-items:center;">
    `;

    group.items.forEach((item, itemIndex) => {
      const checked = !!effective[item.code];
      const id = `perm_${groupIndex}_${itemIndex}_${user.id}`;

      html += `
        <div>${escapeHtml(item.label)}</div>
        <div class="muted" style="font-size:12px;">${escapeHtml(item.code)}</div>
        <label style="display:flex;align-items:center;justify-content:flex-end;">
          <input type="checkbox" data-perm-code="${escapeHtml(item.code)}" id="${id}" ${checked ? "checked" : ""} />
        </label>
      `;
    });

    html += `
        </div>
      </div>
    `;
  });

  body.innerHTML = html;

  if (isSelf) {
    const warn = document.createElement("div");
    warn.className = "muted";
    warn.style.marginTop = "8px";
    warn.style.color = "#b42318";
    warn.textContent = "Caution: you are editing your own permissions.";
    body.prepend(warn);
  }

  const btnReset = smallBtn("Reset to Role Default", "secondary");
  btnReset.onclick = () => {
    body.querySelectorAll("input[type='checkbox'][data-perm-code]").forEach((cb) => {
      const code = cb.getAttribute("data-perm-code");
      cb.checked = !!getRoleBasePermissions(role)[code];
    });
  };

  const btnCancel = smallBtn("Cancel", "secondary");
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn("Save Permissions", "primary");
  btnSave.onclick = async () => {
    try {
      if (btnSave.disabled) return;

      const effectivePermissions = {};
      body.querySelectorAll("input[type='checkbox'][data-perm-code]").forEach((cb) => {
        const code = cb.getAttribute("data-perm-code");
        effectivePermissions[code] = !!cb.checked;
      });
if (isSelf) {
  if (!effectivePermissions["users.view"] || !effectivePermissions["users.permissions"]) {
    alert("You cannot remove your own user-management access.");
    btnSave.disabled = false;
    btnSave.textContent = "Save Permissions";
    return;
  }
}
      const overrides = buildPermissionOverrides(role, effectivePermissions);

      btnSave.disabled = true;
      btnSave.textContent = "Saving...";

      await API.updateUserPermissions(user.id, overrides);

      closeModal();
      await renderUsers();
    } catch (e) {
      btnSave.disabled = false;
      btnSave.textContent = "Save Permissions";
      alert(e.message || "Failed to update permissions");
    }
  };

  openModal({
    title: "User Permissions",
    bodyNode: body,
    footerNodes: [btnReset, btnCancel, btnSave],
  });
}

async function renderProjects() {
  const root = setViewMode(true);

  if (!hasPermission("projects.view")) {
    setTitle("Access Denied");
    setToolbar([]);
    root.innerHTML = `<div class="card"><div class="muted">You do not have access to Projects.</div></div>`;
    return;
  }

  setTitle("Projects");

  const toolbar = [];

  if (hasPermission("projects.create")) {
    const btnCreate = smallBtn("+ Create Project", "primary");
    btnCreate.onclick = () => showCreateProjectModal();
    toolbar.push(btnCreate);
  }

  const btnRefresh = smallBtn("Refresh", "secondary");
  btnRefresh.onclick = () => renderProjects();
  toolbar.push(btnRefresh);

  setToolbar(toolbar);

  root.innerHTML = `<div class="card"><div class="label">Loading...</div></div>`;

  try {
    const rows = await API.listProjects();

    root.innerHTML = `
      <div class="card">
        <div class="label">Projects</div>
        <div class="hr"></div>
      </div>
    `;

    const card = root.querySelector(".card");

    const wrap = document.createElement("div");
    wrap.className = "tableContainer";
    wrap.style.maxHeight = "420px";
    wrap.style.overflow = "auto";

    wrap.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>Project Code</th>
            <th>Project Name</th>
            <th>Customer</th>
            <th>Site</th>
            <th>Lifts</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="pBody"></tbody>
      </table>
    `;

    card.appendChild(wrap);

    const tb = wrap.querySelector("#pBody");

    if (!rows || !rows.length) {
      tb.innerHTML = `
        <tr>
          <td colspan="7" class="muted text-center">No projects found.</td>
        </tr>
      `;
      return;
    }

    rows.forEach((p) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${escapeHtml(p.projectCode || "")}</td>
        <td>${escapeHtml(p.projectName || "")}</td>
        <td>${escapeHtml(p.customer?.name || "")}</td>
        <td>${escapeHtml(p.site?.name || "")}</td>
        <td>${escapeHtml(String(p.liftCount ?? 0))}</td>
        <td class="text-center"></td>
        <td class="text-center"></td>
      `;

      const statusEl = badge(p.status || "OPEN");
      tr.children[5].appendChild(statusEl);

      const openBtn = smallBtn("Open", "secondary");
      openBtn.onclick = async () => {
        try {
          openBtn.disabled = true;
          openBtn.textContent = "Opening...";
          await openProject(p.id);
        } catch (e) {
          openBtn.disabled = false;
          openBtn.textContent = "Open";
          alert(e.message || "Failed to open project");
        }
      };
      tr.children[6].appendChild(openBtn);

if (hasPermission("projects.delete")) {
  const deleteBtn = smallBtn("Delete", "danger");
  deleteBtn.style.marginLeft = "8px";

  deleteBtn.onclick = async () => {
    if (!confirm(`Delete project "${p.projectName}"?\n\nAll lifts must be deleted first.`)) return;

    try {
      await API.deleteProject(p.id);

      showToast("Project deleted successfully");
      await renderProjects();
    } catch (e) {
      alert(e.message || "Failed to delete project");
    }
  };

  tr.children[6].appendChild(deleteBtn);
}

      tb.appendChild(tr);
    });
  } catch (e) {
    root.innerHTML = `
      <div class="card">
        <div class="muted" style="text-align:center;padding:20px;">
          ${escapeHtml(e.message || "Failed to load projects")}
        </div>
      </div>
    `;
  }
}

async function openProject(projectId) {
  if (!hasPermission("projects.view")) {
    throw new Error("You do not have access to Projects.");
  }

  const root = setViewMode(true);

  root.innerHTML = `
    <div class="card">
      <div class="label">Opening project...</div>
      <div class="hr"></div>
      <div class="muted">Loading project details, lifts, and jobs.</div>
    </div>
  `;

  const r = await fetch(`/api/projects/${projectId}`, {
    headers: getOfficeAuthHeaders({}),
  });

  const pj = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(pj?.error || "Failed to open project");

  state.currentProjectId = projectId;
  state.currentProject = pj;

  renderProjectDetails();
}

async function openProjectAndRunAction(projectId, projectLiftId, actionType) {
  await openProject(projectId);

  const lifts = state.currentProject?.lifts || [];
  const lift = lifts.find((x) => String(x.id) === String(projectLiftId));

  if (!lift) {
    alert("Lift not found in selected project.");
    return;
  }

  if (actionType === "ASSIGN_TEST_JOB") {
  if (!hasPermission("jobs.assign")) {
    alert("You do not have permission to assign jobs.");
    return;
  }

  showCreateJobModalForProjectLift(projectLiftId, lift.liftCode, "TEST");
  return;
}

  if (actionType === "COMPLETE_HANDOVER") {
    if (!hasPermission("projects.edit") && !hasPermission("lifts.edit")) {
      alert("You do not have permission to complete handover.");
      return;
    }

    showMilestoneModal(projectLiftId, lift);
  }
}

function showCompleteHandoverModal(projectLiftId, lift) {
  const body = document.createElement("div");
  body.innerHTML = `
    <div class="formGrid">
      <div class="field" style="grid-column:1/-1">
        <label>Lift Code</label>
        <input value="${lift.liftCode || ""}" disabled />
      </div>

      <div class="field">
        <label>Handover Target Date</label>
        <input type="date" id="handoverTargetDate" value="${lift.handoverDate || ""}" disabled />
      </div>

      <div class="field">
        <label>Actual Handover Date</label>
        <input type="date" id="actualHandoverDate" value="${lift.handoverActualDate || ""}" />
      </div>

      <div class="field">
        <label>Warranty Months</label>
        <input type="number" min="1" id="handoverWarrantyMonths" value="${lift.warrantyMonths ?? 12}" />
      </div>

      <div class="field">
        <label>Warranty Service Visits</label>
        <input type="number" min="1" id="handoverWarrantyServiceVisits" value="${lift.warrantyServiceVisits ?? 5}" />
      </div>

      <div class="field" style="grid-column:1/-1">
        <label>Notes</label>
        <textarea id="handoverNotes" placeholder="Actual handover notes...">${lift.notes || ""}</textarea>
      </div>

      <div class="field" style="grid-column:1/-1">
        <div id="handoverValidationBox" class="muted" style="font-size:12px;"></div>
      </div>

      <div class="field" style="grid-column:1/-1">
        <div class="muted" style="font-size:12px">
          Completing handover will set warranty start from the actual handover date and calculate warranty end automatically.
        </div>
      </div>
    </div>
  `;

  const actualHandoverDateEl = body.querySelector("#actualHandoverDate");
  const warrantyMonthsEl = body.querySelector("#handoverWarrantyMonths");
  const warrantyVisitsEl = body.querySelector("#handoverWarrantyServiceVisits");
  const validationBox = body.querySelector("#handoverValidationBox");

  function parseDateOnly(v) {
    if (!v) return null;
    const d = new Date(`${v}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function compareDateOnly(a, b) {
    if (!a || !b) return 0;
    const da = parseDateOnly(a);
    const db = parseDateOnly(b);
    if (!da || !db) return 0;
    if (da < db) return -1;
    if (da > db) return 1;
    return 0;
  }

// 🔧 Get actual TEST completion date (if available)
const testAssignment = (lift.assignments || []).find((a) =>
  String(a.assignment_role || a.role || "").toUpperCase() === "TEST" &&
  String(a.status || "").toUpperCase() === "DONE"
);

const actualTestCompletedDate =
  testAssignment?.completedAt ||
  testAssignment?.completed_at ||
  null;

console.log("TEST COMPLETION DEBUG:", {
  testAssignment,
  actualTestCompletedDate
});

  function validateCompleteHandover() {
    const errors = [];
    const warnings = [];

    const installationStartDate = lift.installationStartDate || null;
    const installationEndDate = lift.installationEndDate || null;
    const testingStartDate = lift.testingStartDate || null;
    const testingEndDate = lift.testingEndDate || null;
    const handoverTargetDate = lift.handoverDate || null;

    const actualHandoverDate = actualHandoverDateEl.value || null;
    const warrantyMonths = Number(warrantyMonthsEl.value || 0);
    const warrantyServiceVisits = Number(warrantyVisitsEl.value);
if (!Number.isFinite(warrantyServiceVisits) || warrantyServiceVisits < 1) {
  errors.push("Warranty Service Visits must be at least 1.");
}

// 🔒 Warranty validation (ADD THIS)
if (!Number.isFinite(warrantyServiceVisits) || warrantyServiceVisits < 1) {
  errors.push("Warranty Service Visits must be at least 1.");
}

if (!Number.isFinite(warrantyMonths) || warrantyMonths < 1) {
  errors.push("Warranty Months must be at least 1.");
}
    if (!actualHandoverDate) {
      errors.push("Actual Handover Date is required.");
    }

    if (installationStartDate && actualHandoverDate && compareDateOnly(actualHandoverDate, installationStartDate) < 0) {
      errors.push("Actual Handover Date cannot be earlier than Installation Start Date.");
    }

    if (installationEndDate && actualHandoverDate && compareDateOnly(actualHandoverDate, installationEndDate) < 0) {
      errors.push("Actual Handover Date cannot be earlier than Installation End Date.");
    }

    if (testingStartDate && actualHandoverDate && compareDateOnly(actualHandoverDate, testingStartDate) < 0) {
      errors.push("Actual Handover Date cannot be earlier than Testing Start Date.");
    }

    const testingReferenceDate = actualTestCompletedDate || testingEndDate;

if (testingReferenceDate && actualHandoverDate && compareDateOnly(actualHandoverDate, testingReferenceDate) < 0) {
  errors.push(
    actualTestCompletedDate
      ? "Actual Handover Date cannot be earlier than TEST job completion date."
      : "Actual Handover Date cannot be earlier than Testing End Date."
  );
}

    if (!Number.isFinite(warrantyMonths) || warrantyMonths < 1) {
      errors.push("Warranty Months must be at least 1.");
    }

    if (!Number.isFinite(warrantyServiceVisits) || warrantyServiceVisits < 1) {
      errors.push("Warranty Service Visits must be at least 1.");
    }

    if (handoverTargetDate && actualHandoverDate && compareDateOnly(actualHandoverDate, handoverTargetDate) > 0) {
      warnings.push("Actual handover is later than the planned handover target date.");
    }

    if (errors.length) {
      validationBox.className = "warnText";
      validationBox.innerHTML = errors.map(x => `• ${x}`).join("<br>");
    } else if (warnings.length) {
      validationBox.className = "muted";
      validationBox.innerHTML = warnings.map(x => `• ${x}`).join("<br>");
    } else {
      validationBox.className = "goodText";
      validationBox.textContent = "Complete handover data looks valid.";
    }

    return { errors, warnings };
  }

  [actualHandoverDateEl, warrantyMonthsEl, warrantyVisitsEl].forEach((el) => {
    if (el) el.addEventListener("change", validateCompleteHandover);
    if (el) el.addEventListener("input", validateCompleteHandover);
  });

  validateCompleteHandover();

  const btnCancel = smallBtn("Cancel", "secondary");
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn("Complete Handover", "primary");
  btnSave.onclick = async () => {
    try {
      const check = validateCompleteHandover();
      if (check.errors.length) {
        throw new Error(check.errors[0]);
      }

      const payload = {
        actualHandoverDate: actualHandoverDateEl.value || null,
        warrantyMonths: Number(warrantyMonthsEl.value || 12),
        warrantyServiceVisits: Number(warrantyVisitsEl.value),
        notes: body.querySelector("#handoverNotes").value || "",
      };

      await API.completeProjectLiftHandover(projectLiftId, payload);

      closeModal();
      alert("Handover completed successfully");
      await openProject(state.currentProjectId);
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  openModal({
    title: `Complete Handover - ${lift.liftCode || ""}`,
    bodyNode: body,
    footerNodes: [btnCancel, btnSave],
  });
}

function getLiftExecutionStatus(lift) {
  const assignments = Array.isArray(lift.assignments) ? lift.assignments : [];
  const norm = (v) => String(v || "").toUpperCase();

  const isRole = (a, role) => norm(a.role) === role;
  const isStatus = (a, status) => norm(a.status) === status;
  const isSupervisorStatus = (a, status) => norm(a.supervisorStatus || a.supervisor_status) === status;

  const hasAnyNonCancelledJobs = assignments.some((a) => norm(a.status) !== "CANCELLED");

  const hasInstallAssignedOrInProgress = assignments.some((a) =>
    isRole(a, "INSTALL") && ["ASSIGNED", "IN_PROGRESS"].includes(norm(a.status))
  );

  const hasInstallInProgress = assignments.some((a) =>
    isRole(a, "INSTALL") && isStatus(a, "IN_PROGRESS")
  );

  const hasInstallApproved = assignments.some((a) =>
    isRole(a, "INSTALL") && isSupervisorStatus(a, "APPROVED")
  );

  const hasInstallDonePendingApproval = assignments.some((a) =>
    isRole(a, "INSTALL") &&
    isStatus(a, "DONE") &&
    !isSupervisorStatus(a, "APPROVED")
  );

  const hasTestAssignedOrInProgress = assignments.some((a) =>
    isRole(a, "TEST") && ["ASSIGNED", "IN_PROGRESS"].includes(norm(a.status))
  );

  const hasTestInProgress = assignments.some((a) =>
    isRole(a, "TEST") && isStatus(a, "IN_PROGRESS")
  );

  const hasTestApproved = assignments.some((a) =>
    isRole(a, "TEST") && isSupervisorStatus(a, "APPROVED")
  );

  const hasTestDonePendingApproval = assignments.some((a) =>
    isRole(a, "TEST") &&
    isStatus(a, "DONE") &&
    !isSupervisorStatus(a, "APPROVED")
  );

  const hasSupportInProgress = assignments.some((a) =>
    ["SUPPORT", "AMC SERVICE", "WARRANTY SERVICE"].includes(norm(a.role)) &&
    isStatus(a, "IN_PROGRESS")
  );

  const hasAssignedOnly = assignments.some((a) =>
    ["ASSIGNED"].includes(norm(a.status))
  );

  const hasActualHandover = !!lift?.handoverActualDate;

  if (hasActualHandover) return "HANDED OVER";
  if (hasSupportInProgress) return "SERVICE IN PROGRESS";
  if (hasTestApproved) return "READY FOR HANDOVER";
  if (hasTestDonePendingApproval) return "TEST AWAITING APPROVAL";
  if (hasTestInProgress) return "TESTING";
  if (hasTestAssignedOrInProgress) return "TEST ASSIGNED";
  if (hasInstallApproved) return "READY FOR TEST ASSIGNMENT";
  if (hasInstallDonePendingApproval) return "INSTALL AWAITING APPROVAL";
  if (hasInstallInProgress) return "INSTALLING";
  if (hasInstallAssignedOrInProgress) return "INSTALL ASSIGNED";
  if (!hasAnyNonCancelledJobs) return "NOT STARTED";
  if (hasAssignedOnly) return "ASSIGNED";
  return "PLANNING";
}

function renderProjectDetails() {
  const root = setViewMode(false);

  const pj = state.currentProject;
  if (!pj) return;

  setTitle(`Project: ${pj.projectName || ""}`);

  const btnBack = smallBtn("← Back to Projects", "secondary");
  btnBack.onclick = () => {
    state.currentProjectId = null;
    state.currentProject = null;
    renderProjects();
  };

  const toolbar = [btnBack];

  if (hasPermission("lifts.create")) {
    const btnAddLift = smallBtn("+ Add Lift", "primary");
    btnAddLift.onclick = () => showAddLiftToProjectModal(pj.id);
    toolbar.push(btnAddLift);
  }

  const btnRefresh = smallBtn("Refresh", "secondary");
  btnRefresh.onclick = async () => {
    await openProject(pj.id);
  };
  toolbar.push(btnRefresh);

  setToolbar(toolbar);

  const lifts = Array.isArray(pj.lifts) ? pj.lifts : [];
  const workflowCounts = {
    notStarted: 0,
    installing: 0,
    readyForTest: 0,
    testing: 0,
    readyForHandover: 0,
    handedOver: 0,
  };

  lifts.forEach((lift) => {
  const status = getLiftExecutionStatus(lift);

  if (status === "NOT STARTED") workflowCounts.notStarted += 1;
  else if (status === "ASSIGNED" || status === "INSTALL ASSIGNED" || status === "INSTALLING") workflowCounts.installing += 1;
  else if (status === "READY FOR TEST ASSIGNMENT") workflowCounts.readyForTest += 1;
  else if (status === "TEST ASSIGNED" || status === "TESTING") workflowCounts.testing += 1;
  else if (status === "READY FOR HANDOVER") workflowCounts.readyForHandover += 1;
  else if (status === "HANDED OVER") workflowCounts.handedOver += 1;
});

  const totalLifts = lifts.length;
  const totalJobs = lifts.reduce((sum, l) => sum + (Array.isArray(l.assignments) ? l.assignments.length : 0), 0);
  const activeJobs = lifts.reduce((sum, l) => sum + (Array.isArray(l.assignments) ? l.assignments.filter(a => ["ASSIGNED", "IN_PROGRESS"].includes((a.status || "").toUpperCase())).length : 0), 0);

  root.innerHTML = `
    <div class="grid" style="margin-bottom:14px">
      <div class="card"><div class="label">Project Code</div><div class="kpi" style="font-size:22px">${pj.projectCode || "—"}</div></div>
      <div class="card"><div class="label">Total Lifts</div><div class="kpi" style="font-size:22px">${totalLifts}</div></div>
      <div class="card"><div class="label">Total Jobs</div><div class="kpi" style="font-size:22px">${totalJobs}</div></div>
      <div class="card"><div class="label">Active Jobs</div><div class="kpi" style="font-size:22px">${activeJobs}</div></div>
    </div>

    <div class="card">
      <div class="label">Project Summary</div>
      <div class="hr"></div>
      <div class="formGrid">
        <div class="field"><label>Project Name</label><div><b>${pj.projectName || ""}</b></div></div>
        <div class="field"><label>Status</label><div id="projectStatusCell"></div></div>
        <div class="field">
  <label>Customer</label>
  <div>${pj.customer?.name || "—"}</div>
  <div class="muted" style="margin-top:4px;">
    Phone: ${pj.customer?.phone || "—"}
  </div>
</div>
        <div class="field"><label>Site</label><div>${pj.site?.name || "—"}</div></div>
        <div class="field" style="grid-column:1/-1"><label>Notes</label><div class="muted">${pj.notes || "—"}</div></div>
      </div>
    </div>

    <div class="grid" style="margin-top:14px">
      <div class="card"><div class="label">Not Started</div><div class="kpi" style="font-size:22px">${workflowCounts.notStarted}</div></div>
      <div class="card"><div class="label">Installation Active</div><div class="kpi" style="font-size:22px">${workflowCounts.installing}</div></div>
      <div class="card"><div class="label">Ready for Test</div><div class="kpi" style="font-size:22px">${workflowCounts.readyForTest}</div></div>
      <div class="card"><div class="label">Testing Active</div><div class="kpi" style="font-size:22px">${workflowCounts.testing}</div></div>
      <div class="card"><div class="label">Ready for Handover</div><div class="kpi" style="font-size:22px">${workflowCounts.readyForHandover}</div></div>
      <div class="card"><div class="label">Handed Over</div><div class="kpi" style="font-size:22px">${workflowCounts.handedOver}</div></div>
    </div>

    <div class="card" style="margin-top:14px">
      <div class="label">Core Workflow</div>
      <div class="hr"></div>
      <div class="muted">Use this project screen as the main control center: <b>Add Lift</b> → <b>Update Milestones</b> → <b>Assign Job</b> → <b>Track Status</b> → <b>Complete Handover</b>.</div>
    </div>

    <div class="card" id="projectLiftsCard" style="margin-top:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <div class="label">Project Lifts</div>
        <div class="muted">Each lift row shows details, milestone dates, workflow status, and technician jobs.</div>
      </div>
      <div class="hr"></div>
    </div>
  `;

  root.querySelector("#projectStatusCell").appendChild(badge(pj.status || "OPEN"));

  const card = root.querySelector("#projectLiftsCard");
  const wrap = makeScrollableTableWrap(`
    <table>
      <thead>
        <tr>
          <th>Lift</th>
          <th>Details</th>
          <th>Milestones</th>
          <th>Jobs</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="plBody"></tbody>
    </table>
  `, "560px");
  wrap.style.marginTop = "10px";
  card.appendChild(wrap);

  const tb = wrap.querySelector("#plBody");

lifts.forEach((l) => {
  const assignments = (Array.isArray(l.assignments) ? l.assignments : [])
    .filter((a) => ['INSTALL', 'TEST'].includes(String(a.role || '').toUpperCase()));

  const installRange = formatDateRange(l.installationStartDate, l.installationEndDate);
  const testRange = formatDateRange(l.testingStartDate, l.testingEndDate);
  const warrantyRange = formatDateRange(l.warrantyStartDate, l.warrantyEndDate);

  const tr = document.createElement("tr");
  tr.innerHTML = `
  <td style="min-width:160px">
    <div><b>${l.liftCode || ''}</b></div>
    <div class="muted">${l.location || '—'}</div>
  </td>

  <td style="min-width:220px">
    ${infoLine('Type', l.liftType || '—')}
    ${infoLine('Capacity', l.passengerCapacity ? `${l.passengerCapacity} persons` : '—')}
    ${infoLine('Floors', l.numberOfFloors || '—')}
    ${infoLine('Warranty', `${l.warrantyMonths ?? 12} months`)}
  </td>

  <td class="muted" style="min-width:240px">
    ${infoLine('Installation', installRange)}
    ${infoLine('Testing', testRange)}
    ${infoLine('Handover Target', l.handoverDate || '—')}
    ${infoLine('Handover Actual', l.handoverActualDate || '—')}
    ${infoLine('Warranty Dates', warrantyRange)}
    ${infoLine(
      'Warranty Visits',
      `${l?.warranty?.completedVisits ?? 0} / ${l?.warranty?.serviceVisitCount ?? l.warrantyServiceVisits ?? 5}`
    )}
  </td>

  <td class="muted" style="min-width:300px"></td>
  <td style="white-space:nowrap"></td>
  <td style="min-width:320px"></td>
`;
  tr.children[4].innerHTML = `
    <div class="statusCell">
      <div class="statusBadgeWrap"></div>
      ${renderLiftProgress(l)}
    </div>
  `;
  tr.children[4].querySelector(".statusBadgeWrap").appendChild(badge(getLiftExecutionStatus(l)));

  const jobsCell = tr.children[3];
  if (!assignments.length) {
    jobsCell.innerHTML = 'No jobs yet';
  } else {
    assignments.forEach((job) => {
      const block = document.createElement('div');
      block.className = 'jobTeamBlock';
      block.innerHTML = renderJobSummaryHtml(job);

      if (hasPermission('jobs.assign')) {
  const manageBtn = smallBtn('Manage Team', 'secondary');
  manageBtn.style.marginTop = '8px';
  manageBtn.onclick = () => {
    showManageTeamModal(job.id, job.role || 'JOB');
  };
  block.appendChild(manageBtn);
}
      jobsCell.appendChild(block);
    });
  }

  const actionWrap = document.createElement("div");
  actionWrap.className = "actionStack";

  const projectLiftId = l.projectLiftId || l.id;
  const workflowStatus = String(getLiftExecutionStatus(l) || "").toUpperCase();

console.log("Lift actions", l.liftCode, {
  liftsEdit: hasPermission("lifts.edit"),
  jobsAssign: hasPermission("jobs.assign"),
  workflowStatus
});


  const goToService = () => {
    location.hash = '#service';
  };

  if (hasPermission('lifts.edit')) {
  const btnMilestone = smallBtn("Milestones", "secondary");
  btnMilestone.onclick = () => showMilestoneModal(projectLiftId, l);
  actionWrap.appendChild(btnMilestone);
}

const hasActiveInstallJob = assignments.some((a) =>
  String(a.role || '').toUpperCase() === 'INSTALL' &&
  ['ASSIGNED', 'IN_PROGRESS'].includes(String(a.status || '').toUpperCase())
);

if (
  !hasActiveInstallJob &&
  workflowStatus === 'NOT STARTED' &&
  hasPermission('jobs.assign')
) {
  const btnAssignInstall = smallBtn("Create Install Job", "primary");
  btnAssignInstall.onclick = () =>
    showCreateJobModalForProjectLift(projectLiftId, l.liftCode, "INSTALL");
  actionWrap.appendChild(btnAssignInstall);
}

if (
  workflowStatus === 'READY FOR TEST ASSIGNMENT' &&
  !l.hasActiveTestJob &&
  hasPermission('jobs.assign')
) {
  const btnCreateTest = smallBtn('Create Test Job', 'primary');
  btnCreateTest.onclick = () =>
    showCreateJobModalForProjectLift(projectLiftId, l.liftCode, 'TEST');
  actionWrap.appendChild(btnCreateTest);
}

if (
  workflowStatus === 'READY FOR HANDOVER' &&
  (hasPermission('jobs.assign') || hasPermission('lifts.edit'))
) {
  const btnHandover = smallBtn("Complete Handover", "primary");
  btnHandover.onclick = () => showCompleteHandoverModal(projectLiftId, l);
  actionWrap.appendChild(btnHandover);
}

if (workflowStatus === 'HANDED OVER') {
  const isAmcServiceDueNow = !!l?.amc?.isDueNow;
  const isWarrantyServiceDueNow = !!l?.warranty?.isDueNow;

  const hasActiveAmcService = !!l?.amc?.activeServiceAssignment;
  const hasActiveWarrantyService = !!l?.warranty?.activeServiceAssignment;

  const hasEligibleAmcContract =
    !!l?.amc &&
    ['AMC ACTIVE', 'AMC EXPIRING SOON'].includes(
      String(l.amc.status || '').toUpperCase()
    );

  if (!l.amc) {
    const hint = document.createElement('div');
    hint.className = 'muted';
    hint.textContent = 'AMC not created (manage in Service)';
    actionWrap.appendChild(hint);
  }

  if (isWarrantyServiceDueNow && !hasActiveWarrantyService) {
    const btn = document.createElement('button');
    btn.className = 'btn secondary';
    btn.textContent = 'Manage Service';
    btn.onclick = goToService;
    actionWrap.appendChild(btn);
  }

  if (hasEligibleAmcContract && isAmcServiceDueNow && !hasActiveAmcService) {
    const hint = document.createElement('div');
    hint.className = 'muted';
    hint.textContent = 'AMC service due (manage in Service)';
    actionWrap.appendChild(hint);
  }

  if (hasActiveWarrantyService || hasActiveAmcService) {
    const hint = document.createElement('div');
    hint.className = 'muted';
    hint.textContent = 'Active service job in progress';
    actionWrap.appendChild(hint);
  }
}
const btnHistory = smallBtn("History", "secondary");

btnHistory.onclick = () => {
  try {
    showServiceHistoryModal(l);
  } catch (e) {
    alert(e.message || String(e));
    console.error('Service History modal failed', e);
  }
};
actionWrap.appendChild(btnHistory);

// DELETE LIFT
if (hasPermission("projects.delete")) {
  const btnDeleteLift = smallBtn("Delete Lift", "danger");

  btnDeleteLift.onclick = async () => {
    if (!confirm(`Delete Lift "${l.liftCode}"?\n\nAll jobs must be deleted first.`)) return;

    try {
      await API.deleteProjectLift(projectLiftId);

      showToast("Lift deleted successfully");
      await openProject(pj.id); // refresh project screen
    } catch (e) {
  alert(e.message || "Cannot delete lift. Remove jobs first.");
}
  };

  actionWrap.appendChild(btnDeleteLift);
}

tr.children[5].appendChild(actionWrap);
tb.appendChild(tr);
});

if (lifts.length === 0) {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td colspan="6" class="muted">No lifts added yet. Click <b>+ Add Lift</b> to start the project workflow.</td>`;
  tb.appendChild(tr);
}
}

async function renderTeamLoadCard(root) {
  const rows = await API.getTeamLoad();

  const section = document.createElement("div");
  section.className = "card";
  section.style.marginTop = "16px";

  section.innerHTML = `
    <div class="label">Technician Load</div>
    <div class="muted">Current open workload for active technicians</div>
    <div class="hr"></div>
  `;

  const rowsWithScore = (rows || []).map((r) => {
    const score =
      (r.overdue || 0) * 5 +
      (r.inProgressJobs || 0) * 3 +
      (r.totalJobs || 0);

    return { ...r, loadScore: score };
  });

  rowsWithScore.sort((a, b) => b.loadScore - a.loadScore);

  const wrap = makeScrollableTableWrap(`
  <table class="teamLoadTable">
    <colgroup>
      <col style="width: 90px;">
      <col style="width: 180px;">
      <col style="width: 90px;">
      <col style="width: 100px;">
      <col style="width: 120px;">
      <col style="width: 110px;">
      <col style="width: 100px;">
      <col style="width: 90px;">
      <col style="width: 90px;">
      <col style="width: 80px;">
    </colgroup>
    <thead>
      <tr>
        <th>Name</th>
        <th>Skills</th>
        <th>Total</th>
        <th>Assigned</th>
        <th>In Progress</th>
        <th>Due Today</th>
        <th>Overdue</th>
        <th>Lead</th>
        <th>Support</th>
        <th>Load</th>
      </tr>
    </thead>
    <tbody id="teamLoadBody"></tbody>
  </table>
`, "320px");

  section.appendChild(wrap);
  root.appendChild(section);

  const tb = wrap.querySelector("#teamLoadBody");

  if (!rowsWithScore.length) {
    const tr = document.createElement("tr");
tr.style.cursor = "pointer";

tr.onclick = () => {
  showTechnicianWorkloadModal(r.id || r.technicianId, r.name);
};
    tr.innerHTML = `<td colspan="10" class="muted">No active technicians found.</td>`;
    tb.appendChild(tr);
    return;
  }

  rowsWithScore.forEach((r) => {
  let rowClass = "";

  if ((r.overdue || 0) > 0 && (r.totalJobs || 0) >= 3) {
    rowClass = "row-danger";
  } else if ((r.totalJobs || 0) >= 3) {
    rowClass = "row-warn";
  }

  const tr = document.createElement("tr");
  if (rowClass) tr.className = rowClass;

  tr.style.cursor = "pointer";
  
  tr.innerHTML = `
    <td>${r.name || ""}</td>
    <td class="teamLoadSkillsCell">
      ${String(r.skills || "")
        .split(",")
        .filter(Boolean)
        .join(", ")
        .replaceAll("INSTALL", "INST")
        .replaceAll("SERVICE", "SERV")}
    </td>
    <td>${r.totalJobs || 0}</td>
    <td>${r.assignedJobs || 0}</td>
    <td>${r.inProgressJobs || 0}</td>
    <td>${r.dueToday || 0}</td>
    <td>${r.overdue || 0}</td>
    <td>${r.leadJobs || 0}</td>
    <td>${r.supportJobs || 0}</td>
    <td><b>${r.loadScore}</b></td>
  `;

  tb.appendChild(tr);
});
}

function showCreateUserModal() {
  const body = document.createElement("div");
  body.innerHTML = `
    <div class="formGrid">
      <div class="field">
        <label>Name</label>
        <input id="newUserName" placeholder="Full name" />
      </div>
      <div class="field">
        <label>Email</label>
        <input id="newUserEmail" placeholder="Email address" />
      </div>
      <div class="field">
        <label>Role</label>
        <select id="newUserRole">
          <option value="SUPERVISOR">SUPERVISOR</option>
          <option value="MANAGER">MANAGER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      <div class="field">
        <label>Password</label>
        <input id="newUserPassword" type="password" placeholder="Password" />
      </div>
    </div>
  `;

  const btnCancel = smallBtn("Cancel", "secondary");
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn("Create", "primary");
  btnSave.onclick = async () => {
    try {
      const payload = {
        name: body.querySelector("#newUserName").value.trim(),
        email: body.querySelector("#newUserEmail").value.trim(),
        role: body.querySelector("#newUserRole").value.trim(),
        password: body.querySelector("#newUserPassword").value.trim(),
      };

      await API.createUser(payload);
      closeModal();
      await renderUsers();
    } catch (e) {
      alert(e.message || "Failed to create user");
    }
  };

  openModal({
    title: "Create User",
    bodyNode: body,
    footerNodes: [btnCancel, btnSave],
  });
}

function showEditUserModal(user) {
  const body = document.createElement("div");
  body.innerHTML = `
    <div class="formGrid">
      <div class="field">
        <label>Name</label>
        <input id="editUserName" value="${escapeHtml(user?.name || "")}" />
      </div>
      <div class="field">
        <label>Email</label>
        <input id="editUserEmail" value="${escapeHtml(user?.email || "")}" />
      </div>
      <div class="field">
        <label>Role</label>
        <select id="editUserRole">
          <option value="SUPERVISOR" ${user?.role === "SUPERVISOR" ? "selected" : ""}>SUPERVISOR</option>
          <option value="MANAGER" ${user?.role === "MANAGER" ? "selected" : ""}>MANAGER</option>
          <option value="ADMIN" ${user?.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
        </select>
      </div>
      <div class="field">
        <label>New Password</label>
        <input id="editUserPassword" type="password" placeholder="Leave blank to keep unchanged" />
      </div>
    </div>
  `;

  const btnCancel = smallBtn("Cancel", "secondary");
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn("Save", "primary");
  btnSave.onclick = async () => {
    try {
      const payload = {
        name: body.querySelector("#editUserName").value.trim(),
        email: body.querySelector("#editUserEmail").value.trim(),
        role: body.querySelector("#editUserRole").value.trim(),
      };

      const newPassword = body.querySelector("#editUserPassword").value.trim();
      if (newPassword) payload.password = newPassword;

      await API.updateUser(user.id, payload);
      closeModal();
      await renderUsers();
    } catch (e) {
      alert(e.message || "Failed to update user");
    }
  };

  openModal({
    title: "Edit User",
    bodyNode: body,
    footerNodes: [btnCancel, btnSave],
  });
}

async function showTechnicianWorkloadModal(technicianId, technicianName) {
  try {
    const jobs = await API.getTechnicianJobs(technicianId);

    const body = document.createElement("div");

    body.innerHTML = `
      <div style="margin-bottom:12px;">
        <b>${technicianName}</b> – Active Jobs
      </div>

      ${
        !jobs.length
          ? `<div class="muted">No active jobs</div>`
          : jobs.map(j => `
    <div class="listRow">
      <div>
        <b>JOB-${j.id}</b>
        <div class="muted">${[j.projectCode, j.projectName].filter(Boolean).join(" - ")}</div>
        <div class="muted">${j.liftCode || ""}</div>
        <div class="muted"><span style="font-weight:600">${j.role}</span> • ${j.status}</div>
        <div class="muted">Due: ${j.dueDate || "—"}</div>
      </div>
      <div class="rowActions">
        <button class="btn secondary" data-action="open-manage-team" data-job-id="${j.id}">
          Open Job
        </button>
        <button class="btn secondary" data-action="suggest-reassign" data-job-id="${j.id}" style="margin-left:8px;">
          Suggest Reassign
        </button>
      </div>
    </div>
  `).join("")
      }
    `;

    body.querySelectorAll("[data-action='open-manage-team']").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const jobId = Number(btn.dataset.jobId);
      if (!jobId) throw new Error("Job not found");

      await showManageTeamModal(jobId, "JOB");
    } catch (err) {
      console.error(err);
      alert(err.message || String(err));
    }
  });
});

body.querySelectorAll("[data-action='suggest-reassign']").forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const jobId = Number(btn.dataset.jobId);
      if (!jobId) throw new Error("Job not found");

      closeModal();
      await showJobSuggestionModal(jobId);
    } catch (err) {
      console.error(err);
      alert(err.message || String(err));
    }
  });
});

const btnClose = smallBtn("Close", "secondary");
btnClose.onclick = closeModal;

openModal({
  title: "Technician Workload",
  bodyNode: body,
  footerNodes: [btnClose],
});

} catch (e) {
  console.error(e);
  alert(e.message || "Failed to load technician workload");
}
}

async function showJobSuggestionModal(jobId) {
  try {
    const data = await API.getReassignOptions(jobId);

    const body = document.createElement("div");

    body.innerHTML = `
      <div style="margin-bottom:12px;">
        <b>Suggested technicians</b> for ${data.role}
      </div>

      ${
        !data.suggestions.length
          ? `<div class="muted">No available technicians found.</div>`
          : data.suggestions.slice(0, 6).map((t) => `
              <div class="listRow">
                <div>
                  <b>${t.name}</b>
                  <div class="muted">${t.skills || ""}</div>
                  <div class="muted">
                    Load ${t.loadScore} • Active ${t.totalJobs} • Overdue ${t.overdue}
                    ${t.currentTeam ? ' • Current team' : ''}
                  </div>
                </div>
                <div class="rowActions">
                  <button
                    class="btn secondary"
                    data-action="use-suggestion"
                    data-job-id="${jobId}"
                    data-tech-id="${t.id}">
                    Use in Manage Team
                  </button>
                </div>
              </div>
            `).join("")
      }
    `;

    setTimeout(() => {
  body.querySelectorAll("[data-action='use-suggestion']").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        const useJobId = Number(btn.dataset.jobId);
        const techId = Number(btn.dataset.techId);
        if (!useJobId || !techId) throw new Error("Invalid suggestion");

          await showManageTeamModal(useJobId, "JOB", {
          suggestedLeadTechnicianId: techId
        });
      } catch (e) {
        alert(e.message || String(e));
      }
    });
  });
}, 0);

    const btnClose = smallBtn("Close", "secondary");
    btnClose.onclick = closeModal;

    openModal({
      title: "Reassignment Suggestions",
      bodyNode: body,
      footerNodes: [btnClose],
    });
  } catch (e) {
    console.error(e);
    alert(e.message || "Failed to load suggestions");
  }
}

async function showAddLiftToProjectModal(projectId) {
  if (!hasPermission("lifts.create")) {
    alert("You do not have permission to add lifts.");
    return;
  }

  const body = document.createElement("div");

  body.innerHTML = `
    <div class="formGrid">
      <div class="field">
        <label>Lift Code (Unique)</label>
        <input id="liftCode" placeholder="L-N2066" />
      </div>

      <div class="field">
        <label>Location</label>
        <input id="location" placeholder="Thimphu" />
      </div>

      <div class="field">
        <label>Passenger Capacity</label>
        <input id="passengerCapacity" type="number" min="1" placeholder="8" />
      </div>

      <div class="field">
        <label>Type of Lift</label>
        <select id="liftType">
          <option value="PASSENGER">PASSENGER</option>
          <option value="GOODS">GOODS</option>
          <option value="HOSPITAL">HOSPITAL</option>
          <option value="SERVICE">SERVICE</option>
          <option value="CAR">CAR</option>
          <option value="DUMBWAITER">DUMBWAITER</option>
        </select>
      </div>

      <div class="field">
        <label>Number of Floors</label>
        <input id="numberOfFloors" type="number" min="1" placeholder="10" />
      </div>

      <div class="field" style="grid-column:1/-1">
        <label>Notes</label>
        <textarea id="notes" placeholder="Any installation notes..."></textarea>
      </div>
    </div>
  `;

  const btnCancel = smallBtn("Cancel", "secondary");
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn("Save Lift", "primary");
  btnSave.onclick = async () => {
    try {
      const liftCode = body.querySelector("#liftCode").value.trim();
      if (!liftCode) return alert("Lift Code is required.");

      const passengerCapacityRaw = body.querySelector("#passengerCapacity").value;
      const numberOfFloorsRaw = body.querySelector("#numberOfFloors").value;

      const payload = {
        liftCode,
        location: body.querySelector("#location").value.trim(),
        passengerCapacity: passengerCapacityRaw ? Number(passengerCapacityRaw) : null,
        liftType: body.querySelector("#liftType").value,
        numberOfFloors: numberOfFloorsRaw ? Number(numberOfFloorsRaw) : null,
        notes: body.querySelector("#notes").value || "",
      };

      const r = await fetch(`/api/projects/${projectId}/lifts`, {
  method: "POST",
  headers: getOfficeAuthHeaders(),
  body: JSON.stringify(payload),
});
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "Add lift failed");

      closeModal();
      await openProject(projectId);
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  openModal({
    title: "Add Lift to Project",
    bodyNode: body,
    footerNodes: [btnCancel, btnSave],
  });
}

async function showCreateJobModalForProjectLift(projectLiftId, liftCodeLabel, presetRole = "") {
  const techs = await API.listTechnicians();
  const lifts = Array.isArray(state.currentProject?.lifts) ? state.currentProject.lifts : [];
  const lift = lifts.find((x) => String(x.projectLiftId || x.id) === String(projectLiftId)) || null;

  const fixedRole = String(presetRole || "INSTALL").toUpperCase();

  const body = document.createElement("div");
  body.innerHTML = `
    <div class="formGrid">
      <div class="field" style="grid-column:1/-1">
        <label>Lift</label>
        <input value="${escapeHtml(liftCodeLabel || "")}" disabled />
      </div>

      <div class="field">
        <label>Lead Technician</label>
        <select id="jobLeadTech"></select>
        <div id="techWarning" class="warnText" style="font-size:12px;margin-top:4px;"></div>
      </div>

      <div class="field">
        <label>Job Type</label>
        <input id="jobRoleLabel" value="${escapeHtml(fixedRole)}" disabled />
      </div>

      <div class="field">
        <label>Due Date</label>
        <input type="date" id="jobDue" />
      </div>

      <div class="field" style="grid-column:1/-1">
        <div id="jobDueHint" class="muted dueDateHint"></div>
      </div>

      <div class="field" style="grid-column:1/-1">
        <label>Notes</label>
        <textarea id="jobNotes"></textarea>
      </div>

      <div class="field" style="grid-column:1/-1">
        <div class="muted" style="font-size:12px">
          Due date is suggested from milestones, but you can still change it.
          A new job is created with one Lead. Add more Support technicians later using <b>Manage Team</b>.
        </div>
      </div>
    </div>
  `;

  const techSelect = body.querySelector("#jobLeadTech");
  const techWarningEl = body.querySelector("#techWarning");
  const dueInput = body.querySelector("#jobDue");
  const dueHint = body.querySelector("#jobDueHint");

  function populateTechnicianOptions() {
    techSelect.innerHTML = "";

    const requiredSkill = getRequiredSkillForJob(fixedRole);

    const filteredTechs = (techs || []).filter((t) =>
      technicianHasSkill(t, requiredSkill)
    );

    if (!filteredTechs.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = `No technicians with ${requiredSkill || "required"} skill found`;
      techSelect.appendChild(opt);
      return;
    }

    filteredTechs.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;

      const skills = t.skills ? ` (${parseSkills(t.skills).join(", ")})` : "";
      const availability = String(t.availability_status || "AVAILABLE").toUpperCase();

      const statusLabel = availability !== "AVAILABLE"
        ? ` — ${availability} ⚠`
        : "";

      opt.textContent = `${t.name || ""}${skills}${statusLabel}`;
      techSelect.appendChild(opt);
    });
  }

  function updateTechnicianWarning() {
    const selected = (techs || []).find(
      (t) => String(t.id) === String(techSelect.value)
    );

    if (!selected) {
      techWarningEl.textContent = "";
      return;
    }

    const availability = String(selected.availability_status || "AVAILABLE").toUpperCase();

    if (availability !== "AVAILABLE") {
      techWarningEl.textContent =
        `⚠ Selected technician is currently ${availability}. Assignment is allowed for ${fixedRole}, but please review availability.`;
    } else {
      techWarningEl.textContent = "";
    }
  }

  function refreshDueDateSuggestion() {
    const suggestion = getSuggestedDueDateForJob(lift, fixedRole);

    if (!dueInput.dataset.userEdited || !dueInput.value) {
      dueInput.value = suggestion || "";
    }

    updateDueDateGuidance(dueHint, lift, fixedRole, dueInput.value);
  }

  populateTechnicianOptions();
  updateTechnicianWarning();
  refreshDueDateSuggestion();

  techSelect.onchange = updateTechnicianWarning;

  dueInput.addEventListener("input", () => {
    dueInput.dataset.userEdited = "1";
    updateDueDateGuidance(dueHint, lift, fixedRole, dueInput.value);
  });

  const btnCancel = smallBtn("Cancel", "secondary");
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn("Create Job", "primary");
  btnSave.onclick = async () => {
    try {
      if (!techSelect.value) throw new Error("Please select a lead technician");

      await API.assignTechToProjectLift(projectLiftId, {
        technicianId: Number(techSelect.value),
        leadTechnicianId: Number(techSelect.value),
        role: fixedRole,
        dueDate: dueInput.value || null,
        notes: body.querySelector("#jobNotes")?.value || "",
      });

      closeModal();
      await openProject(state.currentProjectId);
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  openModal({
    title: `Create ${fixedRole} Job`,
    bodyNode: body,
    footerNodes: [btnCancel, btnSave],
  });
}

async function renderLifts() {
  const root = setViewMode(true);

  if (!hasPermission("lifts.view")) {
    setTitle("Access Denied");
    setToolbar([]);
    root.innerHTML = `<div class="card"><div class="muted">You do not have access to Lifts.</div></div>`;
    return;
  }

  setTitle("Lifts");

  const toolbar = [];

  const btnRefresh = smallBtn("Refresh", "secondary");
  btnRefresh.onclick = () => renderLifts();
  toolbar.push(btnRefresh);

  setToolbar(toolbar);

  root.innerHTML = `<div class="card"><div class="label">Loading...</div></div>`;

  function normalizeWarrantyStatus(v) {
    const s = String(v || "").toUpperCase();
    if (s === "WARRANTY ACTIVE") return "WARRANTY ACTIVE";
    if (s === "WARRANTY EXPIRED") return "WARRANTY EXPIRED";
    return "NO WARRANTY";
  }

  function normalizeAmcStatus(v) {
    const s = String(v || "").toUpperCase();
    if (s === "AMC ACTIVE") return "AMC ACTIVE";
    if (s === "AMC EXPIRING SOON") return "AMC EXPIRING SOON";
    if (s === "AMC EXPIRED") return "AMC EXPIRED";
    if (s === "AMC NOT STARTED") return "AMC NOT STARTED";
    return "NO AMC";
  }

  try {
    const rows = await API.listLifts();

    root.innerHTML = `
      <div class="card">
        <div class="label">Lifts</div>
        <div class="hr"></div>
      </div>
    `;

    const card = root.querySelector(".card");

    const wrap = document.createElement("div");
    wrap.className = "tableContainer";
    wrap.style.maxHeight = "420px";
    wrap.style.overflow = "auto";

    wrap.innerHTML = `
      <table class="liftsTable">
        <thead>
          <tr>
            <th class="col-lift-code">Lift Code</th>
            <th class="col-customer">Customer</th>
            <th class="col-lift-location">Lift Location</th>
            <th class="col-warranty">Warranty Status</th>
            <th class="col-amc">AMC Status</th>
            <th class="col-days">Days Remaining</th>
          </tr>
        </thead>
        <tbody id="lBody"></tbody>
      </table>
    `;

    card.appendChild(wrap);

    const tb = wrap.querySelector("#lBody");

    if (!rows || !rows.length) {
      tb.innerHTML = `
        <tr>
          <td colspan="6" class="muted text-center">No lifts found.</td>
        </tr>
      `;
      return;
    }

    (rows || []).forEach((l) => {
      const tr = document.createElement("tr");

      const warrantyStatus = normalizeWarrantyStatus(l.warrantyStatus);
      const amcStatus = normalizeAmcStatus(l.amcStatus);

      const daysRemaining =
        warrantyStatus === "WARRANTY ACTIVE"
          ? (l.warrantyDaysRemaining ?? "")
          : (
              ["AMC ACTIVE", "AMC EXPIRING SOON"].includes(amcStatus)
                ? (l.daysToExpiry ?? "")
                : ""
            );

      tr.innerHTML = `
        <td class="col-lift-code"><span class="monoCode">${escapeHtml(l.liftCode || "")}</span></td>
        <td class="col-customer">${escapeHtml(l.customerName || "")}</td>
        <td class="col-lift-location">${escapeHtml(l.liftPosition || l.location || "")}</td>
        <td class="col-warranty"></td>
        <td class="col-amc"></td>
        <td class="col-days">${escapeHtml(String(daysRemaining ?? ""))}</td>
      `;

      tr.children[3].appendChild(badge(warrantyStatus));
      tr.children[4].appendChild(badge(amcStatus));

      tb.appendChild(tr);
    });
  } catch (e) {
    root.innerHTML = `
      <div class="card">
        <div class="muted" style="text-align:center;padding:20px;">
          ${escapeHtml(e.message || "Failed to load lifts")}
        </div>
      </div>
    `;
  }
}

async function renderJobs() {
  const root = setViewMode(true);

  if (!hasPermission("jobs.view")) {
    setTitle("Access Denied");
    setToolbar([]);
    root.innerHTML = `<div class="card"><div class="muted">You do not have access to Jobs.</div></div>`;
    return;
  }

  setTitle("Jobs");

  const toolbar = [];
 
  const btnRefresh = smallBtn("Refresh", "secondary");
  btnRefresh.onclick = () => renderJobs();
  toolbar.push(btnRefresh);

  setToolbar(toolbar);

  root.innerHTML = `<div class="card"><div class="label">Loading...</div></div>`;

  try {
    const view = projectJobsView;

    const data = await API.getJobs(view);
    const allRows = Array.isArray(data?.rows) ? data.rows : [];
    const rows = allRows.filter((a) => isProjectJobRole(a.role));

    root.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:12px; flex-wrap:wrap;">
          <div>
            <div class="label">Project Jobs</div>
            <div class="muted">Install and Test jobs only</div>
            <div class="muted" style="margin-top:4px;">Showing: ${escapeHtml(String(view || "").toUpperCase())}</div>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <span class="muted" style="font-weight:600;">Show</span>
            <select id="projectJobsViewFilter" style="height:34px; border-radius:8px; padding:0 8px;">
              <option value="open">Open Jobs</option>
              <option value="pending">Pending Approval</option>
              <option value="completed">Completed</option>
              <option value="all">All Records</option>
            </select>
          </div>
        </div>

        <div class="hr"></div>
      </div>
    `;

    const card = root.querySelector(".card");

    const filter = root.querySelector("#projectJobsViewFilter");
    if (filter) {
      filter.value = projectJobsView;
      filter.onchange = () => {
        projectJobsView = filter.value;
        renderJobs();
      };
    }

    const wrap = makeScrollableTableWrap(`
      <table>
        <thead>
          <tr>
            <th class="col-job-code">Job</th>
            <th class="col-project">Project</th>
            <th class="col-lift">Lift Code</th>
            <th class="col-type">Type</th>
            <th>Lead / Support</th>
            <th>Checklist</th>
            <th class="col-due">Due</th>
            <th>Status</th>
            <th>Supervisor</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody id="jBody"></tbody>
      </table>
    `, "420px");

    card.appendChild(wrap);

    const tb = wrap.querySelector("#jBody");

    if (!rows || rows.length === 0) {
      tb.innerHTML = `
        <tr>
          <td colspan="10" class="muted">No project jobs found.</td>
        </tr>
      `;
      return;
    }

    rows.forEach((a) => {
      const statusText = String(a.status || "").replaceAll("_", " ");

      const checklist = a.checklistSummary || null;
      const checklistText = checklist
        ? `${checklist.doneRequired || 0}/${checklist.totalRequired || 0} required`
        : "No checklist";

      const checklistPercent = checklist ? `(${checklist.percent || 0}%)` : "";

      let checklistBadgeText = "NO CHECKLIST";
      if (checklist) {
        const raw = String(checklist.status || "").toUpperCase();
        if (raw === "COMPLETED") checklistBadgeText = "CHECKLIST COMPLETE";
        else if (raw === "IN_PROGRESS") checklistBadgeText = "CHECKLIST IN PROGRESS";
        else checklistBadgeText = "CHECKLIST NOT STARTED";
      }

      const leadName = String(getLeadName(a) || "");
      const supportNames = Array.isArray(getSupportNames(a)) ? getSupportNames(a) : [];
      const supportCount = supportNames.length;

      const sup = String(a.supervisorStatus || "PENDING").toUpperCase();
      let supText = "🟡 Pending";
      if (sup === "APPROVED") supText = "🟢 Approved";
      if (sup === "REJECTED") supText = "🔴 Rejected";

      const rejectedRemarksHtml =
        sup === "REJECTED" && a.supervisorRemarks
          ? `<div class="muted" style="margin-top:6px; color:#b42318; font-size:12px;">${escapeHtml(a.supervisorRemarks)}</div>`
          : "";

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="col-job-code">
          <span class="monoCode">A-${escapeHtml(String(a.id || ""))}</span>
        </td>

        <td class="col-project">
          ${escapeHtml(a.project?.projectName || "")}
        </td>

        <td class="col-lift">
          <span class="monoCode">${escapeHtml(a.lift?.liftCode || "")}</span>
        </td>

        <td class="col-type">
          ${escapeHtml(a.role || "")}
        </td>

        <td>
          <div><b>Lead:</b> ${escapeHtml(leadName)}</div>
          <div class="muted">${escapeHtml(String(supportCount))} support${supportCount === 1 ? "" : "s"}</div>
          ${supportCount ? `<div class="muted">${escapeHtml(supportNames.join(", "))}</div>` : ""}
        </td>

        <td>
          <div>${escapeHtml(checklistText)}</div>
          <div class="muted">${escapeHtml(checklistPercent)}</div>
          <div class="checklistOfficeBadgeWrap"></div>
        </td>

        <td class="col-due">${escapeHtml(a.dueDate || "")}</td>

        <td></td>

        <td>
          <div class="supervisorStatusWrap"></div>
          ${rejectedRemarksHtml}
        </td>

        <td></td>
      `;

      tr.children[5]
        .querySelector(".checklistOfficeBadgeWrap")
        .appendChild(badge(checklistBadgeText));

      tr.children[7].appendChild(badge(statusText));

      tr.children[8]
        .querySelector(".supervisorStatusWrap")
        .appendChild(badge(supText));

      const cell = tr.children[9];

      if (a.checklistSummary) {
        const b0 = smallBtn("Checklist", "secondary");
        b0.onclick = async () => {
          try {
            await showOfficeChecklistModal(a.id, a.role || "JOB");
          } catch (e) {
            alert(e.message || String(e));
          }
        };
        cell.appendChild(b0);
      }

      if (
        hasPermission("service.approve") &&
        String(a.status || "").toUpperCase() === "DONE" &&
        String(a.supervisorStatus || "PENDING").toUpperCase() === "PENDING"
      ) {
        const b1 = smallBtn("Approve", "primary");
        if (cell.children.length) b1.style.marginLeft = "8px";

        b1.onclick = async () => {
          try {
            const r = await fetch(`/api/supervisor/assignments/${a.id}/approve`, {
              method: "PUT",
              headers: getOfficeAuthHeaders({}),
            });

            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j?.error || "Approve failed");

            alert("Job approved successfully.");
            await renderJobs();
          } catch (e) {
            alert(e.message || String(e));
          }
        };

        cell.appendChild(b1);

        const b2 = smallBtn("Reject", "secondary");
        if (cell.children.length) b2.style.marginLeft = "8px";

        b2.onclick = async () => {
          try {
            const remarks = prompt("Reason for rejection?");
            if (remarks === null) return;

            const r = await fetch(`/api/supervisor/assignments/${a.id}/reject`, {
              method: "PUT",
              headers: getOfficeAuthHeaders({ "Content-Type": "application/json" }),
              body: JSON.stringify({ remarks }),
            });

            const j = await r.json().catch(() => ({}));
            if (!r.ok) throw new Error(j?.error || "Reject failed");

            alert("Job returned to In Progress with supervisor remarks.");
            await renderJobs();
          } catch (e) {
            alert(e.message || String(e));
          }
        };

                cell.appendChild(b2);
      }

      // DELETE BUTTON
      if (hasPermission("jobs.delete")) {
        const bDel = smallBtn("Delete", "danger");
        if (cell.children.length) bDel.style.marginLeft = "8px";

        bDel.onclick = async () => {
          if (!confirm(`Delete Job A-${a.id}? This cannot be undone.`)) return;

          try {
            await API.deleteJob(a.id);

            showToast("Job deleted successfully");
            await renderJobs();
          } catch (e) {
            alert(e.message || "Failed to delete job");
          }
        };

        cell.appendChild(bDel);
      }

      tb.appendChild(tr);
    });
  } catch (e) {
    root.innerHTML = `
      <div class="card">
        <div class="label">Jobs failed to load</div>
        <div class="hr"></div>
        <div class="muted">${escapeHtml(String(e.message || e))}</div>
      </div>
    `;
  }
}

async function renderAMC() {
  const root = setViewMode(true);

  if (!hasPermission("amc.view")) {
    setTitle("Access Denied");
    setToolbar([]);
    root.innerHTML = `<div class="card"><div class="muted">You do not have access to AMC.</div></div>`;
    return;
  }

  setTitle("AMC");

  const toolbar = [];

  if (hasPermission("amc.create")) {
    const btnCreate = smallBtn("+ Create AMC", "primary");
    btnCreate.onclick = () => showCreateAmcSelectionModal();
    toolbar.push(btnCreate);
  }

  const btnRefresh = smallBtn("Refresh", "secondary");
  btnRefresh.onclick = () => renderAMC();
  toolbar.push(btnRefresh);

  setToolbar(toolbar);

  root.innerHTML = `<div class="card"><div class="label">Loading AMC...</div></div>`;

  try {
    const data = await API.getServiceDashboard();
    const rows = Array.isArray(data?.rows) ? data.rows : [];

    const amcRows = rows.filter(
      (r) => String(r.amcStatus || "").toUpperCase() !== "NO AMC"
    );

    root.innerHTML = `
      <div class="card">
        <div class="label">AMC Management</div>
        <div class="hr"></div>

        ${
          !amcRows.length
            ? `<div class="muted">No AMC records found.</div>`
            : `
              <div class="tableWrap">
                <table>
                  <thead>
                    <tr>
                      <th>Lift</th>
                      <th>Customer / Site</th>
                      <th>Status</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Next Service</th>
		      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${amcRows.map((r) => `
                      <tr>
  <td><b>${escapeHtml(r.liftCode || "")}</b></td>
  <td>${escapeHtml([r.customerName, r.building].filter(Boolean).join(" - ") || "—")}</td>
  <td>${escapeHtml(r.amcStatus || "")}</td>
  <td>${escapeHtml(r.amcStartDate || "—")}</td>
  <td>${escapeHtml(r.amcEndDate || "—")}</td>
  <td>${escapeHtml(r.amcNextServiceDue || "—")}</td>

  <td>
    ${
  hasPermission("amc.delete")
    ? `<button class="btn danger" data-action="delete-amc" data-amc-id="${r.amcId || ""}">
        Delete
      </button>`
    : ""
}
  </td>
</tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            `
        }
      </div>
    `;
root.querySelectorAll('[data-action="delete-amc"]').forEach((btn) => {
  btn.onclick = async () => {
    const id = btn.getAttribute("data-amc-id");

    if (!id) {
      alert("AMC ID missing");
      return;
    }

    if (!confirm("Delete this AMC contract?\n\nAll AMC service jobs must be deleted first.")) return;

    try {
      await API.deleteAmc(id);

      showToast("AMC deleted successfully");
      await renderAMC();
    } catch (e) {
      alert(e.message || "Failed to delete AMC");
    }
  };
});

  } catch (e) {
    console.error(e);
    root.innerHTML = `
      <div class="card">
        <div class="label">AMC failed</div>
        <div class="hr"></div>
        <div class="muted">${escapeHtml(e.message || String(e))}</div>
      </div>
    `;
  }
}

async function showCreateAmcSelectionModal() {
  if (!hasPermission("amc.create")) {
    alert("You do not have permission to create AMC.");
    return;
  }

  try {
    const projects = await API.listProjects();
    const eligibleLifts = [];

    for (const p of (projects || [])) {
      const r = await fetch(`/api/projects/${p.id}`, {
        headers: getOfficeAuthHeaders({}),
      });

      const pj = await r.json().catch(() => ({}));
      if (!r.ok) continue;

      (pj.lifts || []).forEach((l) => {
        const handedOver =
          l.handoverActualDate ||
          l.handover_actual_date ||
          null;
        if (!handedOver) return;

        const warrantyEndDate =
          l.warrantyEndDate ||
          l.warranty_end_date ||
          null;
        if (!warrantyEndDate) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const warrantyEnd = new Date(warrantyEndDate);
        if (Number.isNaN(warrantyEnd.getTime())) return;
        warrantyEnd.setHours(0, 0, 0, 0);

        if (today < warrantyEnd) return;

        const amcStatus = String(l?.amc?.status || "").toUpperCase();
        if (["AMC ACTIVE", "AMC EXPIRING SOON"].includes(amcStatus)) return;

        eligibleLifts.push({
          ...l,
          projectLiftId: l.id,
          label: `${l.liftCode || "—"} — ${pj.projectCode || ""} (${pj.customer?.name || ""})`,
        });
      });
    }

    const body = document.createElement("div");

    body.innerHTML = `
      <div class="formGrid">
        <div class="field" style="grid-column:1/-1">
          <label>Select Lift</label>
          <select id="amcLiftSelect">
            <option value="">-- Select Lift --</option>
            ${eligibleLifts.map((l) => `
              <option value="${l.projectLiftId}">
                ${l.label}
              </option>
            `).join("")}
          </select>
        </div>

        ${
          !eligibleLifts.length
            ? `
              <div class="field" style="grid-column:1/-1">
                <div class="muted">No lifts are currently eligible for AMC creation.</div>
              </div>
            `
            : ""
        }
      </div>
    `;

    const btnCancel = smallBtn("Cancel", "secondary");
    btnCancel.onclick = closeModal;

    const btnNext = smallBtn("Next", "primary");
    btnNext.onclick = () => {
      const selectedId = body.querySelector("#amcLiftSelect").value;
      if (!selectedId) {
        alert("Please select a lift");
        return;
      }

      const lift = eligibleLifts.find(
        (x) => String(x.projectLiftId) === String(selectedId)
      );

      if (!lift) {
        alert("Selected lift could not be resolved");
        return;
      }

      closeModal();
      showCreateAmcModal(lift);
    };

    openModal({
      title: "Select Lift for AMC",
      bodyNode: body,
      footerNodes: [btnCancel, btnNext],
    });
  } catch (e) {
    alert(e.message || String(e));
  }
}

async function renderMyJobs() {
  const root = setViewMode(false);

  setTitle("My Jobs");

  const btnRefresh = smallBtn("Refresh", "secondary");
  btnRefresh.onclick = () => renderMyJobs();

  const btnLogout = smallBtn("Logout", "secondary");
  btnLogout.onclick = () => logout();

  setToolbar([btnRefresh, btnLogout]);

  root.innerHTML = `<div class="card"><div class="label">Loading...</div></div>`;

  try {
    const rows = await API.getMyJobs();

    root.innerHTML = `
      <div class="card">
        <div class="label">Assigned Jobs</div>
        <div class="hr"></div>
      </div>
    `;

    const card = root.querySelector(".card");

    const wrap = makeScrollableTableWrap(`
      <table class="myJobsTable">
        <thead>
          <tr>
            <th class="col-job-code">Job</th>
            <th class="col-project">Project</th>
            <th class="col-lift-code">Lift Code</th>
            <th class="col-type">Type</th>
            <th>Lead / Support</th>
            <th>Checklist</th>
            <th class="col-due">Due</th>
            <th>Status</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody id="mjBody"></tbody>
      </table>
    `, "420px");

    card.appendChild(wrap);

    const tb = wrap.querySelector("#mjBody");

    if (!rows || rows.length === 0) {
      tb.innerHTML = `
        <tr>
          <td colspan="9" class="muted">No assigned jobs.</td>
        </tr>
      `;
      return;
    }

    rows.forEach((a) => {
      const statusText = String(a.status || "UNKNOWN")
  .replaceAll("_", " ")
  .toUpperCase();

      const checklist = a.checklistSummary || null;

      const checklistText = checklist
        ? `${checklist.doneRequired || 0}/${checklist.totalRequired || 0} required complete`
        : "No checklist";

      const checklistPercent = checklist ? `(${checklist.percent || 0}%)` : "";

      let checklistBadgeText = "NO CHECKLIST";
      if (checklist) {
        const raw = String(checklist.status || "").toUpperCase();
        if (raw === "COMPLETED") checklistBadgeText = "CHECKLIST COMPLETE";
        else if (raw === "IN_PROGRESS") checklistBadgeText = "CHECKLIST IN PROGRESS";
        else checklistBadgeText = "CHECKLIST NOT STARTED";
      }

      const leadName = getLeadName(a);
      const supportNames = getSupportNames(a);
      const supportCount = supportNames.length;
      const myRole = a.myRole || "";

console.log("MY JOB RAW:", a.liftCode, a.role);

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="col-job-code">
          <span class="monoCode noWrapCode">A-${a.id}</span>
        </td>

        <td class="col-project">
          ${a.projectName || ""}
        </td>

        <td class="col-lift-code">
  <span class="monoCode noWrapCode">
    ${Array.isArray(a.liftCode)
      ? a.liftCode.join("")
      : String(a.liftCode || "").replace(/\s+/g, "")}
  </span>
</td>

<td class="col-type">
  <span class="noWrapCode">
    ${Array.isArray(a.role)
      ? a.role.join("")
      : String(a.role || "").replace(/\s+/g, "")}
  </span>
</td>

        <td>
          <div><b>Lead:</b> ${leadName}</div>
          <div class="muted">${supportCount} support${supportCount === 1 ? "" : "s"}</div>
          ${supportCount ? `<div class="muted">${supportNames.join(", ")}</div>` : ""}
          ${myRole ? `<div class="muted">My Role: ${myRole}</div>` : ""}
        </td>

        <td>
          <div>${checklistText}</div>
          <div class="muted">${checklistPercent}</div>
          <div class="checklistOfficeBadgeWrap"></div>
        </td>

        <td class="col-due">
          <span class="noWrapCode">${a.dueDate || ""}</span>
        </td>

        <td></td>

        <td></td>
      `;

      tr.children[5]
        .querySelector(".checklistOfficeBadgeWrap")
        .appendChild(badge(checklistBadgeText));

      tr.children[7].appendChild(badge(statusText));

      const cell = tr.children[8];

      const b0 = smallBtn("Checklist", "primary");
      b0.onclick = async () => {
        try {
          await showTechnicianChecklistModal(a.id, a.role || "JOB");
        } catch (e) {
          alert(e.message || String(e));
        }
      };

      cell.appendChild(b0);

      tb.appendChild(tr);
    });

  } catch (e) {
    root.innerHTML = `
      <div class="card">
        <div class="label">My Jobs failed to load</div>
        <div class="hr"></div>
        <div class="muted">${String(e.message || e)}</div>
      </div>
    `;
  }
}

async function renderServiceJobs() {
  const root = setViewMode(false);

  setTitle("Service");

  const btnRefresh = smallBtn("Refresh", "secondary");
  btnRefresh.onclick = () => renderServiceJobs();

  setToolbar([btnRefresh]);

  root.innerHTML = `<div class="card"><div class="label">Loading...</div></div>`;

  try {
    const view = serviceJobsView;

    const data = await API.getJobs(view);
    const allRows = Array.isArray(data?.rows) ? data.rows : [];
    const rows = allRows.filter((a) => isServiceJobRole(a.role));

    root.innerHTML = `
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:12px; flex-wrap:wrap;">
          <div>
            <div class="label">Service Jobs</div>
            <div class="muted">Warranty Service and AMC Service jobs</div>
          </div>

          <div style="display:flex; align-items:center; gap:8px;">
            <span class="muted" style="font-weight:600;">Show</span>
            <select id="serviceJobsViewFilter" style="height:34px; border-radius:8px; padding:0 8px;">
              <option value="open">Open Jobs</option>
              <option value="pending">Pending Approval</option>
              <option value="completed">Completed</option>
              <option value="all">All Records</option>
            </select>
          </div>
        </div>

        <div class="muted" style="margin-top:6px;">Showing: ${view.toUpperCase()}</div>
        <div class="hr"></div>
      </div>
    `;

    const card = root.querySelector(".card");
    const filter = root.querySelector("#serviceJobsViewFilter");
    if (filter) {
      filter.value = serviceJobsView;
      filter.onchange = () => {
        serviceJobsView = filter.value;
        renderServiceJobs();
      };
    }

    const wrap = makeScrollableTableWrap(`
      <table>
        <thead>
          <tr>
            <th class="col-job-code">Job</th>
            <th class="col-project">Project</th>
            <th class="col-lift">Lift Code</th>
            <th class="col-type">Type</th>
            <th>Lead / Support</th>
            <th>Checklist</th>
            <th class="col-due">Due</th>
            <th>Status</th>
            <th>Supervisor</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody id="sjBody"></tbody>
      </table>
    `, "420px");

    card.appendChild(wrap);

    const tb = wrap.querySelector("#sjBody");

    if (!rows.length) {
      tb.innerHTML = `
        <tr>
          <td colspan="10" class="muted">No service jobs found.</td>
        </tr>
      `;
      return;
    }

    rows.forEach((a) => {
      const statusText = String(a.status || "").replaceAll("_", " ");

      const checklist = a.checklistSummary || null;

      const checklistText = checklist
        ? `${checklist.doneRequired || 0}/${checklist.totalRequired || 0} required`
        : "No checklist";

      const checklistPercent = checklist ? `(${checklist.percent || 0}%)` : "";

      let checklistBadgeText = "NO CHECKLIST";
      if (checklist) {
        const raw = String(checklist.status || "").toUpperCase();
        if (raw === "COMPLETED") checklistBadgeText = "CHECKLIST COMPLETE";
        else if (raw === "IN_PROGRESS") checklistBadgeText = "CHECKLIST IN PROGRESS";
        else checklistBadgeText = "CHECKLIST NOT STARTED";
      }

      const leadName = getLeadName(a);
      const supportNames = getSupportNames(a);
      const supportCount = supportNames.length;

      const sup = String(a.supervisorStatus || "PENDING").toUpperCase();
      let supText = "🟡 Pending";
      if (sup === "APPROVED") supText = "🟢 Approved";
      if (sup === "REJECTED") supText = "🔴 Rejected";

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td class="col-job-code">
          <span class="monoCode">A-${a.id}</span>
        </td>

        <td class="col-project">
          ${[a.project?.projectCode, a.project?.projectName]
            .filter(Boolean)
            .join(" - ")}
        </td>

        <td class="col-lift">
          <span class="monoCode">${a.lift?.liftCode || ""}</span>
        </td>

        <td class="col-type">
          ${a.role || ""}
        </td>

        <td>
          <div><b>Lead:</b> ${leadName}</div>
          <div class="muted">${supportCount} support${supportCount === 1 ? "" : "s"}</div>
          ${supportCount ? `<div class="muted">${supportNames.join(", ")}</div>` : ""}
        </td>

        <td>
          <div>${checklistText}</div>
          <div class="muted">${checklistPercent}</div>
          <div class="checklistOfficeBadgeWrap"></div>
        </td>

        <td class="col-due">${a.dueDate || ""}</td>

        <td></td>

        <td>
          <div class="supervisorStatusWrap"></div>
          ${
            sup === "REJECTED" && a.supervisorRemarks
              ? `<div class="muted" style="margin-top:6px; color:#b42318; font-size:12px;">${a.supervisorRemarks}</div>`
              : ""
          }
        </td>

        <td></td>
      `;

      // focus highlight (unchanged)
      if (window.__focusAssignmentId && Number(a.id) === Number(window.__focusAssignmentId)) {
        tr.style.boxShadow = "inset 0 0 0 2px #3b82f6";
        tr.style.background = "#f0f7ff";
        tr.style.transition = "all 0.25s ease";

        setTimeout(() => {
          tr.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);

        window.__focusAssignmentId = null;
      }

      // badges
      tr.children[5].querySelector(".checklistOfficeBadgeWrap")
        .appendChild(badge(checklistBadgeText));

      tr.children[7].appendChild(badge(statusText));

      tr.children[8].querySelector(".supervisorStatusWrap")
        .appendChild(badge(supText));

      const cell = tr.children[9];

      // checklist button
      const b0 = smallBtn("Checklist", "secondary");
      b0.onclick = async () => {
        try {
          await showOfficeChecklistModal(a.id, a.role || "JOB");
        } catch (e) {
          alert(e.message || String(e));
        }
      };
      cell.appendChild(b0);

      // approve / reject
      if (
        String(a.status || "").toUpperCase() === "DONE" &&
        String(a.supervisorStatus || "PENDING").toUpperCase() === "PENDING"
      ) {
        const b1 = smallBtn("Approve", "primary");
        if (cell.children.length) b1.style.marginLeft = "8px";

        b1.onclick = async () => {
  try {
    if (b1.disabled) return;

    b1.disabled = true;
    b1.textContent = "Approving...";

    const r = await fetch(`/api/supervisor/assignments/${a.id}/approve`, {
      method: "PUT",
      headers: getOfficeAuthHeaders({}),
    });

    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Approve failed");

    alert("Job approved successfully.");
    await renderJobs();

  } catch (e) {
    b1.disabled = false;
    b1.textContent = "Approve";
    alert(e.message || "Failed to approve job");
  }
};
        cell.appendChild(b1);

        const b2 = smallBtn("Reject", "secondary");
        if (cell.children.length) b2.style.marginLeft = "8px";

        b2.onclick = async () => {
  try {
    if (b2.disabled) return;

    const remarks = prompt("Reason for rejection?");
    if (remarks === null) return;

    const cleanRemarks = String(remarks).trim();
    if (!cleanRemarks) {
      alert("Rejection reason is required.");
      return;
    }

    b2.disabled = true;
    b2.textContent = "Rejecting...";

    const r = await fetch(`/api/supervisor/assignments/${a.id}/reject`, {
      method: "PUT",
      headers: getOfficeAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ remarks: cleanRemarks }),
    });

    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Reject failed");

    alert("Service job returned to In Progress with supervisor remarks.");
    await renderJobs();

  } catch (e) {
    b2.disabled = false;
    b2.textContent = "Reject";
    alert(e.message || "Failed to reject job");
  }
};
        cell.appendChild(b2);
      }

      tb.appendChild(tr);
    });

  } catch (e) {
    root.innerHTML = `
      <div class="card">
        <div class="label">Service jobs failed to load</div>
        <div class="hr"></div>
        <div class="muted">${String(e.message || e)}</div>
      </div>
    `;
  }
}

async function loadBreakdownLiftOptions() {
  const sel = document.getElementById("bdLiftSelect");
  if (!sel) return;

  try {
    const r = await fetch("/api/lifts", {
      headers: getOfficeAuthHeaders(),
    });

    const lifts = await r.json();

    const handedOver = (Array.isArray(lifts) ? lifts : []).filter(l =>
      l.handover_actual_date || l.handoverActualDate
    );

    if (!handedOver.length) {
      sel.innerHTML = `<option value="">No handed-over lifts found</option>`;
      return;
    }

    sel.innerHTML = handedOver.map(l => {
      const projectLiftId = l.projectLiftId || l.project_lift_id || l.id;
      const liftCode = l.lift_code || l.liftCode || "";
      const projectName = l.project_name || l.projectName || "";

      return `<option value="${projectLiftId}">
        ${escapeHtml(liftCode)} — ${escapeHtml(projectName)}
      </option>`;
    }).join("");
  } catch (err) {
    console.error("loadBreakdownLiftOptions error:", err);
    sel.innerHTML = `<option value="">Failed to load lifts</option>`;
  }
}

async function renderBreakdownCalls() {
  const root = setViewMode(true);

  setTitle("Breakdown Calls");
  setToolbar([]);

  root.innerHTML = `
    <div class="card">
      <h3>Create Breakdown Call</h3>

      <div class="field">
        <label>Lift</label>
        <select id="bdLiftSelect">
          <option value="">Loading lifts...</option>
        </select>
      </div>

      <div class="field" style="margin-top:12px;">
        <label>Complaint Type</label>
        <select id="bdComplaintType">
          <option value="">Select complaint</option>
          <option value="PASSENGER TRAPPED">Passenger Trapped</option>
          <option value="LIFT NOT MOVING">Lift Not Moving</option>
          <option value="DOOR ISSUE">Door Issue</option>
          <option value="NO POWER">No Power</option>
          <option value="ABNORMAL NOISE">Abnormal Noise</option>
          <option value="LEVELING ISSUE">Leveling Issue</option>
          <option value="BUTTON NOT WORKING">Button Not Working</option>
          <option value="DISPLAY ISSUE">Display Issue</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div class="field" style="margin-top:12px;">
        <label>Priority</label>
        <select id="bdPriority">
          <option value="NORMAL">Normal</option>
          <option value="URGENT">Urgent</option>
          <option value="CRITICAL">Critical</option>
        </select>
      </div>

      <div style="margin-top:16px;">
        <button id="bdSubmitBtn" class="btn primary">Create Breakdown</button>
      </div>

      <div id="bdResult" style="margin-top:14px;"></div>
    </div>

    <div class="card" style="margin-top:24px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3>Active Breakdown Jobs</h3>

        <div style="display:flex; gap:10px;">
          <select id="bdFilter">
            <option value="open" selected>Open</option>
            <option value="completed">Completed</option>
            <option value="all">All</option>
          </select>

          <button id="bdRefreshBtn" class="btn btnSmall">Refresh</button>
        </div>
      </div>

      <div id="bdListWrap">
        <div id="bdList">Loading...</div>
      </div>
    </div>
  `;

  await loadBreakdownLiftOptions();
  await loadBreakdownList();

  document.getElementById("bdSubmitBtn").onclick = submitBreakdown;
  document.getElementById("bdRefreshBtn").onclick = loadBreakdownList;

  document.getElementById("bdFilter").onchange = (e) => {
    breakdownFilter = e.target.value;
    loadBreakdownList();
  };
}

function renderTechResponseBadge(status) {
  const s = String(status || "PENDING").toUpperCase();

  if (s === "ACKNOWLEDGED") {
    return `<span class="badge bSuccess" style="margin-left:6px;">ACKNOWLEDGED</span>`;
  }

  if (s === "PENDING") {
    return `<span class="badge bWarn" style="margin-left:6px;">PENDING</span>`;
  }

  return `<span class="badge" style="margin-left:6px;">${escapeHtml(s)}</span>`;
}

async function loadBreakdownList() {
  const wrap = document.getElementById("bdList");
  if (!wrap) return;

  try {
    const r = await fetch("/api/breakdown-calls", {
      headers: getOfficeAuthHeaders(),
    });

    const rows = await r.json();

    if (!Array.isArray(rows) || !rows.length) {
      wrap.innerHTML = `<div class="muted">No breakdown jobs found.</div>`;
      return;
    }

    let filtered = rows;

    if (breakdownFilter === "open") {
      filtered = rows.filter(j =>
        ["ASSIGNED", "IN_PROGRESS"].includes(String(j.status || "").toUpperCase())
      );
    } else if (breakdownFilter === "completed") {
      filtered = rows.filter(j =>
        String(j.status || "").toUpperCase() === "DONE"
      );
    }

    if (!filtered.length) {
      wrap.innerHTML = `<div class="muted">No ${breakdownFilter} breakdown jobs found.</div>`;
      return;
    }

    const badge = (text, cls = "") =>
      `<span class="badge ${cls}" style="white-space:nowrap;">${escapeHtml(text)}</span>`;

    const responseText = (status) => {
      const s = String(status || "PENDING").toUpperCase();
      return s === "ACKNOWLEDGED"
        ? badge("✓ Ack", "bSuccess")
        : badge("Pending", "bWarn");
    };

    const callGuide = (label) =>
      `<div style="margin-top:4px; font-size:11px; font-weight:700; color:#9a3412;">
        Office guide: ${escapeHtml(label)}
      </div>`;

    wrap.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="table" style="min-width:1100px;">
          <thead>
            <tr>
              <th style="width:70px;">Job</th>
              <th style="width:170px;">Lift / Project</th>
              <th>Complaint</th>
              <th style="width:150px;">Status</th>
              <th style="width:210px;">Lead</th>
              <th style="width:210px;">Support</th>
              <th style="width:160px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(r => `
              <tr ${r.escalated ? 'style="background:#fff7f7;"' : ""}>
                <td><b>#${escapeHtml(String(r.id || ""))}</b></td>

                <td>
                  <b>${escapeHtml(r.liftCode || "")}</b><br/>
                  <span class="muted">${escapeHtml(r.project || "")}</span>
                </td>

                <td>
                  <b>${escapeHtml(r.complaint || "")}</b><br/>
                  ${badge(r.priority || "NORMAL")}
                </td>

                <td>
                  ${badge(r.status || "ASSIGNED")}
                  ${r.escalated ? badge("ESCALATED", "bDanger") : ""}
                </td>

                <td>
                  <b>${escapeHtml(r.lead || "-")}</b><br/>
                  ${responseText(r.leadResponseStatus)}
                  ${r.escalated ? callGuide("Call Lead") : ""}
                </td>

                <td>
                  <b>${escapeHtml(r.support || "-")}</b><br/>
                  ${responseText(r.supportResponseStatus)}
                  ${r.escalated ? callGuide("Call Support") : ""}
                </td>

                <td>
                  <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    ${hasPermission("breakdowns.assign") &&
  String(r.status || "").toUpperCase() === "ASSIGNED"
    ? `<button class="btn btnSmall" onclick="openBreakdownReassignModal(${Number(r.id)})">Reassign</button>`
    : ""}

                    ${hasPermission("breakdowns.delete")
                      ? `<button class="btn btnSmall danger" onclick="deleteBreakdownCall(${Number(r.id)})">Delete</button>`
                      : ""}
                  </div>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    console.error("loadBreakdownList error:", err);
    wrap.innerHTML = `<div class="muted">Failed to load breakdown jobs</div>`;
  }
}

async function openBreakdownReassignModal(jobId) {
  try {
    const technicians = await API.listTechnicians();

    const serviceTechs = (Array.isArray(technicians) ? technicians : []).filter((t) => {
      const active = t.isActive !== false && t.is_active !== false;
      const skills = String(t.skills || t.role || "").toUpperCase();

      return active && (
        skills.includes("SERVICE") ||
        skills.includes("AMC") ||
        skills.includes("BREAKDOWN") ||
        String(t.role || "").toUpperCase().includes("TECHNICIAN")
      );
    });

    if (serviceTechs.length < 2) {
      alert("At least two active technicians are required.");
      return;
    }

    const options = serviceTechs.map(t => `
      <option value="${Number(t.id)}">
        ${escapeHtml(t.name || "Technician")} ${t.phone ? `(${escapeHtml(t.phone)})` : ""}
      </option>
    `).join("");

    const old = document.getElementById("breakdownReassignModal");
    if (old) old.remove();

    document.body.insertAdjacentHTML("beforeend", `
      <div id="breakdownReassignModal" style="
        position:fixed;
        inset:0;
        background:rgba(15,23,42,.45);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:9999;
      ">
        <div class="card" style="
          width:min(520px, 92vw);
          background:white;
          padding:22px;
          border-radius:16px;
          box-shadow:0 20px 60px rgba(0,0,0,.25);
        ">
          <h3 style="margin-top:0;">Reassign Breakdown Team</h3>

          <div class="field">
            <label>Lead Technician</label>
            <select id="bdReassignLead">
              <option value="">Select lead</option>
              ${options}
            </select>
          </div>

          <div class="field" style="margin-top:12px;">
            <label>Support Technician</label>
            <select id="bdReassignSupport">
              <option value="">Select support</option>
              ${options}
            </select>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:18px;">
            <button class="btn btnSmall" onclick="closeBreakdownReassignModal()">Cancel</button>
            <button class="btn btnSmall primary" onclick="submitBreakdownReassign(${Number(jobId)})">Save Team</button>
          </div>
        </div>
      </div>
    `);
  } catch (err) {
    console.error("openBreakdownReassignModal error:", err);
    alert(err.message || "Failed to open reassignment window");
  }
}

function closeBreakdownReassignModal() {
  const modal = document.getElementById("breakdownReassignModal");
  if (modal) modal.remove();
}

async function submitBreakdownReassign(jobId) {
  const leadTechnicianId = Number(document.getElementById("bdReassignLead")?.value || 0);
  const supportTechnicianId = Number(document.getElementById("bdReassignSupport")?.value || 0);

  if (!leadTechnicianId || !supportTechnicianId) {
    alert("Please select both lead and support technician.");
    return;
  }

  if (leadTechnicianId === supportTechnicianId) {
    alert("Lead and support technician cannot be the same.");
    return;
  }

  try {
    await API.updateBreakdownTeam(jobId, {
      leadTechnicianId,
      supportTechnicianId,
    });

    closeBreakdownReassignModal();
    await loadBreakdownList();
    alert("Breakdown team reassigned successfully.");
  } catch (err) {
    console.error("submitBreakdownReassign error:", err);
    alert(err.message || "Failed to reassign breakdown team");
  }
}

async function submitBreakdown() {
  const projectLiftId = Number(document.getElementById("bdLiftSelect").value);
  const complaintType = document.getElementById("bdComplaintType").value;
  const notes = document.getElementById("bdNotes")?.value.trim() || "";
  const priority = document.getElementById("bdPriority").value;
  const resultBox = document.getElementById("bdResult");

  if (!projectLiftId) {
    resultBox.innerHTML = `<div class="muted">Select a lift.</div>`;
    return;
  }

  if (!complaintType) {
    resultBox.innerHTML = `<div class="muted">Select complaint type.</div>`;
    return;
  }

  const complaint = notes
    ? `${complaintType} - ${notes}`
    : complaintType;

  try {
    const r = await fetch("/api/breakdown-calls", {
      method: "POST",
      headers: getOfficeAuthHeaders(),
      body: JSON.stringify({ projectLiftId, complaint, priority }),
    });

    const text = await r.text();

let data = {};
try {
  data = text ? JSON.parse(text) : {};
} catch {
  data = { error: text || "Server returned non-JSON response" };
}

if (!r.ok) {
  if (r.status === 403) {
    throw new Error("You do not have permission to create breakdown calls.");
  }
  throw new Error(data.error || "Failed to create breakdown");
}

    resultBox.innerHTML = `
  <div class="muted" style="margin-top:8px;">
    Breakdown job #${data.jobId || ""} created successfully.
  </div>
`;

    document.getElementById("bdComplaintType").value = "";
const notesEl = document.getElementById("bdNotes");
if (notesEl) notesEl.value = "";

    await loadBreakdownList();
  } catch (err) {
    resultBox.innerHTML = `<div class="muted">${err.message}</div>`;
  }
}

async function deleteBreakdownCall(id) {
  if (!confirm("Delete this breakdown call?")) return;

  try {
    const r = await fetch(`/api/breakdown-calls/${id}`, {
      method: "DELETE",
      headers: getOfficeAuthHeaders(),
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      throw new Error(data.error || "Failed to delete breakdown call");
    }

    await loadBreakdownList();
  } catch (err) {
    alert(err.message);
  }
}

async function renderTechnicians() {
  const root = setViewMode(true);

  if (!hasPermission("technicians.view")) {
    setTitle("Access Denied");
    setToolbar([]);
    root.innerHTML = `<div class="card"><div class="muted">You do not have access to Technicians.</div></div>`;
    return;
  }

  setTitle("Technicians");

  const toolbarNodes = [];

  if (hasPermission("technicians.create")) {
    const btnCreate = smallBtn("+ Add Technician", "primary");
    btnCreate.onclick = () => showCreateTechnicianModal();
    toolbarNodes.push(btnCreate);
  }

  const btnRefresh = smallBtn("Refresh", "secondary");
  btnRefresh.onclick = () => renderTechnicians();
  toolbarNodes.push(btnRefresh);

  setToolbar(toolbarNodes);

  root.innerHTML = `<div class="card"><div class="label">Loading...</div></div>`;

  try {
    const rows = await API.listTechnicians();

    root.innerHTML = `
      <div class="card">
        <div class="label">Technicians</div>
        <div class="hr"></div>
      </div>
    `;

    const card = root.querySelector(".card");
    const wrap = makeScrollableTableWrap(`
      <table class="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Skills</th>
            <th>Availability</th>
            <th style="width:160px;">Actions</th>
          </tr>
        </thead>
        <tbody id="tBody"></tbody>
      </table>
    `, "420px");

    card.appendChild(wrap);

    const tb = wrap.querySelector("#tBody");

    if (!rows || rows.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td colspan="6" class="muted" style="text-align:center;padding:20px;">
          No technicians found.
        </td>
      `;
      tb.appendChild(tr);
      return;
    }

    rows.forEach((t) => {
      const tr = document.createElement("tr");

      const skills = String(t.skills || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .join(", ");

      const availability = String(t.availability_status || "AVAILABLE").toUpperCase();

      tr.innerHTML = `
        <td>${escapeHtml(t.name || "")}</td>
        <td>${escapeHtml(t.phone || "")}</td>
        <td>${escapeHtml(t.email || "—")}</td>
        <td>${escapeHtml(skills || "—")}</td>
        <td>${escapeHtml(availability)}</td>
        <td>
          <div style="display:flex;gap:6px;flex-direction:column;">
            <button class="btn secondary btnEditTech">Edit</button>
            <button class="btn secondary btnLeaveTech">Leave</button>
          </div>
        </td>
      `;

      const btnEdit = tr.querySelector(".btnEditTech");
      const btnLeave = tr.querySelector(".btnLeaveTech");

      if (btnEdit) {
        if (!hasPermission("technicians.edit")) {
          btnEdit.style.display = "none";
        } else {
          btnEdit.onclick = () => showEditTechnicianModal(t);
        }
      }

      if (btnLeave) {
        if (!hasPermission("technicians.edit")) {
          btnLeave.style.display = "none";
        } else {
          btnLeave.onclick = () => showTechnicianLeaveModal(t);
        }
      }

      tb.appendChild(tr);
    });
  } catch (e) {
    root.innerHTML = `
      <div class="card">
        <div class="muted" style="text-align:center;padding:20px;">
          ${escapeHtml(e.message || "Failed to load technicians")}
        </div>
      </div>
    `;
  }
}

async function showTechnicianLeaveModal(technician) {
  try {
    const leaves = await API.listTechnicianLeaves(technician.id);

    const old = document.getElementById("leaveModalBack");
    if (old) old.remove();

    const back = document.createElement("div");
    back.id = "leaveModalBack";
    back.style.position = "fixed";
    back.style.inset = "0";
    back.style.background = "rgba(15,23,42,0.45)";
    back.style.zIndex = "9999";
    back.style.display = "flex";
    back.style.alignItems = "center";
    back.style.justifyContent = "center";
    back.style.padding = "18px";

    const rowsHtml = leaves.length
      ? leaves.map((l) => `
          <tr>
            <td>${escapeHtml(l.from_date || "")}</td>
            <td>${escapeHtml(l.to_date || "")}</td>
            <td>${escapeHtml(l.status || "")}</td>
            <td>${escapeHtml(l.reason || "—")}</td>
            <td>
              ${
                String(l.status || "").toUpperCase() === "APPROVED"
                  ? `<button class="btn secondary btnCancelLeave" data-id="${l.id}">Cancel</button>`
                  : "—"
              }
            </td>
          </tr>
        `).join("")
      : `
        <tr>
          <td colspan="5" class="muted" style="text-align:center;padding:14px;">
            No leave records found.
          </td>
        </tr>
      `;

    back.innerHTML = `
      <div class="card" style="width:min(780px,96vw);max-height:90vh;overflow:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;">
          <div>
            <div class="label">Leave Records</div>
            <h3 style="margin:4px 0 0;">${escapeHtml(technician.name || "")}</h3>
          </div>
          <button class="btn secondary" id="btnCloseLeaveModal">Close</button>
        </div>

        <div class="hr"></div>

        <div style="overflow:auto;max-height:260px;">
          <table class="table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Reason</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>

        <div class="hr"></div>

        <div class="label">Add Leave</div>

        <div class="formGrid">
          <label>
            From Date
            <input id="leaveFromDate" type="date" />
          </label>

          <label>
            To Date
            <input id="leaveToDate" type="date" />
          </label>
        </div>

        <label>
          Reason
          <textarea id="leaveReason" rows="3" placeholder="Reason for leave"></textarea>
        </label>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;">
          <button class="btn primary" id="btnSaveLeave">Save Leave</button>
        </div>
      </div>
    `;

    document.body.appendChild(back);

    const close = () => back.remove();

    document.getElementById("btnCloseLeaveModal").onclick = close;

    back.onclick = (e) => {
      if (e.target === back) close();
    };

    document.getElementById("btnSaveLeave").onclick = async () => {
      const from_date = document.getElementById("leaveFromDate")?.value || "";
      const to_date = document.getElementById("leaveToDate")?.value || "";
      const reason = document.getElementById("leaveReason")?.value || "";

      if (!from_date || !to_date) {
        alert("From Date and To Date are required.");
        return;
      }

      await API.createTechnicianLeave(technician.id, {
        from_date,
        to_date,
        reason,
      });

      close();
      await renderTechnicians();
      await showTechnicianLeaveModal(technician);
    };

    back.querySelectorAll(".btnCancelLeave").forEach((btn) => {
      btn.onclick = async () => {
        const leaveId = Number(btn.getAttribute("data-id"));
        if (!confirm("Cancel this leave record?")) return;

        await API.cancelTechnicianLeave(leaveId);

        close();
        await renderTechnicians();
        await showTechnicianLeaveModal(technician);
      };
    });
  } catch (e) {
    alert(e.message || "Failed to open leave records");
  }
}

function renderReports() {
  const root = setViewMode(true);

  if (!hasPermission("reports.view")) {
    setTitle("Access Denied");
    setToolbar([]);
    root.innerHTML = `<div class="card"><div class="muted">You do not have access to Reports.</div></div>`;
    return;
  }

  setTitle("Reports");

  const toolbarNodes = [];

  if (hasPermission("reports.export")) {
    const btnExport = smallBtn("Export", "secondary");
    btnExport.onclick = () => {
      alert("Export coming soon");
    };
    toolbarNodes.push(btnExport);
  }

  setToolbar(toolbarNodes);

  root.innerHTML = `
    <div class="card">
      <div class="label">Reports</div>
      <div class="hr"></div>
      <div class="muted">
        Next: AMC expiry list, overdue services, job ageing, technician productivity.
      </div>
    </div>
  `;
}

function checklistSummaryText(summary) {
  if (!summary) return 'Checklist not loaded';
  return `${summary.doneRequired || 0}/${summary.totalRequired || 0} required complete (${summary.percent || 0}%)`;
}

function renderChecklistStatusBadge(summary) {
  const raw = String(summary?.status || 'NOT_STARTED').toUpperCase();

  let label = 'CHECKLIST NOT STARTED';
  if (raw === 'IN_PROGRESS') label = 'CHECKLIST IN PROGRESS';
  if (raw === 'COMPLETED') label = 'CHECKLIST COMPLETE';

  return badge(label);
}

function escapeHtml(v) {
  return String(v ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isServiceRole(roleLabel) {
  const r = String(roleLabel || '').toUpperCase();
  return r.includes('AMC SERVICE') || r.includes('WARRANTY SERVICE');
}

function goToService() {
  location.hash = '#service';
  renderServiceDashboard();
}



async function showSmartReassignModal(jobId) {
  try {
    const data = await API.getReassignOptions(jobId);

    const body = document.createElement("div");

    body.innerHTML = `
      <div style="margin-bottom:12px;">
        <b>Reassign Job</b> (${data.role})
      </div>

      ${
        !data.suggestions.length
          ? `<div class="muted">No available technicians</div>`
          : data.suggestions.map(t => `
              <div class="listRow">
                <div>
                  <b>${t.name}</b>
                  <div class="muted">${t.skills}</div>
                  <div class="muted">
                    Load: ${t.loadScore} | Open: ${t.openJobs} | Overdue: ${t.overdue}
                  </div>
                </div>
                <div class="rowActions">
                  <button class="btn" data-tech-id="${t.id}">
                    Assign
                  </button>
                </div>
              </div>
            `).join("")
      }
    `;

    // 🔥 attach assign handlers
    setTimeout(() => {
      body.querySelectorAll("button[data-tech-id]").forEach(btn => {
        btn.onclick = async () => {
          try {
            const techId = Number(btn.dataset.techId);

            await API.reassignJob(jobId, techId);

            closeModal();
            alert("Reassigned successfully");

            // refresh dashboard
            loadServiceDashboard();

          } catch (e) {
            alert(e.message);
          }
        };
      });
    }, 0);

    const btnClose = smallBtn("Close", "secondary");
    btnClose.onclick = closeModal;

    openModal({
      title: "Smart Reassignment",
      bodyNode: body,
      footerNodes: [btnClose],
    });

  } catch (e) {
    alert(e.message);
  }
}

async function showOfficeChecklistModal(jobId, roleLabel = 'JOB') {
  try {
    const [data, reportData] = await Promise.all([
      API.getChecklist(jobId),
      isServiceRole(roleLabel)
        ? API.getServiceReport(jobId)
        : Promise.resolve({ report: null, parts: [] }),
    ]);

    const body = document.createElement('div');
    body.innerHTML = `
      <div class="checklistModalTop">
        <div class="checklistSummaryRow">
          <div><b>${roleLabel}</b> checklist</div>
          <div class="muted">${checklistSummaryText(data.summary)}</div>
        </div>

        ${
          String(data.status || '').toUpperCase() === 'DONE' &&
          String(data.supervisorStatus || '').toUpperCase() === 'APPROVED'
            ? `
              <div style="border:1px solid #bfdbfe; background:#eff6ff; border-radius:10px; padding:12px; margin:10px 0;">
                <div style="font-weight:700; color:#1d4ed8;">Approved & Locked</div>
                <div class="muted" style="margin-top:6px;">
                  This job has been approved by supervisor. No further changes are allowed.
                </div>
              </div>
            `
            : ''
        }

        ${
          String(data.supervisorStatus || '').toUpperCase() === 'REJECTED' &&
          String(data.supervisorRemarks || '').trim()
            ? `
              <div style="border:1px solid #f5c2c7; background:#fff5f5; border-radius:10px; padding:12px; margin-bottom:12px;">
                <div style="font-weight:700; color:#b42318; margin-bottom:6px;">Supervisor Remarks</div>
                <div style="color:#b42318; font-weight:600;">${escapeHtml(data.supervisorRemarks)}</div>
              </div>
            `
            : ''
        }

        <div id="officeChecklistItemsWrap"></div>

        <div class="hr"></div>
        <div class="checklistNotesHead"><b>Notes</b></div>
        <div id="officeChecklistNotesWrap"></div>

        ${
          isServiceRole(roleLabel)
            ? `
              <div class="hr"></div>

              <div style="font-weight:700; margin-bottom:10px;">Service Report</div>

              <div class="formGrid">
                <div class="field" style="grid-column:1/-1">
                  <label>Overall Condition</label>
                  <textarea disabled>${escapeHtml(reportData?.report?.overallCondition || '')}</textarea>
                </div>

                <div class="field" style="grid-column:1/-1">
                  <label>Faults Observed</label>
                  <textarea disabled>${escapeHtml(reportData?.report?.faultsObserved || '')}</textarea>
                </div>

                <div class="field" style="grid-column:1/-1">
                  <label>Action Taken</label>
                  <textarea disabled>${escapeHtml(reportData?.report?.actionTaken || '')}</textarea>
                </div>

                <div class="field" style="grid-column:1/-1">
                  <label>Recommendations</label>
                  <textarea disabled>${escapeHtml(reportData?.report?.recommendations || '')}</textarea>
                </div>

                <div class="field">
                  <label>Follow-up Required</label>
                  <div style="padding-top:10px;">
                    <input type="checkbox" disabled ${reportData?.report?.followUpRequired ? 'checked' : ''} />
                  </div>
                </div>

                <div class="field" style="grid-column:1/-1">
                  <label>Technician Remarks</label>
                  <textarea disabled>${escapeHtml(reportData?.report?.technicianRemarks || '')}</textarea>
                </div>
              </div>

              <div class="hr"></div>

              <div style="font-weight:700; margin-bottom:10px;">Parts Used</div>
              <div id="officeServicePartsWrap"></div>
            `
            : ''
        }
      </div>
    `;

    const itemsWrap = body.querySelector('#officeChecklistItemsWrap');
    const notesWrap = body.querySelector('#officeChecklistNotesWrap');
    const partsWrap = body.querySelector('#officeServicePartsWrap');

    itemsWrap.innerHTML = (data.items || []).map((item) => `
      <div style="border:1px solid #e5e7eb; border-radius:10px; padding:12px; margin-bottom:10px;">
        <div><b>${item.sortOrder}. ${escapeHtml(item.itemText)}</b></div>
        <div class="muted" style="margin-top:4px;">
          ${(item.isRequired ? 'Required' : 'Optional')} · ${item.isDone ? 'Done' : 'Pending'}
        </div>

        ${
          String(item.itemType || '').toUpperCase() === 'TEXT' && item.textValue
            ? `<div style="margin-top:8px;">${escapeHtml(item.textValue)}</div>`
            : ''
        }

        ${
          String(item.itemType || '').toUpperCase() === 'NUMBER' && item.numberValue != null
            ? `<div style="margin-top:8px;">${escapeHtml(item.numberValue)}</div>`
            : ''
        }

        ${
          String(item.itemType || '').toUpperCase() === 'BOOLEAN'
            ? `<div style="margin-top:8px;">${item.isDone ? 'Yes' : 'No'}</div>`
            : ''
        }
      </div>
    `).join('') || `<div class="muted">No checklist items found.</div>`;

    notesWrap.innerHTML = (data.notes || []).map((n) => `
      <div style="padding:8px 0; border-bottom:1px solid #eee;">
        <div>${escapeHtml(n.noteText || '')}</div>
        <div class="muted" style="margin-top:6px">
          ${escapeHtml(n.technician?.name || 'Technician')} · ${escapeHtml(n.createdAt || '')}
        </div>
      </div>
    `).join('') || `<div class="muted">No notes yet.</div>`;

    if (partsWrap) {
      const parts = reportData?.parts || [];

      partsWrap.innerHTML = parts.length
        ? parts.map((p) => `
            <div style="border:1px solid #e5e7eb; border-radius:10px; padding:12px; margin-bottom:10px;">
              <div><b>${escapeHtml(p.itemName || '')}</b></div>
              <div class="muted" style="margin-top:4px;">Qty: ${escapeHtml(p.qty ?? '')}</div>
              ${
                p.remarks
                  ? `<div style="margin-top:8px;">${escapeHtml(p.remarks)}</div>`
                  : `<div class="muted" style="margin-top:8px;">No remarks</div>`
              }
            </div>
          `).join('')
        : `<div class="muted">No parts added yet.</div>`;
    }

    const btnClose = smallBtn('Close', 'secondary');
    btnClose.onclick = closeModal;

    openModal({
      title: `${roleLabel} Checklist`,
      bodyNode: body,
      footerNodes: [btnClose],
    });
  } catch (e) {
    alert(e.message || String(e));
  }
}

async function showTechChecklistModal(jobId, roleLabel = 'JOB') {
  try {
    const [data, reportData] = await Promise.all([
      API.getTechChecklist(jobId),
      isServiceRole(roleLabel)
        ? API.getTechServiceReport(jobId)
        : Promise.resolve({ report: null, parts: [] }),
    ]);

    const isLead = String(data.teamRole || data.myTeamRole || '').toUpperCase() === 'LEAD';
    const isLocked =
      String(data.status || '').toUpperCase() === 'DONE' &&
      String(data.supervisorStatus || '').toUpperCase() === 'APPROVED';

    const showSupervisorAlert =
      String(data.supervisorStatus || '').toUpperCase() === 'REJECTED' &&
      String(data.supervisorRemarks || '').trim();

    const body = document.createElement('div');

    body.innerHTML = `
      <div class="checklistModalTop">

        ${isLocked ? `
          <div style="border:1px solid #bfdbfe; background:#eff6ff; border-radius:10px; padding:12px; margin-bottom:12px;">
            <div style="font-weight:700; color:#1d4ed8; margin-bottom:6px;">Checklist Locked</div>
            <div style="color:#1d4ed8; font-weight:600;">
              Supervisor has already approved this job. Checklist, notes, service report, and parts are now read-only.
            </div>
          </div>
        ` : ''}

        ${showSupervisorAlert ? `
          <div style="border:1px solid #f5c2c7; background:#fff5f5; border-radius:10px; padding:12px; margin-bottom:12px;">
            <div style="font-weight:700; color:#b42318; margin-bottom:6px;">Supervisor Remarks</div>
            <div style="color:#b42318; font-weight:600;">${escapeHtml(data.supervisorRemarks)}</div>
            <div class="muted" style="margin-top:6px;">
              Please complete the correction and then mark the job complete again.
            </div>
          </div>
        ` : ''}

        <div class="checklistSummaryRow">
  <div><b>${escapeHtml(roleLabel)}</b> checklist</div>
  <div id="checklistSummaryText" class="muted">
    ${checklistSummaryText(data.summary)}
  </div>
</div>

        <div id="checklistItemsWrap" class="checklistItemsWrap"></div>

        <div class="hr"></div>

        <div class="field" style="grid-column:1/-1">
          <label>Add Note</label>
          <textarea id="checklistNoteText" placeholder="Add observation / issue / service note" ${isLocked ? 'disabled' : ''}></textarea>
        </div>

        <div class="checklistNotesHead"><b>Notes</b></div>
        <div id="checklistNotesWrap" class="checklistNotesWrap"></div>

        ${
          isServiceRole(roleLabel)
            ? `
              <div class="hr"></div>

              <div style="font-weight:700; margin-bottom:10px;">Service Report</div>

              <div class="formGrid">
  <div class="field">
    <label>Overall Condition</label>
    <select id="srOverallCondition" ${isLocked ? 'disabled' : ''}>
      <option value="">Select condition</option>
      <option value="Good" ${reportData?.report?.overallCondition === 'Good' ? 'selected' : ''}>Good</option>
      <option value="Minor Issues" ${reportData?.report?.overallCondition === 'Minor Issues' ? 'selected' : ''}>Minor Issues</option>
      <option value="Needs Attention" ${reportData?.report?.overallCondition === 'Needs Attention' ? 'selected' : ''}>Needs Attention</option>
      <option value="Critical" ${reportData?.report?.overallCondition === 'Critical' ? 'selected' : ''}>Critical</option>
    </select>
  </div>

  <div class="field" style="grid-column:1/-1">
    <label>Faults Observed</label>
    <textarea id="srFaultsObserved" ${isLocked ? 'disabled' : ''} placeholder="Short fault description">${escapeHtml(reportData?.report?.faultsObserved || '')}</textarea>
  </div>

  <div class="field" style="grid-column:1/-1">
    <label>Action Taken</label>
    <textarea id="srActionTaken" ${isLocked ? 'disabled' : ''} placeholder="Work carried out">${escapeHtml(reportData?.report?.actionTaken || '')}</textarea>
  </div>

  <div class="field">
    <label>Follow-up Required</label>
    <div style="padding-top:10px;">
      <input type="checkbox" id="srFollowUpRequired" ${isLocked ? 'disabled' : ''} ${reportData?.report?.followUpRequired ? 'checked' : ''} />
    </div>
  </div>

  <div class="field" id="srRecommendationsWrap" style="grid-column:1/-1; ${reportData?.report?.followUpRequired ? '' : 'display:none;'}">
    <label>Recommendations</label>
    <textarea id="srRecommendations" ${isLocked ? 'disabled' : ''} placeholder="Required only if follow-up is needed">${escapeHtml(reportData?.report?.recommendations || '')}</textarea>
  </div>

  <div class="field" style="grid-column:1/-1">
    <label>Technician Remarks</label>
    <textarea id="srTechnicianRemarks" ${isLocked ? 'disabled' : ''} placeholder="Optional remarks">${escapeHtml(reportData?.report?.technicianRemarks || '')}</textarea>
  </div>
</div>

              ${isLocked ? '' : `
                <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
                  <button type="button" class="btn secondary" id="btnSaveServiceReport">Save Report</button>
                </div>
              `}

              <div class="hr"></div>

              <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:10px;">
                <div style="font-weight:700;">Parts Used</div>
                ${isLocked ? '' : `<button type="button" class="btn secondary" id="btnAddServicePart">+ Add Part</button>`}
              </div>

              <div id="servicePartsWrap"></div>
            `
            : ''
        }
      </div>
    `;

    const itemsWrap = body.querySelector('#checklistItemsWrap');
    const notesWrap = body.querySelector('#checklistNotesWrap');
    const summaryTextEl = body.querySelector('#checklistSummaryText');

    let currentChecklist = data;
    let currentReportData = reportData;

    async function refreshChecklistModal() {
      currentChecklist = await API.getTechChecklist(jobId);
      summaryTextEl.textContent = checklistSummaryText(currentChecklist.summary);
      renderItems(currentChecklist.items || []);
      renderNotes(currentChecklist.notes || []);
      const noteEl = body.querySelector('#checklistNoteText');
      if (noteEl) noteEl.value = '';

      if (typeof renderTechDashboard === 'function') {
        await renderTechDashboard();
      }
    }

    async function refreshServiceReportSection() {
      if (!isServiceRole(roleLabel)) return;

      currentReportData = await API.getTechServiceReport(jobId);

      const r = currentReportData.report || {};
      const parts = currentReportData.parts || [];

      const overall = body.querySelector('#srOverallCondition');
      const faults = body.querySelector('#srFaultsObserved');
      const action = body.querySelector('#srActionTaken');
      const reco = body.querySelector('#srRecommendations');
      const follow = body.querySelector('#srFollowUpRequired');
      const remarks = body.querySelector('#srTechnicianRemarks');

      if (overall) overall.value = r.overallCondition || '';
      if (faults) faults.value = r.faultsObserved || '';
      if (action) action.value = r.actionTaken || '';
      if (reco) reco.value = r.recommendations || '';
      if (follow) follow.checked = !!r.followUpRequired;
      if (remarks) remarks.value = r.technicianRemarks || '';

      renderServiceParts(parts);
wireFollowUpToggle();

      if (typeof renderTechDashboard === 'function') {
        await renderTechDashboard();
      }
    }

function wireFollowUpToggle() {
  const followUpEl = body.querySelector('#srFollowUpRequired');
  const recommendationsWrapEl = body.querySelector('#srRecommendationsWrap');

  if (!followUpEl || !recommendationsWrapEl) return;

  const syncRecommendationsVisibility = () => {
    recommendationsWrapEl.style.display = followUpEl.checked ? '' : 'none';
  };

  syncRecommendationsVisibility();
  followUpEl.addEventListener('change', syncRecommendationsVisibility);
}

function renderNotes(notes) {
  notesWrap.innerHTML = '';

  if (!notes.length) {
    notesWrap.innerHTML = `<div class="muted">No notes added</div>`;
    return;
  }

  notes.forEach(n => {
    const div = document.createElement('div');
    div.className = 'listRow';

    div.innerHTML = `
      <div>
        <div>${escapeHtml(n.noteText || n.text || '')}</div>
        <div class="muted" style="font-size:12px;">
          ${n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
        </div>
      </div>
    `;

    notesWrap.appendChild(div);
  });
}

function renderServiceParts(parts) {
  const partsWrap = body.querySelector('#servicePartsWrap');
  if (!partsWrap) return;

  partsWrap.innerHTML = '';

  if (!parts.length) {
    partsWrap.innerHTML = `<div class="muted">No parts added yet.</div>`;
    return;
  }

  parts.forEach((p) => {
    const row = document.createElement('div');
    row.className = 'partItem';

    row.innerHTML = `
      <div class="field">
        <label>Part / Material</label>
        <input type="text" value="${escapeHtml(p.itemName || '')}" placeholder="Part name" ${isLocked ? 'disabled' : ''} />
      </div>

      <div class="field">
        <label>Qty</label>
        <input type="number" min="0.01" step="0.01" value="${p.qty ?? 1}" placeholder="Qty" ${isLocked ? 'disabled' : ''} />
      </div>

      <div class="field">
        <label>Remarks</label>
        <input type="text" value="${escapeHtml(p.remarks || '')}" placeholder="Remarks" ${isLocked ? 'disabled' : ''} />
      </div>

      ${
        isLocked
          ? ''
          : `
            <div class="actions">
              <button type="button" class="btn btnSmall">Save Part</button>
              <button type="button" class="btn btnSmall">Delete</button>
            </div>
          `
      }
    `;

    if (!isLocked) {
      const inputs = row.querySelectorAll('input');
      const [nameEl, qtyEl, remarksEl] = inputs;
      const buttons = row.querySelectorAll('button');
      const [saveBtn, deleteBtn] = buttons;

      saveBtn.onclick = async () => {
        try {
          await API.updateTechServicePart(p.id, {
            itemName: nameEl.value,
            qty: qtyEl.value,
            remarks: remarksEl.value,
          });
          await refreshServiceReportSection();
        } catch (e) {
          alert(e.message || String(e));
        }
      };

      deleteBtn.onclick = async () => {
        try {
          if (!confirm('Delete this part?')) return;
          await API.deleteTechServicePart(p.id);
          await refreshServiceReportSection();
        } catch (e) {
          alert(e.message || String(e));
        }
      };
    }

    partsWrap.appendChild(row);
  });
}
    function renderItems(items) {
  itemsWrap.innerHTML = '';

  if (!items.length) {
    itemsWrap.innerHTML = `<div class="muted">No checklist items found.</div>`;
    return;
  }

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'checklistCard';

    const canEdit = isLead && !isLocked;
    const type = String(item.itemType || 'BOOLEAN').toUpperCase();
    const isBoolean = type === 'BOOLEAN';
    const isText = type === 'TEXT';
    const isNumber = type === 'NUMBER';

    const statusText = isBoolean
      ? (item.isDone ? 'Done' : 'Pending')
      : (item.isDone ? 'Filled' : 'Pending');

    let controlHtml = '';

    if (isBoolean) {
      controlHtml = `
        <label class="checkBooleanRow">
          <input
            type="checkbox"
            class="checkInputBool"
            ${item.isDone ? 'checked' : ''}
            ${canEdit ? '' : 'disabled'}
          />
          <span class="checkBooleanText">
            ${item.isDone ? 'Marked done' : 'Tap to mark done'}
          </span>
        </label>
      `;
    } else if (isText) {
      controlHtml = `
        <textarea
          class="checkInputText"
          ${canEdit ? '' : 'disabled'}
          placeholder="Optional note / observation"
          rows="3"
        >${escapeHtml(item.textValue || '')}</textarea>
      `;
    } else if (isNumber) {
      controlHtml = `
        <input
          type="number"
          class="checkInputNumber"
          ${canEdit ? '' : 'disabled'}
          value="${item.numberValue ?? ''}"
          placeholder="Enter value"
        />
      `;
    } else {
      controlHtml = `
        <input
          type="text"
          class="checkInputText"
          ${canEdit ? '' : 'disabled'}
          value="${escapeHtml(item.textValue || '')}"
          placeholder="Enter value"
        />
      `;
    }

    card.innerHTML = `
      <div class="checkTopRow">
        <div class="checkTitleWrap">
          <div class="checkTitle">
            <span class="checkIndex">${item.sortOrder || (index + 1)}.</span>
            <span class="checkTitleText">${escapeHtml(item.itemText)}</span>
            ${item.isRequired ? '<span class="checkReq">*</span>' : ''}
          </div>
          <div class="checkMeta">
            ${item.isRequired ? 'Required' : 'Optional'} · ${statusText}
          </div>
        </div>
        <div class="checkSaveState muted" data-role="saveState"></div>
      </div>

      <div class="checkControlWrap">
        ${controlHtml}
      </div>
    `;

    const saveStateEl = card.querySelector('[data-role="saveState"]');
    const inputEl = card.querySelector('.checkInputBool, .checkInputText, .checkInputNumber');

    async function saveItem() {
      if (!canEdit || !inputEl) return;

      try {
        saveStateEl.textContent = 'Saving...';

        const payload = {};

        if (isBoolean) {
          payload.isDone = !!inputEl.checked;
        } else if (isText) {
          const val = String(inputEl.value || '').trim();
          payload.textValue = inputEl.value;
          payload.isDone = !!val;
        } else if (isNumber) {
          const raw = String(inputEl.value || '').trim();
          payload.numberValue = raw === '' ? null : Number(raw);
          payload.isDone = raw !== '';
        } else {
          const val = String(inputEl.value || '').trim();
          payload.textValue = inputEl.value;
          payload.isDone = !!val;
        }

        await API.updateTechChecklistItem(jobId, item.id, payload);

        saveStateEl.textContent = 'Saved';

        const metaEl = card.querySelector('.checkMeta');
        if (metaEl) {
          const newStatus = payload.isDone
            ? (isBoolean ? 'Done' : 'Filled')
            : 'Pending';
          metaEl.textContent = `${item.isRequired ? 'Required' : 'Optional'} · ${newStatus}`;
        }

        if (isBoolean) {
          const boolText = card.querySelector('.checkBooleanText');
          if (boolText) {
            boolText.textContent = payload.isDone ? 'Marked done' : 'Tap to mark done';
          }
        }

        setTimeout(() => {
          if (saveStateEl.textContent === 'Saved') saveStateEl.textContent = '';
        }, 1200);
      } catch (e) {
        saveStateEl.textContent = 'Not saved';
        alert(e.message || String(e));
      }
    }

    if (inputEl && canEdit) {
      if (isBoolean) {
        inputEl.addEventListener('change', saveItem);
      } else {
        inputEl.addEventListener('blur', saveItem);
      }
    }

    itemsWrap.appendChild(card);
  });
}

    renderItems(currentChecklist.items || []);
    renderNotes(currentChecklist.notes || []);
    renderServiceParts(currentReportData.parts || []);

    const btnClose = smallBtn('Close', 'secondary');
    btnClose.onclick = closeModal;

    const footerNodes = [btnClose];

    if (!isLocked) {
      const btnAddNote = smallBtn('Add Note', 'secondary');
      btnAddNote.onclick = async () => {
        try {
          const noteText = body.querySelector('#checklistNoteText').value.trim();
          if (!noteText) throw new Error('Enter a note first');
          await API.addTechChecklistNote(jobId, noteText);
          await refreshChecklistModal();
        } catch (e) {
          alert(e.message || String(e));
        }
      };
      footerNodes.unshift(btnAddNote);
    }

    openModal({
      title: `${roleLabel} Checklist`,
      bodyNode: body,
      footerNodes,
    });

wireFollowUpToggle();

    if (isServiceRole(roleLabel) && !isLocked) {
      const saveReportBtn = body.querySelector('#btnSaveServiceReport');
      const addPartBtn = body.querySelector('#btnAddServicePart');

      if (saveReportBtn) {
        saveReportBtn.onclick = async () => {
          try {
            await API.saveTechServiceReport(jobId, {
              overallCondition: body.querySelector('#srOverallCondition')?.value || '',
              faultsObserved: body.querySelector('#srFaultsObserved')?.value || '',
              actionTaken: body.querySelector('#srActionTaken')?.value || '',
              recommendations: body.querySelector('#srRecommendations')?.value || '',
              followUpRequired: !!body.querySelector('#srFollowUpRequired')?.checked,
              technicianRemarks: body.querySelector('#srTechnicianRemarks')?.value || '',
            });
            await refreshServiceReportSection();
            alert('Service report saved');
          } catch (e) {
            alert(e.message || String(e));
          }
        };
      }

      if (addPartBtn) {
        addPartBtn.onclick = async () => {
          try {
            await API.addTechServicePart(jobId, {
              itemName: 'New Part',
              qty: 1,
              remarks: '',
            });
            await refreshServiceReportSection();
          } catch (e) {
            alert(e.message || String(e));
          }
        };
      }
    }
  } catch (e) {
    alert(e.message || String(e));
  }
}

async function renderTechDashboard() {
  const root = setViewMode(false);

  if (!state.techToken) {
    setTitle("Technician");
    setToolbar([]);
    root.innerHTML = `
      <div class="card">
        <div class="label">Technician Login Required</div>
        <div class="hr"></div>
        <div class="muted">Use the left panel button: <b>Technician Login</b>.</div>
      </div>
    `;
    return;
  }

  setTitle("My Jobs");

  const btnRefresh = smallBtn("Refresh", "secondary");
  btnRefresh.onclick = () => renderTechDashboard();

  const btnLogout = smallBtn("Logout", "secondary");
  btnLogout.onclick = techLogout;

  setToolbar([btnRefresh, btnLogout]);

  root.innerHTML = `<div class="card"><div class="label">Loading...</div></div>`;

  try {
    const rows = await API.techMyJobs("");

    root.innerHTML = `
      <div class="card">
        <div class="label">Assigned Jobs</div>
        <div class="hr"></div>
      </div>
    `;

    const card = root.querySelector(".card");
    const wrap = makeScrollableTableWrap(`
      <table>
        <thead>
          <tr>
            <th>JOB</th>
            <th>PROJECT</th>
            <th>LIFT</th>
            <th>TYPE</th>
            <th>LEAD / SUPPORT</th>
            <th>CHECKLIST</th>
            <th>DUE</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody id="techBody"></tbody>
      </table>
    `, "420px");

    card.appendChild(wrap);

    const tb = wrap.querySelector("#techBody");

    if (!rows || rows.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td colspan="9" class="muted">
          No jobs assigned to you right now.
        </td>
      `;
      tb.appendChild(tr);
      return;
    }

    (rows || []).forEach((a) => {
      const leadName = getLeadName(a);
      const supportNames = getSupportNames(a);
      const supportCount = supportNames.length;

      const team = Array.isArray(a.team) ? a.team : [];
      const me = team.find(
        (m) =>
          String(m?.technician?.id || m?.technicianId || "") ===
          String(state.tech?.id || "")
      );

      const myRole = String(me?.teamRole || "").toUpperCase();
      const isLead = myRole === "LEAD";
      const isSupport = myRole === "SUPPORT";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>A-${a.id}</td>
        <td>${a.project?.projectName || ""}</td>
        <td>${a.lift?.liftCode || ""}</td>
        <td>${a.role || ""}</td>
        <td>
          <div><b>Lead:</b> ${leadName}</div>
          <div class="muted">${supportCount} support${supportCount === 1 ? "" : "s"}</div>
          ${supportCount ? `<div class="muted">${supportNames.join(", ")}</div>` : ""}
          <div class="muted" style="margin-top:4px"><b>My Role:</b> ${myRole || "—"}</div>
        </td>
        <td></td>
        <td>${a.dueDate || ""}</td>
        <td></td>
        <td></td>
      `;

      const checklistCell = tr.children[5];
      const summary = a.checklistSummary || null;

      const summaryDiv = document.createElement("div");
      summaryDiv.className = "muted";
      summaryDiv.style.marginBottom = "8px";
      summaryDiv.textContent = checklistSummaryText(summary);
      checklistCell.appendChild(summaryDiv);
      checklistCell.appendChild(renderChecklistStatusBadge(summary));

      tr.children[7].appendChild(
        badge(String(a.status || "").replaceAll("_", " "))
      );

      const cell = tr.children[8];
cell.style.display = "flex";
cell.style.flexDirection = "column";
cell.style.alignItems = "flex-end";
cell.style.gap = "8px";
cell.style.minWidth = "120px";

// Checklist: disabled before start, enabled after start
const bChecklist = smallBtn("Checklist", "secondary");

// ✅ ALWAYS allow viewing
bChecklist.onclick = async () => {
  await showTechChecklistModal(a.id, a.role || "JOB");
};

cell.appendChild(bChecklist);

// Only LEAD can change overall job status
if (isLead && a.status === "ASSIGNED") {
  const b1 = smallBtn("Start", "primary");
  b1.onclick = async () => {
    try {
      await API.updateJobStatusTech(a.id, "IN_PROGRESS");
      await renderTechDashboard();
    } catch (e) {
      alert(e.message || String(e));
    }
  };
  cell.appendChild(b1);
}

if (isLead && a.status === "IN_PROGRESS") {
  const b2 = smallBtn("Complete", "secondary");
  
  const summary = a.checklistSummary || {};
  const totalRequired = Number(summary.totalRequired || 0);
  const doneRequired = Number(summary.doneRequired || 0);

  const isChecklistComplete =
    totalRequired > 0 && doneRequired >= totalRequired;

  const needsResubmission = !!a.resubmissionRequired;

  const canComplete = isChecklistComplete && !needsResubmission;

  // 🔒 Disable if either condition fails
  if (!canComplete) {
    b2.disabled = true;
    b2.style.opacity = "0.5";
    b2.style.cursor = "not-allowed";

    if (needsResubmission) {
      b2.title = "Supervisor requested changes — update checklist or add note";
    } else {
      b2.title = `Complete ${doneRequired}/${totalRequired} required items first`;
    }
  }

  b2.onclick = async () => {
    if (!canComplete) return;

    try {
      await API.updateJobStatusTech(a.id, "DONE");
      await renderTechDashboard();
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  cell.appendChild(b2);
}

      tb.appendChild(tr);
    });
  } catch (e) {
    console.error(e);
    root.innerHTML = `
      <div class="card">
        <div class="label">My Jobs failed to load</div>
        <div class="hr"></div>
        <div class="muted">${String(e.message || e)}</div>
      </div>
    `;
  }
}

// ---------- Create Project modal ----------
function showCreateProjectModal() {
  const body = document.createElement("div");

  body.innerHTML = `
    <div class="formGrid">

      <div class="field" style="grid-column:1/-1">
        <label>Project Name</label>
        <input id="projectName" placeholder="ABC Tower" />
      </div>

      <div class="field">
        <label>Customer Name</label>
        <input id="customerName" placeholder="Client / Company" />
      </div>

      <div class="field">
        <label>Customer Phone</label>
        <input id="customerPhone" placeholder="+975..." />
      </div>

      <div class="field" style="grid-column:1/-1">
        <label>Building (Site)</label>
        <input id="building" placeholder="Building / Site name" />
      </div>

      <div class="field" style="grid-column:1/-1">
        <label>Notes</label>
        <textarea id="notes" placeholder="Notes..."></textarea>
      </div>

    </div>
  `;

  const btnCancel = smallBtn("Cancel", "secondary");
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn("Save Project", "primary");

  btnSave.onclick = async () => {
    try {
      const payload = {
        projectName: body.querySelector("#projectName").value.trim(),
        customerName: body.querySelector("#customerName").value.trim(),
        customerPhone: body.querySelector("#customerPhone").value.trim(),
        building: body.querySelector("#building").value.trim(),
        notes: body.querySelector("#notes").value || "",
      };

      await API.createProject(payload);

      closeModal();

      await renderProjects();

    } catch (e) {
      alert(e.message || String(e));
    }
  };

  openModal({
    title: "Create Project",
    bodyNode: body,
    footerNodes: [btnCancel, btnSave],
  });
}

function showCreateTechnicianModal() {
  const body = document.createElement("div");
  body.innerHTML = `
    <div class="formGrid">
      <div class="field">
        <label>Name</label>
        <input id="techName" placeholder="Technician name" />
      </div>

      <div class="field">
        <label>Phone</label>
        <input id="techPhone" placeholder="17xxxxxx" />
      </div>

      <div class="field">
        <label>Email</label>
        <input id="techEmail" placeholder="email@example.com" />
      </div>

      <div class="field">
  <label>Skill Set</label>
  <select id="techSkills" multiple size="3">
    <option value="INSTALL">INSTALL</option>
    <option value="TEST">TEST</option>
    <option value="SERVICE">SERVICE</option>
  </select>
</div>

      <div class="field">
        <label>PIN</label>
        <input id="techPin" placeholder="4 to 8 digits" />
      </div>

      <div class="field" style="grid-column:1/-1">
  <div class="muted" style="font-size:12px">
    Hold Ctrl (or Cmd on Mac) to select multiple skills.
  </div>
</div>

      <div class="field" style="grid-column:1/-1">
        <div class="muted" style="font-size:12px">
          PIN is required for technician login.
        </div>
      </div>
    </div>
  `;

  const btnCancel = smallBtn("Cancel", "secondary");
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn("Save Technician", "primary");
  btnSave.onclick = async () => {
    try {
      const name = body.querySelector("#techName").value.trim();
      const phone = body.querySelector("#techPhone").value.trim();
      const email = body.querySelector("#techEmail").value.trim();
      const skills = Array.from(body.querySelector("#techSkills").selectedOptions)
  .map(o => o.value)
  .join(",");
      const pin = body.querySelector("#techPin").value.trim();

      if (!name) return alert("Technician name is required.");
      if (!skills) return alert("At least one skill is required.");
      if (!pin) return alert("PIN is required.");
      if (!/^[0-9]{4,8}$/.test(pin)) {
        return alert("PIN must be 4 to 8 digits.");
      }

      await API.createTechnician({
        name,
        phone,
        email,
        skills,
        pin,
      });

      closeModal();
      alert("Technician created successfully");
      await renderTechnicians();
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  openModal({
    title: "Create Technician",
    bodyNode: body,
    footerNodes: [btnCancel, btnSave],
  });
}


function showCreateAmcModal(lift, options = {}) {
  const currentAmc = options.currentAmc || null;
  const isRenewal = !!currentAmc;

  const warrantyEndDate =
    lift?.warrantyEndDate ||
    lift?.warranty_end_date ||
    '';

  const currentEndDate =
    currentAmc?.endDate ||
    currentAmc?.end_date ||
    '';

  function addDays(dateStr, days) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  const defaultStartDate = isRenewal
    ? addDays(currentEndDate, 1)
    : warrantyEndDate;

  const defaultDurationMonths = Number(
    currentAmc?.durationMonths ||
    currentAmc?.duration_months ||
    12
  );

  const defaultServiceVisits = Number(
    currentAmc?.serviceVisitCount ||
    currentAmc?.service_visit_count ||
    lift?.amc?.serviceVisitCount ||
    5
  );

  const defaultAmcType =
    currentAmc?.amcType ||
    currentAmc?.amc_type ||
    'LABOUR_ONLY';

  const defaultBillingCycle =
    currentAmc?.billingCycle ||
    currentAmc?.billing_cycle ||
    'ANNUAL';

  const defaultContractValue =
    currentAmc?.contractValue ||
    currentAmc?.contract_value ||
    '';

  const defaultNotes =
    currentAmc?.amcNotes ||
    currentAmc?.amc_notes ||
    '';

  const body = document.createElement('div');

  body.innerHTML = `
    <div class="formGrid">
      <div class="field" style="grid-column:1/-1">
        <label>Lift</label>
        <input value="${lift?.liftCode || ''}" disabled />
      </div>

      <div class="field">
        <label>AMC Type</label>
        <select id="amcType">
          <option value="LABOUR_ONLY" ${defaultAmcType === 'LABOUR_ONLY' ? 'selected' : ''}>Labour Only</option>
          <option value="COMPREHENSIVE" ${defaultAmcType === 'COMPREHENSIVE' ? 'selected' : ''}>Comprehensive</option>
        </select>
      </div>

      <div class="field">
        <label>AMC Start Date</label>
        <input type="date" id="amcStartDate" value="${defaultStartDate || ''}" />
      </div>

      <div class="field">
        <label>AMC Duration (Months)</label>
        <input type="number" id="amcDurationMonths" min="1" value="${defaultDurationMonths}" />
      </div>

      <div class="field">
        <label>AMC Service Visits</label>
        <input type="number" min="1" id="amcServiceVisits" value="${defaultServiceVisits}" />
      </div>

      <div class="field">
        <label>Service Interval (Days)</label>
        <input type="number" id="amcServiceIntervalDays" min="1" readonly />
      </div>

      <div class="field">
        <label>Billing Cycle</label>
        <select id="amcBillingCycle">
          <option value="ANNUAL" ${defaultBillingCycle === 'ANNUAL' ? 'selected' : ''}>Annual</option>
          <option value="HALF_YEARLY" ${defaultBillingCycle === 'HALF_YEARLY' ? 'selected' : ''}>Half Yearly</option>
          <option value="QUARTERLY" ${defaultBillingCycle === 'QUARTERLY' ? 'selected' : ''}>Quarterly</option>
          <option value="MONTHLY" ${defaultBillingCycle === 'MONTHLY' ? 'selected' : ''}>Monthly</option>
        </select>
      </div>

      <div class="field">
        <label>Contract Value</label>
        <input type="number" id="amcContractValue" min="0" step="0.01" value="${defaultContractValue}" placeholder="Optional" />
      </div>

      <div class="field" style="grid-column:1/-1">
        <label>Notes</label>
        <textarea id="amcNotes" placeholder="AMC notes, exclusions, visit scope...">${defaultNotes}</textarea>
      </div>

      ${
        isRenewal
          ? `
            <div class="field" style="grid-column:1/-1">
              <div class="muted" style="font-size:12px">
                Renewal mode: a new AMC record will be created starting after the previous AMC end date.
              </div>
            </div>
          `
          : ''
      }
    </div>
  `;

  function recalcAmcInterval() {
    const durationMonths = Number(body.querySelector('#amcDurationMonths').value || 12);
    const serviceVisitCount = Number(body.querySelector('#amcServiceVisits').value || 1);

    const totalDays = durationMonths * 30;
    const intervalDays = Math.max(1, Math.floor(totalDays / serviceVisitCount));

    body.querySelector('#amcServiceIntervalDays').value = intervalDays;
  }

  body.querySelector('#amcDurationMonths').addEventListener('input', recalcAmcInterval);
  body.querySelector('#amcServiceVisits').addEventListener('input', recalcAmcInterval);

  recalcAmcInterval();

  const btnCancel = smallBtn('Cancel', 'secondary');
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn(isRenewal ? 'Renew AMC' : 'Create AMC', 'primary');
  btnSave.onclick = async () => {
    try {
      const payload = {
        amcType: body.querySelector('#amcType').value,
        startDate: body.querySelector('#amcStartDate').value,
        durationMonths: Number(body.querySelector('#amcDurationMonths').value || 12),
        serviceVisitCount: Number(body.querySelector('#amcServiceVisits').value || 5),
        serviceIntervalDays: Number(body.querySelector('#amcServiceIntervalDays').value || 90),
        billingCycle: body.querySelector('#amcBillingCycle').value,
        contractValue: body.querySelector('#amcContractValue').value || null,
        amcNotes: body.querySelector('#amcNotes').value || '',
      };

      if (!payload.startDate) {
        throw new Error('AMC Start Date is required');
      }

      if (payload.serviceVisitCount < 1) {
        throw new Error('AMC Service Visits must be at least 1');
      }

      if (payload.durationMonths < 1) {
        throw new Error('AMC Duration must be at least 1 month');
      }

      if (!lift?.projectLiftId) {
  throw new Error('Invalid project lift reference');
}

const endpoint = isRenewal
  ? `/api/amc/${currentAmc.id}/renew`
  : `/api/project-lifts/${lift.projectLiftId}/amc`;

      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || (isRenewal ? 'Failed to renew AMC' : 'Failed to create AMC'));

      closeModal();
      await renderAMC();
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  openModal({
    title: `${isRenewal ? 'Renew AMC' : 'Create AMC'} - ${lift?.liftCode || ''}`,
    bodyNode: body,
    footerNodes: [btnCancel, btnSave],
  });
}

async function renderServiceDashboard() {
  const root = setViewMode(false);
  setTitle("Service Dashboard");
  const btnCreateAllDue = smallBtn("Create All Due Jobs", "primary");

btnCreateAllDue.onclick = async () => {
  try {
    const result = await API.createAllDueServiceJobs();

const s = result?.summary || {};

alert(
  `Warranty Due: ${s.warrantyDueCount || 0}\n` +
  `AMC Due: ${s.amcDueCount || 0}\n` +
  `Created: ${s.createdCount || 0}\n` +
  `Skipped: ${s.skippedCount || 0}\n` +
  `Errors: ${s.errorCount || 0}`
);

    await renderServiceDashboard();
  } catch (e) {
    alert(e.message || String(e));
  }
};

setToolbar([btnCreateAllDue]);

  root.innerHTML = `<div class="card"><div class="label">Loading service data...</div></div>`;

  try {
    const data = await API.getServiceDashboard();
    const rows = Array.isArray(data?.rows) ? data.rows : [];
    const summary = data?.summary || {};

    const warrantyActive = rows.filter(l => l.warrantyStatus === "WARRANTY ACTIVE");
    const warrantyExpired = rows.filter(l => l.warrantyStatus === "WARRANTY EXPIRED");
    const amcActive = rows.filter(l => l.amcStatus === "AMC ACTIVE");
    const amcExpired = rows.filter(l => l.amcStatus === "AMC EXPIRED");

    const warrantyDue = rows.filter(l =>
  ["WARRANTY ACTIVE", "WARRANTY EXPIRED"].includes(l.warrantyStatus) &&
  !l.warrantyActiveServiceAssignment &&
  l.warrantyIsDueNow
);

const amcDue = rows.filter((l) =>
  ["AMC ACTIVE", "AMC EXPIRING SOON", "AMC EXPIRED"].includes(l.amcStatus) &&
  l.amcIsDueNow &&
  (
    !l.amcActiveServiceAssignment ||
    ["ASSIGNED"].includes(
      String(l.amcActiveServiceAssignment?.status || "").toUpperCase()
    )
  )
);

    const dueSoon = rows.filter(l =>
  !!l.serviceIsDueNow &&
  !l.warrantyActiveServiceAssignment &&
  !l.amcActiveServiceAssignment
);

const overdue = rows.filter(l =>
  Number(l.overdueDays || 0) > 0 &&
  !l.warrantyActiveServiceAssignment &&
  !l.amcActiveServiceAssignment
);

    root.innerHTML = `
      <div class="dashboardGrid">

        <div class="card kpiCard">
          <div class="label">Warranty Active</div>
          <div class="kpiValue">${summary.warrantyActive ?? warrantyActive.length}</div>
        </div>

        <div class="card kpiCard">
          <div class="label">Warranty Expired</div>
          <div class="kpiValue">${summary.warrantyExpired ?? warrantyExpired.length}</div>
        </div>

        <div class="card kpiCard">
          <div class="label">AMC Active</div>
          <div class="kpiValue">${summary.amcActive ?? amcActive.length}</div>
        </div>

        <div class="card kpiCard">
          <div class="label">AMC Expired</div>
          <div class="kpiValue">${summary.amcExpired ?? amcExpired.length}</div>
        </div>

        <div class="card kpiCard">
          <div class="label">Service Due (7 Days)</div>
          <div class="kpiValue">${summary.dueSoon ?? dueSoon.length}</div>
        </div>

        <div class="card kpiCard">
          <div class="label">Service Overdue</div>
          <div class="kpiValue">${summary.overdue ?? overdue.length}</div>
        </div>

      </div>

      <div class="dashboardGrid twoCols" style="margin-top:16px">

        <div class="card">
  <div class="label">Due Warranty Services</div>
  <div class="hr"></div>

  ${
    !warrantyDue.length
      ? `<div class="muted">No warranty services due</div>`
      : warrantyDue.map(l => {
          const warrantyStatus = String(l.warrantyStatus || l.warranty?.status || '').toUpperCase();
          const canCreateWarranty = warrantyStatus === 'WARRANTY ACTIVE';

          return `
            <div class="listRow">
              <div>
                <b>${l.liftCode || ""}</b>
                <div class="muted">${[l.customerName, l.building].filter(Boolean).join(" - ")}</div>
                <div class="muted">Due: ${l.warrantyNextServiceDue || l.nextServiceDue || "—"}</div>
                ${!canCreateWarranty ? `<div class="muted">Warranty not active</div>` : ``}
              </div>
              <div class="rowActions">
                <button
                  class="btn"
                  data-action="create-warranty"
                  data-project-lift-id="${l.projectLiftId}"
                  ${canCreateWarranty ? '' : 'disabled title="Warranty is not active for this lift" style="opacity:0.5;cursor:not-allowed;"'}
                >
                  Create Warranty Job
                </button>
              </div>
            </div>
          `;
        }).join("")
  }
</div>

<div class="card">
  <div class="label">Due AMC Services</div>
  <div class="hr"></div>

          ${
            !amcDue.length
              ? `<div class="muted">No AMC services due</div>`
              : amcDue.map(l => `
                  <div class="listRow">
                    <div>
                      <b>${l.liftCode || ""}</b>
                      <div class="muted">${[l.customerName, l.building].filter(Boolean).join(" - ")}</div>
                      <div class="muted">Due: ${l.amcNextServiceDue || l.nextServiceDue || "—"}</div>
                    </div>
                    <div class="rowActions">
                      <button
  class="btn primary"
  data-action="${l.amcActiveServiceAssignment ? 'view-amc' : 'create-amc'}"
  data-project-lift-id="${l.projectLiftId}"
  data-assignment-id="${l.amcActiveServiceAssignment?.id || ''}">
  ${l.amcActiveServiceAssignment ? 'View AMC Job' : 'Create AMC Job'}
</button>
                    </div>
                  </div>
                `).join("")
          }
        </div>

      </div>

      <div class="dashboardGrid twoCols" style="margin-top:16px">
        <div class="card" style="grid-column:1/-1">
          <div class="label">Service Alerts</div>
          <div class="hr"></div>

          ${
            (!dueSoon.length && !overdue.length)
              ? `<div class="muted">No alerts</div>`
              : [
                  ...overdue.slice(0, 5).map(l => `
                    <div class="listRow alertRow danger">
                      <div>
                        <b>${l.liftCode || ""}</b>
                        <div class="muted">${[l.customerName, l.building].filter(Boolean).join(" - ")}</div>
                      </div>
                      <div>Overdue ${Number(l.overdueDays || 0)}d</div>
                    </div>
                  `),
                  ...dueSoon.slice(0, 5).map(l => `
                    <div class="listRow alertRow warn">
                      <div>
                        <b>${l.liftCode || ""}</b>
                        <div class="muted">${[l.customerName, l.building].filter(Boolean).join(" - ")}</div>
                      </div>
                      <div>Due ${l.nextServiceDue || "—"}</div>
                    </div>
                  `)
                ].join("")
          }
        </div>
      </div>
    `;

    await renderServiceJobsTable(root);
    await renderTeamLoadCard(root);

root.querySelectorAll("[data-action='create-warranty']").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const id = btn.dataset.projectLiftId;
    if (!id) return alert("Project lift not found");

    try {
      const r = await fetch(`/api/project-lifts/${id}/auto-warranty-job`, {
        method: "POST",
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Failed");

      alert("Warranty job created with auto-assigned team.");
      await renderServiceDashboard();
    } catch (e) {
      alert(e.message || String(e));
    }
  });
});

root.querySelectorAll("[data-action='create-amc']").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const id = btn.dataset.projectLiftId;
    if (!id) return alert("Project lift not found");

    try {
      const r = await fetch(`/api/project-lifts/${id}/auto-amc-job`, {
        method: "POST",
      });

      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Failed");

      alert("AMC job created with auto-assigned team.");
      await renderServiceDashboard();
    } catch (e) {
      alert(e.message || String(e));
    }
  });
});

        root.querySelectorAll("[data-action='view-amc']").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const assignmentId = btn.dataset.assignmentId;

    if (!assignmentId) {
      alert("AMC job not found");
      return;
    }

    try {
      window.__focusAssignmentId = Number(assignmentId);
      location.hash = "#service";
      await render(currentViewFromHash());

      console.log("Viewing AMC job for", assignmentId);
    } catch (e) {
      alert(e.message || String(e));
    }
  });
});

  } catch (e) {
    console.error(e);
    root.innerHTML = `
      <div class="card">
        <div class="label">Service Dashboard Failed</div>
        <div class="hr"></div>
        <div class="muted">${String(e.message || e)}</div>
      </div>
    `;
  }
}

async function renderServiceJobsTable(root) {
  const view = serviceJobsView;

  const data = await API.getJobs(view);
  const allRows = Array.isArray(data?.rows) ? data.rows : [];
  const rows = allRows.filter((a) => isServiceJobRole(a.role));

  const section = document.createElement("div");
  section.className = "card";
  section.style.marginTop = "16px";

  section.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-end; gap:12px; flex-wrap:wrap;">
      <div>
        <div class="label">Service Jobs</div>
        <div class="muted">Warranty Service and AMC Service jobs</div>
        <div class="muted" style="margin-top:4px;">Showing: ${view.toUpperCase()}</div>
      </div>

      <div style="display:flex; align-items:center; gap:8px;">
        <span class="muted" style="font-weight:600;">Show</span>
        <select id="serviceJobsViewFilter" style="height:34px; border-radius:8px; padding:0 8px;">
          <option value="open">Open Jobs</option>
          <option value="pending">Pending Approval</option>
          <option value="completed">Completed</option>
          <option value="all">All Records</option>
        </select>
      </div>
    </div>

    <div class="hr"></div>
  `;

  const filter = section.querySelector("#serviceJobsViewFilter");
  if (filter) {
    filter.value = serviceJobsView;
    filter.onchange = () => {
      serviceJobsView = filter.value;
      renderServiceDashboard();
    };
  }

  const wrap = makeScrollableTableWrap(`
    <table>
      <thead>
        <tr>
          <th>Job</th>
          <th>Project</th>
          <th>Lift</th>
          <th>Type</th>
          <th>Lead / Support</th>
          <th>Checklist</th>
          <th>Due</th>
          <th>Status</th>
          <th>Supervisor</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="serviceJobBody"></tbody>
    </table>
  `, "420px");

  section.appendChild(wrap);
  root.appendChild(section);

  const tb = wrap.querySelector("#serviceJobBody");

  if (!rows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="10" class="muted">No service jobs found.</td>`;
    tb.appendChild(tr);
    return;
  }

  rows.forEach((a) => {
    const statusText = String(a.status || "").replaceAll("_", " ");
    const checklist = a.checklistSummary || null;

    const checklistText = checklist
      ? `${checklist.doneRequired || 0}/${checklist.totalRequired || 0} required`
      : "No checklist";

    const checklistPercent = checklist ? `(${checklist.percent || 0}%)` : "";

    let checklistBadgeText = "NO CHECKLIST";
    if (checklist) {
      const raw = String(checklist.status || "").toUpperCase();
      if (raw === "COMPLETED") checklistBadgeText = "CHECKLIST COMPLETE";
      else if (raw === "IN_PROGRESS") checklistBadgeText = "CHECKLIST IN PROGRESS";
      else checklistBadgeText = "CHECKLIST NOT STARTED";
    }

    const leadName = getLeadName(a);
    const supportNames = getSupportNames(a);
    const supportCount = supportNames.length;

    const sup = String(a.supervisorStatus || "PENDING").toUpperCase();
    let supText = "🟡 Pending";
    if (sup === "APPROVED") supText = "🟢 Approved";
    if (sup === "REJECTED") supText = "🔴 Rejected";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>A-${a.id}</td>
      <td>${[a.project?.projectCode, a.project?.projectName].filter(Boolean).join(" - ")}</td>
      <td>${a.lift?.liftCode || ""}</td>
      <td>${a.role || ""}</td>
      <td>
        <div><b>Lead:</b> ${leadName}</div>
        <div class="muted">${supportCount} support${supportCount === 1 ? "" : "s"}</div>
        ${supportCount ? `<div class="muted">${supportNames.join(", ")}</div>` : ""}
      </td>
      <td>
        <div>${checklistText}</div>
        <div class="muted">${checklistPercent}</div>
        <div class="checklistOfficeBadgeWrap"></div>
      </td>
      <td>${a.dueDate || ""}</td>
      <td></td>
      <td>
        <div class="supervisorStatusWrap"></div>
        ${
          sup === "REJECTED" && a.supervisorRemarks
            ? `<div class="muted" style="margin-top:6px; color:#b42318; font-size:12px;">${a.supervisorRemarks}</div>`
            : ""
        }
      </td>
      <td></td>
    `;

    if (window.__focusAssignmentId && Number(a.id) === Number(window.__focusAssignmentId)) {
      tr.style.border = "2px solid #3b82f6";
      tr.style.background = "#eef6ff";

      setTimeout(() => {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        tr.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 120);

      window.__focusAssignmentId = null;
    }

    tr.children[5].querySelector(".checklistOfficeBadgeWrap").appendChild(
      badge(checklistBadgeText)
    );

    tr.children[7].appendChild(badge(statusText));

    const supWrap = tr.children[8].querySelector(".supervisorStatusWrap");
    supWrap.appendChild(badge(supText));

    const cell = tr.children[9];

    const b0 = smallBtn("Checklist", "secondary");
    b0.onclick = async () => {
      try {
        await showOfficeChecklistModal(a.id, a.role || "JOB");
      } catch (e) {
        alert(e.message || String(e));
      }
    };
    cell.appendChild(b0);

    const bManage = smallBtn("Manage Team", "secondary");
    if (cell.children.length) bManage.style.marginLeft = "8px";
    bManage.onclick = async () => {
      try {
        await showManageTeamModal(a.id, a.role || "JOB");
      } catch (e) {
        alert(e.message || String(e));
      }
    };
    cell.appendChild(bManage);

    if (
      String(a.status || "").toUpperCase() === "DONE" &&
      String(a.supervisorStatus || "PENDING").toUpperCase() === "PENDING"
    ) {
      const b1 = smallBtn("Approve", "primary");
      if (cell.children.length) b1.style.marginLeft = "8px";
      b1.onclick = async () => {
        try {
          const r = await fetch(`/api/supervisor/assignments/${a.id}/approve`, {
            method: "PUT"
          });
          const j = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(j?.error || "Approve failed");
          alert("Service job approved successfully.");
          await renderServiceDashboard();
        } catch (e) {
          alert(e.message || String(e));
        }
      };
      cell.appendChild(b1);

      const b2 = smallBtn("Reject", "secondary");
      if (cell.children.length) b2.style.marginLeft = "8px";
      b2.onclick = async () => {
        try {
          const remarks = prompt("Reason for rejection?");
          if (remarks === null) return;

          const r = await fetch(`/api/supervisor/assignments/${a.id}/reject`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remarks })
          });

          const j = await r.json().catch(() => ({}));
          if (!r.ok) throw new Error(j?.error || "Reject failed");

          alert("Service job returned to In Progress with supervisor remarks.");
          await renderServiceDashboard();
        } catch (e) {
          alert(e.message || String(e));
        }
      };
      cell.appendChild(b2);
    }

    tb.appendChild(tr);
  });
}

async function showAssignAmcServiceModal(lift) {
  const techs = await API.listTechnicians();
  const body = document.createElement('div');
  body.innerHTML = `
    <div class="formGrid">
      <div class="field" style="grid-column:1/-1">
        <label>Lift</label>
        <input value="${lift?.liftCode || ''}" disabled />
      </div>
      <div class="field">
        <label>Technician</label>
        <select id="amcServiceTech"></select>
      </div>
      <div class="field">
        <label>Service Due Date</label>
        <input type="date" id="amcServiceDueDate" value="${lift?.amc?.nextServiceDue || ''}" />
      </div>
      <div class="field" style="grid-column:1/-1">
        <label>Notes</label>
        <textarea id="amcServiceNotes" placeholder="Preventive maintenance visit scope..."></textarea>
      </div>
    </div>
  `;

  const techSelect = body.querySelector('#amcServiceTech');
  (techs || []).forEach((t) => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = t.name;
    techSelect.appendChild(opt);
  });

  const btnCancel = smallBtn('Cancel', 'secondary');
  btnCancel.onclick = closeModal;

  const btnSave = smallBtn('Assign AMC Service', 'primary');
  btnSave.onclick = async () => {
    try {
      if (!techSelect.value) throw new Error('Please select a technician');
      await API.assignAmcService(lift.projectLiftId || lift.id, {
        technicianId: Number(techSelect.value),
        dueDate: body.querySelector('#amcServiceDueDate').value || null,
        notes: body.querySelector('#amcServiceNotes').value || '',
      });

      closeModal();
      await openProject(state.currentProjectId);
    } catch (e) {
      alert(e.message || String(e));
    }
  };

  openModal({
    title: `Assign AMC Service - ${lift?.liftCode || ''}`,
    bodyNode: body,
    footerNodes: [btnCancel, btnSave],
  });
}

async function showManageTeamModal(jobId, roleLabel = "JOB", options = {}) {
  try {
    const job = await API.getJob(jobId);
    const techs = await API.listTechnicians();

    const body = document.createElement("div");

    const currentLeadId =
      options.suggestedLeadTechnicianId ||
      job.leadTechnician?.id ||
      null;

    const currentSupports = Array.isArray(job.supportTechnicians)
      ? job.supportTechnicians
      : [];

    body.innerHTML = `
      <div class="formGrid">
        <div class="field" style="grid-column:1/-1">
          <label>Job</label>
          <input value="A-${job.id} - ${roleLabel || job.role || "JOB"}" disabled />
        </div>

        <div class="field">
          <label>Lead Technician</label>
          <select id="leadSelect"></select>
        </div>

        <div class="field" style="grid-column:1/-1">
          <label>Support Technicians</label>
          <div id="supportWrap"></div>
          <button id="addSupportBtn" class="btn secondary" type="button">+ Add Support</button>
        </div>
      </div>
    `;

    const leadSelect = body.querySelector("#leadSelect");
    const supportWrap = body.querySelector("#supportWrap");
    const addSupportBtn = body.querySelector("#addSupportBtn");

    function getCurrentSupportIds() {
      return Array.from(supportWrap.querySelectorAll(".supportSelect"))
        .map((s) => Number(s.value))
        .filter(Boolean);
    }

    function populateLeadSelect() {
      const selectedSupportIds = new Set(getCurrentSupportIds());

      leadSelect.innerHTML = "";

      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = "-- Select --";
      leadSelect.appendChild(blank);

      (techs || []).forEach((t) => {
        const tid = Number(t.id);

        // Keep current lead visible, but do not allow support techs in lead list
        if (tid !== Number(currentLeadId) && selectedSupportIds.has(tid)) return;

        const opt = document.createElement("option");
        opt.value = tid;
        opt.textContent = t.name;
        if (tid === Number(leadSelect.dataset.selectedId || currentLeadId)) {
          opt.selected = true;
        }
        leadSelect.appendChild(opt);
      });
    }

    function populateSupportSelect(selectEl, selectedId = null) {
      const leadId = Number(leadSelect.value) || null;

      selectEl.innerHTML = "";

      const blank = document.createElement("option");
      blank.value = "";
      blank.textContent = "-- Select --";
      selectEl.appendChild(blank);

      (techs || []).forEach((t) => {
        const tid = Number(t.id);

        // Do not allow current lead in support
        if (leadId && tid === leadId) return;

        const opt = document.createElement("option");
        opt.value = tid;
        opt.textContent = t.name;
        if (tid === Number(selectedId)) opt.selected = true;
        selectEl.appendChild(opt);
      });
    }

    function refreshAllSupportSelects() {
      const rows = Array.from(supportWrap.querySelectorAll(".supportRow"));

      rows.forEach((row) => {
        const sel = row.querySelector(".supportSelect");
        const currentValue = Number(sel.value) || null;
        populateSupportSelect(sel, currentValue);
      });
    }

    function createSupportRow(selectedId = null) {
      const row = document.createElement("div");
      row.className = "supportRow";
      row.style.display = "flex";
      row.style.gap = "8px";
      row.style.marginBottom = "6px";

      const sel = document.createElement("select");
      sel.className = "supportSelect";
      sel.style.flex = "1";
      populateSupportSelect(sel, selectedId);

      sel.onchange = () => {
        const supportIds = getCurrentSupportIds();
        const unique = new Set(supportIds);

        if (supportIds.length !== unique.size) {
          alert("Duplicate support technicians selected");
          sel.value = "";
        }

        leadSelect.dataset.selectedId = leadSelect.value || "";
        populateLeadSelect();
      };

      const btnRemove = smallBtn("Remove", "secondary");
      btnRemove.onclick = () => {
        row.remove();
        leadSelect.dataset.selectedId = leadSelect.value || "";
        populateLeadSelect();
        refreshAllSupportSelects();
      };

      row.appendChild(sel);
      row.appendChild(btnRemove);
      supportWrap.appendChild(row);
    }

    leadSelect.dataset.selectedId = currentLeadId || "";
    populateLeadSelect();

    currentSupports.forEach((s) => createSupportRow(s.id));

    addSupportBtn.onclick = () => {
      createSupportRow();
      leadSelect.dataset.selectedId = leadSelect.value || "";
      populateLeadSelect();
      refreshAllSupportSelects();
    };

    leadSelect.onchange = () => {
      leadSelect.dataset.selectedId = leadSelect.value || "";
      refreshAllSupportSelects();

      const leadId = Number(leadSelect.value) || null;
      if (!leadId) return;

      Array.from(supportWrap.querySelectorAll(".supportSelect")).forEach((sel) => {
        if (Number(sel.value) === leadId) {
          sel.value = "";
        }
      });
    };

    const btnCancel = smallBtn("Cancel", "secondary");
    btnCancel.onclick = closeModal;

    const btnSave = smallBtn("Save Team", "primary");
    btnSave.onclick = async () => {
      try {
        btnSave.disabled = true;

        const leadId = Number(leadSelect.value);
        if (!leadId) throw new Error("Lead is required");

        const supportIds = Array.from(supportWrap.querySelectorAll(".supportSelect"))
          .map((s) => Number(s.value))
          .filter(Boolean);

        if (supportIds.includes(leadId)) {
          throw new Error("Lead cannot be in support");
        }

        const unique = new Set([leadId, ...supportIds]);
        if (unique.size !== 1 + supportIds.length) {
          throw new Error("Duplicate technicians selected");
        }

        await API.updateJobTeam(jobId, {
          leadTechnicianId: leadId,
          supportTechnicianIds: supportIds,
        });

        closeModal();
        await renderServiceDashboard();
      } catch (e) {
        alert(e.message || String(e));
      } finally {
        btnSave.disabled = false;
      }
    };

    openModal({
      title: "Manage Team",
      bodyNode: body,
      footerNodes: [btnCancel, btnSave],
    });
  } catch (e) {
    alert(e.message || String(e));
  }
}
// ---------- Router ----------
async function render(view) {
  state.view = view;
  setActiveNav(view);

  const role = normalizeRole(getActiveRole());

  if (state.techToken) {
    if (view !== "tech" && view !== "service") {
      const root = document.getElementById("viewRoot");
      setTitle("Access Denied");
      setToolbar([]);
      if (root) {
        root.innerHTML = `
          <div class="card">
            <div class="muted">You do not have permission to access this section.</div>
          </div>
        `;
      }
      return;
    }
  }

  if (state.userToken) {
    const perm = getViewPermission(view);

    if (perm && !hasPermission(perm)) {
      const root = document.getElementById("viewRoot");
      setTitle("Access Denied");
      setToolbar([]);
      if (root) {
        root.innerHTML = `
          <div class="card">
            <div class="muted">You do not have permission to access this section.</div>
          </div>
        `;
      }
      return;
    }
  }

  if (view === 'dashboard') return renderDashboard();
  if (view === 'projects') return renderProjects();
  if (view === 'lifts') return renderLifts();
  if (view === 'jobs') return renderJobs();
  if (view === 'breakdowns') return renderBreakdownCalls(); // ✅ ADD
  if (view === 'technicians') return renderTechnicians();
  if (view === 'reports') return renderReportsView();
  if (view === 'service') return renderServiceDashboard();
  if (view === 'tech') return renderTechDashboard();
  if (view === 'amc') return renderAMC();
  if (view === 'users') return renderUsers();

  return renderDashboard();
}

function getViewFromHash() {
  const hash = (location.hash || '#dashboard').replace('#', '').toLowerCase();
  return hash || 'dashboard';
}

async function bootApp() {
  const sidebar = document.querySelector(".side");

  if (!state.techToken && !state.userToken) {
    if (sidebar) sidebar.style.display = "none";
    renderOpeningLogin();
    return;
  }

  try {
    if (state.userToken) {
      const me = await API.userMe();
      state.user = me.user || null;
      localStorage.setItem(LS_USER, JSON.stringify(state.user));

      state.techToken = null;
      state.tech = null;
      localStorage.removeItem(LS_TOKEN);
      localStorage.removeItem(LS_TECH);

      if (sidebar) sidebar.style.display = "";
      renderSideActions();
      await render(currentViewFromHash());
      return;
    }

    if (state.techToken) {
      const me = await API.techMe();
      state.tech = me.technician || null;
      localStorage.setItem(LS_TECH, JSON.stringify(state.tech));

      state.userToken = null;
      state.user = null;
      localStorage.removeItem(LS_USER_TOKEN);
      localStorage.removeItem(LS_USER);

      if (sidebar) sidebar.style.display = "";
      renderSideActions();
      await render(currentViewFromHash());
      return;
    }

    if (sidebar) sidebar.style.display = "none";
    renderOpeningLogin();
  } catch (e) {
    clearSession();
    if (sidebar) sidebar.style.display = "none";
    renderOpeningLogin();
  }
}

function currentViewFromHash() {
  const h = (location.hash || '#dashboard').replace('#', '').trim();
  const allowed = [
    'dashboard',
    'projects',
    'lifts',
    'jobs',
    'breakdowns', // ✅ ADD THIS
    'technicians',
    'reports',
    'service',
    'tech',
    'amc',
    'users'
  ];
  return allowed.includes(h) ? h : 'dashboard';
}

document.querySelectorAll('#nav a').forEach((a) => {
  a.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!state.techToken && !state.userToken) {
      renderOpeningLogin();
      return;
    }

    const targetView = a.dataset.view;
    const currentView = currentViewFromHash();

    if (targetView === currentView) {
      await render(targetView);
      return;
    }

    location.hash = targetView;
  });
});

window.addEventListener('hashchange', async () => {
  if (!state.techToken && !state.userToken) {
  renderOpeningLogin();
  return;
}

  await render(currentViewFromHash());
});

// init
bootApp();

function openReport(type) {
  const base = window.location.origin;

  const routes = {
    'service-due': '/api/reports/service-due/view',
    'amc-active': '/api/reports/amc-active/view',
    'amc-expiring': '/api/reports/amc-expiring/view',
    'service-timeliness': '/api/reports/service-timeliness/view',
    'technician-performance': '/api/reports/technician-performance/view',
    'project-status': '/api/reports/project-status/view',
    'job-status': '/api/reports/job-status/view',
    'install-test-incentive': '/api/reports/install-test-incentive/view',
  };

  const url = base + (routes[type] || '/');

  window.open(url, '_blank');
}

async function renderReportsView() {
  const title = document.getElementById("pageTitle");
  const toolbar = document.getElementById("toolbar");
  const root = document.getElementById("viewRoot");

  if (title) title.textContent = "Reports";
  if (toolbar) toolbar.innerHTML = "";

  root.innerHTML = `
    <div class="card">
      <div class="sectionTitle">Reports</div>
      <div class="muted" style="margin-top:6px;">Loading live counts...</div>
    </div>
  `;

  let summary = null;

  try {
    const res = await fetch('/api/reports/summary');
    summary = await res.json();
  } catch (err) {
    console.error('Failed to load report summary', err);
  }

  const s = summary || {
    serviceDue: { overdue: 0, dueToday: 0, upcoming: 0 },
    amcActive: { active: 0, pendingVisits: 0, overdue: 0, dueSoon: 0 },
    amcExpiring: { within7Days: 0, within30Days: 0 },
    serviceTimeliness: { totalCompleted: 0, onTime: 0, delayed: 0, onTimePercent: '0.0' },
    technicianPerformance: { totalTechnicians: 0, avgOnTimePercent: '0.0' },
    projectStatus: { totalProjects: 0, openProjects: 0 },
  };

  root.innerHTML = `
    <div class="card">
      <div class="sectionTitle">Reports</div>

      <div class="reportGrid">

        <button class="reportCard" data-report="service-due">
          <div class="reportCardTitle">Service Due Report</div>
          <div class="reportCardText">Overdue, due today and upcoming service jobs.</div>
          <div class="reportStats">
            <span class="statChip danger">Overdue: ${Number(s.serviceDue.overdue || 0)}</span>
            <span class="statChip warning">Due Today: ${Number(s.serviceDue.dueToday || 0)}</span>
            <span class="statChip neutral">Upcoming: ${Number(s.serviceDue.upcoming || 0)}</span>
          </div>
        </button>

        <button class="reportCard" data-report="amc-active">
          <div class="reportCardTitle">AMC Active Report</div>
          <div class="reportCardText">All active AMC contracts and service tracking.</div>
          <div class="reportStats">
            <span class="statChip primary">Active: ${Number(s.amcActive.active || 0)}</span>
            <span class="statChip success">Pending Visits: ${Number(s.amcActive.pendingVisits || 0)}</span>
            <span class="statChip warning">Due Soon: ${Number(s.amcActive.dueSoon || 0)}</span>
          </div>
        </button>

        <button class="reportCard" data-report="amc-expiring">
          <div class="reportCardTitle">AMC Expiring Soon</div>
          <div class="reportCardText">Contracts nearing expiry for renewal follow-up.</div>
          <div class="reportStats">
            <span class="statChip danger">7 Days: ${Number(s.amcExpiring.within7Days || 0)}</span>
            <span class="statChip warning">30 Days: ${Number(s.amcExpiring.within30Days || 0)}</span>
          </div>
        </button>

        <button class="reportCard" data-report="service-timeliness">
          <div class="reportCardTitle">Service Timeliness</div>
          <div class="reportCardText">On-time vs delayed service performance.</div>
          <div class="reportStats">
            <span class="statChip success">On-Time %: ${String(s.serviceTimeliness.onTimePercent || '0.0')}%</span>
            <span class="statChip danger">Delayed: ${Number(s.serviceTimeliness.delayed || 0)}</span>
            <span class="statChip neutral">Completed: ${Number(s.serviceTimeliness.totalCompleted || 0)}</span>
          </div>
        </button>

        <button class="reportCard" data-report="technician-performance">
          <div class="reportCardTitle">Technician Performance</div>
          <div class="reportCardText">Workload, completion and delay metrics.</div>
          <div class="reportStats">
            <span class="statChip primary">Technicians: ${Number(s.technicianPerformance.totalTechnicians || 0)}</span>
            <span class="statChip success">Avg On-Time %: ${String(s.technicianPerformance.avgOnTimePercent || '0.0')}%</span>
          </div>
        </button>

<button class="reportCard" data-report="project-status">
  <div class="reportCardTitle">Project Status Report</div>
  <div class="reportCardText">Project-wise lift progress, warranty and AMC position.</div>
</button>

<button class="reportCard" data-report="job-status">
  <div class="reportCardTitle">Job Status Report</div>
  <div class="reportCardText">Assignment pipeline by role, technician, due date and status.</div>
</button>

<button class="reportCard" data-report="install-test-incentive">
  <div class="reportCardTitle">Install/Test Incentive Report</div>
  <div class="reportCardText">Install and test jobs by technician, including lead/support role and period filter.</div>
</button>

      </div>
    </div>
  `;

  root.querySelectorAll("[data-report]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openReport(btn.dataset.report);
    });
  });
}
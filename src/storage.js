// storage.js
// Talks to the Google Apps Script backend (apps-script/Code.gs), which
// keeps three readable Sheet tabs: Identity, Activity Updates, Indicator
// Status — one row per record, instead of one JSON blob per key.

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6B5-8BUArE_wSJWk86IgXsvMLVDoA4nU1jwXLvxTQxHpW4Y_Djtzxr4PWkEu0vl4V/exec";

async function callAppsScript(payload) {
  // Sent as application/x-www-form-urlencoded (via URLSearchParams) — the
  // reliable pattern for calling an Apps Script Web App with fetch() from
  // a browser (a JSON body with a custom content type can trigger
  // "TypeError: Failed to fetch" due to how Apps Script's redirect-based
  // responses interact with CORS).
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.append(k, String(v));
  });
  const res = await fetch(APPS_SCRIPT_URL, { method: "POST", body: params });
  if (!res.ok) throw new Error(`Storage request failed: ${res.status}`);
  return res.json();
}

/* ---------- Identity ---------- */

export async function getIdentity(email) {
  try {
    const data = await callAppsScript({ action: "identity_get", email });
    return data?.identity || null;
  } catch (e) {
    console.error("getIdentity failed", e);
    return null;
  }
}

export async function setIdentity({ email, name, team }) {
  try {
    await callAppsScript({ action: "identity_set", email, name, team });
    return true;
  } catch (e) {
    console.error("setIdentity failed", e);
    return false;
  }
}

/* ---------- Activity updates (one row per activity + quarter) ---------- */

export async function getAllActivityUpdates() {
  try {
    const data = await callAppsScript({ action: "activity_get_all" });
    return data?.rows || [];
  } catch (e) {
    console.error("getAllActivityUpdates failed", e);
    return [];
  }
}

export async function setActivityUpdate({
  activityRow, quarter, plan, whatHappened, adaptation, confidence,
  updatedBy, updatedByEmail,
}) {
  try {
    await callAppsScript({
      action: "activity_set",
      activity_row: activityRow, quarter, plan, what_happened: whatHappened,
      adaptation, confidence, updated_by: updatedBy, updated_by_email: updatedByEmail,
    });
    return true;
  } catch (e) {
    console.error("setActivityUpdate failed", e);
    return false;
  }
}

/* ---------- Indicator status (one row per SI + letter) ---------- */

export async function getAllIndicatorStatuses() {
  try {
    const data = await callAppsScript({ action: "indicator_get_all" });
    return data?.rows || [];
  } catch (e) {
    console.error("getAllIndicatorStatuses failed", e);
    return [];
  }
}

export async function setIndicatorStatus({
  si, letter, rag, reportedValue, denominator, dataSource, observations, entriesJson,
  updatedBy, updatedByEmail,
}) {
  try {
    await callAppsScript({
      action: "indicator_set",
      si, letter, rag, reported_value: reportedValue, denominator,
      data_source: dataSource, observations, entries_json: entriesJson,
      updated_by: updatedBy, updated_by_email: updatedByEmail,
    });
    return true;
  } catch (e) {
    console.error("setIndicatorStatus failed", e);
    return false;
  }
}

/* ---------- Activity Meta: Type (Q/N) and S·M·G — admin-only edits ---------- */

export async function getAllActivityMeta() {
  try {
    const data = await callAppsScript({ action: "activity_meta_get_all" });
    return data?.rows || [];
  } catch (e) {
    console.error("getAllActivityMeta failed", e);
    return [];
  }
}

export async function setActivityMeta({ activityRow, type, smg, countries, updatedBy, updatedByEmail }) {
  try {
    const payload = { action: "activity_meta_set", activity_row: activityRow, updated_by: updatedBy, updated_by_email: updatedByEmail };
    if (type !== undefined) payload.type = type;
    if (smg !== undefined) payload.smg = smg;
    if (countries !== undefined) payload.countries = countries;
    await callAppsScript(payload);
    return true;
  } catch (e) {
    console.error("setActivityMeta failed", e);
    return false;
  }
}

/* ---------- Projects: pilot map data — admin-only edits ---------- */

export async function getAllProjects() {
  try {
    const data = await callAppsScript({ action: "projects_get_all" });
    return data?.rows || [];
  } catch (e) {
    console.error("getAllProjects failed", e);
    return [];
  }
}

export async function setProject({ projectId, projectName, countries, donor, partners, updatedBy, updatedByEmail }) {
  try {
    await callAppsScript({
      action: "projects_set",
      project_id: projectId, project_name: projectName, countries, donor, partners,
      updated_by: updatedBy, updated_by_email: updatedByEmail,
    });
    return true;
  } catch (e) {
    console.error("setProject failed", e);
    return false;
  }
}

/* ---------- Remembering who's signed in, between visits ---------- */

const LAST_EMAIL_KEY = "gndr-meal-last-email";

export function rememberEmail(email) {
  try { localStorage.setItem(LAST_EMAIL_KEY, email); } catch (e) {}
}
export function getRememberedEmail() {
  try { return localStorage.getItem(LAST_EMAIL_KEY); } catch (e) { return null; }
}

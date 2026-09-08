// storage.js
// Drop-in replacement for the Claude-artifact "window.storage" API, backed by
// a Google Sheet through a Google Apps Script Web App.
//
// Setup: after deploying the Apps Script (see /apps-script/Code.gs and the
// README), paste the Web App URL below.

const APPS_SCRIPT_URL = "https://script.google.com/a/macros/gndr.org/s/AKfycby6B5-8BUArE_wSJWk86IgXsvMLVDoA4nU1jwXLvxTQxHpW4Y_Djtzxr4PWkEu0vl4V/exec";

/**
 * Shared data is visible to everyone on the team (e.g. workplan-updates,
 * indicator-status). Personal data is scoped to the signed-in user's email
 * (e.g. their remembered identity/team choice) and passed in via `ownerEmail`.
 */
async function callAppsScript(payload) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    // Apps Script Web Apps don't support custom headers well with CORS,
    // so we keep this a "simple request" (text/plain body, parsed as JSON
    // on the Apps Script side).
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Storage request failed: ${res.status}`);
  }
  return res.json();
}

export async function getItem(key, shared, ownerEmail) {
  try {
    const data = await callAppsScript({ action: "get", key, shared, ownerEmail });
    if (!data || data.value == null) return null;
    return { key, value: data.value, shared };
  } catch (e) {
    console.error("storage.get failed", e);
    return null;
  }
}

export async function setItem(key, value, shared, ownerEmail) {
  try {
    await callAppsScript({ action: "set", key, value, shared, ownerEmail });
    return { key, value, shared };
  } catch (e) {
    console.error("storage.set failed", e);
    return null;
  }
}

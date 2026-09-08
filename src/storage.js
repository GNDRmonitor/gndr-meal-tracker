// storage.js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6B5-8BUArE_wSJWk86IgXsvMLVDoA4nU1jwXLvxTQxHpW4Y_Djtzxr4PWkEu0vl4V/exec";

async function callAppsScript(payload) {
  const params = new URLSearchParams();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) params.append(k, String(v));
  });
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    body: params,
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

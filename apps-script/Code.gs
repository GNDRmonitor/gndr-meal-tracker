/**
 * GNDR MEAL Tracker — Apps Script backend
 * -----------------------------------------------------------------------
 * Paste this whole file into script.google.com (Extensions > Apps Script,
 * from inside your Google Sheet), then deploy as a Web App. See the
 * README in the project root for the full step-by-step.
 *
 * Data model: one sheet tab called "Storage" with columns:
 *   key | shared | owner_email | value | updated_at
 *
 * - "shared" rows (shared = TRUE) are visible to everyone — used for the
 *   work plan updates, indicator status, and progress notes.
 * - Personal rows (shared = FALSE) are scoped to owner_email — used for
 *   each person's remembered name/team.
 */

const SHEET_NAME = "Storage";

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["key", "shared", "owner_email", "value", "updated_at"]);
  }
  return sheet;
}

function findRow_(sheet, key, shared, ownerEmail) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const [rowKey, rowShared, rowOwner] = data[i];
    if (rowKey === key && Boolean(rowShared) === Boolean(shared)) {
      if (shared || rowOwner === ownerEmail) {
        return i + 1; // 1-indexed row number for Sheets API
      }
    }
  }
  return null;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const body = JSON.parse(e.postData.contents);
    const { action, key, value, shared, ownerEmail } = body;
    const sheet = getSheet_();

    if (action === "get") {
      const rowNum = findRow_(sheet, key, shared, ownerEmail);
      if (!rowNum) {
        return jsonResponse_({ value: null });
      }
      const rowValue = sheet.getRange(rowNum, 4).getValue();
      return jsonResponse_({ value: rowValue });
    }

    if (action === "set") {
      const rowNum = findRow_(sheet, key, shared, ownerEmail);
      const now = new Date().toISOString();
      if (rowNum) {
        sheet.getRange(rowNum, 4, 1, 2).setValues([[value, now]]);
      } else {
        sheet.appendRow([key, Boolean(shared), ownerEmail || "", value, now]);
      }
      return jsonResponse_({ ok: true });
    }

    return jsonResponse_({ error: "Unknown action" });
  } catch (err) {
    return jsonResponse_({ error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/**
 * Optional: run this once from the Apps Script editor (select
 * `setupSheet` in the function dropdown, click Run) to create the
 * Storage tab with headers before your first deploy.
 */
function setupSheet() {
  getSheet_();
}

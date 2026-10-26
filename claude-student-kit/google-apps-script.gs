/**
 * Email capture for the Claude cheat sheet landing page.
 *
 * Saves each signup as a row in a Google Sheet and (optionally) emails the
 * cheat sheet to the new subscriber from your Gmail account. 100% free.
 *
 * Setup: see README.md, Step 2.
 */

// ===================== SETTINGS: edit these =====================
const SEND_WELCOME_EMAIL = true;
// Public link to the cheat sheet PDF, e.g. https://your-site.vercel.app/cheatsheet.pdf
const CHEATSHEET_URL = "https://YOUR-SITE/cheatsheet.pdf";
// Checkout link for the paid Playbook (shown in the welcome email).
const PLAYBOOK_URL = "https://YOUR-STORE.gumroad.com/l/claude-playbook";
const SENDER_NAME = "Claude Study Cheat Sheet";
// =================================================================

const HEADERS = ["Timestamp", "Name", "Email", "Year", "Source", "Form", "Page"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = (e && e.parameter) || {};
    const email = String(p.email || "").trim().toLowerCase();
    const name = String(p.name || "").trim().slice(0, 80);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: "invalid email" });

    const sheet = getSheet();
    const existing = sheet.getLastRow() > 1
      ? sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues().flat()
      : [];
    const isNew = existing.indexOf(email) === -1;

    sheet.appendRow([
      new Date(), name, email,
      String(p.year || "").slice(0, 40),
      String(p.source || "").slice(0, 60),
      String(p.form || "").slice(0, 40),
      String(p.page || "").slice(0, 200),
    ]);

    if (SEND_WELCOME_EMAIL && isNew) sendWelcome(email, name);
    return json({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Signups");
  if (!sheet) {
    sheet = ss.insertSheet("Signups");
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function sendWelcome(email, name) {
  const first = name || "there";
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1b2420;max-width:560px">
      <p>Assalam o Alaikum ${escapeHtml(first)},</p>
      <p>Thanks for grabbing the <b>Claude Study Cheat Sheet</b>! Here's your copy:</p>
      <p><a href="${CHEATSHEET_URL}" style="background:#c8962e;color:#1d1405;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Download the cheat sheet</a></p>
      <p><b>Start today with Day 1 of the 7-day challenge:</b> sign up at claude.ai (it's free) and send the "Say hi" prompt from page 1.</p>
      <p>When you're ready for the full quarter, the <a href="${PLAYBOOK_URL}">Claude Playbook for Pakistani Students</a> has 100+ prompts, a 10-week planner and an internship toolkit.</p>
      <p>Good luck this quarter!<br>${SENDER_NAME}</p>
      <p style="font-size:12px;color:#5b6862">You're getting this because you signed up on our page. Reply "unsubscribe" and we'll remove you.</p>
    </div>`;
  MailApp.sendEmail({
    to: email,
    subject: "Your Claude Study Cheat Sheet 📄",
    htmlBody: html,
    name: SENDER_NAME,
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run this once from the editor to test the sheet and the email. */
function testSignup() {
  doPost({ parameter: { name: "Test", email: Session.getActiveUser().getEmail(), year: "Test", source: "editor", form: "test" } });
}

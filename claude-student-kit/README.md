# Claude Student Kit: free cheat sheet, landing page and paid Playbook

A lead-magnet funnel for Pakistani students at UC Davis:

1. **Landing page** (`site/index.html`): students enter their name and email.
2. **Thank-you page** (`site/thank-you.html`): they get the free cheat sheet instantly and see the paid offer.
3. **Free cheat sheet** (`site/cheatsheet.pdf`): a 4-page beginner guide to Claude's free plan.
4. **Paid Playbook** (`premium/playbook.pdf`): 103 prompts, a 10-week quarter plan and toolkits. Sell it for $9, or $29 bundled with a live workshop.
5. **Email capture** (`google-apps-script.gs`): saves every signup to a Google Sheet and automatically emails them the cheat sheet. Free.

```
claude-student-kit/
├── site/                 ← the PUBLIC website (deploy only this folder)
│   ├── index.html        landing page + email form
│   ├── thank-you.html    download + upsell
│   ├── cheatsheet.html   cheat sheet (web version)
│   └── cheatsheet.pdf    cheat sheet (PDF)
├── premium/              ← the PAID product (git-ignored, never put it on the website)
│   ├── playbook.md       edit the content here
│   ├── playbook.css      styling
│   ├── playbook.html     generated
│   └── playbook.pdf      generated: upload this file to your store
├── google-apps-script.gs email capture → Google Sheets
└── build.js              regenerates the PDFs
```

> ⚠️ **Only deploy the `site/` folder.** `premium/playbook.pdf` is the product you sell. If it ends up on your website (or in a public GitHub repo), anyone can download it for free.

---

## Step 1: Preview it on your computer (2 min)

Double-click `site/index.html` to open it in your browser. Fill in the form and you'll land on the thank-you page. Until you finish Step 2 the form runs in **demo mode**, which means it doesn't save emails yet.

## Step 2: Save emails to a Google Sheet (10 min, free)

1. Go to **sheets.google.com** and create a blank sheet named `Cheat Sheet Signups`.
2. In the sheet, click **Extensions → Apps Script**.
3. Delete everything in the editor and paste in the contents of `google-apps-script.gs`.
4. At the top of the script, set `CHEATSHEET_URL` (after Step 3 you'll know your site address: `https://YOUR-SITE/cheatsheet.pdf`) and `PLAYBOOK_URL` (from Step 4). You can come back and fill these in later.
5. Click 💾 **Save**. Then pick `testSignup` from the function dropdown and click **Run**. Google asks for permission, so click **Review permissions → your account → Advanced → Go to project → Allow**. A "Signups" tab with a test row appears, and a test email reaches your inbox.
6. Click **Deploy → New deployment → ⚙️ → Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
7. Open `site/index.html` in any text editor, find `const FORM_ENDPOINT = "";` near the bottom, and paste the URL between the quotes.

Every signup now becomes a row in your sheet and gets the cheat sheet by email. Gmail allows about 100 automated emails per day on a free account. If you grow past that, export the sheet as a CSV and import it into MailerLite or Kit, which are both free up to 1,000 subscribers.

## Step 3: Put the website online (5 min, free)

**Easiest: Netlify Drop**
1. Go to **app.netlify.com/drop**.
2. Drag the **`site` folder** (only that folder) onto the page.
3. You get a live link like `https://cheerful-name-123.netlify.app`. You can rename it in Site settings.

**Alternative: Vercel**: create a new project from this repo and set the **Root Directory** to `claude-student-kit/site`.

After it's live, go back to Step 2.4 and set `CHEATSHEET_URL` to `https://YOUR-LINK/cheatsheet.pdf`. Then click **Deploy → Manage deployments → Edit → New version** in Apps Script.

## Step 4: Start selling the Playbook (15 min)

1. Create a free account on **Gumroad** (gumroad.com) or **Lemon Squeezy**. Both take a small fee per sale, nothing upfront.
2. Create a product called **"The Claude Playbook for Pakistani Students"** and upload `premium/playbook.pdf`. Price: **$9**.
3. *(Optional)* Create a second product, **"Playbook + Live Workshop"**, at **$29**. Put the workshop date, Zoom link and WhatsApp group link in the content that buyers receive.
4. Copy both product links into `site/thank-you.html` (`BUY_BASIC_URL`, `BUY_BUNDLE_URL`) and into `google-apps-script.gs` (`PLAYBOOK_URL`).
5. Re-upload the `site` folder to Netlify.

## Step 5: Launch plan (week 1)

| Day | Action |
|---|---|
| 1 | Post the landing page link in the PSA WhatsApp/Instagram groups with one sentence of the story ("I made this for us, it's free"). |
| 2 | Post a 30-second Reel or Story: show the "weak prompt vs CHAI prompt" example from page 2 of the cheat sheet. |
| 3 | Ask 5 friends to try the 7-day challenge and send you honest feedback. Use their **real** quotes on the landing page, with permission. |
| 4 | Message the PSA board: offer a free 20-minute "AI study hacks" talk at the next meeting, with a QR code to the landing page. |
| 5 | Email your list: a tip from the Playbook, plus a link to buy it. |
| 6–7 | Announce the first $29 live workshop date (cap it at 20–25 seats so it's easy to run). |

**Track sources:** share links with `?ref=` tags, for example `https://YOUR-LINK/?ref=psa-whatsapp` or `?ref=instagram`. The "Source" column in your sheet shows which channel works best.

## Editing content

- **Cheat sheet:** edit `site/cheatsheet.html`, then run the build (below) to update the PDF.
- **Playbook:** edit `premium/playbook.md`. It's plain text, and each `### Title` followed by a ``` code block is one prompt. Then rebuild.
- **University name:** everything says "UC Davis". To target another campus, find and replace it across the files.

### Rebuild the PDFs

Requires Node.js:

```bash
cd claude-student-kit
npm i playwright && npx playwright install chromium
node build.js
```

## Good to know

- The pages say the kit is **not affiliated with UC Davis or Anthropic**. Keep that line, and don't use university or Anthropic logos.
- The prices shown ($9 / $19 crossed out, $29 / $49 crossed out) and the 14-day refund guarantee are suggestions. Change them so they match what you'll actually honor.
- Free-plan features and limits change over time. Re-check the cheat sheet against claude.ai every quarter.
- The thank-you page is public, so anyone who finds its link can get the free cheat sheet without signing up. That's fine for a free lead magnet. The paid Playbook is only delivered through your store.

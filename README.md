# GNDR MEAL Tracker — deployment guide

This is the GNDR Global Strategy 2026–2030 monitoring app, built as a
standard React + Vite project so it can be hosted on **GitHub Pages** with
**Google Sheets** as its database and **Google Sign-In** for identity.

It was prototyped as a Claude artifact first — this folder is the
production-ready version of that same app, with the storage layer swapped
from Claude's sandboxed `window.storage` to a real backend you control.

Everything below is written for someone who hasn't deployed a web app
before. Follow the steps in order — don't skip the Google Sheet/Apps
Script part, the app won't save anything without it.

---

## What you'll end up with

- A **Google Sheet** that acts as the database (one tab, `Storage`).
- A **Google Apps Script** attached to that Sheet, deployed as a small
  Web App — this is what the frontend talks to when it saves/loads data.
- A **GitHub repository** with this code, published via **GitHub Pages**
  at a URL like `https://<your-github-username>.github.io/gndr-meal-tracker/`.
- **Google Sign-In** so people log in with their own Google account
  instead of typing a name.

Total cost: **$0** — everything here is on free tiers.

---

## Step 1 — Create the Google Sheet + Apps Script backend

1. Go to [sheets.google.com](https://sheets.google.com) and create a new,
   blank spreadsheet. Name it something like `GNDR MEAL Tracker Data`.
2. In the menu, go to **Extensions → Apps Script**. A new tab opens with
   a code editor.
3. Delete whatever's in the default `Code.gs` file, and paste in the
   entire contents of **`apps-script/Code.gs`** from this project.
4. Click the **Save** icon (or `Ctrl+S` / `Cmd+S`).
5. In the function dropdown at the top (next to the "Debug" button),
   select **`setupSheet`**, then click **Run**. The first time, Google
   will ask you to authorize the script — click through the prompts
   (you'll see an "unverified app" warning; click **Advanced → Go to
   [project name] (unsafe)** — this is normal for your own scripts).
   This creates the `Storage` tab in your Sheet with the right columns.
6. Now deploy it as a Web App: click **Deploy → New deployment**.
   - Click the gear icon next to "Select type" and choose **Web app**.
   - Description: anything, e.g. "MEAL tracker backend".
   - Execute as: **Me**.
   - Who has access: **Anyone**. *(This sounds scarier than it is — the
     script only exposes the specific `get`/`set` actions we wrote, not
     your whole Sheet. Still, don't put anything sensitive beyond what's
     already in this app.)*
   - Click **Deploy**.
7. Copy the **Web app URL** it gives you (starts with
   `https://script.google.com/macros/s/.../exec`). You'll need it in
   Step 3.

---

## Step 2 — Create a Google OAuth Client ID (for sign-in)

1. Go to [console.cloud.google.com](https://console.cloud.google.com).
2. Create a new project (top-left dropdown → **New Project**) — call it
   `GNDR MEAL Tracker`.
3. In the left menu, go to **APIs & Services → OAuth consent screen**.
   - User type: **External** (unless your Google Workspace admin has
     Internal available — either works for this app).
   - Fill in the required fields (app name, your email). You can skip
     scopes and test users for now.
   - Save through the steps.
4. Go to **APIs & Services → Credentials**.
   - Click **Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Name: `GNDR MEAL Tracker Web`.
   - Under **Authorized JavaScript origins**, add:
     `https://<your-github-username>.github.io`
     (no trailing slash, no path — just the domain).
   - Click **Create**.
5. Copy the **Client ID** it shows you (ends in
   `.apps.googleusercontent.com`).

*(Optional but recommended: if everyone at GNDR has an `@gndr.org`
Google account, open `src/googleAuth.js` and set `ALLOWED_DOMAIN =
"gndr.org"` so only GNDR accounts can sign in.)*

---

## Step 3 — Paste your URLs into the code

Open this project in **Claude Code** (or any code editor) and edit two
files:

**`src/storage.js`** — replace the placeholder with your Apps Script URL
from Step 1:
```js
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/XXXXXXXX/exec";
```

**`src/googleAuth.js`** — replace the placeholder with your OAuth Client
ID from Step 2:
```js
const GOOGLE_CLIENT_ID = "XXXXXXXXXX.apps.googleusercontent.com";
```

**`vite.config.js`** — set `base` to match your actual GitHub repo name
(this determines the URL path GitHub Pages will use):
```js
base: "/your-repo-name/",
```

---

## Step 4 — Push to GitHub

If you're doing this through **Claude Code**, just ask it to:
> "Create a new GitHub repo called `gndr-meal-tracker`, push this
> project to it, and set up GitHub Pages deployment."

Claude Code can run these steps for you directly. If you'd rather do it
by hand:

```bash
cd gndr-meal-app
git init
git add .
git commit -m "Initial commit — GNDR MEAL tracker"
gh repo create gndr-meal-tracker --public --source=. --push
```

(`gh` is GitHub's command-line tool — Claude Code will have it, or you
can create the repo manually on github.com and push to it instead.)

---

## Step 5 — Deploy to GitHub Pages

The easiest way is the `gh-pages` package already listed in
`package.json`:

```bash
npm install
npm run build
npm run deploy
```

This builds the app and pushes the result to a `gh-pages` branch. Then:

1. On GitHub, go to your repo → **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a
   branch**.
3. Branch: **`gh-pages`**, folder: **`/ (root)`**. Save.
4. After a minute or two, your app is live at:
   `https://<your-github-username>.github.io/gndr-meal-tracker/`

---

## Step 6 — Test it

1. Open the live URL.
2. Sign in with a Google account.
3. Pick a team, click Continue.
4. Log a quarterly update on any activity, then open the Google Sheet
   from Step 1 — you should see a new row appear in the `Storage` tab
   within a couple of seconds.
5. Open the app in a different browser (or incognito window) and sign
   in as someone else — you should see the same shared data (activities,
   indicator dashboard), confirming the "shared" storage is working
   across users.

---

## Updating the app later

Whenever you want to change something (new activities, tweaked
questions, design changes):

```bash
npm run build
npm run deploy
```

That's it — no need to touch GitHub Pages settings again.

---

## Local development (optional)

To run the app on your own machine while making changes:

```bash
npm install
npm run dev
```

This starts a local server (usually `http://localhost:5173`). Note:
Google Sign-In needs `http://localhost:5173` added as an extra
**Authorized JavaScript origin** in your OAuth Client (Step 2) if you
want sign-in to work locally too.

---

## Project structure

```
gndr-meal-app/
├── apps-script/
│   └── Code.gs          ← paste into Google Apps Script (Step 1)
├── src/
│   ├── App.jsx           ← the whole app (ported from the Claude prototype)
│   ├── main.jsx           ← React entry point
│   ├── storage.js         ← talks to the Apps Script backend
│   ├── googleAuth.js       ← Google Sign-In
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Known limitations of this first version

- **No admin/edit-access control** — anyone who signs in can edit any
  activity or indicator, not just "their own". Fine for a small trusted
  team; worth adding role checks later if needed.
- **Apps Script has rate limits** (roughly 20,000 requests/day on a free
  Google account) — plenty for a team this size, but worth knowing.
- **No offline support** — needs an internet connection to load/save.

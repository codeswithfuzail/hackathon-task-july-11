# AssetCare — Responsive Dashboard

## What's included
- `login.html` — Sign-in page (Name + Email + Password). Enter any name — it will show
  on your avatar and in the top navbar / user menu across every page.
- `index.html`, `assets.html`, `issues.html`, `maintenance.html`, `technicians.html`,
  `analytics.html`, `notifications.html`, `settings.html` — all pages, fully mobile
  responsive with a working hamburger menu.
- `css/style.css` — shared theme + responsive styles.
- `js/app.js` — auth, localStorage demo data, and all page rendering logic.

## Demo login
- Admin: admin@assetcare.demo / admin123
- Technician: tech@assetcare.demo / tech123

(Use the "Your name" field to have your own name shown instead of the demo name.)

## Mobile
- Below 1024px, the sidebar becomes a slide-in drawer opened with the hamburger
  icon (top-left of every page), with a dark overlay and a close (✕) button.
- All KPI cards, tables, and charts reflow into single/two-column layouts on
  small screens; tables scroll horizontally if needed.

## Data
Everything is stored in the browser's localStorage — no backend needed. Use
"Reset Demo Data" in the user menu (top-right → Menu) to restore the original
sample data at any time.

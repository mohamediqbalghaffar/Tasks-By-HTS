---
description: How to apply any UI or app change comprehensively across every relevant file
---

# Apply UI / App Change Workflow

When the user sends a screenshot or describes a change to the app, follow these steps every time:

## Step 1 — Understand the Change
- Read the user's description or examine the screenshot carefully
- Identify *what* is changing: a color, label, layout, behavior, component, page, data field, etc.
- Identify *where* it appears: which page(s), component(s), mobile vs desktop

## Step 2 — Read the Project Map
- Always read `project-map.md` in the project root before any edits
- This gives you the definitive list of every file in the project and its role

## Step 3 — Identify All Affected Files
Check **every** category below and decide if this change touches it:

### Pages (src/app/)
- `page.tsx` — main home page (tasks + letters list, filters, header)
- `client-layout.tsx` — main layout wrapper, sidebar, navigation
- `layout.tsx` — root HTML layout
- `item/page.tsx` — single item detail page
- `add/page.tsx` — add new task/letter page
- `archive/page.tsx` — single archive item
- `archives/page.tsx` — archives list
- `data-analysis/page.tsx` — charts and statistics
- `floating-bubble/page.tsx` — floating assistant
- `odoo/page.tsx` — Odoo integration page
- `profile/page.tsx` — user profile
- `settings/page.tsx` — settings root
- `settings/general-settings.tsx` — general settings UI
- `settings/account-settings.tsx` — account settings UI
- `settings/language-settings.tsx` — language settings UI
- `auth/page.tsx` — login/register

### Shared Components (src/components/)
- `item-card.tsx` — the main card shown for tasks & letters on all list pages
- `shared-with-list.tsx` — shared-with user chips
- `LetterNumberEditor.tsx` — letter number input
- `InstallPrompt.tsx` — PWA install prompt
- `icons.ts` — centralized icon imports

### Mobile Components (src/components/mobile/)
- `MobileHeader.tsx` — mobile top header
- `MobileBottomNav.tsx` — mobile bottom navigation bar
- `MobileDrawer.tsx` — mobile slide-out drawer
- `FilterModal.tsx` — mobile filter modal
- `TaskCard.tsx` — mobile task card
- `LetterCard.tsx` — mobile letter card

### UI Primitives (src/components/ui/)
- `button.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `sheet.tsx`, `tabs.tsx` — check if primitive styling needs updating
- `badge.tsx`, `card.tsx`, `separator.tsx` — layout primitives
- `toast.tsx`, `toaster.tsx` — notification toasts
- `loading-animation.tsx`, `loading-spinner.tsx` — loading states
- `liquid-glass-button.tsx` — special glass button

### State & Logic (src/contexts/)
- `TaskContext.tsx` — all task/letter state, CRUD, filtering
- `UIContext.tsx` — UI preferences (theme, layout, etc.)
- `LanguageContext.tsx` — language/RTL/translations
- `AuthContext.tsx` — auth state

### Library / Utilities (src/lib/)
- `translations.ts` ← **ALWAYS update this** if any visible text string changes (supports Arabic, Kurdish Sorani, Kurdish Badini, English)
- `firebase.ts` — Firestore queries (update if data model changes)
- `constants.ts` — app-wide constants
- `backgrounds.ts` — background options
- `render-detail-content.tsx` — renders item detail view
- `notification-service.ts` — push notifications
- `odoo.ts` — Odoo API
- `email.ts` — email sending

### Types (src/types/)
- Update type definitions if the data model changes

### Global Styles (src/app/)
- `globals.css` — global CSS variables, dark mode, themes

## Step 4 — Apply Changes
- For **every** affected file identified in Step 3, make the required edits
- If a label/text changes → update `translations.ts` for all 4 languages (Arabic `ar`, Kurdish Sorani `ku`, Kurdish Badini `ba`, English `en`)
- If a color/style changes → check both `globals.css` CSS variables AND Tailwind classes in components
- If a component's UI changes → verify both the **desktop** (sidebar layout) and **mobile** (bottom nav layout) versions

## Step 5 — Verify Consistency
After all edits:
- Confirm no file was missed by cross-referencing the project map
- Confirm translations were added in all 4 languages
- Confirm dark mode and light mode both handled (use `dark:` Tailwind classes)
- Confirm mobile and desktop both handled

## Notes
- The project uses **Next.js 14 App Router** with TypeScript + Tailwind CSS
- UI components are from **shadcn/ui** (in `src/components/ui/`)
- The app is **RTL-first** (Arabic/Kurdish), so always check direction-sensitive layout
- Firebase Firestore is the backend; Odoo is an optional ERP integration
- The app supports **PWA** (installable) and **Electron** (desktop app)

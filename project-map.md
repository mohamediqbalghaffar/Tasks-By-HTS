# Project Map — Tasks-By-HTS

> **Purpose**: This file is read by the AI assistant at the start of every change request to ensure changes are applied to every relevant file. Keep this file updated when new files are added.

---

## Tech Stack
- **Framework**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Library**: shadcn/ui components
- **Backend**: Firebase Firestore + Firebase Auth
- **Integrations**: Odoo ERP, Email, Push Notifications
- **Platforms**: Web PWA + Electron (Windows .exe) + Android (APK)
- **Languages**: Arabic (ar), Kurdish Sorani (ku), Kurdish Badini (ba), English (en) — RTL-first

---

## Pages — `src/app/`

| File | Role |
|------|------|
| `page.tsx` | 🏠 Main home: task + letter list, filters, tabs (Tasks / Letters / Shared), search, header |
| `client-layout.tsx` | 🧱 Root layout: desktop sidebar, mobile nav, floating chat button |
| `layout.tsx` | 🌐 HTML root, metadata, font loading |
| `item/page.tsx` | 📄 Single task/letter detail view |
| `add/page.tsx` | ➕ Create new task or letter |
| `archive/page.tsx` | 🗃 Single archived item |
| `archives/page.tsx` | 🗃 Archives list |
| `data-analysis/page.tsx` | 📊 Charts and statistics |
| `floating-bubble/page.tsx` | 💬 Floating AI chat assistant |
| `odoo/page.tsx` | 🔗 Odoo ERP integration |
| `profile/page.tsx` | 👤 User profile |
| `settings/page.tsx` | ⚙️ Settings root |
| `settings/general-settings.tsx` | ⚙️ General settings (theme, notifications, downloads) |
| `settings/account-settings.tsx` | ⚙️ Account/password settings |
| `settings/language-settings.tsx` | ⚙️ Language switcher |
| `auth/page.tsx` | 🔐 Login / register |
| `standby/page.tsx` | ⏳ Standby/loading screen |
| `globals.css` | 🎨 Global CSS variables, dark mode, animations |

---

## Shared Components — `src/components/`

| File | Role |
|------|------|
| `item-card.tsx` | 🃏 Main card for tasks & letters (used on home, archives, search) |
| `shared-with-list.tsx` | 👥 Shows list of users an item is shared with |
| `LetterNumberEditor.tsx` | ✏️ Inline editor for letter reference number |
| `InstallPrompt.tsx` | 📲 PWA install prompt banner |
| `icons.ts` | 🎨 Centralized icon re-exports (Lucide) |
| `FirebaseErrorListener.tsx` | 🔥 Global Firebase error handler |

---

## Mobile Components — `src/components/mobile/`

| File | Role |
|------|------|
| `MobileHeader.tsx` | 📱 Top header bar (mobile) |
| `MobileBottomNav.tsx` | 📱 Bottom navigation bar (mobile) |
| `MobileDrawer.tsx` | 📱 Slide-out side drawer (mobile) |
| `FilterModal.tsx` | 🔍 Full-screen filter modal (mobile + desktop) |
| `TaskCard.tsx` | 📋 Task card (mobile-specific layout) |
| `LetterCard.tsx` | 📬 Letter card (mobile-specific layout) |

---

## UI Primitives — `src/components/ui/`

All shadcn/ui base components. Key ones:

| File | Role |
|------|------|
| `button.tsx` | Buttons (all variants) |
| `dialog.tsx` | Modal dialogs |
| `dropdown-menu.tsx` | Dropdown menus |
| `sheet.tsx` | Side sheets / drawers |
| `tabs.tsx` | Tab components |
| `badge.tsx` | Status badges |
| `card.tsx` | Card container |
| `toast.tsx` + `toaster.tsx` | Toast notifications |
| `loading-animation.tsx` | Full-page loading animation |
| `loading-spinner.tsx` | Inline spinner |
| `liquid-glass-button.tsx` | Glass-effect special button |
| `select.tsx` | Dropdown selects |
| `input.tsx` | Text inputs |
| `textarea.tsx` | Multi-line inputs |
| `checkbox.tsx` | Checkboxes |
| `switch.tsx` | Toggle switches |
| `calendar.tsx` | Date picker calendar |
| `date-time-picker.tsx` | Combined date+time picker |
| `wheel-date-picker.tsx` | Scroll-wheel date picker |
| `time-picker.tsx` | Time picker |
| `chart.tsx` | Chart wrapper (Recharts) |
| `table.tsx` | Data tables |
| `scroll-area.tsx` | Custom scrollbar area |
| `progress.tsx` | Progress bars |
| `slider.tsx` | Range sliders |
| `alert.tsx` + `alert-dialog.tsx` | Alerts and confirm dialogs |
| `completion-dialog.tsx` | Task completion dialog |
| `date-range-filter.tsx` | Date range filter UI |
| `avatar.tsx` | User avatar |
| `separator.tsx` | Divider line |
| `popover.tsx` | Popover panels |
| `tooltip.tsx` | Tooltips |
| `label.tsx` | Form labels |
| `form.tsx` | React Hook Form wrapper |
| `radio-group.tsx` | Radio button group |
| `accordion.tsx` | Accordion/collapsible |
| `menubar.tsx` | Menu bar |
| `skeleton.tsx` | Loading skeleton |

---

## State & Context — `src/contexts/`

| File | Role |
|------|------|
| `TaskContext.tsx` | 🗂 All task/letter state, CRUD, filtering, sharing, archiving |
| `UIContext.tsx` | 🎨 UI state: theme, sidebar open, view mode |
| `LanguageContext.tsx` | 🌍 Language selection, RTL/LTR, translation function `t()` |
| `AuthContext.tsx` | 🔐 Auth state, user info, login/logout |

---

## Library & Utilities — `src/lib/`

| File | Role |
|------|------|
| `translations.ts` | 🌍 **ALL visible text strings** in 4 languages (ar, ku, ba, en) — update for any text change |
| `firebase.ts` | 🔥 Firestore queries, Firebase helpers |
| `constants.ts` | 📌 App-wide constants (priorities, statuses, categories) |
| `backgrounds.ts` | 🖼 Background image/gradient options |
| `render-detail-content.tsx` | 📄 Renders item detail fields |
| `notification-service.ts` | 🔔 Push notification setup & sending |
| `odoo.ts` | 🔗 Odoo API client |
| `email.ts` | 📧 Email sending (EmailJS) |
| `utils.ts` | 🛠 Utility helpers (cn, etc.) |

---

## Types — `src/types/`

| File | Role |
|------|------|
| `index.ts` (or similar) | TypeScript type definitions for Task, Letter, User, etc. |

---

## AI Flows — `src/ai/flows/`

| File | Role |
|------|------|
| `telecom-chat-flow.ts` | AI chat assistant flow |
| `generate-powerpoint-slides-flow.ts` | AI PowerPoint generation |
| `generate-chat-title-flow.ts` | Auto-generate chat titles |
| `suggest-task-details.ts` | AI task detail suggestions |

---

## Root Config Files

| File | Role |
|------|------|
| `next.config.ts` | Next.js config |
| `tailwind.config.ts` | Tailwind theme (colors, fonts, etc.) |
| `package.json` | Dependencies and scripts |
| `firebase.json` | Firebase hosting config |
| `firestore.rules` / `src/firestore.rules` | Firestore security rules |
| `.github/workflows/release.yml` | GitHub Actions CI/CD |

---

## Change Checklist (run mentally for every change request)

- [ ] Text changed? → Update `translations.ts` (all 4 languages: ar, ku, ba, en)
- [ ] Color/style changed? → Update `globals.css` AND component Tailwind classes
- [ ] Dark mode affected? → Verify `dark:` classes in all touched components
- [ ] Mobile UI changed? → Check `mobile/` components AND `page.tsx` mobile sections
- [ ] Desktop UI changed? → Check `client-layout.tsx` sidebar
- [ ] Data model changed? → Update `types/`, `TaskContext.tsx`, `firebase.ts`
- [ ] New feature? → Check if `constants.ts` and `translations.ts` need new entries

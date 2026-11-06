# onodem.com — End-to-End Audit (2026-11-06)

Scope: live site https://onodem.com (web build + `/api/v1`), and this repo (`src/` Expo app, `backend/` Spring Boot).
Method: browsed the live site (desktop + 375px mobile), sent non-destructive probes to the live API, did a manual code review of the backend security and config, and ran `tsc` and `expo lint`.

Not covered: signed-in flows on production (I didn't create accounts or sign in on the live site), destructive API calls (no real password resets, no deletes), and native iOS/Android builds.

---

## 🔴 Critical — fix before anything else

### C1. Master OTP `12345` resets ANY account's password (CONFIRMED LIVE)
- `backend/.../auth/service/AuthService.java` → `resetPassword()` and `verifyOtp()` accept the code `"12345"` for any email, and they do it in every profile.
- Live check: `POST /api/v1/auth/verify-otp {"email":"nonexistent-qa-probe@example.invalid","code":"12345"}` → `{"success":true,"data":true}`. Any other code is rejected.
- Impact: **anyone can take over any account.** Calling `/reset-password` with the victim's email, code `12345` and a new password works. I didn't run that call against a real account.
- The frontend advertises the code too: `src/app/forgot-password.tsx:449` shows *"verification code is 12345"*, and the forgot-password API response says *"code 12345 is accepted"*. `src/services/auth.ts:115` defaults `code = "12345"`.
- Fix: delete both master-code branches and the `sarita@example.com` dev override. Remove the text from the UI and the API message. Add attempt limits per email for `verify-otp` and `reset-password`. Today a 5-digit OTP can be brute-forced: the limit is 15 requests/min per IP, and that limit is bypassable (see H2).

### C2. Default JWT signing secret is committed to a PUBLIC repo
- `application.yml`: `secret: ${JWT_SECRET:404E6352…5970}`. The same value is in `backend/.env.example`, and https://github.com/saritabaiga15-oss/NewApp is public.
- If the production server doesn't set `JWT_SECRET`, anyone can mint tokens for any user. I didn't try forging a token against production. **Verify on the server**, and rotate the secret either way.
- Fix: remove the default (`${JWT_SECRET}` with no fallback) so the app fails to start without it, and put a placeholder in `.env.example`. Also remove the zero-padding fallback in `JwtService.getSignInKey()`: short keys are silently padded with zero bytes instead of failing.

### C3. Backend does not compile — unresolved merge conflict
- `backend/.../auth/service/AuthService.java:155-232` still contains `<<<<<<< HEAD` / `=======` / `>>>>>>>` markers. `login()` and `refreshToken()` are defined twice, and `normalizePhone()` only exists inside the conflict block.
- The live server works, so production is running an **older build**. The next deploy from `main` will fail.
- Fix: keep the HEAD version (phone-number login via `findUserByIdentifier`). Decide whether login should really send a "welcome email" on every sign-in (the non-HEAD version does), and delete the markers.

---

## 🟠 High

| # | Issue | Where | Fix |
|---|---|---|---|
| H1 | **Anonymous tribute creation.** `POST /api/v1/tributes` is `permitAll`, and it saves under `userId="community-guest"` with privacy defaulting to `PUBLIC`. Anyone can spam the public feed. | `SecurityConfig`, `TributeController.createTribute` | Require auth, or add a captcha plus strict rate limiting if guest posting is intended. |
| H2 | **Rate limit bypass.** The client IP is taken from the first `X-Forwarded-For` value, which the client controls. nginx appends with `$proxy_add_x_forwarded_for`, so the attacker's value stays first. | `RateLimitingFilter.getClientIP` | Use `request.getRemoteAddr()` (`forward-headers-strategy: framework` already resolves it) or the *last* XFF hop. The counters are also in-memory, so they're lost on restart and not shared across instances. |
| H3 | **Refresh token works as an access token.** Neither token type has a `typ` claim, and the filter accepts any valid JWT. That's a 7-day bearer token with no revocation, and there's no logout or blacklist on the server. | `JwtService`, `JwtAuthenticationFilter` | Add a `type` claim, accept only `access` in the filter and only `refresh` in `/auth/refresh`. Consider rotating and storing refresh tokens. |
| H4 | **`/api/v1/auth/test-email` is public.** Anyone can make the server send mail to any address from info@onodem.com. That's a spam relay and hurts sender reputation. | `AuthController.testEmail`, `SecurityConfig` | Delete it, or restrict it to `ADMIN`. |
| H5 | **Comments on PRIVATE tributes are readable.** `getComments` has no privacy or ownership check. | `EngagementService.getComments` | Apply the same check as `getTributeById`. `getLikeStatus` has the same problem (minor). |
| H6 | **Signed-out users see a fully populated app.** Only `/home` has an auth guard. `/profile`, `/memory-wall`, `/settings` and `/create-tribute` render mock or local data ("Mentee", "128 followers", "2 blocked profiles", 16 memories), and the header shows **"Sign Out"** to a signed-out visitor. | `src/app/*.tsx`, `ResponsiveHeader` | Put a single auth gate in `_layout.tsx` (Expo Router protected routes / `Stack.Protected`) and switch the header between Log In and Sign Out based on auth state. |
| H7 | **Delete Account doesn't work.** `deleteAccount()` always throws *"No authentication provider account-deletion handler has been configured"*. App Store guideline 5.1.1(v) requires in-app account deletion. | `src/services/auth.ts:33` | Add `DELETE /api/v1/users/me` and wire it up. |

## 🟡 Medium

- **No server-side size cap on pagination.** `size` is passed straight to `PageRequest.of` (`/tributes/public-feed`, `/feed`), so `?size=1000000` loads the whole table. Cap it at around 50.
- **Schema managed twice.** `ddl-auto: update` runs alongside Flyway in prod, neon and supabase. Hibernate can silently change the schema. Use `validate` in prod.
- **Swagger enabled by default** (`SWAGGER_ENABLED:true`), and nginx proxies `/swagger-ui/`. Default it to false in prod.
- **Uploads:** the content type is only logged, not enforced, and there's no magic-byte check. `.txt`, `.doc` and `.pdf` are served `inline` from the API origin. Every media file is public (`GET /media/files/**`) even when attached to a PRIVATE tribute; the 16-hex random id is the only protection. `mediaUrl`/`photoUri` aren't validated as `https:` URLs. `/media/pool-health` exposes DB pool metrics to any logged-in user.
- **XSS "sanitizer" is a regex blacklist** (`SanitizationUtil`). It's easy to bypass (`<img src=x onerror=…>` with variations, `<svg>`), and it mangles legitimate text: any word ending in "on…=", "eval(", and so on. React escapes text by default, so store the raw text and encode it on output instead.
- **Neon host and DB username are hard-coded as defaults** in `application-neon.yml` / `application-prod.yml`, and the repo is public. Not a secret by itself, but remove them.
- **CSP sent by Spring only covers API responses.** nginx serves the SPA with no CSP, HSTS, X-Frame-Options or `X-Content-Type-Options`, and with `Server: nginx/1.18.0 (Ubuntu)` showing the version. Add headers in nginx and set `server_tokens off`.
- **`spring.profiles.active` defaults to `neon`**, and the dev profile turns on the H2 console. Make sure prod sets `SPRING_PROFILES_ACTIVE=prod` explicitly.
- **Login sends a "welcome email" on every sign-in** (the non-HEAD side of C3). That's noisy and slow, because SMTP runs inside a request with an 8s timeout.

## 🔵 Frontend bugs & loose ends

- **React hydration error #418** on every page load (live console). Server and client HTML differ. Likely cause: `useResponsive` / `isMounted` and `Platform`-dependent rendering in `_layout`.
- **`tsc --noEmit`: 2 errors.** There are no type declarations for `@/global.css` and `animated-icon.module.css`; add a `*.css` module declaration.
- **`expo lint`: 13 errors, 13 warnings.**
  - Variables used before they're declared: `ConnectionsModal.tsx:42`, `QrCodeModal.tsx:54,57`.
  - Refs read during render: `QrCodeModal.tsx:46,247`.
  - setState called synchronously in effects: `useResponsive.ts:23`, `PwaInstallBanner.tsx:25`, `CreativeVoiceModal.tsx:85,335`, `QrCodeModal.tsx:50`.
  - Plus unused variables and missing hook dependencies.
- **Mock data shown as real.** Profile counts (128/64 followers, "3 tributes"), "2 blocked profiles" and the memory-wall seed data come from `src/data/*` and AsyncStorage, not the API. The memory count also disagreed between desktop (16) and mobile (27) during this session.
- **Duplicate or dead routes:** `creation-studio.tsx` and `creationstudio.tsx`; `create.tsx` alongside `create-tribute.tsx` and `tribute-design.tsx`.
- **Repo hygiene.** These are committed and shouldn't be:
  - `dist.tgz` (4.7 MB)
  - `tatus` (an accidental `git diff > tatus`)
  - `Microsoft/Windows/PowerShell/ModuleAnalysisCache`
  - `memory-wall.html` (72 KB)
  - `backend/src/test/.../NeonConnectionTest.java`, which hits the real DB
- **Demo flags in production code:** `DEMO_MODE = true` and `IS_BACKEND_CONFIGURED` in `src/services/auth.ts`.

## 🎨 UX / Apple HIG review

Note: the "apple-design" and "security audit" skills you mentioned aren't installed in this session. I applied Apple's Human Interface Guidelines and a standard OWASP-style review by hand.

1. **No page titles.** `document.title` is empty on every route, so browser tabs, history, bookmarks and screen readers get nothing. Set `<title>` per screen (Expo Router `<Head>`).
2. **Accessibility.** Login and Register buttons ("Login", "Sign up", "Forgot Password?", "Create account") show up as plain `generic` divs with no `button` role, so VoiceOver/keyboard users can't find them. Add `accessibilityRole="button"` and labels. Placeholders double as labels, so the label disappears once the user starts typing; HIG prefers persistent labels.
3. **Inconsistent navigation naming.** Desktop nav says "Memory Wall", but the mobile tab bar labels the same screen "Saved" with a bookmark icon, and Profile also has a separate "Saved items". Pick one name per destination.
4. **Typography.** "Today's memory", the quote and the mentor name on Memory Wall fall back to italic Arial/system fonts, while the rest of the screen uses the app font. That mix looks unpolished. Use one type family, and use Dynamic-Type-style sizes.
5. **Login screen:** the hero gradient ends in a hard horizontal seam about halfway down at 375px width. The placeholder "Email, username, or phone number" is cut off at 375px; shorten it to "Email or username".
6. **Onboarding hero:** the copy relies on an entrance animation (it starts at opacity 0). I couldn't verify it because the test browser was backgrounded, which pauses animations. Make sure the text shows without JS and with Reduce Motion on (`prefers-reduced-motion`).
7. **404 page** is Expo's default "Unmatched Route" page with a "Sitemap" link that lists every route. Replace it with a branded not-found screen.
8. **Destructive actions:** Settings → "Delete Account" should confirm in a sheet with a destructive-style button and spell out the consequences (HIG). It currently can't succeed anyway (H7).

---

## Suggested order of work
1. C1 → C2 (rotate the secret) → C3, then redeploy.
2. H1–H5 (backend hardening), H2 and the pagination cap together.
3. H6 auth gate + H7 account deletion.
4. Lint errors, the hydration error, page titles and accessibility roles.
5. Clean up the repo and the mock data.

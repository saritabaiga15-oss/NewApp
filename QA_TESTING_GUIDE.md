# Quality Assurance (QA) Test Plan & Execution Matrix
**Project:** Honour Your Mentor (`onodem.com`)  
**Document Version:** 1.0  
**Target Environment:** `https://onodem.com`  
**API Endpoint:** `https://onodem.com/api/v1`  
**Mail Gateway:** `info@onodem.com` via `smtpout.secureserver.net` (Port 587)  
**Host IP:** `148.66.154.48`

---

## 1. Document Purpose & Scope
This test plan provides comprehensive Quality Assurance procedures to validate all production features of the **Honour Your Mentor** platform. It validates functional flows, data integrity (dynamic user identity), asynchronous email dispatch, multimedia recording, and system hygiene.

---

## 2. Pre-Requisites & Deployment Validation

Before beginning test execution, verify that the application server is running the current release:

```bash
# SSH into Host
ssh root@148.66.154.48

# 1. Verify Backend Build & SMTP Environment
cd ~/onodemBackend
git pull origin master
mvn clean package -DskipTests
sudo systemctl restart onodem-backend

# 2. Verify Frontend Production Web Export
cd ~/NewApp
git pull origin main
npm run build
sudo systemctl reload nginx
```

### DNS & Mail Delivery Pre-Flight
- [x] **SPF Record (`TXT @`)**: `v=spf1 include:secureserver.net -all` (Verified in GoDaddy)
- [x] **DMARC Record (`TXT _dmarc`)**: `v=DMARC1; p=quarantine; ...` (Verified in GoDaddy)
- [x] **DKIM Records**: `secureserver1._domainkey` and `secureserver2._domainkey` (Verified in GoDaddy)
- [x] **MX Records**: `smtp.secureserver.net` (0) and `mailstore1.secureserver.net` (10)

---

## 3. Test Cases & Execution Matrix

### Module 1: Authentication & Dynamic Profile Management

| Test Case ID | `TC-AUTH-001` |
| :--- | :--- |
| **Title** | New User Registration & Welcome Email Dispatch |
| **Priority** | High / Blocker |
| **Preconditions** | Unregistered email address accessible by tester |
| **Test Steps** | 1. Open `https://onodem.com/register` in an Incognito window.<br>2. Fill in: Name: `"Sharon"`, Email: `tester@example.com`, Password: `SecurePassword123!`.<br>3. Submit the registration form.<br>4. Inspect the email inbox for `tester@example.com`. |
| **Expected Result** | - Account is created; redirects smoothly to Home (`/home`).<br>- Welcome email arrives from `info@onodem.com` with subject *"Welcome to Honour Your Mentor, Sharon"*.<br>- HTML styling renders with luxury dark design and active call-to-action link. |
| **Status** | `[ ] PASS  [ ] FAIL` |

---

| Test Case ID | `TC-AUTH-002` |
| :--- | :--- |
| **Title** | Dynamic Profile Binding (Zero Placeholder "Sarita Baiga") |
| **Priority** | High / Blocker |
| **Preconditions** | User logged in as registered user ("Sharon") |
| **Test Steps** | 1. Navigate to `https://onodem.com/profile-edit`.<br>2. Inspect the **Full Name**, **Username**, and **Email** fields.<br>3. Inspect the browser `localStorage` key `@honour-your-mentor/profile`.<br>4. Navigate to `https://onodem.com/profile`. |
| **Expected Result** | - Profile name displays `"Sharon"` (NOT `"Sarita Baiga"`).<br>- Email matches the registered email (NOT `"sarita@example.com"`).<br>- Any stale cache of "Sarita Baiga" is purged immediately on initialization. |
| **Status** | `[ ] PASS  [ ] FAIL` |

---

| Test Case ID | `TC-AUTH-003` |
| :--- | :--- |
| **Title** | Password Reset OTP & Security Confirmation Dispatch |
| **Priority** | High |
| **Preconditions** | Active registered account |
| **Test Steps** | 1. Open `https://onodem.com/forgot-password`.<br>2. Enter registered account email and submit.<br>3. Check inbox for 5-digit verification code.<br>4. Enter code and new password, then submit.<br>5. Check inbox for security change confirmation.<br>6. Log in with the new password. |
| **Expected Result** | - Step 2 triggers an email from `info@onodem.com` with the 5-digit OTP.<br>- Code verification allows setting a new password.<br>- Password update triggers confirmation email *"Security Notification: Your password has been changed"*.<br>- Login succeeds with the new password. |
| **Status** | `[ ] PASS  [ ] FAIL` |

---

### Module 2: Creative Studio, Keepsakes & Dedications

| Test Case ID | `TC-STUDIO-001` |
| :--- | :--- |
| **Title** | Open Letter Creation with Dynamic Author Signature |
| **Priority** | High |
| **Preconditions** | User authenticated as `"Sharon"` |
| **Test Steps** | 1. Navigate to `https://onodem.com/creation-studio?type=letter`.<br>2. Set Mentor Name: `"Dr. Alan Turing"`.<br>3. Write message body: `"Thank you for shaping the foundations of how we think."`<br>4. Scroll down to the handwritten closing and signature line. |
| **Expected Result** | - Handwritten signoff automatically displays:<br>&nbsp;&nbsp;&nbsp;&nbsp;*With gratitude,*<br>&nbsp;&nbsp;&nbsp;&nbsp;**Sharon**<br>- The signature is editable and does not default to "Sarita Baiga". |
| **Status** | `[ ] PASS  [ ] FAIL` |

---

| Test Case ID | `TC-STUDIO-002` |
| :--- | :--- |
| **Title** | Mentor Dedication Email Dispatch |
| **Priority** | Critical |
| **Preconditions** | Letter or Memo draft open in Studio |
| **Test Steps** | 1. In the **Dedicate & Share** section below the editor, enter the Mentor's Email: `mentor.recipient@gmail.com`.<br>2. Ensure checkbox is selected: `[✓] Send email notification from info@onodem.com when saved`.<br>3. Click **Save Letter**.<br>4. Check inbox of `mentor.recipient@gmail.com`. |
| **Expected Result** | - Prompt confirms: *"Your post has been published and dedicated! We sent an email notification to mentor.recipient@gmail.com..."*<br>- Mentor receives an email from `info@onodem.com` with subject *"A tribute was dedicated to you by Sharon on Honour Your Mentor"*.<br>- Email contains the letter excerpt and a button linking to `https://onodem.com/memory-wall`. |
| **Status** | `[ ] PASS  [ ] FAIL` |

---

| Test Case ID | `TC-STUDIO-003` |
| :--- | :--- |
| **Title** | Public Feed & Memory Wall Syndication |
| **Priority** | High |
| **Preconditions** | Keepsake published with `[✓] Share this post publicly on Community Feed` checked |
| **Test Steps** | 1. Navigate to `https://onodem.com/memory-wall`.<br>2. Locate the most recent entry. |
| **Expected Result** | - Tribute appears immediately on the Community Feed.<br>- Author is displayed as `"Sharon"`.<br>- Content matches the saved story and dedication attributes. |
| **Status** | `[ ] PASS  [ ] FAIL` |

---

### Module 3: Voice Recording Studio & Audio Dedication

| Test Case ID | `TC-VOICE-001` |
| :--- | :--- |
| **Title** | Mentor Audio Note Playback (Listen Mode) |
| **Priority** | Medium |
| **Preconditions** | Any mentor profile open (`https://onodem.com/mentor-profile/1`) |
| **Test Steps** | 1. Scroll to the **Voice Notes & Audio Memos** section.<br>2. Tap any existing voice card or tap **Listen All**. |
| **Expected Result** | - Modal opens in Listen mode displaying *"Listening..."* and the mentor name.<br>- 9-bar soundwave animates dynamically.<br>- Tapping center pause button toggles playback and freezes waveform. |
| **Status** | `[ ] PASS  [ ] FAIL` |

---

| Test Case ID | `TC-VOICE-002` |
| :--- | :--- |
| **Title** | In-Browser Audio Capture (Record Mode) |
| **Priority** | High |
| **Preconditions** | Microphone connected / accessible in browser |
| **Test Steps** | 1. In the Voice Notes section of the mentor profile, tap **Record** (pink mic button).<br>2. Modal opens in **Record for Mentor** mode.<br>3. Tap **Tap to Record** and approve browser microphone permission.<br>4. Speak for 8–10 seconds; observe the live timer (`00:08`) and wavebars.<br>5. Tap **Stop Recording**. |
| **Expected Result** | - Timer starts counting up accurately.<br>- Wavebars pulsate in sync with recording state.<br>- Stopping switches status to *"Voice Note Ready"* and unlocks the dedication form. |
| **Status** | `[ ] PASS  [ ] FAIL` |

---

| Test Case ID | `TC-VOICE-003` |
| :--- | :--- |
| **Title** | Voice Note Dedication & Email Dispatch |
| **Priority** | High |
| **Preconditions** | `TC-VOICE-002` recording completed |
| **Test Steps** | 1. Fill in Title: `"Words That Guided My Thesis"`.<br>2. Enter Mentor Email: `mentor.audio@gmail.com`.<br>3. Ensure *"Send dedication email"* and *"Share on Community Feed"* are checked.<br>4. Click **Save & Dedicate Voice Note**. |
| **Expected Result** | - Success alert confirms voice note was dedicated.<br>- Email is sent from `info@onodem.com` to `mentor.audio@gmail.com` with direct listening link.<br>- Entry is added to the user's collection and the Memory Wall. |
| **Status** | `[ ] PASS  [ ] FAIL` |

---

### Module 4: Web Performance, Scanner & UI Hygiene

| Test Case ID | `TC-SYS-001` |
| :--- | :--- |
| **Title** | Zero React 418 SSR Hydration Warnings |
| **Priority** | Medium |
| **Preconditions** | Chrome / Edge DevTools Console open |
| **Test Steps** | 1. Load `https://onodem.com/`.<br>2. Hard-refresh the page (`Ctrl + Shift + R`).<br>3. Navigate through Home, Memory Wall, Creation Studio, and Profile. |
| **Expected Result** | - **0** occurrences of `Minified React error #418`.<br>- No visual jumping or flashing during initial page mount. |
| **Status** | `[ ] PASS  [ ] FAIL` |

---

| Test Case ID | `TC-SYS-002` |
| :--- | :--- |
| **Title** | QR Code Modal & Camera Scanner Verification |
| **Priority** | Medium |
| **Preconditions** | Desktop browser |
| **Test Steps** | 1. Click **Open on Phone** in the top navigation bar.<br>2. Verify QR Code tab.<br>3. Click **Camera Scanner** tab. |
| **Expected Result** | - High-contrast dark modal with jet-black on pure-white QR code.<br>- Camera Scanner tab launches live camera viewfinder (or provides image upload option if no webcam is present). |
| **Status** | `[ ] PASS  [ ] FAIL` |

---

| Test Case ID | `TC-SYS-003` |
| :--- | :--- |
| **Title** | Email Deliverability & SPF/DKIM/DMARC Header Check |
| **Priority** | Critical |
| **Preconditions** | Email received in Gmail / Outlook from `info@onodem.com` |
| **Test Steps** | 1. Open the received email in Gmail.<br>2. Click **More options (⋮)** -> **Show original**.<br>3. Inspect the authentication results header. |
| **Expected Result** | - `SPF: PASS with IP ... (secureserver.net)`<br>- `DKIM: PASS with domain onodem.com`<br>- `DMARC: PASS`<br>- Email lands directly in the primary **Inbox** (zero spam flags). |
| **Status** | `[ ] PASS  [ ] FAIL` |

---

## 4. QA Sign-Off Summary Sheet

| Module | Total Tests | Passed | Failed | Blocked | Sign-Off Date | Tester Initials |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 1. Authentication & Profile | 3 | | | | | |
| 2. Studio & Dedications | 3 | | | | | |
| 3. Voice Recording Studio | 3 | | | | | |
| 4. System Hygiene & DNS | 3 | | | | | |
| **Total** | **12** | | | | | |


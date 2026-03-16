# 👤 Profile Page

> **DevNote #06** — Covers `profile.html` + `js/pages/profile.js`

---

## 📍 URL
```
http://localhost:5000/profile
```

---

## 🗂️ Files Involved

| File | Role |
|---|---|
| `frontend/pages/profile.html` | Profile page HTML layout |
| `frontend/js/pages/profile.js` | All profile data loading + edit logic |
| `frontend/css/pages/profile.css` | Two-column layout, card styles, form styles |
| `frontend/css/base/variables.css` | Color tokens |
| `frontend/css/components/navbar.css` | Navbar styles |
| `frontend/css/components/sidebar.css` | Sidebar styles |
| `frontend/css/components/buttons.css` | Button styles |
| `frontend/css/components/toast.css` | Toast notification styles |
| `frontend/css/components/footer.css` | Footer styles |
| `frontend/components/Toast.js` | Success/error notifications |
| `frontend/js/services/apiService.js` | `fetchMe()`, `updateMe()`, `changePassword()` |
| `frontend/js/utils/navigation-utils.js` | `initNavigation()` |
| `frontend/js/utils/helpers.js` | `getOptimizedImageUrl(url, width)` |
| `Cloudinary` | Primary storage for profile photos |

---

## 🔐 Auth Guard

Top of `profile.js`:
```js
const userInfo = apiService.getUserInfo();
if (!userInfo) window.location.href = '/auth';
const TOKEN = userInfo?.token;
```
Not logged in → redirected to `/auth`.

---

## 🧩 HTML Structure (profile.html)

```
profile.html
│
├── #navbar-root              ← Navbar injected by JS
├── <aside> → #sidebar-root   ← Sidebar injected by JS
├── #toast-root               ← Toast notifications
│
└── <main class="profile-layout">  ← 2-column grid layout
    │
    ├── LEFT COLUMN: .card.av-card   ← Avatar + stats card
    │   ├── .av-img-wrapper     ← Clickable → triggers hidden file input
    │   │   ├── #avCircle       ← Shows photo OR initials letter
    │   │   └── .av-edit-overlay ← Pencil icon overlay on hover
    │   │
    │   ├── <input type="file" id="avatarInput" style="display:none">
    │   │   └── onchange="handleAvatarUpload(this)"
    │   │
    │   ├── #avName             ← User's full name (from backend)
    │   ├── #avRoll             ← Roll number (from backend)
    │   ├── #avRole             ← Branch + Year / "Administrator"
    │   │
    │   └── .av-stat-row        ← Quick stats row
    │       ├── #statListings   ← Number of listings
    │       ├── #statSold       ← Number sold
    │       └── #statWish       ← Number wishlisted
    │
    └── RIGHT COLUMN: .profile-right
        │
        ├── CARD 1: College Info (read-only, cannot change)
        │   └── #collegeInfoGrid   ← Populated by renderCollegeInfo()
        │       Shows: Name, Roll Number, Branch, Year, Hostel, Email
        │
        ├── CARD 2: Contact Info (user can change)
        │   ├── #fldPhone          ← Phone number input
        │   ├── #fldWhatsapp       ← WhatsApp number input
        │   ├── #fldSecEmail       ← Secondary email input
        │   └── #saveContactBtn "💾 Save Contact Info"
        │       onclick="saveContact()"
        │
        └── CARD 3: Change Password
            ├── #fldCurrentPass    ← Old password
            ├── #fldNewPass        ← New password
            ├── #fldConfirmPass    ← Confirm new password
            └── #changePassBtn "🔑 Update Password"
                onclick="changePassword()"

<footer> → #footer-root
```

---

## ⚙️ JavaScript (profile.js) — Detailed Walkthrough

### Constants
```js
const COLLEGE_FIELDS = [
    { key: 'name',          label: 'Full Name',     icon: '👤' },
    { key: 'roll',          label: 'Roll Number',   icon: '🎫' },
    { key: 'branch',        label: 'Branch',        icon: '📐' },
    { key: 'year',          label: 'Year',          icon: '📅' },
    { key: 'currentHostel', label: 'Current Hostel',icon: '🏠' },
    { key: 'email',         label: 'College Email', icon: '✉️' },
];
// These are displayed but CANNOT be changed via this page
```

### Functions Explained

```
profile.js
│
├── renderCollegeInfo(user)      ← Populates the read-only college info grid
│   ├── Maps COLLEGE_FIELDS array
│   └── Writes info-item cards into #collegeInfoGrid
│
├── renderAvatarCard(user, activity) ← Populates left avatar card
│   ├── Sets #avName, #avRoll, #avRole text
│   ├── Sets #statListings, #statSold, #statWish from activity data
│   └── Calls setAvatarDisplay(activity.img, initial)
│
├── setAvatarDisplay(imgUrl, initial)
│   ├── If imgUrl exists:
│   │   → Shows `<img src="cloudinary_url">` in #avCircle
│   │   → Uses `getOptimizedImageUrl(imgUrl, 256)` for the circle
│   │   → Makes background transparent
│   └── Else:
│       → Shows initial letter in #avCircle
│       → Restores background color
│
├── fillContactForm(user)        ← Pre-fills contact inputs from user data
│   ├── #fldPhone = user.phone
│   ├── #fldWhatsapp = user.whatsapp
│   └── #fldSecEmail = user.secondaryEmail
│
├── window.saveContact()         ← Saves phone/whatsapp/secondaryEmail
│   ├── Disables button, shows "Saving…"
│   ├── apiService.updateMe({ phone, whatsapp, secondaryEmail }, TOKEN)
│   │   → PUT /api/users/me
│   ├── On success: shows "Contact info saved ✅"
│   └── On error: shows error toast
│
├── window.changePassword()      ← Changes password
│   ├── Validates: all 3 fields filled
│   ├── Validates: newPass === confirmPass
│   ├── Validates: newPass.length >= 6
│   ├── apiService.changePassword(currentPass, newPass, TOKEN)
│   │   → PUT /api/users/me/password
│   ├── On success: clears all password fields, shows toast
│   └── On error: shows error with message from backend
│
├── window.handleAvatarUpload(input)  ← Profile photo upload
│   ├── Gets file from file input
│   ├── IMMEDIATELY shows local preview (FileReader → base64 URL)
│   ├── Creates FormData with file as "avatar"
│   ├── POST /api/users/me/avatar
│   ├── On success:
│   │   ├── Shows "Profile photo updated ✅" toast
│   │   ├── Updates localStorage userInfo.profileImage = json.imgURL
│   │   └── Calls setAvatarDisplay(json.imgURL) with Cloudinary URL
│   └── On error: shows error toast
│
└── DOMContentLoaded (async)
    ├── initNavigation()            → Navbar + Sidebar + Footer
    ├── initToast()                 → Toast system
    ├── Fetches data IN PARALLEL:
    │   ├── apiService.fetchMe(TOKEN)
    │   │   → GET /api/users/me
    │   └── fetch('/api/users/activity', ...)
    │       → GET /api/users/activity
    ├── renderAvatarCard(user, activity)
    ├── renderCollegeInfo(user)
    └── fillContactForm(user)
```

---

## 🌐 Backend API Calls

### Load Profile Data
```
apiService.fetchMe(TOKEN)
   ↓
GET /api/users/me
Header: Authorization: Bearer <token>
   ↓
userController.getMe
   ↓
userService.getUserById(userId)
   ↓
jsonDb.users.findById(userId)  ← reads users.json
   ↓
Returns user object WITHOUT password field:
{ _id, name, email, roll, branch, year, currentHostel, phone, whatsapp, secondaryEmail, role }
```

### Load Activity for Stats (parallel with above)
```
fetch('/api/users/activity', { headers: { Authorization: Bearer token } })
   ↓
GET /api/users/activity
   ↓
userController.getActivity
   ↓
productService.getUserActivity(userId)
   ↓
activityRepository.getOrCreate(userId)  ← reads userActivity.json
   ↓
Returns: { wishlisted: [...], listed: [...], sold: [...], img: "filename.jpg" }
```

### Save Contact Info
```
apiService.updateMe({ phone, whatsapp, secondaryEmail }, TOKEN)
   ↓
PUT /api/users/me   { phone, whatsapp, secondaryEmail }
   ↓
userController.updateMe
   └── Only these fields are accepted. Anything else is ignored.
   ↓
userService.updateUserProfile(userId, { phone, whatsapp, secondaryEmail })
   ↓
jsonDb.users.update(userId, patch)  ← updates users.json
   ↓
Returns updated user (without password)
```

### Change Password
```
apiService.changePassword(currentPass, newPass, TOKEN)
   ↓
PUT /api/users/me/password   { currentPassword, newPassword }
   ↓
userController.changePassword
   ├── Validates both fields present, newPassword.length >= 6
   ├── Finds user in users.json
   ├── bcrypt.compare(currentPassword, user.password) ← verify old pass
   │   └── If wrong → 401 "Current password is incorrect."
   ├── bcrypt.hash(newPassword, 10) ← hash the new password
   └── userService.updateUserProfile(userId, { password: hashedNew })
   ↓
Returns: { message: "Password updated successfully." }
```

### Upload Profile Photo
```
POST /api/users/me/avatar   FormData: { avatar: <file> }
   ↓
userController.uploadAvatar
   ├── Uploads file to Cloudinary
   ├── Destroys old avatar on Cloudinary if it exists
   └── activityRepository.update(userId, { profileImage: secure_url })
       → updates MongoDB
   ↓
Returns: { imgURL: "https://res.cloudinary.com/..." }
```

---

## 🔗 Navigation Links From This Page

| Where | Goes to |
|---|---|
| Navbar, Sidebar, Footer links | Home, Browse, Sell, Dashboard, Profile |
| No page-to-page links from content | (all actions stay on this page) |

---

## 🔄 Data Flow: User Uploads a Profile Photo

```
User clicks on avatar circle (av-img-wrapper)
      ↓
onclick triggers: document.getElementById('avatarInput').click()
      ↓
File picker opens → user selects an image
      ↓
onchange="handleAvatarUpload(this)" fires
      ↓
handleAvatarUpload(input):
  1. Gets file = input.files[0]
  2. FileReader.readAsDataURL(file) → base64 preview
     → IMMEDIATELY shows in #avCircle (user sees photo right away)
  3. Creates FormData with avatar = file
  4. fetch('/api/users/me/avatar', { method: 'POST', body: formData, ... })
      ↓
Backend (userController.uploadAvatar):
  → multer intercepts: saves file as "userId_timestamp.jpg"
     to /data/profile-images/
  → Reads userActivity.json for old avatar filename
  → Deletes old file from disk if exists
  → activityRepository.update(userId, { img: "userId_timestamp.jpg" })
     → writes to userActivity.json
  → Returns: { img: "userId_timestamp.jpg", url: "/profile-images/..." }
      ↓
Frontend:
  → Shows toast "Profile photo updated ✅"
  → Updates localStorage: userInfo.profileImage = "userId_timestamp.jpg"
  → setAvatarDisplay("userId_timestamp.jpg") replaces base64 with real URL
  → Next time sidebar loads, it reads profileImage from localStorage → shows photo
```

---

## 💡 Key Things to Know

- **Two types of data** are loaded in parallel: `users.json` data (name, roll, email, etc.) via `/api/users/me`, and activity data (listing counts, sold counts, wishlisted count, profile image filename) via `/api/users/activity`.
- **Read-only fields** (name, roll, branch, year, hostel, email) come from users.json and are displayed as text only — no edit inputs for these.
- **Changeable fields** (phone, whatsapp, secondary email, password, profile photo) all have dedicated backend endpoints.
- **Profile image is stored in userActivity.json**, NOT in users.json. The `img` field is part of the activity record, not the user record.
- **The profile photo takes 2 steps:** First it shows a local preview (instant, using FileReader + base64), then it's uploaded to the server and the real URL is set (which may take a second or two).
- **Sidebar also updates:** After uploading, `localStorage.userInfo.profileImage` is updated. The next time the sidebar renders (e.g., on the next page visit), it will show the new photo.

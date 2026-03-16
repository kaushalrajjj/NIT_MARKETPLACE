# 🔐 Login / Auth Page

> **DevNote #02** — Covers `auth.html` + `js/pages/auth.js`

---

## 📍 URL
```
http://localhost:5000/auth
```

---

## 🗂️ Files Involved

| File | Role |
|---|---|
| `frontend/pages/auth.html` | Login form HTML |
| `frontend/js/pages/auth.js` | Login form logic, calls backend |
| `frontend/css/auth.css` | Auth-page-specific styling (TWO-PANEL layout) |
| `frontend/css/base/variables.css` | Color tokens |
| `frontend/css/base/reset.css` | Browser resets |
| `frontend/css/components/buttons.css` | Button styles |
| `frontend/css/components/navbar.css` | Navbar styles |
| `frontend/css/components/sidebar.css` | Sidebar styles |
| `frontend/css/components/toast.css` | Toast notification styles |
| `frontend/components/Navbar.js` | Injects navbar HTML |
| `frontend/components/Sidebar.js` | Injects sidebar HTML |
| `frontend/components/Toast.js` | Shows success/error messages |
| `frontend/js/utils/navigation-utils.js` | `initNavigation()` |
| `frontend/js/services/apiService.js` | `apiService.login()` — sends POST to backend |

---

## 🧩 HTML Structure (auth.html)

```
auth.html
│
├── #navbar-root          ← Navbar injected by JS
├── #sidebar-root         ← Sidebar injected by JS
├── #toast-root           ← Toast system
│
└── <div class="auth-page">
    │
    ├── LEFT PANEL (.auth-left)
    │   ├── Curved animated blobs (decoration)
    │   ├── Headline: "The Smarter Way to Trade on Campus"
    │   ├── Tagline about 1,800+ students
    │   └── 3 trust features (Verified Users / Face-to-Face / Zero Commission)
    │
    └── RIGHT PANEL (.auth-right)
        └── #loginCard (.auth-card)
            ├── Title: "Welcome"
            ├── <form onsubmit="handleLogin(event)">
            │   ├── Email input: id="loginEmail"
            │   │   └── oninput="validateEmail(this, 'login')"
            │   ├── Password input: id="loginPass"
            │   ├── Remember me checkbox: id="rememberMe"
            │   └── Submit button: id="loginBtn"
            │       ├── #loginBtnText = "Sign In"
            │       └── #loginSpinner  = loading spinner
            └── Copyright notice
```

> **Note:** Register/Signup form was removed. Only login exists now.

---

## ⚙️ JavaScript (auth.js)

```
auth.js
│
├── import apiService from apiService.js
├── import initNavigation from navigation-utils.js
├── import getToastHTML, initToast from Toast.js
│
├── window.validateEmail(input, prefix)
│   ├── Called while typing in email field
│   ├── Checks if value ends with "@nitkkr.ac.in"
│   ├── Shows/hides #loginEmailErr error message
│   └── Adds/removes "error" CSS class on input
│
├── window.handleLogin(e)    ← called by form's onsubmit
│   ├── Prevents default form submission
│   ├── Validates that both email and password are filled
│   ├── Shows loading spinner, disables button
│   ├── Calls: apiService.login(email, password)
│   │         → sends POST /api/auth/login
│   ├── On SUCCESS:
│   │   ├── Saves response to localStorage as "userInfo"
│   │   │   (contains: _id, name, email, role, token, profileImage)
│   │   ├── Shows success toast
│   │   └── Redirects to `/` (Home) after 800ms
│   └── On FAILURE:
│       ├── Shows error toast with message
│       └── Re-enables button + hides spinner
│
└── DOMContentLoaded
    ├── Adds class "auth-body" to <body> (changes layout to full-height)
    ├── initNavigation() → injects Navbar + Sidebar + Footer
    └── Injects toast HTML + initToast()
```

---

## 🌐 Backend API Call

```
Frontend (auth.js)                    Backend (authRoutes.js → authController.js → authService.js)
─────────────────────────────────────────────────────────────────────────────────────────────────
apiService.login(email, password)
  ↓
POST /api/auth/login
  { email, password }
  ↓
authController.login(req, res)
  ↓
authService.login(email, password)
  ├── jsonDb.users.findOne({ email })      ← Check users.json
  ├── If not found: jsonDb.admins.findOne({ email }) ← Check admins.json
  ├── bcrypt.compare(password, user.password) ← Verify password
  └── Returns: { _id, name, email, role, profileImage, token }
  ↓
Response: 200 OK → { token, _id, name, email, role, profileImage }
          401 Unauthorized → { message: "Invalid email or password" }
```

---

## 🔗 Navigation Links From This Page

| Where | Goes to |
|---|---|
| After successful login | `/` (redirect) |
| Navbar: Home | `/` |
| Navbar: Browse | `/browse` |
| Sidebar: Home | `/` |
| Sidebar: Browse Items | `/browse` |
| Sidebar: Sell an Item | `/sell` |
| Sidebar: Wishlist | `/dashboard?tab=wishlist` |
| Sidebar: My Profile | `/profile` |

---

## 🔄 Data Flow on Login

```
User fills email + password → clicks "Sign In"
       ↓
handleLogin() runs
       ↓
apiService.login("user@nitkkr.ac.in", "password123")
       ↓
POST /api/auth/login  →  Express router → authController → authService
       ↓
authService checks:
  1. users.json    → find { email: "user@nitkkr.ac.in" }
  2. admins.json   → if not found in users
  3. bcrypt.compare(plaintext, hashedPassword)
       ↓
generateToken(user._id)  → creates a JWT
       ↓
Returns JSON to frontend:
  { _id, name, email, role, profileImage, token }
       ↓
Frontend: localStorage.setItem("userInfo", JSON.stringify(response))
       ↓
Redirect to `/` (Home)
```

---

## 💡 Key Things to Know

- **Email Validation:** Only `@nitkkr.ac.in` emails are allowed. This is validated on the frontend AND the backend (for registration, which is currently disabled).
- **Password Storage:** Passwords are stored as **bcrypt hashes** in `users.json`. The plain text password is never stored.
- **Role Detection:** If the email matches in `admins.json`, the user gets `role: "admin"` and is redirected to the admin dashboard.
- **Token Storage:** The JWT token is stored in `localStorage`. It expires when you log out (which removes it from localStorage). There's no server-side session.
- **The Left Panel** (with the blue background and blobs) is purely decorative CSS. The actual login form is in the right panel.

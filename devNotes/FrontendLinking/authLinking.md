# Linking Map: Authentication Page (auth.html)

This file shows all the dependencies and connections for the **Login & Signup Page**.

## 🏗️ 1. File Structure Links

```mermaid
graph TD
    HTML[frontend/pages/auth.html]
    
    subgraph CSS_FILES [CSS Styling]
        STYLE_BASE[frontend/css/base/fonts.css<br>frontend/css/base/variables.css<br>frontend/css/base/reset.css]
        STYLE_COMP[frontend/css/components/buttons.css<br>frontend/css/components/navbar.css]
        STYLE_PAGE[frontend/css/pages/auth.css]
    end

    subgraph JS_FILES [JavaScript Logic]
        JS_PAGE[frontend/js/pages/auth.js]
        JS_NAV[frontend/js/utils/navigation-utils.js]
        JS_API_AUTH[frontend/js/api/authApi.js]
        JS_HELP[frontend/js/utils/helpers.js]
        JS_AUTH_HELP[frontend/js/utils/auth-helper.js]
    end

    subgraph INJECTED_COMP [UI Components]
        COMP_NAV[frontend/components/Navbar.js]
        COMP_SIDE[frontend/components/Sidebar.js]
        COMP_FOOT[frontend/components/Footer.js]
    end

    subgraph ASSETS [Assets & Media]
        ASSET_IMG[frontend/assets/images/*]
        ASSET_FONT[frontend/assets/fonts/*]
        ASSET_ICON[External: FontAwesome Icons]
    end

    HTML -->|1. Loads| STYLE_BASE
    HTML -->|2. Loads| STYLE_COMP
    HTML -->|3. Loads| STYLE_PAGE
    HTML -->|4. Loads| JS_PAGE
    
    JS_PAGE -->|Imports| JS_NAV
    JS_PAGE -->|Imports| JS_API_AUTH
    JS_PAGE -->|Imports| JS_HELP
    JS_PAGE -->|Imports| JS_AUTH_HELP
    
    JS_NAV -->|Injects| COMP_NAV
    JS_NAV -->|Injects| COMP_SIDE
    JS_NAV -->|Injects| COMP_FOOT
    
    STYLE_BASE -->|References| ASSET_FONT
    HTML -->|Displays| ASSET_IMG
    HTML -->|Displays| ASSET_ICON
```

---

## 📂 2. Dependency Details

### 🎨 Stylesheets
*   **Base Styles**: Sets the foundation (Fonts, Global Variables, CSS Reset).
*   **Component Styles**: Handles the look of common elements used on Auth page (Buttons, Nav).
*   **Page Styles (`auth.css`)**: Contains the layout for the two-panel split screen (Left branding panel and Right form panel), animations for floating cards, and transition logic for multi-step signup.

### 🧠 JavaScript Execution
1.  **`auth.js`**: manages the user session and form submissions.
    *   **Login Handler**: Validates inputs and talks to `authApi.js` to log the user in.
    *   **Multi-step Signup**: Handles transition between "Account", "Profile", and "Verify" steps.
    *   **OTP Timer**: Manages the 30-second countdown for the email verification code.
2.  **`auth-helper.js`**: Reusable logic to check if a user is already signed in (redirects them if they are) and updates profile avatars in the UI.

### 🧱 Injected Components
Wait... **`auth.html` uses a custom design!** 
While it imports `navigation-utils.js`, it often overrides the default sidebar/navbar to focus the user on the login forms. However, the footer and global navigation components are still linked for fallback and redirections.

---

## 🖼️ 3. Asset Loading
*   **Fonts**: Uses Lora for headlines and Figtree for form inputs.
*   **Icons**: Extensive use of FontAwesome for input icons (Lock, Envelope, User) and the "Success" checkmarks.
*   **Dynamic UI**: The page uses "Floating Cards" that showcase recently sold items—these refer to placeholders and emojis in the code.

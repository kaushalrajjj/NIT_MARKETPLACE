# Linking Map: Sell Page (sell.html)

This file shows all the dependencies and connections for the **Sell an Item Page**.

## 🏗️ 1. File Structure Links

```mermaid
graph TD
    HTML[frontend/html/sell.html]
    
    subgraph CSS_FILES [CSS Styling]
        STYLE_BASE[frontend/css/base/fonts.css<br>frontend/css/base/variables.css<br>frontend/css/base/reset.css]
        STYLE_COMP[frontend/css/components/buttons.css<br>frontend/css/components/navbar.css<br>frontend/css/components/sidebar.css]
        STYLE_PAGE[frontend/css/pages/sell.css]
    end

    subgraph JS_FILES [JavaScript Logic]
        JS_PAGE[frontend/js/pages/sell.js]
        JS_NAV[frontend/js/utils/navigation-utils.js]
        JS_API_AUTH[frontend/js/api/authApi.js]
    end

    subgraph INJECTED_COMP [UI Components]
        COMP_NAV[frontend/components/Navbar.js]
        COMP_SIDE[frontend/components/Sidebar.js]
    end

    subgraph ASSETS [Assets & Media]
        ASSET_FONT[frontend/assets/fonts/*]
        ASSET_ICON[External: FontAwesome Icons]
    end

    HTML -->|1. Loads| STYLE_BASE
    HTML -->|2. Loads| STYLE_COMP
    HTML -->|3. Loads| STYLE_PAGE
    HTML -->|4. Loads| JS_PAGE
    
    JS_PAGE -->|Imports| JS_NAV
    JS_PAGE -->|Imports| JS_API_AUTH
    
    JS_NAV -->|Injects| COMP_NAV
    JS_NAV -->|Injects| COMP_SIDE
    
    STYLE_BASE -->|References| ASSET_FONT
    HTML -->|Displays| ASSET_ICON
```

---

## 📂 2. Dependency Details

### 🎨 Stylesheets
*   **Base Styles**: Shared typography (Figtree/Syne) and theme variables.
*   **Component Styles**: Handled the layout for buttons and the global responsive Navbar/Sidebar.
*   **Page Styles (`sell.css`)**: Specific styling for the submission form, including the `form-grid` layout, input focus states, and the photo upload preview box.

### 🧠 JavaScript Execution
1.  **`sell.js`**: The form controller for posting items.
    *   **Auth Check**: Immediately verifies if a user is logged in using `authApi.js`. Redirects to `/auth` if not.
    *   **Navigation Init**: Calls `initNavigation()` to build the page structure.
    *   **Form Submission**: Captures all input fields (Title, Category, Price, etc.) and sends a `POST` request to `/api/products` using the user's secure token.
    *   **Redirection**: On success, redirects the student to their **Dashboard** to see their new listing.

### 🧱 Injected Components
*   `Navbar.js`: The top navigation.
*   `Sidebar.js`: The mobile slide-out menu.
*   **Note**: This page is highly functional, focusing on the form structure. It doesn't use the `Footer.js` component to keep the interface clean and focused on the task of selling.

---

## 🖼️ 3. Asset Loading
*   **Fonts**: Loaded from `assets/fonts/`.
*   **Icons**: FontAwesome icons used for form feedback (Cloud-arrow-up for photo preview, Plus for publishing).
*   **User Data**: Fetches the logged-in student's token from `localStorage` to authorize the listing creation.

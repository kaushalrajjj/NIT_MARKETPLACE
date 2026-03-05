# Linking Map: Dashboard Page (dashboard.html)

This file shows all the dependencies and connections for the **User Dashboard**.

## 🏗️ 1. File Structure Links

```mermaid
graph TD
    HTML[frontend/html/dashboard.html]
    
    subgraph CSS_FILES [CSS Styling]
        STYLE_BASE[frontend/css/base/fonts.css<br>frontend/css/base/variables.css<br>frontend/css/base/reset.css]
        STYLE_COMP[frontend/css/components/buttons.css<br>frontend/css/components/navbar.css<br>frontend/css/components/sidebar.css<br>frontend/css/components/footer.css<br>frontend/css/components/product-card.css<br>frontend/css/components/modal.css]
        STYLE_PAGE[frontend/css/pages/dashboard.css]
    end

    subgraph JS_FILES [JavaScript Logic]
        JS_PAGE[frontend/js/pages/dashboard.js]
        JS_NAV[frontend/js/utils/navigation-utils.js]
        JS_API_PROD[frontend/js/api/productApi.js]
        JS_API_AUTH[frontend/js/api/authApi.js]
        JS_HELP[frontend/js/utils/helpers.js]
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
    JS_PAGE -->|Imports| JS_API_PROD
    JS_PAGE -->|Imports| JS_API_AUTH
    JS_PAGE -->|Imports| JS_HELP
    
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
*   **Base Styles**: Shared typography (Figtree/Syne) and CSS variables.
*   **Component Styles**: Handles the common UI (Navbar, Modal for details) and the `product-card.css` for listing layouts.
*   **Page Styles (`dashboard.css`)**: Specific styles for the dashboard statistics cards, listing status badges (Active/Sold), and the action buttons (Mark Sold, Delete).

### 🧠 JavaScript Execution
1.  **`dashboard.js`**: The dashboard's main engine.
    *   **Auth Guard**: Immediately checks for a valid session; redirects to `/auth` if the user isn't logged in.
    *   **Data Hub**: Calls `fetchMyProducts` from `productApi.js` to get the user's specific listings.
    *   **Management Actions**: Handles interactive functions like `markAsSold` and `deleteProduct`.
    *   **UI Control**: Manages the grid/list view toggle and local sorting.
2.  **`productApi.js`**: Essential for the "Mark as Sold" and "Delete" backend communication.

### 🧱 Injected Components
*   `Navbar.js`: Standard cross-site header.
*   `Sidebar.js`: Navigation menu.
*   `Footer.js`: Bottom links.
*   **Note**: The product cards in the dashboard use a local template in `dashboard.js` rather than the external `productCard.js` component to allow for "Mark Sold" and "Delete" buttons.

---

## 🖼️ 3. Asset Loading
*   **Fonts**: Loaded from `assets/fonts/`.
*   **Icons**: FontAwesome icons for the dashboard (Plus circle for selling, Trash for deleting, Clock for time).
*   **Status Indicators**: CSS-driven color coding for Active (Green) and Sold (Red) statuses.

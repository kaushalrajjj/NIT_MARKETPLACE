# Linking Map: Home Page (index.html)

This file shows all the dependencies and connections for the **Home Page**.

## 🏗️ 1. File Structure Links

```mermaid
graph TD
    HTML[frontend/pages/index.html]
    
    subgraph CSS_FILES [CSS Styling]
        STYLE_BASE[frontend/css/base/fonts.css<br>frontend/css/base/variables.css<br>frontend/css/base/reset.css]
        STYLE_COMP[frontend/css/components/buttons.css<br>frontend/css/components/navbar.css<br>frontend/css/components/sidebar.css<br>frontend/css/components/footer.css]
        STYLE_PAGE[frontend/css/pages/index.css]
    end

    subgraph JS_FILES [JavaScript Logic]
        JS_PAGE[frontend/js/pages/index.js]
        JS_NAV[frontend/js/utils/navigation-utils.js]
        JS_API[frontend/js/api/productApi.js]
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
    JS_PAGE -->|Imports| JS_API
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
*   **Base Styles**: Sets the foundation (Fonts, Global Variables, CSS Reset).
*   **Component Styles**: Handles the look of common elements used on Home (Buttons, Nav, Sidebar).
*   **Page Styles (`index.css`)**: Specific styling for the Hero section, Trust & Safety cards, and CTA banners.

### 🧠 JavaScript Execution
1.  **`index.js`**: The main controller. 
    *   Triggers `initNavigation()` to build the page layout.
    *   Initializes the **Scroll Reveal** effect (making elements fade in as you scroll).
    *   Fetches public stats (total listings, etc.) from the backend.
2.  **`navigation-utils.js`**: Reusable script that picks up the pure HTML from the component files and injects it into the DOM.

### 🧱 Injected Components
Since `index.html` has empty root divs (`#navbar-root`, `#sidebar-root`), the following files provide the actual HTML:
*   `Navbar.js`: Provides the top logo and search bar.
*   `Sidebar.js`: Provides the mobile slide-out menu.
*   `Footer.js`: Provides the site map at the bottom.

---

## 🖼️ 3. Asset Loading
*   **Fonts**: Loaded via `fonts.css` from `frontend/assets/fonts/Figtree` and `Lora`.
*   **Icons**: Using FontAwesome CDN classes (e.g., `<i class="fa-solid fa-house"></i>`).
*   **Images**: Any logos or background textures reside in `frontend/assets/images/`.

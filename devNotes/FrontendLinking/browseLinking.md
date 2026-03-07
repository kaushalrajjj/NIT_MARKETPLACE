# Linking Map: Browse Page (browse.html)

This file shows all the dependencies and connections for the **Browse Marketplace Page**.

## 🏗️ 1. File Structure Links

```mermaid
graph TD
    HTML[frontend/pages/browse.html]
    
    subgraph CSS_FILES [CSS Styling]
        STYLE_BASE[frontend/css/base/fonts.css<br>frontend/css/base/variables.css<br>frontend/css/base/reset.css]
        STYLE_COMP[frontend/css/components/buttons.css<br>frontend/css/components/navbar.css<br>frontend/css/components/sidebar.css<br>frontend/css/components/footer.css<br>frontend/css/components/product-card.css<br>frontend/css/components/modal.css]
        STYLE_PAGE[frontend/css/pages/browse.css]
    end

    subgraph JS_FILES [JavaScript Logic]
        JS_PAGE[frontend/js/pages/browse.js]
        JS_NAV[frontend/js/utils/navigation-utils.js]
        JS_API_PROD[frontend/js/api/productApi.js]
        JS_API_AUTH[frontend/js/api/authApi.js]
        JS_HELP[frontend/js/utils/helpers.js]
    end

    subgraph INJECTED_COMP [UI Components]
        COMP_NAV[frontend/components/Navbar.js]
        COMP_SIDE[frontend/components/Sidebar.js]
        COMP_FOOT[frontend/components/Footer.js]
        COMP_PCARD[frontend/components/productCard.js]
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
    JS_PAGE -->|Uses| COMP_PCARD
    
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
*   **Base Styles**: Foundation layer (Typography, HSL Color variables).
*   **Component Styles**: 
    *   `product-card.css`: Vital for layout out the search results.
    *   `modal.css`: Required for the "Quick View" item detail popup.
*   **Page Styles (`browse.css`)**: Handles the complex grid/list toggle layout and the filter sidebar.

### 🧠 JavaScript Execution
1.  **`browse.js`**: The controller for the marketplace experience.
    *   **Data Fetching**: Requests products from `productApi.js` based on URL filters.
    *   **Filtering Engine**: Handles price ranges, categories, and hostel locations.
    *   **Modal Controller**: Opens and populates the "Quick View" modal with item details and seller contact info.
    *   **View Switcher**: Toggles between `grid` and `list` layouts for items.
2.  **`productCard.js`**: Unlike the main layouts, this component is called repeatedly to generate the HTML for every single search result.

### 🧱 Injected Components
*   `Navbar.js`: Main header.
*   `Sidebar.js`: Mobile navigation drawer.
*   `Footer.js`: Bottom links.
*   `productCard.js`: The "Building Block" of the marketplace results.

---

## 🖼️ 3. Asset Loading
*   **Fonts**: Fetched locally from `assets/fonts/` (Syne for headings, Figtree/Lora for body).
*   **Icons**: Dynamic icons like Category Emojis are generated via `helpers.js`, while UI icons (Filter, x-mark) come from FontAwesome.
*   **Modal Images**: The "Quick View" modal dynamically renders large emojis or placeholder images from the asset folder.

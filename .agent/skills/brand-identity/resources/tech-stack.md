# Preferred Tech Stack & Implementation Rules

When generating code or UI components for this brand, you **MUST** strictly adhere to the following technology choices.

## Core Stack

- **Framework:** Vanilla HTML5, CSS3, ES6+ JavaScript. (No React/Vue unless explicitly requested for a new app).
- **Styling Engine:** Native CSS with CSS Variables (`var(--primary)`). No Sass/Tailwind.
- **Component Library:** Custom "Tubelight" components (Navbar, Footer) as defined in `JS/navbar.js`.
- **Icons:** Font Awesome 6 (via CDN).

## Implementation Guidelines

### 1. CSS Usage

- Use CSS Variables defined in `style.css` for all colors and spacing.
- **Dark Mode:** Implement dark mode using `[data-theme="dark"]` selector in CSS.
- **Responsiveness:** Mobile-first media queries.

### 2. Component Patterns

- **Buttons:** Use `.btn` classes. Primary actions use variable `--primary`.
- **Forms:** Labels must always be placed _above_ input fields.
- **Layout:** Use Flexbox and CSS Grid.
- **JavaScript:** Use modular JS files (ES Modules) where possible, or script tags in `index.html`.

### 3. Forbidden Patterns

- Do NOT use jQuery.
- Do NOT use Bootstrap classes (unless already present, but prefer custom).
- Do NOT introduce build steps (Webpack/Vite) unless creating a separate sub-project.

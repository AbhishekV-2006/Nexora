/**
 * PostCSS Configuration
 * 
 * TECHNOLOGY: PostCSS with Tailwind and Autoprefixer
 * WHY: PostCSS plugins process CSS for modern browser compatibility
 * - Tailwind: Converts utility classes to CSS
 * - Autoprefixer: Adds vendor prefixes (-webkit-, -moz-) for older browsers
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Works with Vite to process CSS in development and production
 * - Ensures Tailwind utilities are compiled to actual CSS
 * - Maintains browser compatibility across user base
 */

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

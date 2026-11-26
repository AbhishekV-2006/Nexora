/**
 * Tailwind CSS Configuration
 * 
 * TECHNOLOGY: Tailwind CSS - Utility-first CSS framework
 * WHY: Rapid UI development with pre-defined utility classes
 * - No custom CSS file maintenance - styles defined inline in JSX
 * - Consistent design system with predefined colors, spacing, typography
 * - Tree-shaking removes unused styles in production (smaller bundles)
 * - Highly customizable for brand colors and design tokens
 * 
 * NEXORA ARCHITECTURE FIT:
 * - Enables consistent UI across freelancer marketplace
 * - Quick prototyping with Material UI-like components
 * - Responsive design utilities (sm:, md:, lg:) for mobile-first approach
 * - Can integrate with Material UI components for advanced components
 */

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1", // Indigo - for CTAs and primary actions
        secondary: "#8b5cf6", // Purple - for secondary elements
        success: "#10b981", // Green - for success states
        danger: "#ef4444", // Red - for errors and destructive actions
        warning: "#f59e0b", // Amber - for warnings
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

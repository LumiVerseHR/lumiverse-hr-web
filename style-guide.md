# LumiVerse Design System & Style Guide

This document defines the design system for the LumiVerse website. Follow these guidelines to maintain consistency across all pages.

---

## Brand Identity

**Company:** LumiVerse - AI Solutions Studio
**Tagline:** "We build intelligent systems"
**Tone:** Professional, bold, confident, no-hype, results-focused

---

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Background Primary | `#050508` | Main page background |
| Background Secondary | `#0c0c10` | Section alternation, cards |
| Background Tertiary | `#111116` | Elevated elements |

### Accent Colors
| Name | Hex | Usage |
|------|-----|-------|
| Accent (Coral) | `#FF4D4D` | Primary CTAs, highlights, icons |
| Accent Secondary (Orange) | `#FF8F4D` | Gradient midpoint |
| Accent Tertiary (Cyan) | `#4DFFFF` | Secondary project themes, variety |

### Text Colors
| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#FAFAFA` | Headings, important text |
| Text Secondary | `#888888` | Body text, descriptions |
| Text Muted | `#555555` | Subtle labels, captions |

### Gradients
```css
/* Primary accent gradient */
--gradient-accent: linear-gradient(135deg, #FF4D4D 0%, #FF8F4D 50%, #FFD54D 100%);

/* Cool gradient (for variety) */
--gradient-cool: linear-gradient(135deg, #4DFFFF 0%, #4D9FFF 100%);
```

### Glass Effect
```css
--glass: rgba(255,255,255,0.03);
--glass-border: rgba(255,255,255,0.08);
```

---

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

Load from Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
```

### Type Scale

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `.display-xl` | clamp(3.5rem, 12vw, 10rem) | 800 | Hero headlines |
| `.display-lg` | clamp(2.5rem, 8vw, 6rem) | 700 | Page titles |
| `.display-md` | clamp(2rem, 5vw, 4rem) | 700 | Section titles |
| `.heading-lg` | clamp(1.5rem, 3vw, 2.5rem) | 600 | Card titles |
| `.heading-md` | clamp(1.25rem, 2vw, 1.75rem) | 600 | Subsection titles |
| `.body-lg` | 1.25rem | 400 | Lead paragraphs |
| `.body-md` | 1rem | 400 | Body text |
| `.label` | 0.75rem | 600 | Labels, tags (uppercase) |

### Letter Spacing
- Display text: `-0.02em` to `-0.04em` (tighter)
- Body text: Normal
- Labels: `0.1em` to `0.15em` (wider, uppercase)

---

## Layout System

### Container Widths
```css
.container { max-width: 1400px; padding: 0 2rem; }
.container-wide { max-width: 1600px; padding: 0 2rem; }
```

### Section Spacing
```css
.section { padding: 8rem 0; }
/* Mobile: padding: 5rem 0; */
```

### Grid System
Use CSS Grid for layouts:
```css
.bento-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(3, 1fr);
}

/* Responsive breakpoints */
@media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 768px) { grid-template-columns: 1fr; }
```

---

## Components

### Navigation
- Fixed position with blur backdrop on scroll
- Logo with animated dot indicator
- Desktop: horizontal links + CTA button
- Mobile: hamburger menu with full-screen overlay

```css
.nav {
  position: fixed;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--glass-border);
}
```

### Buttons

**Primary Button (CTA)**
```css
.btn-primary {
  background: var(--accent);
  color: var(--bg-primary);
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
}
.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 77, 77, 0.35);
}
```

**Secondary Button**
```css
.btn-secondary {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
}
.btn-secondary:hover {
  background: var(--glass);
}
```

**Ghost Button (Links)**
```css
.btn-ghost {
  background: transparent;
  color: var(--accent);
  padding: 0;
}
```

### Cards

**Bento Card**
```css
.bento-card {
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 2.5rem;
  transition: all 0.4s ease;
}
.bento-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 77, 77, 0.3);
}
```

**Project Card**
- Image section with overlay gradient
- Content section with tag, title, description
- Feature pills/tags
- Ghost link button

### Icons
Use Font Awesome 6:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

**Icon Container**
```css
.bento-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 77, 77, 0.15), rgba(255, 143, 77, 0.1));
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}
```

### Feature Lists
```css
.feature-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
}
.feature-list-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 77, 77, 0.15);
  color: var(--accent);
}
```

---

## Page Patterns

### Hero Section
- Minimum height: 100vh (homepage) or 80vh (subpages)
- Animated mesh gradient background
- Floating geometric shapes
- Label pill at top
- Massive headline with gradient word
- Subtitle paragraph
- Two CTAs (primary + secondary)

```html
<section class="hero">
  <div class="mesh-gradient"></div>
  <div class="geo-shape geo-shape-1"></div>
  <div class="container">
    <div class="hero-label">
      <span class="hero-label-dot"></span>
      Label Text
    </div>
    <h1 class="display-xl">Headline</h1>
    <p class="hero-subtitle">Description</p>
    <div class="hero-ctas">
      <a href="#" class="btn btn-primary">Primary CTA</a>
      <a href="#" class="btn btn-secondary">Secondary CTA</a>
    </div>
  </div>
</section>
```

### Section Header
```html
<div class="section-header">
  <span class="section-label">LABEL</span>
  <h2 class="display-md section-title">Section Title</h2>
  <p class="section-description">Description text here.</p>
</div>
```

### Case Study Pages
1. Breadcrumb navigation
2. Project tag pill
3. Large title
4. Description
5. CTAs
6. Hero image showcase
7. Stats bar (4 columns)
8. Feature sections (alternating layout)
9. Bento grid for technical details
10. CTA section with gradient background

### Process/Steps Section
```html
<div class="process-grid">
  <div class="process-step">
    <div class="process-number">01</div>
    <h3 class="process-title">Step Title</h3>
    <p class="process-text">Description</p>
  </div>
  <!-- Repeat for each step -->
</div>
```

### Contact Section
- Two-column layout
- Left: contact info with icon boxes
- Right: CTA card with booking button

### Footer
- Four-column grid (brand, services, work, contact)
- Bottom bar with copyright and social links

---

## Animations & Effects

### Mesh Gradient Animation
```css
.mesh-gradient {
  background:
    radial-gradient(ellipse 80% 80% at 80% 20%, rgba(255, 77, 77, 0.3), transparent),
    radial-gradient(ellipse 60% 60% at 60% 80%, rgba(255, 143, 77, 0.2), transparent);
  filter: blur(60px);
  animation: meshMove 20s ease-in-out infinite;
}

@keyframes meshMove {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(5%, -5%) scale(1.1); }
  50% { transform: translate(-5%, 5%) scale(0.95); }
  75% { transform: translate(3%, 3%) scale(1.05); }
}
```

### Floating Shapes
```css
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(15deg); }
  50% { transform: translateY(-20px) rotate(15deg); }
}
```

### Logo Dot Pulse
```css
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}
```

### Card Hover
```css
.card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 77, 77, 0.3);
}
```

### Button Hover
```css
.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 77, 77, 0.35);
}
```

---

## Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| `1200px` | Large tablets, small desktops |
| `992px` | Tablets (hide desktop nav) |
| `768px` | Mobile landscape |
| `640px` | Mobile portrait |

### Key Responsive Changes
- Navigation: desktop links → hamburger menu at 992px
- Grids: 3-col → 2-col → 1-col
- Section padding: 8rem → 5rem
- Typography scales down via clamp()

---

## Image Guidelines

### Sources
- Unsplash: `https://images.unsplash.com/photo-ID?auto=format&fit=crop&w=800&q=80`
- Local images: `/images/` directory

### Project Images
- Aspect ratio: 16:9 or similar
- Add gradient overlay for text readability
- Use `object-fit: cover`

### Image Showcase
```css
.image-showcase img {
  width: 100%;
  border-radius: 16px;
  border: 1px solid var(--glass-border);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
}
```

---

## Code Standards

### HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Google Analytics -->
  <!-- Meta tags -->
  <!-- CSS: styles.css + Google Fonts + Font Awesome -->
  <!-- Page-specific styles in <style> block -->
</head>
<body>
  <nav class="nav">...</nav>
  <div class="mobile-nav">...</div>

  <!-- Page sections -->
  <section class="hero">...</section>
  <section class="section">...</section>
  <section class="section section-dark">...</section>

  <footer class="footer">...</footer>

  <!-- JavaScript at bottom -->
  <script>
    // Nav scroll effect
    // Mobile nav toggle
    // Smooth scroll
  </script>
</body>
</html>
```

### CSS Organization
1. CSS variables in `:root`
2. Reset and base styles
3. Typography classes
4. Layout (container, grid)
5. Components (nav, buttons, cards)
6. Page-specific sections
7. Animations
8. Responsive media queries
9. Utility classes

---

## File Structure

```
lumiverse-hr-web/
├── index.html              # Homepage
├── pitaj-lider.html        # Case study: AI Assistant
├── lider-pdf-archive.html  # Case study: Document AI
├── 404.html                # Error page
├── styles.css              # Main stylesheet
├── style-guide.md          # This file
├── images/
│   ├── pitaj-lider-ai-assistant.jpg
│   ├── 0017_014.jpg
│   └── ...
└── ...
```

---

## Checklist for New Pages

- [ ] Include all meta tags (charset, viewport, title, description)
- [ ] Link to `styles.css`, Google Fonts, Font Awesome
- [ ] Add Google Analytics snippet
- [ ] Include navigation with mobile toggle
- [ ] Use consistent section structure
- [ ] Apply appropriate color theme (coral or cyan for variety)
- [ ] Add breadcrumbs on subpages
- [ ] Include footer
- [ ] Add navigation scroll effect JS
- [ ] Add mobile nav toggle JS
- [ ] Test responsive behavior at all breakpoints
- [ ] Verify all links work
- [ ] Check image loading and alt text

---

## Quick Reference

### Common Classes
```
.container          - Standard width container
.section            - Section with padding
.section-dark       - Dark background section
.display-xl/lg/md   - Large headings
.heading-lg/md      - Smaller headings
.body-lg/md         - Body text
.text-secondary     - Muted text color
.text-accent        - Coral accent color
.gradient-text      - Gradient text effect
.btn-primary        - Primary CTA button
.btn-secondary      - Secondary button
.btn-ghost          - Text link button
.bento-grid         - Card grid layout
.bento-card         - Glass card
.bento-card-lg      - Wide card (2 columns)
.feature-list       - Checklist items
.mb-1 to mb-6       - Margin bottom utilities
.mt-1 to mt-6       - Margin top utilities
.text-center        - Center align
.grid-2/3/4         - Grid columns
.gap-1 to gap-4     - Grid gap
```

---

*Last updated: November 2024*

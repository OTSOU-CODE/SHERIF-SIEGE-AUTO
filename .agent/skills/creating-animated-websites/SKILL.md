---
name: creating-animated-websites
description: specialized in building high-performance, visually stunning animated websites using GSAP, Three.js, and modern CSS techniques. Combines technical implementation with premium design principles. Use when the user wants to "create", "build", or "develop" a modern, animated, or "wow" website.
---

# Creating Modern Animated Websites

## Capabilities

This skill encapsulates the expertise to build "Awwwards-winning" style websites that feature smooth motion, 3D elements, and premium interactivity.

## Workflow

### Phase 1: Foundation & Layout (The "Expensive" Look)

Before animating, ensure the static structure is perfect.

- **Grid Systems**: Use CSS Grid for magazine-style "Bento Box" layouts.
  - use `grid-template-areas` for complex, asymmetric designs.
  - ensure consistent 4px/8px-based spacing.
- **Typography**: Set up fluid type scales.
- **Glassmorphism/Neumorphism**: Apply modern visual trends where appropriate.

### Phase 2: Motion Strategy (The "Life")

Animation must be meaningful, not just decorative.

- **Key Tool**: **GSAP (GreenSock Animation Platform)** is the gold standard.
- **Sequencing**: Use `gsap.timeline()` to choreograph elements.
  - _Rule_: Never animate everything at once. Stagger elements (`stagger: 0.1`) for a "wave" effect.
- **Scroll-Driven Motion**: Use `ScrollTrigger` to scrub animations or pin sections.
- **Micro-interactions**: Hover states, magnetic buttons, cursor followers.

### Phase 3: 3D & WebGL (The "Wow" Factor)

- **Three.js / React Three Fiber**:
  - Use for product showcases, interactive backgrounds, or hero elements.
  - Optimize models (GLB/GLTF) with Draco compression.
  - Use efficient lighting (bake shadows where possible).

### Phase 4: Performance (The "Feel")

A slow site is not premium.

- **60fps Rule**: Animate **only** `transform` and `opacity`.
- **Asset Optimization**: WebP/AVIF images, lazy loading.
- **Compositing**: Use `will-change` sparingly to promote layers.

## Technical Stack Recommendation

- **Framework**: Next.js (for performance/SEO) or Vite (for SPAs).
- **Styling**: Tailwind CSS (speed) or Styled-Components (isolation).
- **Animation**: GSAP (complex motion), Framer Motion (React UI interactions).
- **3D**: Three.js, React-Three-Fiber.

## Implementation Checklist

- [ ] **Setup**: Project initialized with Next.js/Vite and configured linter.
- [ ] **Assets**: Images optimized, fonts loaded (subsetted).
- [ ] **Layout**: Responsive Grid/Flexbox structure implemented.
- [ ] **Motion**:
  - [ ] Hero animation sequence defined.
  - [ ] Scroll triggers set up.
  - [ ] Hover/Focus states active.
- [ ] **Performance Audit**:
  - [ ] Lighthouse Performance score > 90.
  - [ ] No layout thrashing or jank.
- [ ] **Mobile**: Touch gestures (swipe, pinch) work correctly.

## Best Practices

- **Mobile Adaptation**: On mobile, simplify complex 3D or heavy parallax. Focus on smooth scrolling and touch feedback.
- **Accessibility**: Respect `prefers-reduced-motion`. Ensure all interactive elements constitute a logical tab order.
- **Secret Management**: Never commit API keys. Use `.env` files.

## Reference Materials

- **Dev Guide**: `.agent/skills/developing-modern-websites/SKILL.md` (Deep technical details)
- **UI/UX Guide**: `.agent/skills/designing-ui-ux/SKILL.md` (Design principles)

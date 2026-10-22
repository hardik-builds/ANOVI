---
name: ANOVI Haute Joaillerie
description: Quiet luxury fine jewelry visual design system with editorial typography and bespoke gold accents
colors:
  onyx: "#0D0D0E"
  onyx-surface: "#141415"
  onyx-card: "#18181A"
  gold: "#D4AF37"
  gold-champagne: "#E5C158"
  gold-muted: "#8C7326"
  ivory: "#FDFCFB"
  cream-silk: "#F7F5F0"
  neutral-muted: "#A0A0A5"
  border-hairline: "rgba(255, 255, 255, 0.1)"
  border-gold-subtle: "rgba(212, 175, 55, 0.25)"
typography:
  display:
    fontFamily: "'Cormorant Garamond', Garamond, Georgia, serif"
    fontWeight: 300
    lineHeight: 1.1
    letterSpacing: "0.02em"
  heading:
    fontFamily: "'Cormorant Garamond', Garamond, Georgia, serif"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0.04em"
  kicker:
    fontFamily: "'Montserrat', -apple-system, sans-serif"
    fontWeight: 500
    textTransform: "uppercase"
    letterSpacing: "0.3em"
  body:
    fontFamily: "'Montserrat', -apple-system, sans-serif"
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: "0.02em"
rounded:
  none: "0px"
  sm: "2px"
  md: "4px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.onyx}"
    rounded: "{rounded.none}"
    padding: "14px 28px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ivory}"
    rounded: "{rounded.none}"
    padding: "14px 28px"
---

# Design System

## Overview
ANOVI Haute Joaillerie embraces quiet luxury, spatial restraint, and editorial discipline inspired by Parisian high-jewelry salons on Place Vendôme. There are zero cartoonish gradients, zero floating pill badges, and zero generic SaaS conventions.

## Colors
- **Onyx Pitch (`#0D0D0E`)**: Primary theatrical canvas that makes high-resolution diamonds and gold jewelry facets radiate with natural luminescence.
- **Champagne Gold (`#D4AF37`)**: Reserved strictly for high-value focal actions, fine jewelry accents, and selected states.
- **Ivory (`#FDFCFB`)**: Primary text color for pristine legibility on dark surfaces.
- **Hairline Dividers (`rgba(255, 255, 255, 0.1)`)**: Whispering structure without heavy borders.

## Typography
- **Cormorant Garamond**: High-contrast, editorial serif with refined proportions for display headings, product names, and quotes.
- **Montserrat**: Clean, geometric sans-serif set with airy letter-spacing (`tracking-[0.2em]`) for metadata, prices, actions, and body copy.

## Layout
- Full viewport height (`100dvh`) presence for the runway carousel without unintended browser scrollbars.
- Generous negative space surrounding jewelry items to convey rarity and exclusivity.
- Asymmetrical editorial pacing that mimics luxury fashion lookbooks.

## Elevation & Depth
- Flat, clean surfaces layered through contrast rather than heavy artificial drop shadows.
- Soft, high-diffusion ambient glows (`drop-shadow(0 20px 40px rgba(0,0,0,0.6))`) around cut-out jewelry renders.

## Shapes
- Sharp, architectural edges (`rounded-none` or `rounded-[2px]`) reflect gemological precision and diamond cuts.
- Pure oval masks (`clip-path: ellipse(...)`) for intimate artisan atelier portraits.

## Components
- **Nav Underline**: Kinetic transforms (`transform: scaleX(...)`) with smooth bezier curves rather than layout-thrashing width animations.
- **Product Cards**: Zero pill badges. Metadata separated with quiet typographic bullets (`·`).
- **Interactive Buttons**: Crisp typography, high contrast, tactile hover micro-transitions.

## Do's and Don'ts
- **DO** use generous whitespace and unhurried pacing.
- **DO** keep metal swatches and gemstone tags as quiet inline text.
- **DON'T** use purple/indigo gradients or neon colors.
- **DON'T** wrap tags in static pill boxes.
- **DON'T** animate width, height, or margins (always animate opacity and transform).

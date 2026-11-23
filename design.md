---
version: alpha
name: Casa di Solare
description: A warm, sunlit editorial system with soft cream surfaces, terracotta-brown contrast, and a single luminous citrus accent.
colors:
  primary: "#ffaf37"
  secondary: "#563e3b"
  tertiary: "#f3e9d8"
  neutral: "#ffffff"
  surface: "#fffaf0"
  on-surface: "#563e3b"
  background: "#ffffff"
  error: "#b4533c"
typography:
  headline-display:
    fontFamily: "Solare Italic, serif"
    fontSize: "500px"
    fontWeight: 400
    lineHeight: "500px"
    letterSpacing: "-35px"
  headline-lg:
    fontFamily: "Solare, serif"
    fontSize: "48px"
    fontWeight: 450
    lineHeight: "52px"
    letterSpacing: "-0.02em"
  headline-md:
    fontFamily: "Helvetica Neue, Helvetica, sans-serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: "29px"
    letterSpacing: "0px"
  headline-sm:
    fontFamily: "Helvetica Neue, Helvetica, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  body-lg:
    fontFamily: "Helvetica Neue, Helvetica, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "0px"
  body-md:
    fontFamily: "Helvetica Neue, Helvetica, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "normal"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Helvetica Neue, Helvetica, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0px"
  label-lg:
    fontFamily: "Helvetica Neue, Helvetica, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "22px"
    letterSpacing: "0px"
  label-md:
    fontFamily: "Helvetica Neue, Helvetica, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0px"
  label-sm:
    fontFamily: "Helvetica Neue, Helvetica, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0.04em"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 32px
  full: 9999px
spacing:
  xs: 6px
  sm: 20px
  md: 62px
  lg: 130px
  xl: 150px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "11px 20px"
    height: "40px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "11px 20px"
    height: "40px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
## Overview
Casa di Solare feels like a quiet, sun-washed editorial brand: minimal in structure, but emotionally rich through warm color and a striking display face. The visual tone is calm, refined, and slightly nostalgic, with a handcrafted personality that still feels modern and spacious. It favors generous breathing room, soft light backgrounds, and a single bold accent rather than a busy palette.

## Colors
- **Primary (#ffaf37):** A radiant citrus-gold accent used sparingly for emphasis, calls to action, and moments of warmth. It brings the site its “sunlight” character and should remain the most vivid color in the system.
- **Secondary (#563e3b):** A deep cocoa-brown used for body text, headings, borders, and quiet structural contrast. It reads softer than pure black, which supports the brand’s warm, editorial mood.
- **Tertiary (#f3e9d8):** A pale sand tone that can be used for subtle tinting, sections, and supporting surfaces when a warmer layer is needed.
- **Neutral (#ffffff):** Clean white used for cards, text contrast, and crisp negative space.
- **Surface (#fffaf0):** A soft cream background that better matches the screenshot’s paper-like atmosphere than stark white alone.
- **On-surface (#563e3b):** The default readable foreground on light surfaces; this keeps UI elements legible without harshness.
- **Error (#b4533c):** A muted terracotta-red for destructive states and validation, chosen to stay within the warm palette.

## Typography
The system pairs an expressive custom serif with Helvetica Neue for nearly all functional text. `headline-display` is the signature voice: oversized, italic, and highly stylized, intended for hero moments only. `headline-lg` can carry large editorial statements while the remaining headline and body levels stay neutral, restrained, and highly readable.

Helvetica Neue should be used for `headline-md`, `headline-sm`, `body-*`, and `label-*` to preserve the minimal, modern balance seen in the source. Weights remain light-to-regular rather than bold; emphasis should come from scale and spacing, not heavy font weight. Letter spacing is mostly neutral, with only the display treatment using tightened tracking for a dramatic, overlapping effect. Uppercase styling is not a core pattern here; keep text in sentence case unless a specific editorial treatment calls for otherwise.

## Layout
The composition is spacious and centered, with a strong preference for large margins and broad fields of empty background. The source suggests a fixed, poster-like presentation rather than a dense multi-column app layout. Use the spacing scale as a wide rhythm: `xs` for tight internal gaps, `sm` for modest grouping, and `md`/`lg` for section-scale breathing room.

Cards and content blocks should feel lightly inset with comfortable padding rather than packed. The system benefits from wide gutters and large surrounding whitespace, especially around featured imagery and hero content. Use rounded full-width visual containers or centered panels when building large showcase sections.

## Elevation & Depth
Depth is intentionally minimal. The screenshot relies on flat color fields, soft tonal contrast, and subtle border definition instead of shadow stacks or raised surfaces. If hierarchy is needed, use color separation, stroke contrast, and scale differences rather than elevation effects.

Borders should be thin and quiet, like the card treatment in the extracted data. Shadows should generally be absent; when necessary, keep them nearly imperceptible so the design preserves its calm, printed feel.

## Shapes
The shape language is soft and organic. Primary interactive elements use pill radii via `rounded.full`, while content surfaces use gentle rounding with `rounded.md`. The main visual impression should be rounded, approachable, and sunlit rather than angular or mechanical.

Large curves are especially important in illustration-like or hero treatments. Avoid sharp corners unless a component is explicitly text-only or utility-driven.

## Components
Buttons should follow three clear treatments:
- `button-primary` is the main action: citrus-gold fill, white text, pill radius, and a compact 40px height. It should feel inviting rather than urgent.
- `button-secondary` is the quiet inverse: transparent fill, brown outline/text, same pill shape and sizing, used for secondary actions or alternatives.
- `button-link` is a minimal text action with underline styling and no padding or border, suited to inline navigation.

Use button padding around `11px 20px` and keep label text at `label-lg` scale. Buttons should remain visually consistent across states; hover and active states can shift saturation or deepen the brown slightly, but should not introduce shadows or hard motion.

Cards should be clean white surfaces with a 1px border, `rounded.md`, and `padding: 16px`. They should feel like paper inserts rather than raised panels. If imagery is present inside cards, keep the framing simple and let the content breathe.

Inputs should match the same quiet surface treatment as cards: white background, brown foreground, rounded corners, and modest padding. Focus states should be clear through border color or outline changes, not shadows. Keep form elements calm and unobtrusive.

Lists, chips, tooltips, and other dense UI atoms should inherit the same restraint: thin borders, warm text, no decorative depth, and soft rounding where needed. Avoid complex iconography unless it supports clarity. Any supporting UI should defer to the typography and color contrast rather than compete with the hero treatment.

## Do's and Don'ts
- Do use the citrus `primary` color sparingly so it feels special and luminous.
- Do prefer the warm `secondary` brown for text and structural elements instead of pure black.
- Do keep layouts airy, centered, and generous with whitespace.
- Do use Helvetica Neue for functional text and reserve Solare Italic for dramatic editorial moments.
- Don't introduce heavy shadows, gradients with sharp contrast, or glossy effects.
- Don't overuse the accent color on large surfaces; it should read as a highlight, not a base.
- Don't make buttons square or overly tall; keep them pill-shaped and compact.
- Don't crowd content with tight spacing or dense multi-column arrangements unless the content truly requires it.

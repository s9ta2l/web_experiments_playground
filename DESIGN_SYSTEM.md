# Web Experiments Playground design system

This is the project’s record of agreed branding and shared interface rules. It lives in the repository and is not imported or displayed by the website. Update the rules and dated decision log when a design decision changes.

## Logo

The source of truth is `public/favicon.svg`. Preserve the existing circular gradient, triangle cutout, proportions, and gradient direction.

The gradient runs from left to right with these exact stops:

| Stop | Color | CSS token |
| --- | --- | --- |
| 0% | Cyan `#22d3ee` | `--logo-cyan` |
| 53% | Purple `#7c3aed` | `--logo-purple` |
| 95% | Fuchsia `#d946ef` | `--logo-fuchsia` |
| 100% | Pink `#ff4f8b` | `--logo-pink` |

Use the logo by itself on both light and dark backgrounds. Its link can have an invisible hit area, but must not have an outer circle, border, background, shadow, or backdrop blur. Preserve the browser’s keyboard focus indicator.

## Shared colors

Color tokens live at the top of `src/style.css`.

| Use | Value |
| --- | --- |
| Page background (`--paper`) | White `#ffffff` |
| Main text (`--ink`) | `#101010` |
| Secondary text (`--ink-soft`) | `rgba(16, 16, 16, 0.72)` |
| Light interface accent (`--accent`) | Logo purple `#7c3aed` |
| Dark interface accent (`--accent` override) | Logo fuchsia `#d946ef` |

Home and About use a plain white background. Keep shared surfaces neutral; do not reintroduce beige paper colors or decorative background gradients. Experiment artwork, preview images, and dark panels keep the colors needed for their own content.

Camera Kaleidoscope distinguishes selections from actions: the selected pattern uses a white background with dark text; other patterns stay transparent with light text and use the accent on hover. Primary camera/photo buttons use the shared fuchsia accent. Secondary action buttons use the accent on hover. Adapt button widths to the screen as described below.

## Glass surfaces

- Controls, experiment information, the right menu, and Camera Kaleidoscope’s toolbar share one frosted-glass treatment. The moving artwork supplies the color behind each surface; do not sample canvas colors in JavaScript.
- Use a neutral 64% tint: `rgba(255, 255, 255, 0.64)` on light pages, or `rgba(7, 12, 18, 0.64)` on dark pages. The remaining transparency lets nearby artwork colors show through.
- Use `backdrop-filter: blur(18px) saturate(1.15)` (including the WebKit prefix). Blur only the scenery behind the panel; text, icons, and controls stay sharp.
- Match both sides to `chromeTheme`: dark text and purple accents on light glass; light text and fuchsia accents on dark glass. Keep secondary text strong enough to read over changing imagery.
- Keep the original thin outline: `1px` using `--glass-outline` (dark ink at 14% on light glass, white at 12% on dark glass). Apply the same outline to settings, information, and the right menu. Inset internal dividers to the text column, as in settings and information.
- Put the glass and outline on the outer frame, so scrolling and switching between settings and information never cuts off the edge or adds another glass layer. Camera Kaleidoscope’s closed toolbar has its own frame; its information view uses the shared shell.
- Preserve panel positions and transitions. Use a solid surface in the same theme when backdrop filtering is unavailable.
- Keep the logo and hamburger bare; the glass belongs to the panels.

## Text links

- No underlines, including on hover.
- Use a slightly stronger weight: `--link-weight: 500`. Apply the same treatment to the footer and links in body text.
- Resting links use the surrounding text palette: dark ink on light backgrounds and light text on dark backgrounds.
- On hover, use the purple accent on white, or the brighter fuchsia accent on dark panels. Both come directly from the logo gradient.
- Keep the existing short color transition and visible keyboard focus indicators.
- Apply these rules to introductory text, future About body links, footer links, menu text links, and links rendered inside experiment Notes.
- Experiment cards and image controls keep their own typography.

## Navigation

- The hamburger is a bare three-line icon with an invisible touch target. Do not add a circle, border, filled background, or backdrop blur.
- On hover it uses the logo accent: purple on light surfaces and fuchsia on dark surfaces.
- Keep the same hamburger visible at the top right while the menu is open. It toggles the menu closed and does not turn into an X. There is no visible “Menu” heading or “Close” label.
- Match the glass tint to the page: light on Home, About, and light-canvas experiments; dark on dark-canvas experiments. Use purple accents on light surfaces and fuchsia on dark surfaces, with no color flash during opening.
- Slide the navigation surface in and out over 240 ms, keeping the hamburger fixed. Fade the backdrop at the same time and honor reduced-motion preferences.
- List **Gallery** (the former Showroom), then **About**, then an inset divider and each experiment title on its own line. Align the divider with the menu text, leaving a 1.5rem inset on both sides plus the right safe-area allowance. Do not show descriptions or an “Experiments” heading in this list.
- Preserve accessible names, expanded state, keyboard focus, Escape dismissal, and dismissal by clicking outside the panel. The visible burger remains reachable inside the open menu.
- Experiments with a light canvas set `chromeTheme: "light"` in `meta.js` so the bare menu icon stays dark against their artwork. Other experiments default to a light icon over a dark canvas.

## Experiment information

- The right menu is for navigation. Experiment descriptions, author credits when supplied, instructions, Notes, and Copy link belong in the controls area’s information view. Omit empty credits and generic contribution or collaboration status labels.
- Put an outlined info icon beside the Controls heading in the left control panel. For Camera Kaleidoscope, put it beside the bottom toolbar.
- Clicking the info icon replaces the controls in their existing shell with a 200 ms fade and slight vertical motion. For Camera Kaleidoscope on desktop, information replaces the bottom toolbar. The desktop canvas stays interactive; phones use the full-screen panel described below.
- The info icon becomes a close icon while information is visible. Clicking it or pressing Escape returns to the controls with their settings intact and focus on the same button. Keep the controls’ mount independent so an experiment cannot overwrite the shared info button.
- Let information use the available viewport height on phones and keep the return icon visible while scrolling long Notes.
- Instructions and Notes start collapsed. Use link-style disclosure buttons with downward chevrons; opening rotates the chevron upward and expands the content downward over 200 ms. Keep expanded state accessible and honor reduced motion.
- Show Copy link as a bare chain-link icon below the description, in the space previously used for status labels. Provide an accessible name, hover tooltip, checkmark feedback, and a screen-reader status message.

## Phone controls

- Keep settings and information closed initially so the experiment has the screen. Show a small Controls button at the bottom, using the shared glass, thin outline, and page theme.
- Tapping Controls opens a full-screen glass panel. Use the viewport's dynamic height and safe-area insets; scroll the content within the frame while its header and close button stay visible.
- Keep the existing information switch and expandable Instructions/Notes inside this panel. In information, use a back arrow to return to controls and a separate close icon to return to the experiment.
- Preserve settings by moving the existing controls rather than recreating them. Closing the panel returns focus to Controls; reopening starts on controls. Escape returns from information first, then closes the panel. Respect reduced motion.
- Use touch targets of at least 44px for buttons, checkbox labels, and disclosures, with larger slider hit areas. Keep text and controls within the available width.
- Apply this layout to narrow screens and landscape phones. Desktop keeps its existing left panel and in-place information switch.
- Kaleidoscope is an exception to the Controls opener: keep all pattern choices, Flip camera, and Capture photo directly available in the bottom glass toolbar. At narrow widths, use equal widths for the three patterns in the first row and the two actions in the second; use a compact single row where it fits. Keep a bare info icon beside the toolbar. On phones, Info opens the full-screen panel directly, and returning restores the toolbar with the selection intact.
- Use the freed artwork space for Pendulum and Rotation Matrices, leaving the matrices readable and swipeable. Keep ECG's status text below the top navigation on phones.

## Gallery

- Keep the compact introduction and the existing responsive grid of square preview tiles.
- Show the title over the preview at rest. Hover or keyboard focus reveals the description with the existing 200 ms fade and slide.
- Show the title and description together on touch screens; honor reduced-motion preferences.
- Show no tag badges on the cards. Keep experiment metadata available in the registry.
- Use larger description text across the available padded width: `clamp(1.05rem, 1.6vw, 1.25rem)`, with a line height of `1.4`.
- Keep description text regular weight. Preserve legibility over preview artwork with the existing dark overlay.

## Implementation map

| File | Responsibility |
| --- | --- |
| `public/favicon.svg` | Original logo and exact gradient stops |
| `src/style.css` | Brand tokens, links, shared shell, and card presentation |
| `src/main.js` | Gallery markup, navigation, and experiment information |
| `src/app/dialog.js` | Shared modal focus, dismissal, and trigger behavior |
| `src/app/experimentInfo.js` | Controls/information switching and expanding sections |
| `src/app/experimentControls.js` | Responsive phone dialog and persistent controls |
| `DESIGN_SYSTEM.md` | Contributor reference and decision history |

## Decision log

### 2026-10-11

- Kept every Kaleidoscope control directly available in a responsive bottom toolbar, removed its phone Controls opener, balanced button widths, and retained direct access to Info.
- Made phone controls opt-in through a compact Controls button and full-screen glass dialog, preserving settings, the information switch, and a fixed close button. Adapted artwork layouts, touch targets, and direct Kaleidoscope capture for phones in both orientations.
- Distinguished Camera Kaleidoscope's selected pattern with a white fill and dark text, keeping primary action buttons fuchsia.
- Aligned Camera Kaleidoscope's selected pattern, Start camera, Capture photo, Download JPG, and secondary-button hover colors with the shared logo accent.
- Inset the menu divider to its text column, matching the internal separators in settings and information.
- Retained the thin outline across both sides and moved the settings/information glass to their outer frame, keeping it continuous while scrolling and switching views.
- Applied shared frosted glass to controls, information, navigation, and the kaleidoscope toolbar, using live backdrop color and matching light/dark text palettes.
- Reviewed the About contribution instructions against the template and registry; retained the copy and opening.
- Adapted menu colors to the page theme, added smooth opening and closing, and extended its divider to both edges.
- Changed experiment information to replace the controls in place, keeping their values and the canvas interaction available.
- Removed generic contribution/collaboration statuses, made Instructions and Notes expandable links with chevrons, and replaced Copy link text with an icon below the description.
- Simplified the menu button to a bare hamburger with the logo accent on hover.
- Kept the same hamburger visible inside the open menu; removed the visible Menu and Close labels and the X transformation.
- Standardized navigation to a white panel with Gallery, About, a divider, and a plain list of experiment titles.
- Moved all experiment information out of the navigation and into a left-side info panel beside the controls, with the kaleidoscope icon beside its toolbar.
- Added light-canvas metadata for Orbital Spiral, Rotation Matrices in 3D, and Art / Code Wake so their bare hamburger remains legible.

### 2026-10-10

- Kept the original logo and recorded all four gradient colors.
- Removed the logo’s outer button shell on experiment pages; keep it bare on every background.
- Standardized text links to a medium weight without underlines, with purple or fuchsia hover colors from the logo.
- Replaced the beige page background and decorative gradients with white.
- Removed showroom tag badges and increased description text size.
- Kept this design record in the repository, outside the website.

## Visual verification

1. Open Home and About: their page backgrounds should be white.
2. Check introductory and footer links: they should have a subtle weight increase, no underline, and a purple hover color.
3. Open the menu from Home, About, and light/dark experiments: it should slide smoothly in its matching theme and show Gallery, About, an inset divider aligned with the text, and only experiment titles. Its bare hamburger should stay fixed and close it when clicked again.
4. Hover or keyboard-focus a gallery card: its description should be larger, with no badges.
5. Check narrow and touch layouts: descriptions should fit inside the tiles, and touch visitors should see both the title and description.
6. Open an experiment’s info icon: information should replace its controls smoothly. Expand Instructions and Notes and check the arrows and downward animation. Copy the link using the icon below the description. Repeat with Camera Kaleidoscope’s bottom toolbar.
7. Close information with its icon or Escape: the controls and their values should return. Check menu Tab focus, Escape, and clicking outside; closing should return focus to the burger. With reduced motion enabled, all panel and disclosure changes should happen immediately.
8. Check both panels over light artwork, dark artwork, and the live kaleidoscope: underlying colors should show softly through the glass while text stays sharp. Controls and information should use the same material and text palette. The thin outline should remain continuous on all four sides while scrolling long Notes or settings. Repeat on a phone.
9. At 320×568, 390×844, and 844×390 with touch enabled, open experiments with settings panels: settings should start closed. Open Controls, change a value, switch to Info, expand Notes, and scroll. The header should stay visible. Return to controls, close the panel, and reopen; the setting should remain. Check rotation, keyboard focus, Escape, reduced motion, and returning to desktop. Kaleidoscope should show all its buttons immediately with no Controls opener; check equal widths, pattern selection, Flip camera, Info, Capture photo, and Retake.

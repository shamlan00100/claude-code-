# Focus PT design reference

Consult this file before building any component.

## Materials

Chalk (surface), water (accent: what is moving now), rock (secondary: context, not content), iron (structure: what does not move). Sleek, material-led, quietly premium. Not fitness styling: no neon, no gradients, no motivational tone.

## Tokens

Light: surface.base `#EDEBE5`, surface.raised `#F7F6F2`, surface.sunken `#E2E0D9`, border.hairline `#D2CFC7`, text.primary `#16191B`, text.secondary `#5C5F62`, text.tertiary `#797C7F`, accent `#14707C`, accent.quiet `#D6E7E8`, destructive `#A32E22`.

Dark: surface.base `#121517`, surface.raised `#1B1F22`, surface.sunken `#0C0E10`, border.hairline `#2C3134`, text.primary `#ECEAE4`, text.secondary `#9BA0A3`, text.tertiary `#6E7376`, accent `#4FB6C0`, accent.quiet `#123A3E`, destructive `#E0705F`.

Dark is not an inversion: the accent lifts and contrast drops slightly because gyms are badly lit.

In code (`src/styles.css`): `bg-base`, `bg-raised`, `bg-sunken`, `border-hairline`, `text-iron`, `text-rock`, `text-tertiary`, `water`, `water-quiet`, `oxide`, `chalk`.

## Colour laws

Red is a verb, not an adjective: destructive actions only, never a state, result or person. Accent means "now" or "gained": live session, progress fill, completed package, nothing else. A screen must remain fully usable with all colour removed. Water is never a button fill.

## Type

IBM Plex Sans for Latin, IBM Plex Sans Arabic for Arabic, IBM Plex Mono for all numerals with tabular figures and tightened tracking. Mono never for labels or prose. Sentence case everywhere, no all-caps, no italics anywhere. Weights 400/500/600 only; 600 for numerals and primary buttons. Negative tracking at 20px and above; never track out body text. Body measure under 66 characters.

Scale: display 40/44 w500, title 28/34 w500, heading 20/26 w500, body 16/24 w400, detail 14/20 w400, micro 12/16 w500. Utilities: `type-display`, `type-title`, `type-heading`, `type-body`, `type-detail`, `type-micro`, and `numeric` for numbers.

text.tertiary only at 19px semibold or 24px regular and above, never for interactive or essential text.

## Components

Buttons: height 48px, or 56px client-facing and during a set. Radius 4px, weight 600, sentence case, label names its outcome. Primary = iron fill with chalk text. Secondary = transparent with hairline border. Quiet = text only in rock. Destructive = oxide outline at rest, filling solid oxide only on the confirming step. Disabled = sunken fill with tertiary text, never reduced opacity. One primary action per screen. Client screens: full width anchored to the bottom. Trainer screens: intrinsic width, inline.

Inputs: height 48px, radius 4px, raised background, hairline border. Label always above the field; placeholders are examples, never labels. Invalid state is a 3px iron edge on the leading side plus a plain sentence beneath. Validation errors are never red.

Focus: 2px accent ring at 2px offset on every interactive element, both themes, never removed.

Cards: radius 5px, hairline border, raised background, no shadow.

Sheets: bottom sheets only, never centre modals. 12px top radius, drag handle, iron scrim at 40%. The only component with a shadow.

Toasts: iron fill, chalk text, radius 4px, above the nav, four seconds, one action maximum, no icon.

Empty states: one factual sentence, one button. No illustration, no joke, no mascot.

Icons: 22px, 2px stroke, outline only. No filled or duotone icons.

Spacing: 8px grid. Minimum touch target 48px, 56px during a set, 52px in the logger.

Navigation: bottom bar, four items maximum, labels always visible, never icon-only. Active is iron at a heavier weight, inactive is rock. No accent in the nav. Count badges are iron pills in mono, never red, never bare dots.

## Session states

Drawn from three variables only: border (solid / dashed / sunken fill), left edge (none / hairline / water), text weight (full / reduced).

booked: solid hairline, full-weight time. confirmed: solid hairline plus hairline leading edge. in_progress: water border and water leading edge, the only card that may carry accent. completed: solid hairline, time drops to rock. cancelled: same as completed with the outcome named in words. no_show: drawn identically to cancelled, only the copy differs. rescheduled: sunken fill, names its replacement, never deleted. unscheduled: dashed rock, transparent background, em-dash where the time goes, the only card that invites a tap. substituted and rested follow completed, with what happened named in words.

Every settled session states its credit outcome in words on the card ("Returned to package" or "Counted as used"), always visible, never behind a tap. No icons on state. No pill backgrounds behind state tags. No missed-session count shown to a client.

Forbidden: red, amber or orange for anything a client did or didn't do; strikethrough on a missed session; streak counters; warning triangles, sad faces or downward arrows on a person's data.

## The logger

One exercise per screen. Prefill every set from the client's last session for that exercise; the client taps only what changed. No dropdowns and no modals during logging. The fields follow the exercise's tracking type: weight and reps are steppers at ±2.5kg and ±1 rep; time and distance use steppers sized to the exercise; long-press opens a keypad. Row height and tick target 52px. A completed set sinks into a sunken fill with an iron tick: no accent, no celebration. The rest timer is the only running number and the only accent on the screen. "Last time" is stated, never compared: no arrows, no percentages. Nothing blocks a save; unfinished sets save unfinished.

## Charts

One series per chart. One baseline hairline, no gridlines. No fills or gradients under the line. The line is accent whichever way it points: a dip is drawn identically to a rise. Gaps break the line, never interpolated. Axis labels in mono at 11px in tertiary; only the latest value is labelled in iron. Never compare clients to each other. The x-axis reverses in RTL.

## Motion

One animated moment only: a session card moving from its old slot to its new one, 180ms ease-out. Everything else is opacity at 120ms. `prefers-reduced-motion` cuts to the end state. No flashing, pulsing or attention-seeking animation anywhere, including the live session.

## Voice

Short, factual, unbothered. State what happened, then offer the next move. Never apologise, congratulate or characterise effort. "Session logged." not "Great work today!". "Tuesday 06:00 didn't happen. Pick a new time." not "You missed your session." "Couldn't save. Check your connection and try again." not "Oops! Something went wrong." No exclamation marks in system copy. No emoji anywhere in the product surface. A button names its outcome and the confirmation repeats the word.

## Accessibility floor

Support text scaling to 200%: cards grow, they never clip. Every icon carries an accessible name or is hidden next to a visible label. No gesture is the only way to do anything. Every primary action sits in the lower third of the screen. Offline: a logged set saves locally first and syncs when possible, stated plainly, never as an error or a warning colour.

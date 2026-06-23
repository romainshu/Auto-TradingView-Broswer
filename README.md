# Stock Review Browser

A single-file, no-backend tool for rapidly eyeballing TradingView charts across a ticker
list — auto-advancing on a timer, with a fully editable watchlist sidebar, simple
per-ticker marks, and an export so you can pull your decisions back out when you're done.

It is **not** a scanner or an analysis tool. It does no calculation of its own beyond
loading a chart with a few standard indicators. The judgment is yours; this just removes
the friction of clicking through tickers one by one.

---

## 1. Files

| File | Purpose |
|---|---|
| `review.html` | The entire application — HTML, CSS, and JS in one file. |
| `stocks.js` | The seed ticker list, as a plain JS array. Edit this to load a different watchlist. |

Both files must sit in the **same folder**. `review.html` loads `stocks.js` via a relative
`<script src="stocks.js">` tag — there is no build step, no server, and no other
dependency to install. Double-click `review.html` and it opens in your default browser.

**Internet access is required** while using it (not while editing it) — the chart itself
is TradingView's own widget, loaded live from `s3.tradingview.com`, and the fonts are
loaded from Google Fonts. Nothing about the ticker list, your marks, or your session ever
leaves your machine; only the chart symbol you're currently viewing is sent to
TradingView, same as visiting tradingview.com directly.

### `stocks.js` format

```js
const STOCKS = [
    "NVDA",
    "PLTR",
    "TSLA",
];
```

One ticker per array entry. Plain tickers (`"NVDA"`) are auto-resolved by TradingView to
the most likely exchange. If a ticker exists on multiple exchanges and resolves wrong, use
the explicit form instead: `"NASDAQ:NVDA"`.

This file is only a **seed list** — see [Session Persistence](#7-session-persistence)
below for how it interacts with what you've actually been working with in the browser.

---

## 2. Quick Start

1. Edit `stocks.js` with the tickers you want to review.
2. Open `review.html`.
3. It starts playing immediately: first ticker loads on the Daily timeframe with
   MA50 / MA200 / Bollinger Bands(20, 2), and a 30-second countdown begins.
4. Use **Pause** (or hit Space) any time you want to actually look at a chart — once
   paused, the embedded chart behaves exactly like tradingview.com: zoom, pan, change
   timeframe, add your own indicators, draw on it, whatever you want.
5. Mark tickers as you go (click a row's mark button, or `Ctrl+Space` for whichever
   ticker is currently on screen).
6. When you're done, use the **Export** dropdown + button in the sidebar to pull out a
   `.txt` of what you marked.

---

## 3. The Chart

- Powered by TradingView's free "Advanced Chart" embeddable widget (`tv.js`), loaded
  fresh for every ticker switch.
- Opens on the **Daily** timeframe by default, never auto-switches to Weekly/Monthly.
- Default indicators on every chart: **MA50**, **MA200**, **Bollinger Bands (20, 2)**.
- Because it's a real TradingView widget (not a static image), all native functionality
  works once you stop on a chart: indicators, drawing tools, comparison, timeframe
  switching, symbol search inside the widget itself, etc.

### Known limitations of the chart (and why)

The widget is a free, public embed — TradingView serves it as a **cross-origin iframe**
with no JavaScript API exposed to the parent page. Two things this rules out, both of
which would require TradingView's separate, licensed, self-hosted **Charting Library**
(a different product, with real JS hooks like `chart().onSymbolChanged()` and
`selectLineTool()`):

1. **This page can't see what you search for inside the widget's own search box.** If
   you type a different symbol directly into the chart, this app has no way to know —
   the title, sidebar, and timer will silently stay on the old ticker. Use the sidebar's
   own **Jump-to / Add** tools instead of the chart's built-in search if you want this
   app to track it (see [Watchlist Sidebar](#5-watchlist-sidebar)).
2. **This page can't pre-select a drawing/measure tool** (e.g., "Price Range") when a
   chart loads. It's still right there in the side toolbar — one click per chart — just
   not something that can be automated from outside the iframe.

---

## 4. Playback Controls

| Control | Where | Behavior |
|---|---|---|
| Prev / Next | Header buttons, `←` / `→` | Step backward/forward one ticker. |
| Pause / Resume | Header button, `Space` | Stops/resumes the countdown and auto-advance. |
| Restart | Header button, `R` | Jumps back to ticker #1 and resumes playing. Does **not** clear marks or viewed history. |
| Open Current Stock | Header button | Opens the current ticker on tradingview.com in a new tab. |
| Interval | Header number input | Auto-advance speed in seconds (1–120). Default **30s**. Changes apply immediately. |

- A thin progress bar under the header drains in sync with the countdown.
- A large, low-opacity **watermark of the current ticker symbol** sits centered over the
  chart, so you can tell what you're looking at at a glance without reading the small
  header text. It's purely decorative (`pointer-events: none`) — it never blocks zooming,
  panning, or clicking the chart underneath it.
- Reaching the end of the list **stops** (does not loop) and shows a **Review Complete**
  banner, with its own Restart/Dismiss buttons.

### Keyboard shortcuts

| Key | Action |
|---|---|
| `→` | Next ticker |
| `←` | Previous ticker |
| `Space` | Pause / Resume |
| `Ctrl`+`Space` | Cycle the mark on whichever ticker is currently on screen — no need to click into the sidebar at all |
| `R` | Restart |
| `Escape` | Cancel an open "insert ticker(s)" box in the sidebar |

All shortcuts except `Ctrl+Space` are suppressed while you're typing into a text field
(the interval input, the bulk Add box, or a per-row insert box), so typing tickers never
accidentally triggers navigation.

---

## 5. Watchlist Sidebar

The right-hand panel is a **live, editable** view of the ticker list — not just a
read-only display of `stocks.js`.

### Each row

- **Mark button** (leftmost) — see [Marks](#6-marks).
- **Position number**.
- **Ticker symbol** — click anywhere on the row (except its buttons) to jump straight to
  that ticker. Works whether you're paused or playing.
- **`+`** — opens an inline box to insert one or more tickers right after this row.
- **`×`** — removes this ticker from the list.

### Reordering and deleting by drag

- **Drag a row up or down** to reorder the list. Other rows shift live to preview where
  it'll land; release to commit.
- **Drag a row left** past about a third of the row's width to delete it — a red
  "Remove ✕" panel is revealed as you drag. Release early and it snaps back instead.
- Dragging is disabled while an insert box (see below) is open, so the two never conflict
  over what a given row index means mid-edit.

### Adding tickers

Two ways in, both accepting the same flexible input — tickers separated by **comma,
semicolon, tab, space, or newline**, in any mix (so a pasted scanner list, a hand-typed
`"NVDA, AMD TSLA"`, or a multi-line paste all parse the same way):

1. **Bulk Add box** (top of the sidebar, always visible) — type or paste, press `Enter`
   (or it auto-commits on paste) to append to the **end** of the list. `Shift+Enter` for
   a literal line break if you're composing something multi-line before submitting.
2. **Per-row `+`** — same input rules, but inserts right after that specific row instead
   of at the end. The box **stays open** after each addition (repositioned right after
   what you just added) so you can keep adding more without re-clicking `+` — it only
   closes when you submit it blank, press `Escape`, or click elsewhere.

Newly-added rows flash with a brief green glow (about 2 seconds) so you can spot exactly
where they landed, even in a long list.

---

## 6. Marks

Each ticker can carry one simple mark, cycled in this order:

```
(none) → ✓ Check → 1 (Level 1) → 2 (Level 2) → W (Watchlist) → (none) → ...
```

- Click a row's mark button to cycle it.
- Press **`Ctrl+Space`** to cycle the mark on the **currently displayed** ticker, without
  touching the mouse or the sidebar at all.
- Marks persist through Restart, list edits, and closing/reopening the browser (see
  below).

---

## 7. Session Persistence

Your list, marks, viewed history, and current position are **auto-saved continuously**
to the browser's `localStorage` and **auto-restored** the next time you open this exact
file in the same browser — no save button, no extra step.

A few things worth knowing about that:

- It's tied to **this file's location on disk, in this specific browser**. A copy of the
  file moved elsewhere, or opened in a different browser, starts fresh from `stocks.js`.
- Once a session exists, it takes priority over `stocks.js` on every subsequent load —
  editing `stocks.js` with a new day's list won't show up on its own. Use the buttons
  below to bring it in deliberately:

| Button | Effect |
|---|---|
| **Replace** | Confirms, then wipes the current list/marks/viewed-history and reloads entirely from `stocks.js`. |
| **Append** | Adds only the tickers from `stocks.js` that aren't already in your current list, onto the end. Existing tickers, marks, and viewed history are untouched. Flashes "Nothing new" or "+N added" as feedback. |

"Viewed" is tracked automatically (any ticker that's ever actually been shown on screen,
by any means — auto-advance, Prev/Next, or clicking it in the sidebar) and is what the
**Viewed / Unviewed** export filters use; it's independent of marks.

---

## 8. Export

A dropdown + **Export** button in the sidebar header writes a dated `.txt` file:

| Option | What it includes |
|---|---|
| All (grouped) | Every marked ticker, in sections — one per mark category (`CHECK`, `LEVEL 1`, `LEVEL 2`, `WATCHLIST`), unmarked tickers omitted. |
| Check / Level 1 / Level 2 / Watchlist | A flat list of tickers carrying that specific mark. |
| Viewed / Unviewed | A flat list based on watch history instead of marks. |

Flat-list exports show the mark glyph inline (`NVDA ✓`) when set. The grouped export
looks like:

```
CHECK (2)
  NVDA
  AMD

LEVEL 1 (1)
  TSLA

WATCHLIST (3)
  APP
  CRWD
  PLTR
```

Separately, **Copy List** (next to Export) copies just the plain ticker symbols —
no marks, no formatting — to your clipboard, for pasting straight back into `stocks.js`
or somewhere else.

---

## 9. Customizing

Everything tunable lives at the top of the `<script>` block in `review.html`, inside the
`CONFIG` object and a couple of constants right after it:

```js
const CONFIG = {
  defaultIntervalSeconds: 30,   // auto-advance speed
  chartInterval: "D",           // chart timeframe on load
  chartTheme: "dark",
  studies: [ /* MA50, MA200, BB(20,2) by default */ ],
};

const MARK_CYCLE = [null, "check", "level1", "level2", "watch"];
const MARK_GLYPH = { check: "✓", level1: "1", level2: "2", watch: "W" };
const MARK_LABEL = { check: "Check", level1: "Level 1", level2: "Level 2", watch: "Watchlist" };
```

- **Change default indicators**: edit `CONFIG.studies`. Each entry is
  `{ id, version, inputs }` using TradingView's basic-studies IDs, e.g.
  `MASimple@tv-basicstudies` (input: `length`) or `BB@tv-basicstudies`
  (inputs: `length`, `mult` — `mult` is the standard-deviation multiplier).
- **Change the mark set**: edit the three `MARK_*` constants together (cycle order,
  glyph, and label must all stay in sync by key name). Drag/insert/export logic all
  reads from these constants generically, so no other code needs to change.
- **Visual theme**: CSS variables at the top of the `<style>` block (`--bg`, `--panel`,
  `--accent`, `--blue`, `--violet`, `--amber`, `--red`, and their `-dim` tints).
- **Watermark size/opacity**: `#ticker-watermark` in the CSS — currently
  `font-size: clamp(48px, 14vw, 220px)`, `opacity: 0.16`.

---

## 10. Architecture Notes

For anyone (human or AI) picking this codebase back up later:

- **Single file, vanilla JS, no framework, no build step.** Everything lives in one
  IIFE inside `review.html`. The only runtime dependencies are TradingView's `tv.js`
  (fetched on first chart load) and Google Fonts (fetched on page load).
- **State shape**: `state.stocks` is an array of
  `{ symbol, mark, viewed, addedAt }` objects — *not* bare strings. `state.currentIndex`
  points into that array. `addedAt` is a transient timestamp used only to decide whether
  to show the "just added" flash; it's harmless to ignore otherwise.
- **Render funnel**: almost every mutation ends in `renderStatusBar()`, which updates the
  header *and* calls `renderSidebar()`, which rebuilds the row list from scratch *and*
  calls `saveSession()`. This single chokepoint is intentional — it's what keeps the
  header, sidebar, and localStorage in sync without scattering render calls everywhere.
- **Why the per-second countdown tick does *not* call `renderStatusBar()`**: it used to,
  and that full sidebar rebuild every second was silently destroying (and thus closing)
  any open per-row insert box every time it had focus. The 1-second (and previously,
  accelerated) tick now does a narrow, direct DOM update of just the countdown number and
  progress bar instead. If you're tempted to "simplify" that back to a full render, don't
  — see the git history of this conversation for the exact symptom it caused.
- **Why dragging calls `selectIndex(i)` directly instead of relying on a `click`
  listener**: `row.setPointerCapture()` (used so a drag gesture tracks correctly even if
  the pointer leaves the row's bounds) also redirects the browser's synthesized `click`
  event to the *row* itself rather than letting it bubble from whatever element was
  actually pressed. A separate click-based "jump to ticker" handler attached to the
  ticker-symbol span specifically will silently stop firing after the very first drag.
  The fix is for the drag handler's own "no movement crossed the threshold" branch to
  call `selectIndex(i)` directly — there is no other click listener for row navigation,
  and there shouldn't be one added back.
- **Drag uses Pointer Events, not native HTML5 drag-and-drop**, because the swipe-to-
  delete gesture is directional (only leftward counts) and native DnD doesn't model that
  well. Reordering shows a live preview by shifting sibling rows' `transform`, then
  commits the actual array splice only on release.
- **The "outside click closes the insert box" listener is deliberately narrow**: it skips
  closing if the click target is inside any `.sidebar-row` or the open `.insert-row`
  itself. Those elements manage `state.insertAfterIndex` through their own click
  handlers; pre-emptively closing the box first would tear down the very element about to
  be clicked (since it lives inside the re-rendered `#sidebar-list`) before its own click
  could fire, silently swallowing it. Header controls (Copy List, Export, the bulk Add
  box) live outside `#sidebar-list`, so they're safe to close-on-click-into without that
  risk.

---

## 11. Troubleshooting

- **Chart won't load / blank area**: check your internet connection — the widget script
  and the chart data both come from TradingView live.
- **List looks stale / doesn't match a `stocks.js` you just edited**: that's expected —
  see [Session Persistence](#7-session-persistence). Use **Replace** or **Append**.
- **List doesn't persist between sessions at all**: `localStorage` can be unavailable or
  cleared in private/incognito windows, or if third-party storage is blocked by browser
  settings. The app still works fully in that case — it just won't remember between
  sessions.
- **A symbol you typed into TradingView's own search box doesn't show up in the header or
  sidebar**: expected — see the chart limitations in [section 3](#3-the-chart). Use the
  sidebar's Add/insert tools instead.

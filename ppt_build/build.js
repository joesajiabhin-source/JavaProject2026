const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";
p.author = "Abhin Joe Saji";
p.title = "JavaProject — Review 1";

const W = 13.33, H = 7.5, M = 0.6;
// Dark neon theme (bg is bright/neon; cards & text tuned for contrast)
const BG = "0B0A1A";
const PRIMARY = "8B5CF6";     // violet
const ACCENT = "FFD166";      // bright gold accent
const TEXT = "FFFFFF";
const SOFT = "E6E1F7";
const MUTED = "B7AED6";
const CARD = "161230";        // deep card surface
const CARD2 = "1D1840";
const HAIR = "3A3160";
const CODEBG = "100D24";
const GREEN = "4ADE80";
const RED = "FB7185";
const BLUE = "7DD3FC";
const F = "Segoe UI", MONO = "Consolas";

const BUILD = "C:/Users/abhin/OneDrive/Desktop/Projects2026/JavaProject/ppt_build/";
const BG4K = BUILD + "bg_4k_bright.jpg";   // bright 4K neon bg for every slide
const BG_TITLE = BUILD + "bg_title_4k.jpg"; // uploaded designed title slide (4K)

const shadow = () => ({ type: "outer", color: "000000", blur: 10, offset: 3, angle: 45, opacity: 0.45 });

function bg(s) {
  s.background = { color: BG };
  s.addImage({ path: BG4K, x: 0, y: 0, w: W, h: H });
  s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H, fill: { color: "0B0820", transparency: 62 }, line: { type: "none" } });
}
function header(s, eyebrow, title, pg) {
  s.addText(eyebrow.toUpperCase(), { x: M, y: 0.34, w: 10, h: 0.3, fontFace: F, fontSize: 13.5, bold: true, color: ACCENT, charSpacing: 3, margin: 0 });
  s.addText(title, { x: M, y: 0.6, w: 12, h: 0.62, fontFace: F, fontSize: 29.0, bold: true, color: TEXT, margin: 0 });
  s.addText("Folio · Review 1", { x: M, y: 7.12, w: 3, h: 0.28, fontFace: F, fontSize: 13.5, color: MUTED, margin: 0 });
  s.addText(pg + " / 10", { x: W - 1.7, y: 7.12, w: 1.1, h: 0.28, align: "right", fontFace: F, fontSize: 13.5, color: MUTED, margin: 0 });
}
function card(s, x, y, w, h, fill) {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, rectRadius: 0.09, line: { color: HAIR, width: 1 }, shadow: shadow() });
}
function arrow(s, x, y, w, h, opts = {}) {
  s.addShape(p.shapes.LINE, { x, y, w, h, line: { color: "CFC6EC", width: 1.6, endArrowType: "triangle", ...opts } });
}

// ============ SLIDE 1 — TITLE (uploaded designed artwork) ============
let s = p.addSlide();
s.background = { color: BG };
s.addImage({ path: BG_TITLE, x: 0, y: 0, w: W, h: H });

// ============ SLIDE 2 — ABSTRACT + PROBLEM/OBJECTIVES ============
s = p.addSlide();
bg(s); header(s, "Sections 1–2 · Abstract, Problem & Objectives", "Why Folio exists — the real-world problem it solves", "02");

s.addText("ABSTRACT", { x: M, y: 1.42, w: 3, h: 0.28, fontFace: F, fontSize: 14.0, bold: true, color: ACCENT, charSpacing: 2.5, margin: 0 });
s.addText("Folio is a browser-based Library Management System that digitises the complete circulation workflow — borrowing, renewing, returning, and late-fee tracking — using Object-Oriented principles in JavaScript, with no server required.", { x: M, y: 1.7, w: 6.5, h: 1.0, fontFace: F, fontSize: 15.0, color: SOFT, margin: 0, lineSpacingMultiple: 1.14 });

s.addText("REAL-WORLD PROBLEM", { x: M, y: 2.86, w: 4, h: 0.28, fontFace: F, fontSize: 14.0, bold: true, color: ACCENT, charSpacing: 2.5, margin: 0 });
const probs = [
  "Paper registers lose track of due dates and borrowers",
  "Borrowing limits are easily exceeded by mistake",
  "Late fees are miscalculated or never collected",
];
probs.forEach((o, i) => {
  s.addText("\u2717", { x: M + 0.02, y: 3.22 + i * 0.42, w: 0.25, h: 0.3, fontFace: F, fontSize: 15.0, bold: true, color: RED, margin: 0 });
  s.addText(o, { x: M + 0.3, y: 3.22 + i * 0.42, w: 6.2, h: 0.34, fontFace: F, fontSize: 14.5, color: SOFT, margin: 0 });
});

s.addText("OBJECTIVES & SCOPE", { x: M, y: 4.6, w: 4, h: 0.28, fontFace: F, fontSize: 14.0, bold: true, color: ACCENT, charSpacing: 2.5, margin: 0 });
const objs = [
  "Model books, readers, and loans as structured objects",
  "Enforce borrowing limits, due dates, renewals in code",
  "Automate fine calculation — \u20B910 per overdue day",
  "One dashboard for the librarian's entire collection",
];
objs.forEach((o, i) => {
  s.addShape(p.shapes.OVAL, { x: M + 0.02, y: 4.98 + i * 0.48, w: 0.09, h: 0.09, fill: { color: PRIMARY }, line: { type: "none" } });
  s.addText(o, { x: M + 0.28, y: 4.86 + i * 0.48, w: 6.3, h: 0.36, fontFace: F, fontSize: 14.5, color: SOFT, margin: 0 });
});

card(s, 7.45, 1.42, 5.28, 5.35, CARD);
s.addText("IN SCOPE FOR REVIEW 1", { x: 7.8, y: 1.68, w: 4.6, h: 0.3, fontFace: F, fontSize: 14.0, bold: true, color: ACCENT, charSpacing: 2.5, margin: 0 });
const scope = [
  ["Book Management", "add · edit · remove · search by title, author, ISBN, genre"],
  ["Reader Management", "register readers · search by name or ID"],
  ["Circulation", "borrow · return · renew once · place a hold"],
  ["Fines & Dashboard", "auto \u20B910/day fines · live loan statistics"],
];
scope.forEach((r, i) => {
  const y = 2.16 + i * 1.0;
  s.addShape(p.shapes.OVAL, { x: 7.8, y: y + 0.07, w: 0.11, h: 0.11, fill: { color: PRIMARY }, line: { type: "none" } });
  s.addText(r[0], { x: 8.06, y: y - 0.05, w: 4.5, h: 0.32, fontFace: F, fontSize: 16.5, bold: true, color: TEXT, margin: 0 });
  s.addText(r[1], { x: 8.06, y: y + 0.27, w: 4.5, h: 0.52, fontFace: F, fontSize: 13.5, color: MUTED, margin: 0, lineSpacingMultiple: 1.05 });
});
s.addShape(p.shapes.LINE, { x: 7.8, y: 6.12, w: 4.6, h: 0, line: { color: HAIR, width: 1 } });
s.addText("3 files   ·   0 dependencies   ·   100% client-side", { x: 7.8, y: 6.24, w: 4.6, h: 0.3, fontFace: F, fontSize: 14.5, bold: true, color: ACCENT, margin: 0 });

// ============ SLIDE 3 — FINAL SYSTEM OVERVIEW ============
s = p.addSlide();
bg(s); header(s, "Section 3 · Final System Overview", "How Folio works — modules at a glance", "03");

s.addText("The librarian opens one page; everything else happens inside it. Four modules cover the full circulation cycle, and the browser stores all data.", { x: M, y: 1.42, w: 12.1, h: 0.4, fontFace: F, fontSize: 15.0, color: SOFT, margin: 0 });

const mods = [
  ["Dashboard", "Live statistics: total books, active readers, on-loan, overdue + fines due. Quick actions for checkout, add, register.", "01"],
  ["Books", "Catalogue table with search by title / author / ISBN / genre. Add, edit, and remove books (borrowed ones locked).", "02"],
  ["Readers", "Registered members with borrowed counts and remaining slots (max 3 per reader). Search by name or ID.", "03"],
  ["Loans", "Every active loan card: due-date badge, fine tag, hold tag, and one-click renew / hold / return actions.", "04"],
];
mods.forEach((m, i) => {
  const x = 0.7 + (i % 2) * 6.05, y = 2.05 + Math.floor(i / 2) * 2.25;
  card(s, x, y, 5.85, 2.05, CARD);
  s.addText(m[2], { x: x + 0.3, y: y + 0.22, w: 1.0, h: 0.55, fontFace: F, fontSize: 32.0, bold: true, color: PRIMARY, margin: 0 });
  s.addText(m[0], { x: x + 1.25, y: y + 0.26, w: 4.3, h: 0.36, fontFace: F, fontSize: 19.0, bold: true, color: TEXT, margin: 0 });
  s.addText(m[1], { x: x + 1.25, y: y + 0.68, w: 4.35, h: 1.2, fontFace: F, fontSize: 14.0, color: MUTED, margin: 0, lineSpacingMultiple: 1.12 });
});

card(s, 0.7, 6.5, 11.9, 0.6, CARD2);
s.addText([
  { text: "Under the hood:  ", options: { bold: true, color: ACCENT } },
  { text: "seed demo data \u2192 actions validate & mutate state \u2192 save() persists to localStorage \u2192 render() redraws the page.", options: { color: SOFT } },
], { x: 1.0, y: 6.56, w: 11.3, h: 0.48, fontFace: F, fontSize: 14.5, margin: 0, valign: "middle" });

// ============ SLIDE 4 — ARCHITECTURE & DESIGN ============
s = p.addSlide();
bg(s); header(s, "Section 4 · Architecture & Design", "Architecture, design patterns & class model", "04");

const layers = [
  ["PRESENTATION", "index.html  +  styles.css", "Sidebar navigation · content area · modal forms", 1.42, 1.06],
  ["APPLICATION", "app.js — all logic in one module", "Constants · data & storage · actions · renderers · handlers", 2.82, 1.06],
  ["PERSISTENCE", "Browser localStorage", "Keys: folio-books · folio-users  (JSON)", 4.22, 0.92],
];
layers.forEach(L => {
  card(s, 0.7, L[3], 7.2, L[4], CARD);
  s.addText(L[0], { x: 1.0, y: L[3] + 0.12, w: 2.2, h: 0.24, fontFace: F, fontSize: 13.0, bold: true, color: ACCENT, charSpacing: 2.5, margin: 0 });
  s.addText(L[1], { x: 1.0, y: L[3] + 0.34, w: 6.6, h: 0.3, fontFace: F, fontSize: 16.5, bold: true, color: TEXT, margin: 0 });
  s.addText(L[2], { x: 1.0, y: L[3] + 0.63, w: 6.6, h: 0.26, fontFace: F, fontSize: 13.0, color: MUTED, margin: 0 });
});
arrow(s, 3.7, 2.51, 0, 0.28); s.addText("DOM events", { x: 2.42, y: 2.48, w: 1.2, h: 0.28, align: "right", fontFace: F, fontSize: 13.5, color: MUTED, margin: 0 });
s.addShape(p.shapes.LINE, { x: 4.85, y: 2.51, w: 0, h: 0.28, flipV: true, line: { color: "CFC6EC", width: 1.6, endArrowType: "triangle" } });
s.addText("render()", { x: 5.0, y: 2.48, w: 1.4, h: 0.28, fontFace: F, fontSize: 13.5, color: MUTED, margin: 0 });
arrow(s, 3.7, 3.91, 0, 0.28); s.addText("save() \u2192 JSON", { x: 1.9, y: 3.88, w: 1.75, h: 0.28, align: "right", fontFace: F, fontSize: 13.5, color: MUTED, margin: 0 });
s.addShape(p.shapes.LINE, { x: 4.85, y: 3.91, w: 0, h: 0.28, flipV: true, line: { color: "CFC6EC", width: 1.6, endArrowType: "triangle" } });
s.addText("load() \u2190 JSON", { x: 5.0, y: 3.88, w: 1.75, h: 0.28, fontFace: F, fontSize: 13.5, color: MUTED, margin: 0 });

card(s, 8.25, 1.42, 4.45, 2.7, CARD);
s.addText("DESIGN PATTERNS USED", { x: 8.55, y: 1.6, w: 4.0, h: 0.28, fontFace: F, fontSize: 13.5, bold: true, color: ACCENT, charSpacing: 2, margin: 0 });
const pats = [
  ["Module pattern", "one app.js namespace, sectioned"],
  ["MVC-style separation", "state / actions / views"],
  ["Observer-ish re-render", "actions trigger render()"],
  ["Repository over storage", "save() / load() hide persistence"],
];
pats.forEach((r, i) => {
  const y = 1.98 + i * 0.54;
  s.addShape(p.shapes.OVAL, { x: 8.55, y: y + 0.06, w: 0.1, h: 0.1, fill: { color: PRIMARY }, line: { type: "none" } });
  s.addText([{ text: r[0] + "  ", options: { bold: true, color: TEXT } }, { text: "— " + r[1], options: { color: MUTED } }], { x: 8.78, y: y - 0.04, w: 3.85, h: 0.5, fontFace: F, fontSize: 13.5, margin: 0 });
});

s.addText("CLASS MODEL  (Library manages books & users; loan state lives on each Book)", { x: 0.7, y: 5.32, w: 9, h: 0.28, fontFace: F, fontSize: 13.5, bold: true, color: ACCENT, charSpacing: 2, margin: 0 });
const cls = [
  ["Library", "addBook() · borrowBook() · returnBook() · renewBook() · placeHold() · calcFine()"],
  ["Book", "id · title · author · isbn · genre · status · borrowerId · dueDate · renewed · hold"],
  ["User", "id · name · contact · loanedCount() · canBorrow()"],
];
cls.forEach((c, i) => {
  const x = 0.7 + i * 4.12;
  card(s, x, 5.66, 3.92, 1.15, CODEBG);
  s.addText(c[0], { x: x + 0.22, y: 5.78, w: 3.5, h: 0.26, fontFace: F, fontSize: 15.0, bold: true, color: BLUE, margin: 0 });
  s.addText(c[1], { x: x + 0.22, y: 6.06, w: 3.55, h: 0.68, fontFace: MONO, fontSize: 12.0, color: SOFT, margin: 0, lineSpacingMultiple: 1.08 });
});

// ============ SLIDE 5 — CORE FEATURES ============
s = p.addSlide();
bg(s); header(s, "Section 5 · Core Features Implemented", "Everything Review 1 delivers, working end-to-end", "05");

const feats = [
  ["Borrow a book", "Verifies availability and the 3-book limit, sets a 14-day due date.", "borrowBook()"],
  ["Return a book", "Frees the copy and charges \u20B910 per overdue day automatically.", "returnBook() · calcFine()"],
  ["Renew a loan", "Once only, +7 days — blocked if another reader placed a hold.", "renewBook()"],
  ["Place a hold", "Marks a borrowed book so it cannot be renewed by its reader.", "placeHold()"],
  ["Search the catalogue", "Filter books by title, author, ISBN, or genre as you type.", "renderBooks() + filter"],
  ["Register readers", "New members appear instantly with their loan capacity.", "addUser()"],
];
feats.forEach((f, i) => {
  const x = 0.7 + (i % 3) * 4.12, y = 1.6 + Math.floor(i / 3) * 2.5;
  card(s, x, y, 3.92, 2.3, CARD);
  s.addText(f[0], { x: x + 0.25, y: y + 0.22, w: 3.45, h: 0.34, fontFace: F, fontSize: 17.5, bold: true, color: TEXT, margin: 0 });
  s.addText(f[1], { x: x + 0.25, y: y + 0.62, w: 3.45, h: 0.95, fontFace: F, fontSize: 14.0, color: MUTED, margin: 0, lineSpacingMultiple: 1.12 });
  s.addShape(p.shapes.LINE, { x: x + 0.25, y: y + 1.68, w: 3.4, h: 0, line: { color: HAIR, width: 0.75 } });
  s.addText(f[2], { x: x + 0.25, y: y + 1.8, w: 3.45, h: 0.3, fontFace: MONO, fontSize: 13.0, bold: true, color: GREEN, margin: 0 });
});

// ============ SLIDE 6 — TECHNICAL IMPLEMENTATION ============
s = p.addSlide();
bg(s); header(s, "Section 6 · Technical Implementation", "Logic, UI, and data — with classes, methods & schema", "06");

card(s, 0.6, 1.45, 6.35, 3.0, CODEBG);
s.addText("app.js — borrowBook()  (core circulation logic)", { x: 0.9, y: 1.62, w: 5.8, h: 0.26, fontFace: F, fontSize: 13.0, bold: true, color: ACCENT, charSpacing: 1.5, margin: 0 });
const code = [
  ["function ", "borrowBook", "(bookId, userId) {"],
  ["  const b = ", "findBook", "(bookId);"],
  ["  if (!b || b.status !== \"available\")"],
  ["    return \"Book is not available\";"],
  ["  if (loanCount(userId) >= MAX_LOANS) // 3"],
  ["    return \"Reader has reached the limit\";"],
  ["  b.status = \"borrowed\"; b.borrowerId = userId;"],
  ["  b.dueDate = today + LOAN_DAYS;       // 14 d"],
  ["  save(); return null;                 // ok"],
  ["}"],
];
const runs = code.map((ln, i) => ({ text: ln[0] + (ln[1] || "") + (ln[2] || ""), options: { breakLine: i < code.length - 1, color: ln[1] ? ACCENT : "D9E2F2", bold: !!ln[1] } }));
s.addText(runs, { x: 0.9, y: 1.94, w: 5.8, h: 2.4, fontFace: MONO, fontSize: 13.0, valign: "top", margin: 0, lineSpacingMultiple: 1.08 });

card(s, 7.15, 1.45, 5.55, 3.0, CODEBG);
s.addText("Storage schema — SQL-style view of localStorage", { x: 7.45, y: 1.62, w: 5.0, h: 0.26, fontFace: F, fontSize: 13.0, bold: true, color: ACCENT, charSpacing: 1.2, margin: 0 });
const sql = [
  ["CREATE TABLE book (", TEXT],
  ["  id INT PRIMARY KEY,", TEXT],
  ["  title VARCHAR, author VARCHAR,", TEXT],
  ["  isbn VARCHAR, genre VARCHAR,", TEXT],
  ["  status VARCHAR(10), borrower_id INT,", TEXT],
  ["  due_date DATE, renewed BOOLEAN,", TEXT],
  ["  hold BOOLEAN );", TEXT],
  ["CREATE TABLE user (", TEXT],
  ["  id INT PRIMARY KEY,", TEXT],
  ["  name VARCHAR, contact VARCHAR );", TEXT],
];
const runs2 = sql.map((ln, i) => ({ text: ln[0], options: { breakLine: i < sql.length - 1, color: ln[1], fontSize: 12.5 } }));
s.addText(runs2, { x: 7.45, y: 1.94, w: 5.0, h: 2.4, fontFace: MONO, valign: "top", margin: 0, lineSpacingMultiple: 1.06 });

s.addText("BACKEND / LOGIC", { x: 0.6, y: 4.75, w: 3, h: 0.26, fontFace: F, fontSize: 13.5, bold: true, color: ACCENT, charSpacing: 2, margin: 0 });
s.addText("Plain ES6 JavaScript: constants (FINE_RATE \u20B910, MAX_LOANS 3, LOAN_DAYS 14), data arrays, pure action functions that validate \u2192 mutate \u2192 save. OOP via object records: encapsulated loan state, abstracted persistence.", { x: 0.6, y: 5.02, w: 6.35, h: 1.0, fontFace: F, fontSize: 14.0, color: SOFT, margin: 0, lineSpacingMultiple: 1.12 });

s.addText("FRONTEND / UI", { x: 7.15, y: 4.75, w: 3, h: 0.26, fontFace: F, fontSize: 13.5, bold: true, color: ACCENT, charSpacing: 2, margin: 0 });
s.addText("Semantic HTML5 shell, CSS Grid sidebar layout, template-literal renderers per page, one reusable modal for all forms, toast feedback for every action.", { x: 7.15, y: 5.02, w: 5.55, h: 0.95, fontFace: F, fontSize: 14.0, color: SOFT, margin: 0, lineSpacingMultiple: 1.12 });

s.addText("DATABASE INTEGRATION", { x: 0.6, y: 6.12, w: 4, h: 0.26, fontFace: F, fontSize: 13.5, bold: true, color: ACCENT, charSpacing: 2, margin: 0 });
s.addText("No server — Web Storage (localStorage) persists both tables as JSON (folio-books, folio-users) and survives page reloads.", { x: 0.6, y: 6.38, w: 12.1, h: 0.5, fontFace: F, fontSize: 14.0, color: SOFT, margin: 0 });

// ============ SLIDE 7 — TESTING & DEBUGGING ============
s = p.addSlide();
bg(s); header(s, "Section 7 · Testing & Debugging", "How we verified every rule works", "07");

const tt = [
  ["Manual unit testing", "Each action tested against its rule: borrow blocked when unavailable, at 3-loan limit, or on invalid IDs.", "Chrome DevTools console"],
  ["Integration testing", "Full cycles exercised: borrow \u2192 renew \u2192 hold \u2192 return \u2192 fine, verifying state and UI update together.", "Live app + seeded data"],
  ["State persistence tests", "localStorage inspected in the Application tab after every mutation; reload proves data survives.", "DevTools Application tab"],
  ["Edge-case checks", "Empty states (no books/readers/loans), overdue boundaries (due today vs late), delete-while-borrowed block.", "Seeded demo scenarios"],
];
tt.forEach((t, i) => {
  const x = 0.7 + (i % 2) * 6.05, y = 1.6 + Math.floor(i / 2) * 2.2;
  card(s, x, y, 5.85, 2.0, CARD);
  s.addText(t[0], { x: x + 0.28, y: y + 0.2, w: 5.3, h: 0.34, fontFace: F, fontSize: 17.5, bold: true, color: TEXT, margin: 0 });
  s.addText(t[1], { x: x + 0.28, y: y + 0.6, w: 5.3, h: 0.85, fontFace: F, fontSize: 14.0, color: MUTED, margin: 0, lineSpacingMultiple: 1.12 });
  s.addText("Tools:  " + t[2], { x: x + 0.28, y: y + 1.58, w: 5.3, h: 0.28, fontFace: F, fontSize: 13.0, bold: true, color: GREEN, margin: 0 });
});

card(s, 0.7, 6.15, 11.9, 0.85, CARD2);
s.addText([
  { text: "Summary of results:  ", options: { bold: true, color: ACCENT } },
  { text: "all 7 business rules verified working — 3-book limit, 14-day loans, single renewal, hold blocks renewal, \u20B910/day fines, availability checks, borrowed-delete block. No known defects at Review 1.", options: { color: SOFT } },
], { x: 1.0, y: 6.27, w: 11.3, h: 0.62, fontFace: F, fontSize: 14.5, margin: 0, valign: "middle" });

// ============ SLIDE 8 — CHALLENGES & SOLUTIONS ============
s = p.addSlide();
bg(s); header(s, "Section 8 · Challenges & Solutions", "Issues we hit — and how we fixed them", "08");

const ch = [
  ["Focus lost while searching", "Re-rendering the book list on every keystroke cleared the search box mid-typing.", "Re-focus the input and restore the caret position after each render."],
  ["Deleting borrowed books", "Removing a borrowed title would orphan an active loan and corrupt statistics.", "Block removal while status = borrowed; require a return first (disabled button + tooltip)."],
  ["Renewal abuse", "Unlimited renewals could stall popular titles indefinitely.", "One renewal per loan; a placed hold hard-blocks renewal."],
  ["Team merge conflicts", "Four members editing one app.js caused overwrites.", "Sectioned file (10 labelled sections) + Git feature branches with review before merge."],
];
ch.forEach((c, i) => {
  const y = 1.55 + i * 1.32;
  card(s, 0.7, y, 12.0, 1.16, CARD);
  s.addText(c[0], { x: 1.0, y: y + 0.14, w: 3.1, h: 0.62, fontFace: F, fontSize: 15.5, bold: true, color: TEXT, margin: 0, valign: "top" });
  s.addText([{ text: "Issue: ", options: { bold: true, color: RED } }, { text: c[1], options: { color: MUTED } }], { x: 4.3, y: y + 0.12, w: 4.15, h: 0.95, fontFace: F, fontSize: 13.5, margin: 0, lineSpacingMultiple: 1.08 });
  s.addText([{ text: "Fix: ", options: { bold: true, color: GREEN } }, { text: c[2], options: { color: SOFT } }], { x: 8.65, y: y + 0.12, w: 3.85, h: 0.95, fontFace: F, fontSize: 13.5, margin: 0, lineSpacingMultiple: 1.08 });
  if (i < 3) s.addShape(p.shapes.LINE, { x: 1.0, y: y + 1.24, w: 11.4, h: 0, line: { color: HAIR, width: 0.75 } });
});

// ============ SLIDE 9 — CONCLUSION & OUTCOMES ============
s = p.addSlide();
bg(s); header(s, "Section 9 · Conclusion & Outcomes", "Final status — objectives met", "09");

card(s, 0.7, 1.55, 5.9, 3.1, CARD);
s.addText("FINAL PRODUCT STATUS", { x: 1.0, y: 1.78, w: 5.3, h: 0.3, fontFace: F, fontSize: 14.0, bold: true, color: ACCENT, charSpacing: 2.5, margin: 0 });
const status = [
  "Fully working prototype, live in the browser",
  "All circulation features functional end-to-end",
  "Data persists across sessions — no setup needed",
  "Demo-ready with realistic seeded data",
];
status.forEach((d, i) => {
  const y = 2.26 + i * 0.6;
  s.addText("\u2713", { x: 1.0, y: y - 0.04, w: 0.3, h: 0.3, fontFace: F, fontSize: 16.0, bold: true, color: GREEN, margin: 0 });
  s.addText(d, { x: 1.36, y, w: 5.1, h: 0.34, fontFace: F, fontSize: 14.5, color: SOFT, margin: 0 });
});

card(s, 6.85, 1.55, 5.85, 3.1, CARD);
s.addText("OBJECTIVES VS OUTCOMES", { x: 7.15, y: 1.78, w: 5.3, h: 0.3, fontFace: F, fontSize: 14.0, bold: true, color: ACCENT, charSpacing: 2.5, margin: 0 });
const oc = [
  "Digital circulation — achieved",
  "Rule enforcement in code — achieved (7/7 rules)",
  "Automatic fine calculation — achieved (\u20B910/day)",
  "Single dashboard for the librarian — achieved",
];
oc.forEach((d, i) => {
  const y = 2.26 + i * 0.6;
  s.addText("\u2713", { x: 7.15, y: y - 0.04, w: 0.3, h: 0.3, fontFace: F, fontSize: 16.0, bold: true, color: GREEN, margin: 0 });
  s.addText(d, { x: 7.51, y, w: 5.0, h: 0.34, fontFace: F, fontSize: 14.5, color: SOFT, margin: 0 });
});

card(s, 0.7, 4.95, 12.0, 1.9, CARD2);
s.addText("WHAT THE REVIEW PANEL WILL SEE", { x: 1.0, y: 5.15, w: 6, h: 0.3, fontFace: F, fontSize: 14.0, bold: true, color: ACCENT, charSpacing: 2.5, margin: 0 });
s.addText("A one-click demo: open index.html \u2192 borrow a book as Maya \u2192 renew it \u2192 place a hold as Noah \u2192 watch renewal become blocked \u2192 return 3-days-late Sapiens and watch the \u20B930 fine appear. Every number on the dashboard updates live.", { x: 1.0, y: 5.5, w: 11.4, h: 1.2, fontFace: F, fontSize: 15.5, color: SOFT, margin: 0, lineSpacingMultiple: 1.18 });

// ============ SLIDE 10 — FUTURE WORK ============
s = p.addSlide();
bg(s); header(s, "Section 10 · Future Work", "What's missing — and where Folio goes next", "10");

card(s, 0.7, 1.55, 5.9, 4.6, CARD);
s.addText("CURRENT LIMITATIONS", { x: 1.0, y: 1.78, w: 5.3, h: 0.3, fontFace: F, fontSize: 14.0, bold: true, color: RED, charSpacing: 2.5, margin: 0 });
const lim = [
  "Single-machine storage — no sync between devices",
  "No authentication — anyone can act as the librarian",
  "One copy per title — no multi-copy inventory",
  "Manual testing only — no automated test suite",
  "Fine is computed, not recorded as paid/unpaid",
];
lim.forEach((d, i) => {
  const y = 2.26 + i * 0.72;
  s.addText("\u2013", { x: 1.0, y: y - 0.04, w: 0.3, h: 0.3, fontFace: F, fontSize: 16.0, bold: true, color: RED, margin: 0 });
  s.addText(d, { x: 1.36, y, w: 5.1, h: 0.56, fontFace: F, fontSize: 14.5, color: SOFT, margin: 0 });
});

card(s, 6.85, 1.55, 5.85, 4.6, CARD);
s.addText("EXPANSION IDEAS", { x: 7.15, y: 1.78, w: 5.3, h: 0.3, fontFace: F, fontSize: 14.0, bold: true, color: GREEN, charSpacing: 2.5, margin: 0 });
const exp = [
  "Move to a real backend (Java + SQL) using our schema",
  "Login roles: librarian vs member self-service",
  "Email/SMS reminders before due dates",
  "Fine payment tracking and receipts",
  "Barcode support for faster check-in/out",
];
exp.forEach((d, i) => {
  const y = 2.26 + i * 0.72;
  s.addText("\u2192", { x: 7.15, y: y - 0.04, w: 0.3, h: 0.3, fontFace: F, fontSize: 16.0, bold: true, color: GREEN, margin: 0 });
  s.addText(d, { x: 7.51, y, w: 5.0, h: 0.56, fontFace: F, fontSize: 14.5, color: SOFT, margin: 0 });
});

s.addShape(p.shapes.LINE, { x: 0.7, y: 6.45, w: 12.0, h: 0, line: { color: HAIR, width: 1 } });
s.addText("Thank you — Questions?", { x: 0.7, y: 6.6, w: 8, h: 0.4, fontFace: F, fontSize: 20.0, bold: true, color: TEXT, margin: 0 });
s.addText("Team Folio · Abhin Joe Saji · Athul Pious · Adwaid P · Nanda Kishor K", { x: 4.8, y: 6.68, w: 7.9, h: 0.3, align: "right", fontFace: F, fontSize: 13.5, color: MUTED, margin: 0 });

p.writeFile({ fileName: "C:/Users/abhin/AppData/Local/Temp/JavaProject_Review1_new.pptx" }).then(() => console.log("PPTX written"));

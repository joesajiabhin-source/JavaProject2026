/* ============================================================
   Folio — Library Manager  |  Frontend JavaScript
   Communicates with Java Spring Boot REST API via fetch().
   No localStorage — all data lives on the server.

   SECTION 1 — API Layer        : fetch() wrappers for all endpoints
   SECTION 2 — Helpers          : formatting, escaping, debounce
   SECTION 3 — UI Utilities     : toast, navigation, render dispatcher
   SECTION 4 — Templates       : shared row / card / badge HTML
   SECTION 5 — Page Renderers   : Overview, Books, Readers, Loans (with History)
   SECTION 6 — Modal           : popup forms & detail dialogs
   SECTION 7 — Form Handlers   : process submitted forms & actions
   SECTION 8 — Initialization  : bind events, first render
   ============================================================ */


/* ============================================================
   SECTION 1 — API LAYER
   All server communication goes through these functions.
   ============================================================ */

const api = {
  async getStats()       { return (await fetch("/api/stats")).json(); },
  async getBooks(q)      { return (await fetch("/api/books" + (q ? "?q=" + encodeURIComponent(q) : ""))).json(); },
  async getAvailable()   { return (await fetch("/api/books/available")).json(); },
  async getBook(id)      { const r = await fetch("/api/books/" + id); return r.ok ? r.json() : null; },
  async getLoans()       { return (await fetch("/api/loans")).json(); },
  async getUsers(q)      { return (await fetch("/api/users" + (q ? "?q=" + encodeURIComponent(q) : ""))).json(); },
  async getUser(id)      { const r = await fetch("/api/users/" + id); return r.ok ? r.json() : null; },
  async getHistory(uid)  { return (await fetch("/api/history" + (uid ? "?userId=" + uid : ""))).json(); },

  async addBook(data)    { return (await fetch("/api/books",   { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) })).json(); },
  async updateBook(id,d) { return (await fetch("/api/books/"+id, { method: "PUT",  headers: {"Content-Type":"application/json"}, body: JSON.stringify(d) })).json(); },
  async removeBook(id)   { return (await fetch("/api/books/"+id, { method: "DELETE" })).json(); },
  async addUser(data)    { return (await fetch("/api/users",   { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) })).json(); },
  async updateUser(id,d) { return (await fetch("/api/users/"+id, { method: "PUT",  headers: {"Content-Type":"application/json"}, body: JSON.stringify(d) })).json(); },
  async removeUser(id)   { return (await fetch("/api/users/"+id, { method: "DELETE" })).json(); },
  async borrow(data)     { return (await fetch("/api/borrow",  { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(data) })).json(); },
  async returnBook(id)   { return (await fetch("/api/return/"+id, { method: "POST" })).json(); },
  async renewBook(id)    { return (await fetch("/api/renew/"+id,  { method: "POST" })).json(); },
  async placeHold(id)    { return (await fetch("/api/hold/"+id,   { method: "POST" })).json(); },
  async payFine(id)      { return (await fetch("/api/history/"+id+"/pay", { method: "POST" })).json(); },
};


/* ============================================================
   SECTION 2 — HELPERS
   ============================================================ */

const $ = id => document.getElementById("id_" + id);

const DAY       = 86400000;
const MAX_LOANS = 3;

const daysLeft = due => {
  if (!due) return 0;
  const parts = String(due).split("-").map(Number);
  const dueMidnight = new Date(parts[0], parts[1] - 1, parts[2]).getTime();
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((dueMidnight - todayMidnight) / DAY);
};

const fmtDate = iso => {
  if (!iso) return "—";
  const parts = String(iso).split("-").map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString("en", {
      day: "numeric", month: "short", year: "numeric"
    });
  }
  return new Date(iso).toLocaleDateString("en", {
    day: "numeric", month: "short", year: "numeric"
  });
};

const fmtMoney = n => "₹" + n;

const initials = name => name.split(" ").filter(Boolean)
  .map(w => w[0]).join("").slice(0, 2).toUpperCase();

/* Escape values before they land in HTML — keeps quotes or < from breaking markup */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* Debounced search — one request after typing pauses */
const debounce = (fn, ms = 250) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

function spineColor(text) {
  const colors = ["#b94f3d", "#1f5d50", "#d69a35", "#54708f", "#7a556f", "#765c3c"];
  const hash = [...(text || "")].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return colors[hash % colors.length];
}


/* ============================================================
   SECTION 3 — UI UTILITIES
   ============================================================ */

let page = "overview";
const content = () => document.getElementById("content");

function toast(msg, isError = false) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast" + (isError ? " error" : "");
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function navigateTo(p) {
  page = p;
  document.querySelectorAll(".nav-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.page === p));
  document.querySelector(".sidebar").classList.remove("open");
  render();
}

function render() {
  const pages = { overview: renderOverview, books: renderBooks,
                  readers: renderReaders, loans: renderLoans };
  pages[page]().catch(() => toast("Could not reach the server", true));
}

function pageHead(eyebrow, title, sub, actions = "") {
  return `<div class="page-head">
    <div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${sub}</p></div>
    ${actions}
  </div>`;
}

/* Guards against out-of-order search responses overwriting newer results. */
let searchSeq = 0;


/* ============================================================
   SECTION 4 — TEMPLATES
   One definition per repeated piece of markup.
   ============================================================ */

const bookRow = b => `<tr>
  <td><strong>${esc(b.title)}</strong><br><span class="mono">${esc(b.author)}</span></td>
  <td>${esc(b.genre)}</td>
  <td class="mono">${esc(b.isbn)}</td>
  <td><span class="pill ${b.status === "available" ? "available" : "borrowed"}">
    <span class="pill-dot"></span>${b.status === "available" ? "Available" : "Borrowed"}</span></td>
  <td><button class="btn btn-secondary btn-sm" onclick="openModal('update', ${b.id})">✎ Edit</button></td>
  <td><button class="btn btn-danger" ${b.status === "borrowed" ? "disabled title='Return first'" : ""}
        onclick="doRemoveBook(${b.id})">✕</button></td>
</tr>`;

const loanRow = l => {
  const b = l.book, d = daysLeft(b.dueDate);
  return `<tr>
    <td><strong>${esc(b.title)}</strong><br><span class="mono">${esc(b.author)}</span></td>
    <td>${esc(l.borrowerName)}</td>
    <td>${dueBadge(d)}</td>
    <td>${fineTag(l.fine) || "—"}</td>
  </tr>`;
};

const readerCard = u => {
  const n = u.loans;
  return `<div class="card reader-card">
    <div class="avatar">${esc(initials(u.name))}</div>
    <div class="eyebrow">Reader ${String(u.id).padStart(2, "0")}</div>
    <h3>${esc(u.name)}</h3>
    <p>${esc(u.contact)}</p>
    <div class="reader-meta">
      <span><strong>${n}</strong> borrowed</span>
      <span><strong>${MAX_LOANS - n}</strong> slots open</span>
    </div>
    <div class="quick-actions" style="margin-top: 14px;">
      <button class="btn btn-secondary btn-sm" onclick="openModal('viewUser', ${u.id})">👁 Details</button>
      <button class="btn btn-secondary btn-sm" onclick="openModal('updateUser', ${u.id})">✎ Edit</button>
      <button class="btn btn-danger btn-sm" ${n > 0 ? "disabled title='Return all borrowed books first'" : ""}
              onclick="doRemoveUser(${u.id})">✕</button>
    </div>
  </div>`;
};

const loanCard = l => {
  const b = l.book, d = daysLeft(b.dueDate);
  return `<div class="card loan-card">
    <div class="loan-spine" style="background:${spineColor(b.title)}"><span>${esc(b.genre)}</span></div>
    <div class="loan-body">
      ${dueBadge(d)}
      ${fineTag(l.fine)}
      ${b.onHold ? '<span class="hold-tag">Hold</span>' : ""}
      <h3>${esc(b.title)}</h3>
      <p>${esc(b.author)}</p>
      <dl class="loan-info">
        <div><dt>Reader</dt><dd>${esc(l.borrowerName)}</dd></div>
        <div><dt>Due date</dt><dd>${fmtDate(b.dueDate)}</dd></div>
      </dl>
      <div class="loan-actions">
        <button class="btn btn-secondary" ${b.renewed ? "disabled" : ""} onclick="doRenew(${b.id})">
          ↻ ${b.renewed ? "Renewed" : "Renew"}</button>
        <button class="btn btn-secondary" ${b.onHold ? "disabled" : ""} onclick="doPlaceHold(${b.id})">
          ⊕ ${b.onHold ? "On Hold" : "Hold"}</button>
        <button class="btn btn-primary" onclick="doReturn(${b.id})">✓ Return</button>
      </div>
    </div>
  </div>`;
};

const historyRow = h => `<tr>
  <td><strong>${esc(h.bookTitle)}</strong></td>
  <td>${esc(h.userName)}</td>
  <td>${fmtDate(h.borrowDate)}</td>
  <td>${fmtDate(h.dueDate)}</td>
  <td>${fmtDate(h.returnDate)}</td>
  <td>${h.fineAmount > 0 ? fineTag(h.fineAmount) : "—"}</td>
  <td>
    ${h.fineAmount === 0
      ? '<span class="pill available"><span class="pill-dot"></span>Settled</span>'
      : (h.finePaid
          ? '<span class="pill available"><span class="pill-dot"></span>Paid</span>'
          : '<span class="pill borrowed"><span class="pill-dot"></span>Unpaid</span>')
    }
  </td>
  <td>
    ${h.fineAmount > 0 && !h.finePaid
      ? `<button class="btn btn-primary btn-sm" onclick="doPayFine(${h.id})">Mark Paid</button>`
      : "—"}
  </td>
</tr>`;

const dueBadge = d => `<span class="due-badge ${d < 0 ? "overdue" : d <= 2 ? "soon" : "ok"}">
  ${d < 0 ? Math.abs(d) + "d overdue" : d === 0 ? "Due today" : d + "d left"}</span>`;

const fineTag = f => f > 0 ? `<span class="fine-tag">${fmtMoney(f)}</span>` : "";

const EMPTY = {
  books:   '<div class="empty"><span>📖</span>No books found.</div>',
  readers: '<div class="empty"><span>👥</span>No readers found.</div>',
  loans:   '<div class="empty"><span>📚</span>No active loans — every book is home.</div>',
  history: '<div class="empty"><span>📜</span>No borrowing history recorded yet.</div>',
};


/* ============================================================
   SECTION 5 — PAGE RENDERERS
   Each function fetches data from the API, then rebuilds HTML.
   ============================================================ */

async function renderOverview() {
  const [stats, loans] = await Promise.all([api.getStats(), api.getLoans()]);

  content().innerHTML = `
    ${pageHead("Dashboard", `Good morning, <em>Librarian.</em>`,
      "Here's what's happening across your shelves today.",
      `<button class="btn btn-primary" onclick="openModal('borrow')">↗ Check out book</button>`)}

    <div class="stats">
      <div class="card stat">
        <span class="value">${stats.totalBooks}</span>
        <span class="label">Total books</span>
        <span class="note">${stats.available} ready to borrow</span>
      </div>
      <div class="card stat">
        <span class="value">${stats.totalReaders}</span>
        <span class="label">Active readers</span>
        <span class="note">Registered members</span>
      </div>
      <div class="card stat">
        <span class="value">${stats.onLoan}</span>
        <span class="label">On loan</span>
        <span class="note">Across all readers</span>
      </div>
      <div class="card stat ${stats.overdue > 0 ? "urgent" : ""}">
        <span class="value">${stats.overdue}</span>
        <span class="label">Overdue</span>
        <span class="note">${fmtMoney(stats.totalFines)} in fines</span>
      </div>
    </div>

    <div class="card mb">
      <div class="eyebrow">Quick actions</div>
      <div class="quick-actions">
        <button class="btn btn-primary" onclick="openModal('book')">＋ Add book</button>
        <button class="btn btn-primary" onclick="openModal('user')">＋ Register reader</button>
        <button class="btn btn-secondary" onclick="navigateTo('loans')">↩ Return a book</button>
      </div>
    </div>

    ${loans.length > 0 ? `
      <div class="card">
        <div class="eyebrow">Recent loans</div>
        <div class="table-wrap"><table>
          <thead><tr><th>Book</th><th>Reader</th><th>Due</th><th>Fine</th></tr></thead>
          <tbody>${loans.map(loanRow).join("")}</tbody>
        </table></div>
      </div>
    ` : EMPTY.loans}`;
}

async function renderBooks() {
  const q = ($("bookSearch")?.value || "");
  const list = await api.getBooks(q);

  content().innerHTML = `
    ${pageHead("The collection", `Books & <em>editions.</em>`,
      "Manage every title in your catalogue.",
      `<button class="btn btn-primary" onclick="openModal('book')">＋ Add book</button>`)}

    <div class="card flush">
      <div class="search-bar">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" id="id_bookSearch" placeholder="Search by title, author, ISBN, or genre..."
                 value="${esc(q)}" oninput="filterBooks(this.value)">
        </div>
        <button class="btn btn-secondary" onclick="openModal('borrow')">＋ Check out</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Title</th><th>Genre</th><th>ISBN</th><th>Status</th><th></th><th></th></tr></thead>
        <tbody>${list.map(bookRow).join("")}</tbody>
      </table>
      ${list.length === 0 ? EMPTY.books : ""}</div>
    </div>`;

  const inp = $("bookSearch");
  if (q && inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
}

const filterBooks = debounce(async q => {
  const seq = ++searchSeq;
  const list = await api.getBooks(q);
  if (seq !== searchSeq) return;

  const tbody = document.querySelector(".table-wrap tbody");
  const wrap  = document.querySelector(".table-wrap");
  if (!tbody || !wrap) return;
  tbody.innerHTML = list.map(bookRow).join("");

  const emptyEl = wrap.querySelector(".empty");
  if (list.length === 0 && !emptyEl) wrap.insertAdjacentHTML("beforeend", EMPTY.books);
  if (list.length > 0 && emptyEl)    emptyEl.remove();
});

async function renderReaders() {
  const q = ($("userSearch")?.value || "");
  const list = await api.getUsers(q);

  content().innerHTML = `
    ${pageHead("Community", `Your <em>readers.</em>`,
      "Registered members and their borrowing activity.",
      `<button class="btn btn-primary" onclick="openModal('user')">＋ New reader</button>`)}

    <div class="card flush mb">
      <div class="search-bar">
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" id="id_userSearch" placeholder="Search by name or user ID..."
                 value="${esc(q)}" oninput="filterReaders(this.value)">
        </div>
      </div>
    </div>

    <div class="reader-grid">
      ${list.map(readerCard).join("")}
      ${list.length === 0 ? EMPTY.readers : ""}
    </div>`;

  const inp = $("userSearch");
  if (q && inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
}

const filterReaders = debounce(async q => {
  const seq = ++searchSeq;
  const list = await api.getUsers(q);
  if (seq !== searchSeq) return;

  const grid = document.querySelector(".reader-grid");
  if (grid) grid.innerHTML = list.map(readerCard).join("")
    + (list.length === 0 ? EMPTY.readers : "");
});

async function renderLoans() {
  const [loans, history] = await Promise.all([api.getLoans(), api.getHistory()]);

  content().innerHTML = `
    ${pageHead("Circulation", `Loans & <em>returns.</em>`,
      "Track due dates, renew once, and return titles to the shelf.")}

    <div class="loan-grid mb">
      ${loans.map(loanCard).join("")}
      ${loans.length === 0 ? EMPTY.loans : ""}
    </div>

    <div class="card" style="margin-top: 32px;">
      <div class="eyebrow">Audit & Archive</div>
      <h2>📜 Borrowing History & Fines</h2>
      ${history.length > 0 ? `
        <div class="table-wrap"><table>
          <thead><tr><th>Book</th><th>Reader</th><th>Borrowed</th><th>Due</th><th>Returned</th><th>Fine</th><th>Payment Status</th><th></th></tr></thead>
          <tbody>${history.map(historyRow).join("")}</tbody>
        </table></div>
      ` : EMPTY.history}
    </div>`;
}


/* ============================================================
   SECTION 6 — MODAL
   ============================================================ */

async function openModal(type, targetId) {
  let title, eyebrow, form;

  if (type === "book") {
    title = "Add a new book";
    eyebrow = "Grow the collection";
    form = `<form class="form-grid" onsubmit="handleAddBook(event)">
      <div class="field"><label>Book title</label><input name="title" required autofocus></div>
      <div class="field"><label>Author</label><input name="author" required></div>
      <div class="field"><label>ISBN</label><input name="isbn" required></div>
      <div class="field"><label>Genre</label><input name="genre" required></div>
      <button class="btn btn-primary">＋ Add book</button>
    </form>`;

  } else if (type === "user") {
    title = "Register a reader";
    eyebrow = "New library member";
    form = `<form class="form-grid" onsubmit="handleAddUser(event)">
      <div class="field"><label>Full name</label><input name="name" required autofocus></div>
      <div class="field"><label>Contact</label><input name="contact" required></div>
      <button class="btn btn-primary">＋ Register reader</button>
    </form>`;

  } else if (type === "borrow") {
    const [avail, users] = await Promise.all([api.getAvailable(), api.getUsers()]);
    if (avail.length === 0 || users.length === 0)
      return toast("Need at least one available book and one reader", true);
    title = "Check out a book";
    eyebrow = "14-day lending period";
    form = `<form class="form-grid" onsubmit="handleBorrow(event)">
      <div class="field"><label>Available book</label><select name="bookId" required>
        <option value="" disabled selected>Select a book</option>
        ${avail.map(b => `<option value="${b.id}">${esc(b.title)}</option>`).join("")}</select></div>
      <div class="field"><label>Reader</label><select name="userId" required>
        <option value="" disabled selected>Select a reader</option>
        ${users.map(u => `<option value="${u.id}">${esc(u.name)}</option>`).join("")}</select></div>
      <button class="btn btn-primary">↗ Confirm checkout</button>
    </form>`;

  } else if (type === "update") {
    const b = await api.getBook(targetId);
    if (!b) return toast("Book not found", true);
    title = "Update book details";
    eyebrow = "Edit catalogue entry";
    form = `<form class="form-grid" onsubmit="handleUpdateBook(event, ${b.id})">
      <div class="field"><label>Book title</label><input name="title" value="${esc(b.title)}" required autofocus></div>
      <div class="field"><label>Author</label><input name="author" value="${esc(b.author)}" required></div>
      <div class="field"><label>ISBN</label><input name="isbn" value="${esc(b.isbn)}" required></div>
      <div class="field"><label>Genre</label><input name="genre" value="${esc(b.genre)}" required></div>
      <button class="btn btn-primary">✓ Save changes</button>
    </form>`;

  } else if (type === "updateUser") {
    const u = await api.getUser(targetId);
    if (!u) return toast("Reader not found", true);
    title = "Update reader details";
    eyebrow = `Reader ${String(u.id).padStart(2, "0")}`;
    form = `<form class="form-grid" onsubmit="handleUpdateUser(event, ${u.id})">
      <div class="field"><label>Full name</label><input name="name" value="${esc(u.name)}" required autofocus></div>
      <div class="field"><label>Contact</label><input name="contact" value="${esc(u.contact)}" required></div>
      <button class="btn btn-primary">✓ Save changes</button>
    </form>`;

  } else if (type === "viewUser") {
    const [u, hist] = await Promise.all([api.getUser(targetId), api.getHistory(targetId)]);
    if (!u) return toast("Reader not found", true);
    title = esc(u.name);
    eyebrow = `Reader ${String(u.id).padStart(2, "0")}`;

    const booksHtml = u.borrowedBooks && u.borrowedBooks.length > 0 ? `
      <div class="table-wrap mb"><table>
        <thead><tr><th>Book</th><th>Due Date</th><th>Overdue Fine</th></tr></thead>
        <tbody>${u.borrowedBooks.map(b => {
          const d = daysLeft(b.dueDate);
          return `<tr>
            <td><strong>${esc(b.title)}</strong><br><span class="mono">${esc(b.author)}</span></td>
            <td>${dueBadge(d)} <span class="mono">${fmtDate(b.dueDate)}</span></td>
            <td>${fineTag(b.fine) || "—"}</td>
          </tr>`;
        }).join("")}</tbody>
      </table></div>
    ` : '<p style="opacity: .7; margin-bottom: 16px;">No books currently borrowed.</p>';

    const histHtml = hist && hist.length > 0 ? `
      <div class="table-wrap mb"><table>
        <thead><tr><th>Book</th><th>Returned</th><th>Fine</th><th>Status</th></tr></thead>
        <tbody>${hist.map(h => `<tr>
          <td><strong>${esc(h.bookTitle)}</strong></td>
          <td>${fmtDate(h.returnDate)}</td>
          <td>${h.fineAmount > 0 ? fineTag(h.fineAmount) : "₹0"}</td>
          <td>${h.fineAmount === 0 ? "—" : (h.finePaid ? '<span class="pill available"><span class="pill-dot"></span>Paid</span>' : '<span class="pill borrowed"><span class="pill-dot"></span>Unpaid</span>')}</td>
        </tr>`).join("")}</tbody>
      </table></div>
    ` : '<p style="opacity: .7; margin-bottom: 16px;">No past borrowing history.</p>';

    form = `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 14px;">
          <div><span class="eyebrow">Contact</span><div><strong>${esc(u.contact)}</strong></div></div>
          ${u.totalFines > 0 ? `<div><span class="eyebrow">Live Fines</span><div><strong style="color:var(--gold);">${fmtMoney(u.totalFines)}</strong></div></div>` : ""}
        </div>

        <div class="eyebrow">Currently Borrowed (${u.borrowedBooks ? u.borrowedBooks.length : 0})</div>
        ${booksHtml}

        <div class="eyebrow">Past Borrowing History (${hist ? hist.length : 0})</div>
        ${histHtml}
      </div>
      <div class="quick-actions" style="margin-top: 14px;">
        <button class="btn btn-secondary" onclick="closeModal(); openModal('updateUser', ${u.id})">✎ Edit Reader</button>
        <button class="btn btn-danger" ${(u.borrowedBooks && u.borrowedBooks.length > 0) ? "disabled title='Return books first'" : ""}
                onclick="closeModal(); doRemoveUser(${u.id})">✕ Delete Reader</button>
      </div>`;
  }

  const ov = document.createElement("div");
  ov.className = "modal-overlay";
  ov.innerHTML = `
    <div class="modal">
      <button class="modal-close" onclick="closeModal()">✕</button>
      <div class="eyebrow">${eyebrow}</div>
      <h2>${title}</h2>
      ${form}
    </div>`;

  ov.addEventListener("mousedown", e => { if (e.target === ov) closeModal(); });
  document.body.appendChild(ov);
}

function closeModal() {
  document.querySelector(".modal-overlay")?.remove();
}


/* ============================================================
   SECTION 7 — FORM & ACTION HANDLERS
   ============================================================ */

const formValues = form => Object.fromEntries(new FormData(form).entries());

async function handleAddBook(e) {
  e.preventDefault();
  const d = formValues(e.target);
  const res = await api.addBook({ title: d.title.trim(), author: d.author.trim(),
                                  isbn: d.isbn.trim(), genre: d.genre.trim() });
  if (res && res.error) return toast(res.error, true);
  closeModal(); toast("Book added to the collection"); render();
}

async function handleUpdateBook(e, id) {
  e.preventDefault();
  const d = formValues(e.target);
  const res = await api.updateBook(id, { title: d.title.trim(), author: d.author.trim(),
                                          isbn: d.isbn.trim(), genre: d.genre.trim() });
  if (res && res.error) return toast(res.error, true);
  closeModal(); toast("Book updated successfully"); render();
}

async function handleAddUser(e) {
  e.preventDefault();
  const d = formValues(e.target);
  const res = await api.addUser({ name: d.name.trim(), contact: d.contact.trim() });
  if (res && res.error) return toast(res.error, true);
  closeModal(); toast("New reader registered"); render();
}

async function handleUpdateUser(e, id) {
  e.preventDefault();
  const d = formValues(e.target);
  const res = await api.updateUser(id, { name: d.name.trim(), contact: d.contact.trim() });
  if (res && res.error) return toast(res.error, true);
  closeModal(); toast("Reader updated successfully"); render();
}

async function doRemoveUser(id) {
  const res = await api.removeUser(id);
  if (res && res.error) return toast(res.error, true);
  toast("Reader removed"); render();
}

async function handleBorrow(e) {
  e.preventDefault();
  const d = formValues(e.target);
  const res = await api.borrow({ bookId: +d.bookId, userId: +d.userId });
  if (res && res.error) return toast(res.error, true);
  closeModal(); toast("Book checked out for 14 days"); render();
}

async function doReturn(id) {
  const res = await api.returnBook(id);
  if (res && res.error) return toast(res.error, true);
  toast(res.fine > 0 ? "Book returned. Late fee: " + fmtMoney(res.fine) : "Book returned and ready to borrow");
  render();
}

async function doRenew(id) {
  const res = await api.renewBook(id);
  if (res && res.error) return toast(res.error, true);
  toast("Loan extended by 7 days"); render();
}

async function doPlaceHold(id) {
  const res = await api.placeHold(id);
  if (res && res.error) return toast(res.error, true);
  toast("Hold placed — renewal is now blocked"); render();
}

async function doRemoveBook(id) {
  const res = await api.removeBook(id);
  if (res && res.error) return toast(res.error, true);
  toast("Book removed"); render();
}

async function doPayFine(id) {
  const res = await api.payFine(id);
  if (res && res.error) return toast(res.error, true);
  toast("Fine marked as paid");
  render();
}


/* ============================================================
   SECTION 8 — INITIALIZATION
   ============================================================ */

document.querySelectorAll(".nav-btn").forEach(btn =>
  btn.addEventListener("click", () => navigateTo(btn.dataset.page)));

document.getElementById("menuToggle").addEventListener("click", () =>
  document.querySelector(".sidebar").classList.toggle("open"));

render();

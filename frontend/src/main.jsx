import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  ArrowRightLeft,
  Bookmark,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  HelpCircle,
  Library,
  Menu,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import "./styles.css";

/* ─── Constants & Seed Data ──────────────────────────────────── */

const DAY = 86400000;
const today = new Date();
const dateFromNow = (days) =>
  new Date(today.getTime() + days * DAY).toISOString().slice(0, 10);
const formatToday = () =>
  today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

const seedBooks = [
  {
    id: "b1",
    title: "The Midnight Library",
    author: "Matt Haig",
    isbn: "9780525559498",
    genre: "Fiction",
    status: "available",
    borrowerId: null,
    dueDate: null,
    renewed: false,
    holdUserId: null,
  },
  {
    id: "b2",
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9780735211292",
    genre: "Self-growth",
    status: "borrowed",
    borrowerId: "u1",
    dueDate: dateFromNow(4),
    renewed: false,
    holdUserId: null,
  },
  {
    id: "b3",
    title: "Sapiens",
    author: "Yuval Noah Harari",
    isbn: "9780062316097",
    genre: "History",
    status: "borrowed",
    borrowerId: "u2",
    dueDate: dateFromNow(-3),
    renewed: false,
    holdUserId: null,
  },
  {
    id: "b4",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    isbn: "9780465050659",
    genre: "Design",
    status: "available",
    borrowerId: null,
    dueDate: null,
    renewed: false,
    holdUserId: null,
  },
  {
    id: "b5",
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    isbn: "9780553380163",
    genre: "Science",
    status: "available",
    borrowerId: null,
    dueDate: null,
    renewed: false,
    holdUserId: null,
  },
  {
    id: "b6",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    genre: "Technology",
    status: "borrowed",
    borrowerId: "u3",
    dueDate: dateFromNow(6),
    renewed: false,
    holdUserId: "u1", // Reserved for Maya Patel
  },
];

const seedUsers = [
  { id: "u1", name: "Maya Patel", email: "maya@example.com", phone: "+91 98765 43210" },
  { id: "u2", name: "Noah Williams", email: "noah@example.com", phone: "+91 98123 45678" },
  { id: "u3", name: "Aarav Shah", email: "aarav@example.com", phone: "+91 98456 78901" },
  { id: "u4", name: "Ananya Roy", email: "ananya@example.com", phone: "+91 97654 32109" },
];

/* ─── Desk Instructions Knowledge Base ───────────────────────── */

const deskInstructions = {
  checkout: {
    id: "checkout",
    title: "How to check out / issue a book",
    tags: ["checkout", "borrow", "issue", "lend", "take"],
    steps: [
      "Click 'Check out book' at the top of the dashboard or in the Books section.",
      "Select any available book from the catalogue and pick the registered reader.",
      "The system confirms availability, verifies the 3-book borrowing limit, and sets a standard 14-day loan period.",
    ],
    rule: "Library rule: Each reader may borrow a maximum of 3 books simultaneously for 14 days.",
    actionText: "Check out a book",
    actionModal: "borrow",
  },
  return: {
    id: "return",
    title: "How to return a book & collect overdue fines",
    tags: ["return", "fine", "overdue", "late", "fee", "bring back", "checkin"],
    steps: [
      "Go to the Loans page or click 'Return a book' in Quick actions.",
      "Locate the active loan and click the 'Return' button.",
      "If the return is past due date, the system automatically computes the late fee at ₹10 per day for collection before check-in.",
    ],
    rule: "Library rule: Overdue books incur a late fee of ₹10 per day. Books returned on time have zero fine.",
    actionText: "View active loans",
    actionPage: "loans",
  },
  renew: {
    id: "renew",
    title: "How to renew a borrowed book",
    tags: ["renew", "extend", "prolong", "longer", "date"],
    steps: [
      "Open the Loans section to view current active loans.",
      "Click 'Renew' on the reader's loan card.",
      "The loan is extended by 7 days. Note: Renewal is blocked if the loan was already renewed once, or if another reader placed a hold on this book.",
    ],
    rule: "Library rule: Each loan can be renewed once (+7 days), provided no reservation hold has been placed.",
    actionText: "Open loans desk",
    actionPage: "loans",
  },
  hold: {
    id: "hold",
    title: "How to place a hold / reservation",
    tags: ["hold", "reserve", "waitlist", "booking", "save"],
    steps: [
      "Find a borrowed book in Loans (or click 'Place a hold' in Quick actions).",
      "Click 'Hold' and select which reader wants to reserve the title.",
      "The book is marked On Hold. The current borrower will not be allowed to renew it, and upon return it will be reserved for pickup.",
    ],
    rule: "Library rule: Placing a hold blocks renewals by current borrowers and reserves the next checkout.",
    actionText: "Place a hold",
    actionModal: "place-hold-picker",
  },
  addBook: {
    id: "addBook",
    title: "How to add a new book to the catalogue",
    tags: ["add book", "new book", "catalogue", "title", "isbn", "genre", "author"],
    steps: [
      "Click 'Add a book' in Quick actions or in the Books section.",
      "Enter the Book Title, Author, ISBN number, and Genre.",
      "Click 'Add book'. The new title is immediately catalogued as Available for readers.",
    ],
    rule: "Library rule: All book fields (Title, Author, ISBN, Genre) are required.",
    actionText: "Add a book",
    actionModal: "book",
  },
  addUser: {
    id: "addUser",
    title: "How to register a new reader",
    tags: ["register reader", "new reader", "member", "student", "user", "account"],
    steps: [
      "Click 'Register reader' in Quick actions or in the Readers section.",
      "Enter the reader's full name, email address, and phone number.",
      "Click 'Register reader'. The member account is ready with a 3-book borrowing quota.",
    ],
    rule: "Library rule: Readers must be registered before books can be issued to them.",
    actionText: "Register reader",
    actionModal: "user",
  },
};

/* ─── Hooks & Helpers ────────────────────────────────────────── */

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // safe fallback
    }
  }, [key, value]);
  return [value, setValue];
}

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function formatDate(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function stringColor(text) {
  const colors = ["#b94f3d", "#1f5d50", "#d69a35", "#54708f", "#7a556f", "#765c3c"];
  return colors[[...text].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length];
}

/* ─── Shared UI Components ───────────────────────────────────── */

function Modal({ title, kicker, children, onClose }) {
  useEffect(() => {
    const close = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        {kicker && <span className="eyebrow">{kicker}</span>}
        <h2>{title}</h2>
        {children}
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function PageHeading({ eyebrow, title, copy, action }) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {action}
    </div>
  );
}

function Status({ book, userById }) {
  if (book.status === "available") {
    if (book.holdUserId) {
      return (
        <span className="pill hold" title={`Reserved for ${userById[book.holdUserId]?.name}`}>
          <span /> Reserved: {userById[book.holdUserId]?.name}
        </span>
      );
    }
    return (
      <span className="pill available">
        <span /> Available
      </span>
    );
  }
  return (
    <span className="pill borrowed">
      <span /> {userById[book.borrowerId]?.name || "Borrowed"}
      {book.holdUserId && " (On hold)"}
    </span>
  );
}

function DueBadge({ date }) {
  const days = Math.ceil((new Date(date) - today) / DAY);
  if (days < 0) return <span className="due overdue">{Math.abs(days)}d overdue</span>;
  if (days === 0) return <span className="due soon">Due today</span>;
  return <span className="due">Due in {days}d</span>;
}

function EmptyState({ text }) {
  return (
    <div className="empty">
      <BookOpen size={24} />
      <span>{text}</span>
    </div>
  );
}

/* ─── Main App Component ─────────────────────────────────────── */

function App() {
  const [books, setBooks] = useStoredState("folio-books-v3", seedBooks);
  const [users, setUsers] = useStoredState("folio-users-v3", seedUsers);
  const [page, setPage] = useState("overview");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  // Active items for modals
  const [editingBook, setEditingBook] = useState(null);
  const [selectedReader, setSelectedReader] = useState(null);
  const [returningBook, setReturningBook] = useState(null);
  const [holdingBook, setHoldingBook] = useState(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const userById = useMemo(
    () => Object.fromEntries(users.map((user) => [user.id, user])),
    [users],
  );

  const borrowed = books.filter((book) => book.status === "borrowed");
  const overdue = borrowed.filter((book) => new Date(book.dueDate) < today);
  const fineTotal = overdue.reduce((total, book) => {
    const days = Math.ceil((today - new Date(book.dueDate)) / DAY);
    return total + days * 10;
  }, 0);

  const filteredBooks = books.filter((book) =>
    [book.title, book.author, book.isbn, book.genre]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  const filteredUsers = users.filter((user) =>
    [user.name, user.email, user.id, user.phone || ""]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  function navigate(nextPage) {
    setPage(nextPage);
    setQuery("");
    setNavOpen(false);
  }

  /* ── Actions ── */

  function addBook(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBooks((current) => [
      ...current,
      {
        id: "b-" + Date.now().toString(36),
        title: data.get("title").trim(),
        author: data.get("author").trim(),
        isbn: data.get("isbn").trim(),
        genre: data.get("genre").trim(),
        status: "available",
        borrowerId: null,
        dueDate: null,
        renewed: false,
        holdUserId: null,
      },
    ]);
    setModal(null);
    setNotice("Book added to the collection");
  }

  function saveEditBook(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBooks((current) =>
      current.map((b) =>
        b.id === editingBook.id
          ? {
              ...b,
              title: data.get("title").trim(),
              author: data.get("author").trim(),
              isbn: data.get("isbn").trim(),
              genre: data.get("genre").trim(),
            }
          : b,
      ),
    );
    setModal(null);
    setEditingBook(null);
    setNotice("Book details updated");
  }

  function removeBook(id) {
    const book = books.find((b) => b.id === id);
    if (book?.status === "borrowed") {
      setNotice("Cannot remove book while it is borrowed");
      return;
    }
    setBooks((current) => current.filter((b) => b.id !== id));
    setNotice("Book removed");
  }

  function addUser(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setUsers((current) => [
      ...current,
      {
        id: "u" + (users.length + 1),
        name: data.get("name").trim(),
        email: data.get("email").trim(),
        phone: data.get("phone")?.trim() || "+91 98400 12345",
      },
    ]);
    setModal(null);
    setNotice("New reader registered");
  }

  function borrowBook(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const bookId = data.get("bookId");
    const userId = data.get("userId");

    const book = books.find((b) => b.id === bookId);
    if (book && book.holdUserId && book.holdUserId !== userId) {
      const holdHolder = userById[book.holdUserId]?.name || "another reader";
      setNotice(`This book is currently reserved for ${holdHolder}`);
      return;
    }

    const currentLoans = books.filter((b) => b.borrowerId === userId).length;
    if (currentLoans >= 3) {
      setNotice("This reader has reached the 3-book limit");
      return;
    }

    setBooks((current) =>
      current.map((b) =>
        b.id === bookId
          ? {
              ...b,
              status: "borrowed",
              borrowerId: userId,
              dueDate: dateFromNow(14),
              renewed: false,
              holdUserId: null,
            }
          : b,
      ),
    );
    setModal(null);
    setNotice("Book checked out for 14 days");
  }

  function initiateReturn(book) {
    const daysOverdue = Math.ceil((today - new Date(book.dueDate)) / DAY);
    if (daysOverdue > 0) {
      setReturningBook(book);
      setModal("return-confirm");
    } else {
      executeReturn(book);
    }
  }

  function executeReturn(book) {
    setBooks((current) =>
      current.map((item) =>
        item.id === book.id
          ? {
              ...item,
              status: "available",
              borrowerId: null,
              dueDate: null,
              renewed: false,
            }
          : item,
      ),
    );
    setReturningBook(null);
    setModal(null);
    if (book.holdUserId) {
      const holdHolder = userById[book.holdUserId]?.name || "reserved reader";
      setNotice(`Book returned. Note: Title is on hold for ${holdHolder}`);
    } else {
      setNotice("Book returned and ready to borrow");
    }
  }

  function renewBook(book) {
    if (book.renewed) {
      setNotice("This loan has already been renewed once");
      return;
    }
    if (book.holdUserId) {
      const holdHolder = userById[book.holdUserId]?.name || "another reader";
      setNotice(`Cannot renew: This book is on hold for ${holdHolder}`);
      return;
    }
    setBooks((current) =>
      current.map((item) =>
        item.id === book.id
          ? {
              ...item,
              dueDate: new Date(
                new Date(item.dueDate).getTime() + 7 * DAY,
              ).toISOString().slice(0, 10),
              renewed: true,
            }
          : item,
      ),
    );
    setNotice("Loan extended by 7 days");
  }

  function placeHold(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const holdUserId = data.get("holdUserId");
    const bookId = holdingBook?.id || data.get("bookId");

    const targetBook = books.find((b) => b.id === bookId);
    if (targetBook && targetBook.borrowerId === holdUserId) {
      setNotice("The current borrower cannot place a hold on their own borrowed book");
      return;
    }

    setBooks((current) =>
      current.map((b) => (b.id === bookId ? { ...b, holdUserId: holdUserId } : b)),
    );
    setModal(null);
    setHoldingBook(null);
    setNotice("Hold placed on title");
  }

  function releaseHold(book) {
    setBooks((current) =>
      current.map((b) => (b.id === book.id ? { ...b, holdUserId: null } : b)),
    );
    setNotice("Hold released");
  }

  const nav = [
    { id: "overview", label: "Overview", icon: Library },
    { id: "books", label: "Books", icon: BookOpen },
    { id: "users", label: "Readers", icon: Users },
    { id: "loans", label: "Loans", icon: ArrowRightLeft },
  ];

  return (
    <div className={`app-shell page-${page}`}>
      {/* ─── Sidebar ─── */}
      <aside className={navOpen ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <div className="brand-mark"><span>F</span></div>
          <div><strong>Folio</strong><small>Library desk</small></div>
        </div>
        <nav>
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-item nav-${id}${page === id ? " active" : ""}`}
              onClick={() => navigate(id)}
            >
              <span className="nav-icon" aria-hidden="true"><Icon size={18} /></span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="connection-dot" />
          <div>
            <span>Demo mode</span>
            <small>Saved in this browser</small>
          </div>
          <button className="icon-button" onClick={() => setModal("settings")} aria-label="Settings">
            <Settings size={17} />
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main>
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setNavOpen(!navOpen)}>
            <Menu size={20} />
          </button>
          <div className="search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                page === "users"
                  ? "Search readers by name or ID..."
                  : "Search title, author, ISBN, or genre..."
              }
              aria-label="Search"
            />
            <kbd>⌘ K</kbd>
          </div>
          <button className="profile" onClick={() => setModal("settings")}>
            <span>AL</span>
            <div><strong>Alex Lee</strong><small>Librarian</small></div>
            <ChevronDown size={15} />
          </button>
        </header>

        <div className="content">
          {page === "overview" && (
            <Overview
              books={books}
              users={users}
              borrowed={borrowed}
              overdue={overdue}
              fineTotal={fineTotal}
              userById={userById}
              setModal={setModal}
              navigate={navigate}
              setHoldingBook={setHoldingBook}
            />
          )}

          {page === "books" && (
            <Books
              books={filteredBooks}
              userById={userById}
              setModal={setModal}
              removeBook={removeBook}
              onEditBook={(book) => {
                setEditingBook(book);
                setModal("edit-book");
              }}
              query={query}
            />
          )}

          {page === "users" && (
            <Readers
              users={filteredUsers}
              books={books}
              setModal={setModal}
              onSelectReader={(reader) => setSelectedReader(reader)}
            />
          )}

          {page === "loans" && (
            <Loans
              books={borrowed.filter((book) =>
                [book.title, book.author, userById[book.borrowerId]?.name]
                  .join(" ")
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              )}
              userById={userById}
              initiateReturn={initiateReturn}
              renewBook={renewBook}
              onOpenHold={(book) => {
                setHoldingBook(book);
                setModal("place-hold");
              }}
              releaseHold={releaseHold}
            />
          )}
        </div>
      </main>

      {notice && <div className="toast"><Check size={17} />{notice}</div>}

      {/* ─── Modal Dialogs ─── */}

      {/* Add Book */}
      {modal === "book" && (
        <Modal title="Add a new book" kicker="Grow the collection" onClose={() => setModal(null)}>
          <form className="form-grid" onSubmit={addBook}>
            <Field label="Book title"><input name="title" required autoFocus /></Field>
            <Field label="Author"><input name="author" required /></Field>
            <Field label="ISBN"><input name="isbn" required /></Field>
            <Field label="Genre"><input name="genre" required /></Field>
            <button className="primary wide" type="submit"><Plus size={17} /> Add book</button>
          </form>
        </Modal>
      )}

      {/* Edit Book */}
      {modal === "edit-book" && editingBook && (
        <Modal title="Edit book details" kicker="Update catalogue" onClose={() => { setModal(null); setEditingBook(null); }}>
          <form className="form-grid" onSubmit={saveEditBook}>
            <Field label="Book title"><input name="title" required defaultValue={editingBook.title} /></Field>
            <Field label="Author"><input name="author" required defaultValue={editingBook.author} /></Field>
            <Field label="ISBN"><input name="isbn" required defaultValue={editingBook.isbn} /></Field>
            <Field label="Genre"><input name="genre" required defaultValue={editingBook.genre} /></Field>
            <button className="primary wide" type="submit"><Check size={17} /> Save changes</button>
          </form>
        </Modal>
      )}

      {/* Register Reader */}
      {modal === "user" && (
        <Modal title="Register a reader" kicker="New library member" onClose={() => setModal(null)}>
          <form className="form-grid" onSubmit={addUser}>
            <Field label="Full name"><input name="name" required autoFocus /></Field>
            <Field label="Email address"><input name="email" type="email" required /></Field>
            <Field label="Phone number"><input name="phone" placeholder="+91 98400 12345" defaultValue="+91 98400 12345" /></Field>
            <button className="primary wide" type="submit"><UserPlus size={17} /> Register reader</button>
          </form>
        </Modal>
      )}

      {/* Check Out Book */}
      {modal === "borrow" && (
        <Modal title="Check out a book" kicker="14-day lending period" onClose={() => setModal(null)}>
          <form className="form-grid" onSubmit={borrowBook}>
            <Field label="Available book">
              <select name="bookId" required defaultValue="">
                <option value="" disabled>Select a book</option>
                {books.filter((book) => book.status === "available").map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} ({book.genre})
                    {book.holdUserId ? ` — Reserved for ${userById[book.holdUserId]?.name}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reader">
              <select name="userId" required defaultValue="">
                <option value="" disabled>Select a reader</option>
                {users.map((user) => {
                  const count = books.filter((b) => b.borrowerId === user.id).length;
                  return (
                    <option key={user.id} value={user.id} disabled={count >= 3}>
                      {user.name} ({count}/3 books borrowed){count >= 3 ? " — Limit reached" : ""}
                    </option>
                  );
                })}
              </select>
            </Field>
            <button className="primary wide" type="submit"><ArrowRightLeft size={17} /> Confirm checkout</button>
          </form>
        </Modal>
      )}

      {/* Return Confirmation & Late Fee Modal */}
      {modal === "return-confirm" && returningBook && (
        <Modal title="Return book" kicker="Overdue fine calculation" onClose={() => { setModal(null); setReturningBook(null); }}>
          {(() => {
            const daysOver = Math.max(0, Math.ceil((today - new Date(returningBook.dueDate)) / DAY));
            const fine = daysOver * 10;
            return (
              <div>
                <p style={{ margin: "0 0 12px", fontSize: "13px" }}>
                  <strong>{returningBook.title}</strong> is <strong>{daysOver} day{daysOver !== 1 ? "s" : ""} overdue</strong>.
                </p>
                <div style={{ background: "#fdf3f0", border: "1px solid #f2cfc7", padding: "14px", borderRadius: "8px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--red)" }}>
                    <span>Late fee (₹10 × {daysOver} days)</span>
                    <strong style={{ fontSize: "18px" }}>{money(fine)}</strong>
                  </div>
                </div>
                <p style={{ fontSize: "12px", color: "#676359", marginBottom: "16px" }}>
                  Collect fine of {money(fine)} from {userById[returningBook.borrowerId]?.name} to complete return.
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="secondary" style={{ flex: 1 }} onClick={() => { setModal(null); setReturningBook(null); }}>
                    Cancel
                  </button>
                  <button className="primary" style={{ flex: 1.2 }} onClick={() => executeReturn(returningBook)}>
                    <Check size={16} /> Collect & Return
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Place Hold Modal */}
      {(modal === "place-hold" || modal === "place-hold-picker") && (
        <Modal title="Place a hold" kicker="Reserve a title" onClose={() => { setModal(null); setHoldingBook(null); }}>
          <form className="form-grid" onSubmit={placeHold}>
            {modal === "place-hold-picker" && (
              <Field label="Borrowed book to reserve">
                <select name="bookId" required defaultValue="">
                  <option value="" disabled>Select a borrowed book</option>
                  {borrowed.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} — borrowed by {userById[b.borrowerId]?.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            {holdingBook && (
              <p style={{ margin: "0 0 8px", fontSize: "13px" }}>
                Book: <strong>{holdingBook.title}</strong> (currently on loan)
              </p>
            )}
            <Field label="Reader requesting hold">
              <select name="holdUserId" required defaultValue="">
                <option value="" disabled>Select reader</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </Field>
            <p style={{ fontSize: "11px", color: "#79756b", margin: "2px 0 6px" }}>
              Placing a hold prevents the current borrower from renewing and reserves the title upon return.
            </p>
            <button className="primary wide" type="submit"><Bookmark size={17} /> Confirm hold</button>
          </form>
        </Modal>
      )}

      {/* Reader Profile & Borrowed Books Modal */}
      {selectedReader && (
        <Modal
          title={selectedReader.name}
          kicker={`Reader details • ID: ${selectedReader.id}`}
          onClose={() => setSelectedReader(null)}
        >
          {(() => {
            const userLoans = books.filter((b) => b.borrowerId === selectedReader.id);
            return (
              <div>
                <p style={{ margin: "0 0 14px", fontSize: "12px", color: "#79756b" }}>
                  Email: {selectedReader.email} • Phone: {selectedReader.phone || "+91 98400 12345"}
                </p>
                <div style={{ marginBottom: "14px" }}>
                  <strong style={{ fontSize: "13px", display: "block", marginBottom: "8px" }}>
                    Borrowed books ({userLoans.length} of 3 limit):
                  </strong>
                  {userLoans.length === 0 ? (
                    <p style={{ fontSize: "12px", color: "#8a857a" }}>No books currently borrowed.</p>
                  ) : (
                    <div className="reader-loan-list">
                      {userLoans.map((b) => (
                        <div key={b.id} className="reader-loan-item">
                          <div>
                            <strong>{b.title}</strong>
                            <div style={{ fontSize: "10px", color: "#79756b" }}>
                              Due: {formatDate(b.dueDate)}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <DueBadge date={b.dueDate} />
                            <button
                              className="primary"
                              style={{ padding: "4px 8px", fontSize: "11px" }}
                              onClick={() => {
                                setSelectedReader(null);
                                initiateReturn(b);
                              }}
                            >
                              Return
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Settings Modal */}
      {modal === "settings" && (
        <Modal title="Backend configuration" kicker="MySQL ready" onClose={() => setModal(null)}>
          <div className="setup-card">
            <div className="status">
              <span /> Demo data is stored locally
            </div>
            <p>
              The Spring Boot backend is configured for MySQL. Set
              <code>MYSQL_URL</code>, <code>MYSQL_USER</code>, and
              <code>MYSQL_PASSWORD</code> when starting the backend service.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Overview / Dashboard ───────────────────────────────────── */

function Overview({
  books,
  users,
  borrowed,
  overdue,
  fineTotal,
  userById,
  setModal,
  navigate,
  setHoldingBook,
}) {
  const [instructionQuery, setInstructionQuery] = useState("");
  const [selectedInstructionKey, setSelectedInstructionKey] = useState("checkout");

  // Filter instructions based on search query
  const matchingInstruction = useMemo(() => {
    if (!instructionQuery.trim()) {
      return deskInstructions[selectedInstructionKey] || deskInstructions.checkout;
    }
    const q = instructionQuery.toLowerCase().trim();
    const foundKey = Object.keys(deskInstructions).find((k) => {
      const item = deskInstructions[k];
      return (
        item.title.toLowerCase().includes(q) ||
        item.tags.some((t) => t.includes(q)) ||
        item.steps.some((s) => s.toLowerCase().includes(q))
      );
    });
    return foundKey ? deskInstructions[foundKey] : deskInstructions[selectedInstructionKey];
  }, [instructionQuery, selectedInstructionKey]);

  const stats = [
    { label: "Total titles", value: books.length, note: "Across all collections", image: "/icons/clay-books.png" },
    { label: "Registered readers", value: users.length, note: "Active members", image: "/icons/clay-readers.png" },
    { label: "Active loans", value: borrowed.length, note: "Currently checked out", image: "/icons/clay-loans.png" },
    {
      label: "Overdue loans",
      value: overdue.length,
      note: fineTotal > 0 ? `Uncollected fines: ${money(fineTotal)}` : "All loans on schedule",
      image: "/icons/clay-calendar.png",
      urgent: overdue.length > 0,
    },
  ];

  function handleInstructionAction(inst) {
    if (inst.actionModal) {
      setModal(inst.actionModal);
    } else if (inst.actionPage) {
      navigate(inst.actionPage);
    }
  }

  return (
    <>
      <PageHeading
        eyebrow={formatToday()}
        title={<>Good morning, <em>Alex.</em></>}
        copy="Here’s what’s happening across your shelves today."
        action={
          <button className="primary" onClick={() => setModal("borrow")}>
            <ArrowRightLeft size={17} /> Check out book
          </button>
        }
      />

      {/* Stats Cards with original 3D Clay Objects */}
      <section className="stats-grid">
        {stats.map(({ label, value, note, image, urgent }, index) => (
          <article className={urgent ? "stat-card urgent" : "stat-card"} key={label} style={{ "--delay": `${index * 70}ms` }}>
            <img className="stat-object" src={image} alt="" aria-hidden="true" />
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </section>

      {/* ─── Desk Instructions & Guidance Area (Added without disrupting UI) ─── */}
      <section className="instruction-panel">
        <div className="instruction-head">
          <div>
            <span className="eyebrow">Desk Operating Instructions</span>
            <h2>Where should I go & what to do?</h2>
          </div>
        </div>

        {/* Input box for librarian instruction search */}
        <div className="instruction-input-wrap">
          <Search size={18} />
          <input
            className="instruction-input"
            value={instructionQuery}
            onChange={(e) => setInstructionQuery(e.target.value)}
            placeholder="Type what you want to do (e.g. check out, return, renew, hold, fines, add book)..."
            aria-label="Instruction search"
          />
        </div>

        {/* Quick selection pills */}
        <div className="instruction-pills">
          {[
            { key: "checkout", label: "Check out book" },
            { key: "return", label: "Return & fines" },
            { key: "renew", label: "Renew loan" },
            { key: "hold", label: "Place hold" },
            { key: "addBook", label: "Add book" },
            { key: "addUser", label: "Register reader" },
          ].map((pill) => (
            <button
              key={pill.key}
              className={`instruction-pill${matchingInstruction?.id === pill.key ? " active" : ""}`}
              onClick={() => {
                setInstructionQuery("");
                setSelectedInstructionKey(pill.key);
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Display selected step-by-step instruction */}
        {matchingInstruction && (
          <div className="instruction-card">
            <div className="instruction-card-text">
              <strong>{matchingInstruction.title}</strong>
              <ol className="instruction-steps">
                {matchingInstruction.steps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
              <div className="instruction-rule">{matchingInstruction.rule}</div>
            </div>
            <button
              className="primary"
              onClick={() => handleInstructionAction(matchingInstruction)}
            >
              {matchingInstruction.actionText} <ArrowRight size={15} />
            </button>
          </div>
        )}
      </section>

      {/* ─── Dashboard 2-Column Grid ─── */}
      <section className="dashboard-grid">
        {/* Left: Recent loans */}
        <article className="panel activity-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Live circulation</span>
              <h2>Recent loans</h2>
            </div>
            <button className="text-button" onClick={() => navigate("loans")}>View all</button>
          </div>
          <div className="loan-list">
            {borrowed.slice(0, 4).map((book) => (
              <div className="loan-row" key={book.id}>
                <div className="book-spine" style={{ "--spine": stringColor(book.title) }}>
                  {book.title.charAt(0)}
                </div>
                <div className="loan-title">
                  <strong>{book.title}</strong>
                  <span>{book.author}</span>
                </div>
                <div className="loan-reader">
                  <span>Borrowed by</span>
                  <strong>{userById[book.borrowerId]?.name}</strong>
                </div>
                <DueBadge date={book.dueDate} />
              </div>
            ))}
            {!borrowed.length && <EmptyState text="No books are currently on loan." />}
          </div>
        </article>

        {/* Right: Quick actions (Original clean button names and layout) */}
        <aside className="panel quick-panel">
          <span className="eyebrow">Quick actions</span>
          <h2>What would you like to do?</h2>
          <button onClick={() => setModal("book")}>
            <span><Plus size={18} /></span>
            <div><strong>Add a book</strong><small>Grow your catalogue</small></div>
          </button>
          <button onClick={() => setModal("user")}>
            <span><UserPlus size={18} /></span>
            <div><strong>Register reader</strong><small>Create a new account</small></div>
          </button>
          <button onClick={() => navigate("loans")}>
            <span><RotateCcw size={18} /></span>
            <div><strong>Return a book</strong><small>Complete a loan</small></div>
          </button>
          <button onClick={() => setModal("place-hold-picker")}>
            <span><Bookmark size={18} /></span>
            <div><strong>Place a hold</strong><small>Reserve a borrowed title</small></div>
          </button>
        </aside>
      </section>
    </>
  );
}

/* ─── Books View ─────────────────────────────────────────────── */

function Books({ books, userById, setModal, removeBook, onEditBook, query }) {
  return (
    <>
      <PageHeading
        eyebrow="The collection"
        title={<>Books & <em>editions.</em></>}
        copy="Search, manage, and keep every title accounted for."
        action={
          <button className="primary" onClick={() => setModal("book")}>
            <Plus size={17} /> Add book
          </button>
        }
      />
      <section className="panel table-panel">
        <div className="table-head">
          <span>{books.length} titles {query && "found"}</span>
          <button className="secondary" onClick={() => setModal("borrow")}>Check out</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Genre</th>
                <th>ISBN</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    <div className="title-cell">
                      <div className="mini-spine" style={{ "--spine": stringColor(book.title) }} />
                      <span>
                        <strong>{book.title}</strong>
                        <small>{book.author}</small>
                      </span>
                    </div>
                  </td>
                  <td>{book.genre}</td>
                  <td className="mono">{book.isbn}</td>
                  <td><Status book={book} userById={userById} /></td>
                  <td>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        className="icon-button"
                        onClick={() => onEditBook(book)}
                        aria-label="Edit book"
                        title="Edit book"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="icon-button danger"
                        disabled={book.status === "borrowed"}
                        onClick={() => removeBook(book.id)}
                        aria-label="Remove book"
                        title={book.status === "borrowed" ? "Cannot remove borrowed book" : "Remove book"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!books.length && <EmptyState text="No books match your search." />}
        </div>
      </section>
    </>
  );
}

/* ─── Readers View ───────────────────────────────────────────── */

function Readers({ users, books, setModal, onSelectReader }) {
  return (
    <>
      <PageHeading
        eyebrow="Community"
        title={<>Your <em>readers.</em></>}
        copy="Registered members and their current borrowing activity."
        action={
          <button className="primary" onClick={() => setModal("user")}>
            <UserPlus size={17} /> New reader
          </button>
        }
      />
      <section className="reader-grid">
        {users.map((user, index) => {
          const loans = books.filter((book) => book.borrowerId === user.id);
          return (
            <article
              className="reader-card"
              key={user.id}
              onClick={() => onSelectReader(user)}
              style={{ cursor: "pointer" }}
              title="Click to view borrowed books list"
            >
              <div className="avatar" style={{ "--avatar": stringColor(user.name) }}>
                {user.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
              </div>
              <div>
                <span className="eyebrow">Reader {String(index + 1).padStart(2, "0")}</span>
                <h2>{user.name}</h2>
                <p>{user.email}</p>
                <p style={{ fontSize: "10px", opacity: 0.7, marginTop: "2px" }}>ID: {user.id}</p>
              </div>
              <div className="reader-meta">
                <span><strong>{loans.length}</strong> borrowed</span>
                <span><strong>{3 - loans.length}</strong> slots open</span>
              </div>
              <div className="book-dots">
                {loans.length ? (
                  loans.map((book) => (
                    <span title={book.title} key={book.id} style={{ "--spine": stringColor(book.title) }} />
                  ))
                ) : (
                  <small>No active loans</small>
                )}
              </div>
            </article>
          );
        })}
        {!users.length && <EmptyState text="No readers match your search." />}
      </section>
    </>
  );
}

/* ─── Loans View ─────────────────────────────────────────────── */

function Loans({ books, userById, initiateReturn, renewBook, onOpenHold, releaseHold }) {
  return (
    <>
      <PageHeading
        eyebrow="Circulation"
        title={<>Loans & <em>returns.</em></>}
        copy="Track due dates, renew once, place holds, and return titles to the shelf."
      />
      <section className="loans-board">
        {books.map((book) => {
          const holdHolder = userById[book.holdUserId];
          return (
            <article className="loan-card" key={book.id}>
              <div className="large-spine" style={{ "--spine": stringColor(book.title) }}>
                <span>{book.genre}</span>
              </div>
              <div className="loan-card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <DueBadge date={book.dueDate} />
                  {holdHolder && (
                    <span className="pill hold" style={{ fontSize: "10px" }}>
                      <span /> On hold for {holdHolder.name}
                    </span>
                  )}
                </div>
                <h2>{book.title}</h2>
                <p>{book.author}</p>
                <dl>
                  <div>
                    <dt>Reader</dt>
                    <dd>{userById[book.borrowerId]?.name}</dd>
                  </div>
                  <div>
                    <dt>Due date</dt>
                    <dd>{formatDate(book.dueDate)}</dd>
                  </div>
                </dl>
                <div className="card-actions">
                  <button
                    className="secondary"
                    onClick={() => renewBook(book)}
                    disabled={book.renewed || Boolean(book.holdUserId)}
                    title={
                      book.renewed
                        ? "Already renewed once"
                        : book.holdUserId
                        ? `On hold for ${holdHolder?.name}`
                        : "Extend by 7 days"
                    }
                  >
                    <RotateCcw size={16} /> {book.renewed ? "Renewed" : "Renew"}
                  </button>
                  <button className="primary" onClick={() => initiateReturn(book)}>
                    <Check size={16} /> Return
                  </button>
                  {!book.holdUserId ? (
                    <button
                      className="secondary"
                      onClick={() => onOpenHold(book)}
                      title="Place hold for another reader"
                    >
                      <Bookmark size={15} /> Hold
                    </button>
                  ) : (
                    <button
                      className="secondary"
                      onClick={() => releaseHold(book)}
                      title="Release hold"
                    >
                      Release
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {!books.length && <EmptyState text="No active loans. Every book is home." />}
      </section>
    </>
  );
}

/* ─── Mount ──────────────────────────────────────────────────── */

createRoot(document.getElementById("root")).render(<App />);

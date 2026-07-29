import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRightLeft,
  BookOpen,
  Check,
  ChevronDown,
  Clock3,
  Library,
  Menu,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const DAY = 86400000;
const today = new Date();
const dateFromNow = (days) =>
  new Date(today.getTime() + days * DAY).toISOString().slice(0, 10);

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
    renewed: true,
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
  },
];

const seedUsers = [
  { id: "u1", name: "Maya Patel", email: "maya@example.com" },
  { id: "u2", name: "Noah Williams", email: "noah@example.com" },
  { id: "u3", name: "Aarav Shah", email: "aarav@example.com" },
];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function useStoredState(key, initialValue) {
  const [value, setValue] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialValue;
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(value)), [key, value]);
  return [value, setValue];
}

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

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
        <span className="eyebrow">{kicker}</span>
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

function App() {
  const [books, setBooks] = useStoredState("folio-books", seedBooks);
  const [users, setUsers] = useStoredState("folio-users", seedUsers);
  const [page, setPage] = useState("overview");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [notice, setNotice] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 2600);
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
    [user.name, user.email, user.id]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  function navigate(nextPage) {
    setPage(nextPage);
    setQuery("");
    setNavOpen(false);
  }

  function addBook(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBooks((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        title: data.get("title").trim(),
        author: data.get("author").trim(),
        isbn: data.get("isbn").trim(),
        genre: data.get("genre").trim(),
        status: "available",
        borrowerId: null,
        dueDate: null,
        renewed: false,
      },
    ]);
    setModal(null);
    setNotice("Book added to the collection");
  }

  function addUser(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setUsers((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: data.get("name").trim(),
        email: data.get("email").trim(),
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
    const currentLoans = books.filter(
      (book) => book.borrowerId === userId && book.status === "borrowed",
    ).length;
    if (currentLoans >= 3) {
      setNotice("This reader has reached the 3-book limit");
      return;
    }
    setBooks((current) =>
      current.map((book) =>
        book.id === bookId
          ? {
              ...book,
              status: "borrowed",
              borrowerId: userId,
              dueDate: dateFromNow(14),
              renewed: false,
            }
          : book,
      ),
    );
    setModal(null);
    setNotice("Book checked out for 14 days");
  }

  function returnBook(book) {
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
    setNotice("Book returned and ready to borrow");
  }

  function renewBook(book) {
    if (book.renewed) {
      setNotice("This loan has already been renewed once");
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

  function removeBook(id) {
    setBooks((current) => current.filter((book) => book.id !== id));
    setNotice("Book removed");
  }

  const nav = [
    { id: "overview", label: "Overview", icon: Library },
    { id: "books", label: "Books", icon: BookOpen },
    { id: "users", label: "Readers", icon: Users },
    { id: "loans", label: "Loans", icon: ArrowRightLeft },
  ];

  return (
    <div className="app-shell">
      <aside className={navOpen ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <div className="brand-mark"><span>F</span></div>
          <div><strong>Folio</strong><small>Library desk</small></div>
        </div>
        <nav>
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={page === id ? "nav-item active" : "nav-item"}
              onClick={() => navigate(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="connection-dot" />
          <div>
            <span>{supabase ? "Supabase connected" : "Demo mode"}</span>
            <small>{supabase ? "Cloud data enabled" : "Saved in this browser"}</small>
          </div>
          <button className="icon-button" onClick={() => setModal("settings")} aria-label="Settings">
            <Settings size={17} />
          </button>
        </div>
      </aside>

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
              placeholder={page === "users" ? "Search readers..." : "Search title, author, ISBN..."}
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
            />
          )}
          {page === "books" && (
            <Books
              books={filteredBooks}
              userById={userById}
              setModal={setModal}
              removeBook={removeBook}
              query={query}
            />
          )}
          {page === "users" && (
            <Readers
              users={filteredUsers}
              books={books}
              setModal={setModal}
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
              returnBook={returnBook}
              renewBook={renewBook}
            />
          )}
        </div>
      </main>

      {notice && <div className="toast"><Check size={17} />{notice}</div>}

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
      {modal === "user" && (
        <Modal title="Register a reader" kicker="New library member" onClose={() => setModal(null)}>
          <form className="form-grid" onSubmit={addUser}>
            <Field label="Full name"><input name="name" required autoFocus /></Field>
            <Field label="Email address"><input name="email" type="email" required /></Field>
            <button className="primary wide" type="submit"><UserPlus size={17} /> Register reader</button>
          </form>
        </Modal>
      )}
      {modal === "borrow" && (
        <Modal title="Check out a book" kicker="14-day lending period" onClose={() => setModal(null)}>
          <form className="form-grid" onSubmit={borrowBook}>
            <Field label="Available book">
              <select name="bookId" required defaultValue="">
                <option value="" disabled>Select a book</option>
                {books.filter((book) => book.status === "available").map((book) => (
                  <option key={book.id} value={book.id}>{book.title}</option>
                ))}
              </select>
            </Field>
            <Field label="Reader">
              <select name="userId" required defaultValue="">
                <option value="" disabled>Select a reader</option>
                {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            </Field>
            <button className="primary wide" type="submit"><ArrowRightLeft size={17} /> Confirm checkout</button>
          </form>
        </Modal>
      )}
      {modal === "settings" && (
        <Modal title="Connect your database" kicker="Supabase ready" onClose={() => setModal(null)}>
          <div className="setup-card">
            <div className={supabase ? "status connected" : "status"}>
              <span /> {supabase ? "Connected" : "Waiting for project details"}
            </div>
            <p>
              Add your Supabase URL and anonymous key to a <code>.env</code> file,
              using <code>.env.example</code> as the guide. Until then, Folio safely
              stores demo changes in this browser.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PageHeading({ eyebrow, title, copy, action }) {
  return (
    <div className="page-heading">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></div>
      {action}
    </div>
  );
}

function Overview({ books, users, borrowed, overdue, fineTotal, userById, setModal, navigate }) {
  const stats = [
    { label: "Total books", value: books.length, note: `${books.filter((b) => b.status === "available").length} ready to borrow`, icon: BookOpen },
    { label: "Active readers", value: users.length, note: "Registered members", icon: Users },
    { label: "On loan", value: borrowed.length, note: "Across all readers", icon: ArrowRightLeft },
    { label: "Overdue", value: overdue.length, note: `${money(fineTotal)} in estimated fines`, icon: Clock3, urgent: overdue.length > 0 },
  ];
  return (
    <>
      <PageHeading
        eyebrow="Wednesday, 29 July"
        title={<>Good morning, <em>Alex.</em></>}
        copy="Here’s what’s happening across your shelves today."
        action={<button className="primary" onClick={() => setModal("borrow")}><ArrowRightLeft size={17} /> Check out book</button>}
      />
      <section className="stats-grid">
        {stats.map(({ label, value, note, icon: Icon, urgent }, index) => (
          <article className={urgent ? "stat-card urgent" : "stat-card"} key={label} style={{ "--delay": `${index * 70}ms` }}>
            <div className="stat-icon"><Icon size={19} /></div>
            <span>{label}</span><strong>{value}</strong><small>{note}</small>
          </article>
        ))}
      </section>
      <section className="dashboard-grid">
        <article className="panel activity-panel">
          <div className="panel-head">
            <div><span className="eyebrow">Live circulation</span><h2>Recent loans</h2></div>
            <button className="text-button" onClick={() => navigate("loans")}>View all</button>
          </div>
          <div className="loan-list">
            {borrowed.slice(0, 4).map((book) => (
              <div className="loan-row" key={book.id}>
                <div className="book-spine" style={{ "--spine": stringColor(book.title) }}>{book.title.charAt(0)}</div>
                <div className="loan-title"><strong>{book.title}</strong><span>{book.author}</span></div>
                <div className="loan-reader"><span>Borrowed by</span><strong>{userById[book.borrowerId]?.name}</strong></div>
                <DueBadge date={book.dueDate} />
              </div>
            ))}
            {!borrowed.length && <EmptyState text="No books are currently on loan." />}
          </div>
        </article>
        <aside className="panel quick-panel">
          <span className="eyebrow">Quick actions</span>
          <h2>What would you like to do?</h2>
          <button onClick={() => setModal("book")}><span><Plus size={18} /></span><div><strong>Add a book</strong><small>Grow your catalogue</small></div></button>
          <button onClick={() => setModal("user")}><span><UserPlus size={18} /></span><div><strong>Register reader</strong><small>Create a new account</small></div></button>
          <button onClick={() => navigate("loans")}><span><RotateCcw size={18} /></span><div><strong>Return a book</strong><small>Complete a loan</small></div></button>
        </aside>
      </section>
    </>
  );
}

function Books({ books, userById, setModal, removeBook, query }) {
  return (
    <>
      <PageHeading
        eyebrow="The collection"
        title={<>Books & <em>editions.</em></>}
        copy="Search, manage, and keep every title accounted for."
        action={<button className="primary" onClick={() => setModal("book")}><Plus size={17} /> Add book</button>}
      />
      <section className="panel table-panel">
        <div className="table-head"><span>{books.length} titles {query && "found"}</span><button className="secondary" onClick={() => setModal("borrow")}>Check out</button></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Genre</th><th>ISBN</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td><div className="title-cell"><div className="mini-spine" style={{ "--spine": stringColor(book.title) }} /><span><strong>{book.title}</strong><small>{book.author}</small></span></div></td>
                  <td>{book.genre}</td><td className="mono">{book.isbn}</td>
                  <td><Status book={book} userById={userById} /></td>
                  <td><button className="icon-button danger" disabled={book.status === "borrowed"} onClick={() => removeBook(book.id)} aria-label="Remove book"><Trash2 size={16} /></button></td>
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

function Readers({ users, books, setModal }) {
  return (
    <>
      <PageHeading
        eyebrow="Community"
        title={<>Your <em>readers.</em></>}
        copy="Registered members and their current borrowing activity."
        action={<button className="primary" onClick={() => setModal("user")}><UserPlus size={17} /> New reader</button>}
      />
      <section className="reader-grid">
        {users.map((user, index) => {
          const loans = books.filter((book) => book.borrowerId === user.id);
          return (
            <article className="reader-card" key={user.id}>
              <div className="avatar" style={{ "--avatar": stringColor(user.name) }}>{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
              <div><span className="eyebrow">Reader {String(index + 1).padStart(2, "0")}</span><h2>{user.name}</h2><p>{user.email}</p></div>
              <div className="reader-meta"><span><strong>{loans.length}</strong> borrowed</span><span><strong>{3 - loans.length}</strong> slots open</span></div>
              <div className="book-dots">{loans.length ? loans.map((book) => <span title={book.title} key={book.id} style={{ "--spine": stringColor(book.title) }} />) : <small>No active loans</small>}</div>
            </article>
          );
        })}
        {!users.length && <EmptyState text="No readers match your search." />}
      </section>
    </>
  );
}

function Loans({ books, userById, returnBook, renewBook }) {
  return (
    <>
      <PageHeading
        eyebrow="Circulation"
        title={<>Loans & <em>returns.</em></>}
        copy="Track due dates, renew once, and return titles to the shelf."
      />
      <section className="loans-board">
        {books.map((book) => (
          <article className="loan-card" key={book.id}>
            <div className="large-spine" style={{ "--spine": stringColor(book.title) }}><span>{book.genre}</span></div>
            <div className="loan-card-body">
              <DueBadge date={book.dueDate} />
              <h2>{book.title}</h2><p>{book.author}</p>
              <dl><div><dt>Reader</dt><dd>{userById[book.borrowerId]?.name}</dd></div><div><dt>Due date</dt><dd>{formatDate(book.dueDate)}</dd></div></dl>
              <div className="card-actions">
                <button className="secondary" onClick={() => renewBook(book)} disabled={book.renewed}><RotateCcw size={16} /> {book.renewed ? "Renewed" : "Renew"}</button>
                <button className="primary" onClick={() => returnBook(book)}><Check size={16} /> Return</button>
              </div>
            </div>
          </article>
        ))}
        {!books.length && <EmptyState text="No active loans. Every book is home." />}
      </section>
    </>
  );
}

function Status({ book, userById }) {
  return book.status === "available" ? (
    <span className="pill available"><span /> Available</span>
  ) : (
    <span className="pill borrowed"><span /> {userById[book.borrowerId]?.name}</span>
  );
}

function DueBadge({ date }) {
  const days = Math.ceil((new Date(date) - today) / DAY);
  if (days < 0) return <span className="due overdue">{Math.abs(days)}d overdue</span>;
  if (days === 0) return <span className="due soon">Due today</span>;
  return <span className="due">Due in {days}d</span>;
}

function EmptyState({ text }) {
  return <div className="empty"><BookOpen size={24} /><span>{text}</span></div>;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(date));
}

function stringColor(text) {
  const colors = ["#b94f3d", "#1f5d50", "#d69a35", "#54708f", "#7a556f", "#765c3c"];
  return colors[[...text].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length];
}

createRoot(document.getElementById("root")).render(<App />);

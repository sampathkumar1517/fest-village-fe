import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import "./festival.css";

const FestivalDetails = () => {
  const location = useLocation();
  const [festivals, setFestivals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [festival, setFestival] = useState({
    name: "",
    amountPerFamily: "",
    startDate: "",
    endDate: "",
    organisers: "",
    inCharge: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFestival((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // Load from localStorage
    const stored = JSON.parse(localStorage.getItem("festivals") || "[]");
    setFestivals(stored);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    let updated;
    if (editingId) {
      updated = festivals.map(f => f.id === editingId ? { ...festival, id: editingId } : f);
      setEditingId(null);
    } else {
      updated = [...festivals, { ...festival, id: Date.now() }];
    }
    setFestivals(updated);
    localStorage.setItem("festivals", JSON.stringify(updated));
    setFestival({
      name: "",
      amountPerFamily: "",
      startDate: "",
      endDate: "",
      organisers: "",
      inCharge: "",
    });
    setShowForm(false);
  };

  const handleEdit = (fest) => {
    setFestival(fest);
    setEditingId(fest.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this festival?")) {
      const updated = festivals.filter(f => f.id !== id);
      setFestivals(updated);
      localStorage.setItem("festivals", JSON.stringify(updated));
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="festival-container">
      {/* Header */}
      <header className="festival-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">🪔</div>
            <div>
              <h1>Village Festival Manager</h1>
              <p>Collection & Expense Tracker</p>
            </div>
          </div>
          <a href="#" className="manage-link">Manage your<br />Festival Finances</a>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="festival-nav">
        <Link to="/festival" className={`nav-tab ${isActive("/festival") || isActive("/") ? "active" : ""}`}>
          ⭐ Festivals
        </Link>
        <Link to="/collection" className={`nav-tab ${isActive("/collection") ? "active" : ""}`}>
          ₹ Collections
        </Link>
        <Link to="/expenses" className={`nav-tab ${isActive("/expenses") ? "active" : ""}`}>
          ☑ Expenses
        </Link>
        <Link to="/analytics" className={`nav-tab ${isActive("/analytics") ? "active" : ""}`}>
        🢅 Analytics
        </Link>
        <Link to="/review" className={`nav-tab ${isActive("/review") ? "active" : ""}`}>
          💬 Review
        </Link>
      </nav>

      {/* Main Content */}
      <main className="festival-content">
        <div className="content-header">
          <div>
            <h2>🪔Festivals</h2>
            <p className="subtitle">Manage your village festival details</p>
          </div>
          <button className="btn-add-festival" onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFestival({
              name: "",
              amountPerFamily: "",
              startDate: "",
              endDate: "",
              organisers: "",
              inCharge: "",
            });
          }}>
            + Add Festival
          </button>
        </div>

        {/* Festival Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="festival-form">
            <h3 className="form-title">
              <span className="form-icon">🪔</span>
              {editingId ? "Edit Festival Details" : "New Festival Details"}
            </h3>
            <div className="form-grid">
              <label>
                Festival Name *
                <input
                  type="text"
                  name="name"
                  value={festival.name}
                  onChange={handleChange}
                  placeholder="e.g., Lord Murugan Festival"
                  required
                />
              </label>
              <label>
                Amount Per Family (₹) *
                <input
                  type="number"
                  name="amountPerFamily"
                  value={festival.amountPerFamily}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  required
                />
              </label>
              <label>
                Collection Start Date *
                <input
                  type="date"
                  name="startDate"
                  value={festival.startDate}
                  onChange={handleChange}
                  placeholder="dd-mm-yyyy"
                  required
                />
              </label>
              <label>
                Festival End Date *
                <input
                  type="date"
                  name="endDate"
                  value={festival.endDate}
                  onChange={handleChange}
                  placeholder="dd-mm-yyyy"
                  required
                />
              </label>
              <label>
                Organizers
                <input
                  type="text"
                  name="organisers"
                  value={festival.organisers}
                  onChange={handleChange}
                  placeholder="e.g., Murugan Temple Committee"
                />
              </label>
              <label>
                Incharge Person
                <input
                  type="text"
                  name="inCharge"
                  value={festival.inCharge}
                  onChange={handleChange}
                  placeholder="e.g., Mr. Rajan"
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}>Cancel</button>
              <button type="submit" className="btn-save">
                <span className="btn-icon">+</span>
                {editingId ? "Update Festival" : "Create Festival"}
              </button>
            </div>
          </form>
        )}

        {/* Empty State */}
        {festivals.length === 0 && !showForm && (
          <div className="empty-state">
            <div className="empty-icon">🎆</div>
            <h3>No festivals yet</h3>
            <p>Create your first festival to start tracking collections</p>
            <button className="btn-add-first" onClick={() => setShowForm(true)}>
              + Add First Festival
            </button>
          </div>
        )}

        {/* Festivals List */}
        {festivals.length > 0 && (
          <div className="festivals-list">
            {festivals.map((fest) => {
              const today = new Date();
              const endDate = new Date(fest.endDate);
              const isActive = endDate >= today;
              
              return (
                <div key={fest.id} className="festival-card">
                  <div className="festival-card-header">
                    <div className="festival-card-title-row">
                      <h3>{fest.name}</h3>
                      <button className="btn-delete-icon" onClick={() => handleDelete(fest.id)}>
                        🗑️
                      </button>
                    </div>
                    {isActive && <span className="festival-status-badge">Active</span>}
                  </div>
                  <div className="festival-details">
                    <div className="festival-detail-item">
                      <span className="detail-icon">₹</span>
                      <span className="detail-text">
                        <strong>Per Family:</strong> ₹{Number(fest.amountPerFamily).toLocaleString()}
                      </span>
                    </div>
                    <div className="festival-detail-item">
                      <span className="detail-icon">📅</span>
                      <span className="detail-text">
                        <strong>Collection:</strong> {fest.startDate} → {fest.endDate}
                      </span>
                    </div>
                    <div className="festival-detail-item">
                      <span className="detail-icon">👥</span>
                      <span className="detail-text">
                        <strong>Organizers:</strong> {fest.organisers || "N/A"}
                      </span>
                    </div>
                    <div className="festival-detail-item">
                      <span className="detail-icon">👤</span>
                      <span className="detail-text">
                        <strong>Incharge:</strong> {fest.inCharge || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="festival-actions">
                    <button className="btn-edit" onClick={() => handleEdit(fest)}>Edit</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="festival-footer">
        <p>© 2026. Built with <span className="heart">❤</span> using caffeine.ai</p>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <BottomNav />
    </div>
  );
};

export default FestivalDetails;

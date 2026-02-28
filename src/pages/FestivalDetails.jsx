import { useState } from "react";
import "./festival.css";

const FestivalDetails = () => {
  const [festivals, setFestivals] = useState([]);
  const [showForm, setShowForm] = useState(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setFestivals([...festivals, { ...festival, id: Date.now() }]);
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

  return (
    <div className="festival-container">
      {/* Header */}
      <header className="festival-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">🎉</div>
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
        <button className="nav-tab active">⭐ Festivals</button>
        <button className="nav-tab">₹ Collections</button>
        <button className="nav-tab">☑ Expenses</button>
        <button className="nav-tab">📊 Analytics</button>
        <button className="nav-tab">💬 Review</button>
      </nav>

      {/* Main Content */}
      <main className="festival-content">
        <div className="content-header">
          <div>
            <h2>⭐ Festivals</h2>
            <p className="subtitle">Manage your village festival details</p>
          </div>
          <button className="btn-add-festival" onClick={() => setShowForm(true)}>
            + Add Festival
          </button>
        </div>

        {/* Festival Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="festival-form">
            <h3>Create New Festival</h3>
            <div className="form-grid">
              <label>
                Festival Name
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
                Amount Per Family
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
                Collection Start Date
                <input
                  type="date"
                  name="startDate"
                  value={festival.startDate}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Festival End Date
                <input
                  type="date"
                  name="endDate"
                  value={festival.endDate}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Organisers
                <input
                  type="text"
                  name="organisers"
                  value={festival.organisers}
                  onChange={handleChange}
                  placeholder="Names of organisers"
                />
              </label>
              <label>
                In-Charge
                <input
                  type="text"
                  name="inCharge"
                  value={festival.inCharge}
                  onChange={handleChange}
                  placeholder="Name of person in-charge"
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-save">Save Festival</button>
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
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
            {festivals.map((fest) => (
              <div key={fest.id} className="festival-card">
                <h3>{fest.name}</h3>
                <div className="festival-details">
                  <p><strong>Amount per Family:</strong> ₹{fest.amountPerFamily}</p>
                  <p><strong>Collection Period:</strong> {fest.startDate} to {fest.endDate}</p>
                  <p><strong>Organisers:</strong> {fest.organisers}</p>
                  <p><strong>In-Charge:</strong> {fest.inCharge}</p>
                </div>
                <div className="festival-actions">
                  <button className="btn-edit">Edit</button>
                  <button className="btn-delete">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="festival-footer">
        <p>© 2026. Built with <span className="heart">❤</span> using caffeine.ai</p>
      </footer>
    </div>
  );
};

export default FestivalDetails;

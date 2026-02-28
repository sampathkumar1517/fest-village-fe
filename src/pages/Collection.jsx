import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import "./collection.css";

const Collection = () => {
  const location = useLocation();
  const [records, setRecords] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [entry, setEntry] = useState({
    familyName: "",
    paidAmount: "",
    paymentType: "Cash",
    collectedBy: "",
    mobile: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // Load from localStorage
    const stored = JSON.parse(localStorage.getItem("collections") || "[]");
    setRecords(stored);
    const storedFestivals = JSON.parse(localStorage.getItem("festivals") || "[]");
    setFestivals(storedFestivals);
    if (storedFestivals.length > 0 && !selectedFestival) {
      setSelectedFestival(storedFestivals[0].id);
    }
  }, []);

  const addRecord = (e) => {
    e.preventDefault();
    if (!selectedFestival) {
      alert("Please select a festival first");
      return;
    }
    const selectedFest = festivals.find(f => f.id === selectedFestival);
    const expectedAmount = Number(selectedFest?.amountPerFamily || 0);
    const paidAmount = Number(entry.paidAmount || 0);
    const balance = expectedAmount - paidAmount;
    
    const newRecord = { 
      ...entry, 
      id: Date.now(),
      festivalId: selectedFestival,
      balance: balance,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [...records, newRecord];
    setRecords(updated);
    localStorage.setItem("collections", JSON.stringify(updated));
    setEntry({
      familyName: "",
      paidAmount: "",
      paymentType: "Cash",
      collectedBy: "",
      mobile: "",
    });
    setShowForm(false);
  };

  const deleteRecord = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      const updated = records.filter(r => r.id !== id);
      setRecords(updated);
      localStorage.setItem("collections", JSON.stringify(updated));
    }
  };

  const isActive = (path) => location.pathname === path;

  const selectedFest = festivals.find(f => f.id === selectedFestival);
  const perFamilyAmount = Number(selectedFest?.amountPerFamily || 0);
  const filteredRecords = selectedFestival ? records.filter(r => r.festivalId === selectedFestival) : records;
  const totalCollected = filteredRecords.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);
  const totalBalance = filteredRecords.reduce((sum, r) => sum + (Number(r.balance) || 0), 0);

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
          📊 Analytics
        </Link>
        <Link to="/review" className={`nav-tab ${isActive("/review") ? "active" : ""}`}>
          💬 Review
        </Link>
      </nav>

      {/* Main Content */}
      <main className="festival-content">
        <div className="content-header">
          <div>
            <h2>₹ Collections</h2>
            <p className="subtitle">Track family payments for each festival</p>
          </div>
        </div>

        {/* Select Festival Card */}
        <div className="select-festival-card">
          <h3>Select Festival</h3>
          <div className="festival-selector-row">
            <select 
              className="festival-select"
              value={selectedFestival}
              onChange={(e) => setSelectedFestival(e.target.value)}
            >
              <option value="">-- Select Festival --</option>
              {festivals.map(fest => (
                <option key={fest.id} value={fest.id}>{fest.name}</option>
              ))}
            </select>
            <button className="btn-add-payment" onClick={() => setShowForm(true)}>
              <span className="btn-icon">+</span> Add Payment
            </button>
          </div>
        </div>

        {/* Collection Form */}
        {showForm && (
          <form onSubmit={addRecord} className="festival-form payment-form">
            <div className="form-header-row">
              <h3 className="form-title">
                <span className="form-icon">💰</span>
                Record Family Payment
              </h3>
              {perFamilyAmount > 0 && (
                <div className="per-family-badge">
                  Per Family: ₹{perFamilyAmount.toLocaleString()}
                </div>
              )}
            </div>
            <div className="form-grid">
              <label>
                Family Name *
                <input
                  type="text"
                  name="familyName"
                  value={entry.familyName}
                  onChange={handleChange}
                  placeholder="e.g., Rajan Family"
                  required
                />
              </label>
              <label>
                Paid Amount (₹) *
                <input
                  type="number"
                  name="paidAmount"
                  value={entry.paidAmount}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  required
                />
              </label>
              <label>
                Mobile Number *
                <input
                  type="tel"
                  name="mobile"
                  value={entry.mobile}
                  onChange={handleChange}
                  placeholder="e.g., 9876543210"
                  pattern="[0-9]{10}"
                  required
                />
              </label>
              <label>
                Payment Type
                <select
                  name="paymentType"
                  value={entry.paymentType}
                  onChange={handleChange}
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </label>
              <label>
                Collected By
                <input
                  type="text"
                  name="collectedBy"
                  value={entry.collectedBy}
                  onChange={handleChange}
                  placeholder="e.g., Kumar"
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-save">Record Payment</button>
            </div>
          </form>
        )}

        {/* Summary Cards */}
        {records.length > 0 && (
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-label">Total Collected</div>
              <div className="summary-value">₹{totalCollected.toLocaleString()}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Balance</div>
              <div className="summary-value">₹{totalBalance.toLocaleString()}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Families</div>
              <div className="summary-value">{records.length}</div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredRecords.length === 0 && !showForm && selectedFestival && (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h3>No collection records yet</h3>
            <p>Add your first collection record to start tracking</p>
            <button className="btn-add-first" onClick={() => setShowForm(true)}>
              + Add First Record
            </button>
          </div>
        )}
        
        {!selectedFestival && festivals.length > 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Select a Festival</h3>
            <p>Please select a festival from the dropdown above to view or add collections</p>
          </div>
        )}
        
        {festivals.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎆</div>
            <h3>No festivals available</h3>
            <p>Create a festival first to start tracking collections</p>
          </div>
        )}

        {/* Records Table */}
        {filteredRecords.length > 0 && (
          <div className="table-container">
            <table className="records-table">
              <thead>
                <tr>
                  <th>Family Name</th>
                  <th>Paid Amount</th>
                  <th>Balance</th>
                  <th>Payment Type</th>
                  <th>Collected By</th>
                  <th>Mobile</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r) => (
                  <tr key={r.id}>
                    <td>{r.familyName}</td>
                    <td>₹{Number(r.paidAmount).toLocaleString()}</td>
                    <td>
                      <span className={Number(r.balance || 0) <= 0 ? "balance-paid" : "balance-due"}>
                        ₹{Number(r.balance || 0).toLocaleString()}
                      </span>
                    </td>
                    <td><span className="badge-payment">{r.paymentType}</span></td>
                    <td>{r.collectedBy || "N/A"}</td>
                    <td>{r.mobile || "N/A"}</td>
                    <td>
                      <button className="btn-delete-small" onClick={() => deleteRecord(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default Collection;

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import "./expenses.css";

const Expenses = () => {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [expense, setExpense] = useState({
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    // Load from localStorage
    const stored = JSON.parse(localStorage.getItem("expenses") || "[]");
    setItems(stored);
    const storedFestivals = JSON.parse(localStorage.getItem("festivals") || "[]");
    setFestivals(storedFestivals);
    if (storedFestivals.length > 0 && !selectedFestival) {
      setSelectedFestival(storedFestivals[0].id);
    }
  }, [selectedFestival]);

  const addExpense = (e) => {
    e.preventDefault();
    if (!selectedFestival) {
      alert("Please select a festival first");
      return;
    }
    const newExpense = { ...expense, id: Date.now(), festivalId: selectedFestival };
    const updated = [...items, newExpense];
    setItems(updated);
    localStorage.setItem("expenses", JSON.stringify(updated));
    setExpense({ 
      category: "", 
      description: "", 
      amount: "",
      date: new Date().toISOString().split('T')[0],
    });
    setShowForm(false);
  };

  const deleteExpense = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      const updated = items.filter(item => item.id !== id);
      setItems(updated);
      localStorage.setItem("expenses", JSON.stringify(updated));
    }
  };

  const isActive = (path) => location.pathname === path;

  const filteredItems = selectedFestival ? items.filter(item => item.festivalId === selectedFestival) : items;
  const totalExpenses = filteredItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  
  const expensesByCategory = filteredItems.reduce((acc, item) => {
    const cat = item.category || 'other';
    acc[cat] = (acc[cat] || 0) + (Number(item.amount) || 0);
    return acc;
  }, {});

  const categoryLabels = {
    food: "Food",
    flower: "Flower",
    festival: "Festival Items",
    petrol: "Petrol",
    dress: "Dress",
    decoration: "Decoration",
    retail: "Retail Shop",
    other: "Other"
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
            <h2>☑ Expenses</h2>
            <p className="subtitle">Record and track festival expenses</p>
          </div>
        </div>

        {/* Select Festival and Add Expense */}
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
            <button className="btn-add-expense" onClick={() => setShowForm(true)}>
              <span className="btn-icon">+</span> Add Expense
            </button>
          </div>
        </div>

        {/* Expense Form */}
        {showForm && (
          <form onSubmit={addExpense} className="festival-form expense-form-card">
            <h3 className="form-title">
              <span className="form-icon">💸</span>
              Record Expense
            </h3>
            <div className="form-grid expense-form-grid">
              <label>
                Category
                <div className="category-select-wrapper">
                  <select name="category" value={expense.category} onChange={handleChange} required className="category-select">
                    <option value="">-- choose --</option>
                    <option value="food">🍽️ Food</option>
                    <option value="flower">🌸 Flower</option>
                    <option value="festival">🏺 Festival Items</option>
                    <option value="petrol">⛽ Petrol</option>
                    <option value="dress">👗 Dress</option>
                    <option value="decoration">🎊 Decoration</option>
                    <option value="retail">🏪 Retail Shop</option>
                    <option value="other">📦 Others</option>
                  </select>
                </div>
              </label>
              <label>
                Amount (₹) *
                <input
                  type="number"
                  name="amount"
                  value={expense.amount}
                  onChange={handleChange}
                  placeholder="e.g., 1500"
                  required
                />
              </label>
              <label className="description-full">
                Description *
                <input
                  type="text"
                  name="description"
                  value={expense.description}
                  onChange={handleChange}
                  placeholder="e.g., Prasadam food for 200 people"
                  required
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-save">Record Expense</button>
            </div>
          </form>
        )}

        {/* Summary Cards */}
        {filteredItems.length > 0 && (
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-label">Total Expenses</div>
              <div className="summary-value">₹{totalExpenses.toLocaleString()}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Total Items</div>
              <div className="summary-value">{filteredItems.length}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Categories</div>
              <div className="summary-value">{Object.keys(expensesByCategory).length}</div>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {Object.keys(expensesByCategory).length > 0 && (
          <div className="category-breakdown">
            <h3>Expenses by Category</h3>
            <div className="category-list">
              {Object.entries(expensesByCategory).map(([cat, amount]) => (
                <div key={cat} className="category-item">
                  <span className="category-name">{categoryLabels[cat] || cat}</span>
                  <span className="category-amount">₹{amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && !showForm && selectedFestival && (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <h3>No expenses recorded yet</h3>
            <p>Add your first expense to start tracking</p>
            <button className="btn-add-first" onClick={() => setShowForm(true)}>
              + Add First Expense
            </button>
          </div>
        )}
        
        {!selectedFestival && festivals.length > 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Select a Festival</h3>
            <p>Please select a festival from the dropdown above to view or add expenses</p>
          </div>
        )}
        
        {festivals.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎆</div>
            <h3>No festivals available</h3>
            <p>Create a festival first to start tracking expenses</p>
          </div>
        )}

        {/* Expenses List */}
        {filteredItems.length > 0 && (
          <div className="expenses-list-container">
            <h3>All Expenses</h3>
            <div className="expenses-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="expense-card">
                  <div className="expense-header">
                    <span className="expense-category">{categoryLabels[item.category] || item.category}</span>
                    <button className="btn-delete-small" onClick={() => deleteExpense(item.id)}>×</button>
                  </div>
                  <div className="expense-description">{item.description || "No description"}</div>
                  <div className="expense-footer">
                    <div className="expense-amount">₹{Number(item.amount).toLocaleString()}</div>
                    <div className="expense-date">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
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

export default Expenses;

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import "./analytics.css";

const Analytics = () => {
  const location = useLocation();
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [collections, setCollections] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [selectedFestival, setSelectedFestival] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedMobile, setSelectedMobile] = useState("");

  useEffect(() => {
    // Get data from localStorage
    const loadData = () => {
      const storedCollections = JSON.parse(localStorage.getItem("collections") || "[]");
      const storedExpenses = JSON.parse(localStorage.getItem("expenses") || "[]");
      const storedFestivals = JSON.parse(localStorage.getItem("festivals") || "[]");
      
      setFestivals(storedFestivals);
      
      if (selectedFestival) {
        const filteredCollections = storedCollections.filter(c => c.festivalId === selectedFestival);
        const filteredExpenses = storedExpenses.filter(e => e.festivalId === selectedFestival);
        
        setCollections(filteredCollections);
        setExpenses(filteredExpenses);
        
        const collected = filteredCollections.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);
        const expenseTotal = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        
        setTotalCollected(collected);
        setTotalExpenses(expenseTotal);
      } else {
        setCollections(storedCollections);
        setExpenses(storedExpenses);
        
        const collected = storedCollections.reduce((sum, r) => sum + (Number(r.paidAmount) || 0), 0);
        const expenseTotal = storedExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        
        setTotalCollected(collected);
        setTotalExpenses(expenseTotal);
      }
    };

    loadData();
    // Refresh data every 2 seconds to catch updates from other tabs
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [selectedFestival]);
  
  useEffect(() => {
    const storedFestivals = JSON.parse(localStorage.getItem("festivals") || "[]");
    setFestivals(storedFestivals);
    if (storedFestivals.length > 0 && !selectedFestival) {
      setSelectedFestival(storedFestivals[0].id);
    }
  }, []);

  const selectedFest = festivals.find(f => f.id === selectedFestival);
  const perFamilyAmount = Number(selectedFest?.amountPerFamily || 0);
  const expectedTotal = collections.length * perFamilyAmount;
  const collectionProgress = expectedTotal > 0 ? (totalCollected / expectedTotal) * 100 : 0;
  
  const balance = totalCollected - totalExpenses;
  const percentage = totalCollected > 0 ? ((totalExpenses / totalCollected) * 100).toFixed(1) : 0;

  const handleShareWhatsApp = () => {
    if (!selectedFestival) {
      alert("Please select a festival first");
      return;
    }

    const summary = `
🎉 *Festival Summary Report*

💰 Total Collected: ₹${totalCollected.toLocaleString()}
💸 Total Expenses: ₹${totalExpenses.toLocaleString()}
📊 Balance: ₹${balance.toLocaleString()}
👥 Families: ${collections.length}
📈 Progress: ${collectionProgress.toFixed(1)}%

Thank you for your contribution!
    `.trim();

    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(summary)}`;
    window.open(whatsappLink, '_blank');
  };

  const isActive = (path) => location.pathname === path;

  // Calculate expenses by category
  const expensesByCategory = expenses.reduce((acc, item) => {
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

  const maxCategoryAmount = Math.max(...Object.values(expensesByCategory), 0);

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
            <h2>📊 Analytics</h2>
            <p className="subtitle">Financial overview and insights</p>
          </div>
        </div>

        {/* Select Festival and Share */}
        <div className="analytics-select-card">
          <div className="analytics-select-row">
            <div className="select-festival-section">
              <h3>Select Festival</h3>
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
            </div>
            <button className="btn-share-whatsapp" onClick={handleShareWhatsApp}>
              <span className="share-icon">📱</span> Share via WhatsApp
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="analytics-cards">
          <div className="analytics-card">
            <div className="analytics-icon-circle collected-icon">
              <span className="icon-symbol">₹</span>
            </div>
            <div className="analytics-content">
              <div className="analytics-value">₹{totalCollected.toLocaleString()}</div>
              <div className="analytics-label">{collections.length} families</div>
            </div>
          </div>
          <div className="analytics-card">
            <div className="analytics-icon-circle expense-icon">
              <span className="icon-symbol">💼</span>
            </div>
            <div className="analytics-content">
              <div className="analytics-value expense">₹{totalExpenses.toLocaleString()}</div>
              <div className="analytics-label">{expenses.length} items</div>
            </div>
          </div>
          <div className="analytics-card">
            <div className="analytics-icon-circle balance-icon">
              <span className="icon-symbol">📈</span>
            </div>
            <div className="analytics-content">
              <div className="analytics-value balance">{balance >= 0 ? '+' : ''}₹{balance.toLocaleString()}</div>
              <div className="analytics-label">{balance >= 0 ? 'Surplus' : 'Deficit'}</div>
            </div>
          </div>
        </div>

        {/* Collection Progress */}
        {selectedFestival && perFamilyAmount > 0 && (
          <div className="chart-container collection-progress-card">
            <div className="progress-header">
              <div>
                <div className="progress-title">Collected: ₹{totalCollected.toLocaleString()}</div>
                <div className="progress-subtitle">
                  ₹{perFamilyAmount.toLocaleString()} per family = {collections.length} families = ₹{expectedTotal.toLocaleString()} expected
                </div>
              </div>
              <div className="expected-amount">Expected: ₹{expectedTotal.toLocaleString()}</div>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${Math.min(collectionProgress, 100)}%` }}>
                <span className="progress-text">{collectionProgress.toFixed(1)}% collected</span>
              </div>
            </div>
            <div className="progress-footer">
              {collections.length} families paid
            </div>
          </div>
        )}

        {/* Comparison Chart */}
        <div className="chart-container">
          <h3>Collection vs Expenses</h3>
          <div className="bar-chart-wrapper">
            <div className="chart-y-axis">
              <div className="y-axis-label">₹{Math.max(totalCollected, totalExpenses, 1000).toLocaleString()}</div>
              <div className="y-axis-label">₹{Math.round(Math.max(totalCollected, totalExpenses, 1000) * 0.75).toLocaleString()}</div>
              <div className="y-axis-label">₹{Math.round(Math.max(totalCollected, totalExpenses, 1000) * 0.5).toLocaleString()}</div>
              <div className="y-axis-label">₹{Math.round(Math.max(totalCollected, totalExpenses, 1000) * 0.25).toLocaleString()}</div>
              <div className="y-axis-label">₹0</div>
            </div>
            <div className="chart-bars-container">
              <div className="chart-bar-item">
                <div className="chart-bar collected-bar" style={{ height: `${totalCollected > 0 ? Math.min((totalCollected / Math.max(totalCollected, totalExpenses, 1000)) * 100, 100) : 0}%` }}>
                  <span className="bar-value">₹{totalCollected.toLocaleString()}</span>
                </div>
                <div className="chart-x-label">Collected</div>
              </div>
              <div className="chart-bar-item">
                <div className="chart-bar expense-bar" style={{ height: `${totalExpenses > 0 ? Math.min((totalExpenses / Math.max(totalCollected, totalExpenses, 1000)) * 100, 100) : 0}%` }}>
                  <span className="bar-value">₹{totalExpenses.toLocaleString()}</span>
                </div>
                <div className="chart-x-label">Expenses</div>
              </div>
              <div className="chart-bar-item">
                <div className="chart-bar balance-bar" style={{ height: `${Math.abs(balance) > 0 ? Math.min((Math.abs(balance) / Math.max(totalCollected, totalExpenses, 1000)) * 100, 100) : 0}%` }}>
                  <span className="bar-value">{balance >= 0 ? '+' : '-'}₹{Math.abs(balance).toLocaleString()}</span>
                </div>
                <div className="chart-x-label">Balance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses by Category */}
        {Object.keys(expensesByCategory).length > 0 && (
          <div className="chart-container">
            <h3>Expenses by Category</h3>
            <div className="category-chart">
              {Object.entries(expensesByCategory).map(([cat, amount]) => (
                <div key={cat} className="category-chart-item">
                  <div className="category-chart-header">
                    <span className="category-chart-name">{categoryLabels[cat] || cat}</span>
                    <span className="category-chart-amount">₹{amount.toLocaleString()}</span>
                  </div>
                  <div className="category-chart-bar-wrapper">
                    <div 
                      className="category-chart-bar" 
                      style={{ width: `${maxCategoryAmount > 0 ? (amount / maxCategoryAmount) * 100 : 0}%` }}
                    ></div>
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

export default Analytics;

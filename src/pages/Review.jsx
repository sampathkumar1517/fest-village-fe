import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import "./review.css";

const Review = () => {
  const location = useLocation();
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim() && rating > 0) {
      const newSuggestion = {
        id: Date.now(),
        text: feedback,
        rating: rating,
        date: new Date().toLocaleDateString(),
        status: "pending"
      };
      setSuggestions([...suggestions, newSuggestion]);
      setFeedback("");
      setRating(0);
      setSubmitted(true);
      
      // In a real app, this would send to backend
      console.log("Feedback received:", newSuggestion);
      
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  const isActive = (path) => location.pathname === path;

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
            <h2>💬 Review</h2>
            <p className="subtitle">Share your feedback and view implemented features</p>
          </div>
        </div>

        {/* Implemented Features */}
        <div className="implemented-features">
          <div className="features-header">
            <h3 className="features-title">
              <span className="check-icon">✅</span>
              Implemented Features
            </h3>
            <div className="completion-status">16/16 Complete</div>
          </div>
          <div className="features-grid">
            <div className="feature-category">
              <h4 className="category-title">Festivals</h4>
              <div className="feature-list">
                <div className="feature-check-item">✅ Create festival with name, amount, dates</div>
                <div className="feature-check-item">✅ View all festivals as cards</div>
                <div className="feature-check-item">✅ Add organizers and incharge person</div>
                <div className="feature-check-item">✅ Delete festivals</div>
              </div>
            </div>
            <div className="feature-category">
              <h4 className="category-title">Collections</h4>
              <div className="feature-list">
                <div className="feature-check-item">✅ Festival selector for collections</div>
                <div className="feature-check-item">✅ Payment type: Cash / Online / Cheque</div>
                <div className="feature-check-item">✅ Track collector name per payment</div>
                <div className="feature-check-item">✅ Record family payments with mobile</div>
                <div className="feature-check-item">✅ Show balance (green = paid, red = due)</div>
              </div>
            </div>
            <div className="feature-category">
              <h4 className="category-title">Expenses</h4>
              <div className="feature-list">
                <div className="feature-check-item">✅ 8 expense categories (Food, Flower, etc.)</div>
                <div className="feature-check-item">✅ Color-coded category badges</div>
                <div className="feature-check-item">✅ Record expenses with description & amount</div>
              </div>
            </div>
            <div className="feature-category">
              <h4 className="category-title">Analytics</h4>
              <div className="feature-list">
                <div className="feature-check-item">✅ Summary: Collected / Expenses / Balance</div>
                <div className="feature-check-item">✅ Expense breakdown charts (bar + pie)</div>
                <div className="feature-check-item">✅ Collection progress bar</div>
                <div className="feature-check-item">✅ Share summary via WhatsApp</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="feedback-section">
          <div className="feedback-card">
            <h3 className="feedback-title">
              <span className="feedback-icon">💬</span>
              Share Your Feedback
            </h3>
            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="form-group">
                <label>
                  Rate your experience *
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${star <= rating ? 'active' : ''}`}
                        onClick={() => setRating(star)}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </label>
              </div>
              <div className="form-group">
                <label>
                  Your comment *
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={5}
                    placeholder="Share your thoughts about the Village Festival Manager..."
                    required
                  />
                </label>
              </div>
              <button type="submit" className="btn-save">Submit Feedback</button>
            </form>
          </div>

          <div className="feedback-summary-card">
            <h3 className="feedback-title">
              <span className="feedback-icon">⭐</span>
              Feedback Summary
            </h3>
            {suggestions.length === 0 ? (
              <div className="empty-feedback">
                <div className="empty-star-icon">⭐</div>
                <p>No feedback yet. Be the first!</p>
              </div>
            ) : (
              <div className="feedback-list">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="feedback-item">
                    <div className="feedback-rating">
                      {[...Array(suggestion.rating || 0)].map((_, i) => (
                        <span key={i}>⭐</span>
                      ))}
                    </div>
                    <div className="feedback-text">{suggestion.text}</div>
                    <div className="feedback-date">{suggestion.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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

export default Review;

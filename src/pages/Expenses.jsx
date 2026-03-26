import { useEffect, useMemo, useState } from "react";
import { FileText, Plus, Trash2 } from "lucide-react";
import "./expenses.css";

const CATEGORIES = [
  "Food",
  "Flower",
  "Festival Things",
  "Petrol",
  "Dress",
  "Decoration",
  "Retail Shop",
  "Other",
];

export default function Expenses() {
  const [festivals, setFestivals] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedFestivalId, setSelectedFestivalId] = useState("");
  const [form, setForm] = useState({
    date: "",
    description: "",
    category: "Food",
    amount: "",
  });

  useEffect(() => {
    const storedFestivals = JSON.parse(localStorage.getItem("festivals") || "[]");
    const storedExpenses = JSON.parse(localStorage.getItem("expenses") || "[]");

    setFestivals(storedFestivals);
    setExpenses(storedExpenses);
    
    // Don't auto-select - user must select manually
  }, []);

  const festivalExpenses = useMemo(() => {
    if (!selectedFestivalId) return [];
    return expenses.filter((e) => e.festivalId === selectedFestivalId);
  }, [expenses, selectedFestivalId]);

  const totals = useMemo(() => {
    const total = festivalExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    const byCategory = {};
    festivalExpenses.forEach((e) => {
      const cat = e.category || "Other";
      byCategory[cat] = (byCategory[cat] || 0) + (parseFloat(e.amount) || 0);
    });

    return { total, byCategory };
  }, [festivalExpenses]);

  const formatCurrency = (amount) => `₹${amount.toLocaleString("en-IN")}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!selectedFestivalId) return;

    if (!form.date || !form.description.trim() || !form.amount.trim()) {
      alert("Please fill date, description and amount.");
      return;
    }

    const amount = parseFloat(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      alert("Enter a valid amount.");
      return;
    }

    const existing = JSON.parse(localStorage.getItem("expenses") || "[]");
    const newExpense = {
      id: `exp_${Date.now()}`,
      festivalId: selectedFestivalId,
      date: form.date,
      description: form.description.trim(),
      category: form.category,
      amount,
      createdAt: new Date().toISOString(),
    };

    const updated = [...existing, newExpense];
    localStorage.setItem("expenses", JSON.stringify(updated));
    setExpenses(updated);

    setForm((prev) => ({
      ...prev,
      date: "",
      description: "",
      amount: "",
    }));
  };

  const handleDelete = (id) => {
    if (!window.confirm("Delete this expense?")) return;
    const updated = expenses.filter((e) => e.id !== id);
    localStorage.setItem("expenses", JSON.stringify(updated));
    setExpenses(updated);
  };

  const selectedFestival = festivals.find((f) => f.id === selectedFestivalId);

  return (
    <div className="expenses-container">
      {/* Header */}
      <div className="expenses-header">
        <div>
          <h2 className="expenses-title">
            <FileText className="expenses-icon" />
            Expenses
          </h2>
          <p className="expenses-subtitle">Manage all village festival expenses</p>
        </div>
      </div>

      {/* Festival select + add */}
      <div className="add-expense-card">
        <div className="festival-selector-row">
          <div className="select-festival-section">
            <label className="festival-select-label">Select Festival</label>
            <select
              value={selectedFestivalId}
              onChange={(e) => setSelectedFestivalId(e.target.value)}
              className="festival-select"
            >
              <option value="">Choose a festival...</option>
              {festivals.map((fest) => (
                <option key={fest.id} value={fest.id}>
                  {fest.name}
                </option>
              ))}
            </select>
          </div>
          <div className="add-expense-button-wrapper">
            <button
              className="btn-add-expense"
              onClick={() => {
                if (!selectedFestivalId) {
                  alert("Please select a festival first");
                  return;
                }
                // Form will be shown below
              }}
              disabled={!selectedFestivalId}
              type="button"
            >
              <Plus className="btn-icon" /> Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Expense form - only show when festival is selected */}
      {selectedFestivalId ? (
        <div className="expense-form-card">
          <form onSubmit={handleAddExpense}>
            <div className="expense-form-grid">
              <div>
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Category</label>
                <div className="category-select-wrapper">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="category-select"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="description-full">
                <label className="form-label">Description *</label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g., Annadanam, flower decoration, petrol for van..."
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Amount (₹) *</label>
                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="e.g., 2500"
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setForm({
                    date: "",
                    description: "",
                    category: "Food",
                    amount: "",
                  });
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={!selectedFestivalId}
              >
                <Plus className="btn-icon" /> Save Expense
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="expenses-empty">
          <p>Please select a festival to manage expenses</p>
        </div>
      )}

      {/* Category breakdown - only show when festival is selected and has expenses */}
      {selectedFestivalId && festivalExpenses.length > 0 && (
        <div className="category-breakdown">
          <h3>Expenses by Category</h3>
          <div className="category-list">
            {Object.entries(totals.byCategory).map(([cat, amt]) => (
              <div key={cat} className="category-item">
                <span className="category-name">{cat}</span>
                <span className="category-amount">{formatCurrency(amt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense cards list - only show when festival is selected */}
      {selectedFestivalId ? (
        <div className="expenses-list-container">
          <h3>All Expenses — {selectedFestival?.name || "Festival"}</h3>
          {festivalExpenses.length === 0 ? (
            <div className="expenses-empty-state">
              <p>No expenses recorded yet for this festival.</p>
            </div>
          ) : (
            <div className="expenses-grid">
              {festivalExpenses.map((exp) => (
                <div key={exp.id} className="expense-card">
                  <div className="expense-header">
                    <span className="expense-category">{exp.category}</span>
                    <button
                      className="btn-delete-small"
                      onClick={() => handleDelete(exp.id)}
                      title="Delete expense"
                    >
                      <Trash2 className="delete-icon" />
                    </button>
                  </div>
                  <div className="expense-description">{exp.description}</div>
                  <div className="expense-footer">
                    <div className="expense-amount">{formatCurrency(exp.amount)}</div>
                    <div className="expense-date">{exp.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

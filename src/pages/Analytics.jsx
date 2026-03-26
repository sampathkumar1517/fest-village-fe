import { useState, useEffect, useMemo } from "react";
import { LineChart } from "lucide-react";
import "./analytics.css";

export default function Analytics() {
  const [festivals, setFestivals] = useState([]);
  const [collections, setCollections] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedFestivalId, setSelectedFestivalId] = useState("");

  // Load data from localStorage
  useEffect(() => {
    const storedFestivals = JSON.parse(localStorage.getItem("festivals") || "[]");
    const storedCollections = JSON.parse(localStorage.getItem("collections") || "[]");
    const storedExpenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    
    setFestivals(storedFestivals);
    setCollections(storedCollections);
    setExpenses(storedExpenses);
    
    // Don't auto-select - user must select manually
  }, []);

  // Calculate analytics for selected festival
  const analytics = useMemo(() => {
    if (!selectedFestivalId) {
      return {
        collected: 0,
        expenses: 0,
        balance: 0,
        families: 0,
        expected: 0,
        familiesPaid: 0,
        perFamilyAmount: 0,
        expensesByCategory: {},
        familyCollections: [],
      };
    }

    const festival = festivals.find((f) => f.id === selectedFestivalId);
    if (!festival) {
      return {
        collected: 0,
        expenses: 0,
        balance: 0,
        families: 0,
        expected: 0,
        familiesPaid: 0,
        perFamilyAmount: 0,
        expensesByCategory: {},
        familyCollections: [],
      };
    }

    // Calculate collections
    const festivalCollections = collections.filter((c) => c.festivalId === selectedFestivalId);
    const totalCollected = festivalCollections.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const uniqueFamilies = new Set(festivalCollections.map((c) => c.familyName)).size;
    const perFamilyAmount = parseFloat(festival.perFamilyAmount) || 0;
    // Expected is based on families who have paid (as shown in the image)
    const expectedAmount = perFamilyAmount * uniqueFamilies;

    // Calculate expenses
    const festivalExpenses = expenses.filter((e) => e.festivalId === selectedFestivalId);
    const totalExpenses = festivalExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    // Expenses by category
    const expensesByCategory = {};
    festivalExpenses.forEach((exp) => {
      const category = exp.category || "Other";
      expensesByCategory[category] = (expensesByCategory[category] || 0) + (parseFloat(exp.amount) || 0);
    });

    // Family collections with progress
    const familyCollections = [];
    const familyMap = {};
    festivalCollections.forEach((c) => {
      const name = c.familyName;
      if (!familyMap[name]) {
        familyMap[name] = { name, paid: 0, expected: perFamilyAmount };
      }
      familyMap[name].paid += parseFloat(c.amount) || 0;
    });
    Object.values(familyMap).forEach((fam) => {
      familyCollections.push(fam);
    });

    return {
      collected: totalCollected,
      expenses: totalExpenses,
      balance: totalCollected - totalExpenses,
      families: uniqueFamilies,
      expected: expectedAmount,
      familiesPaid: uniqueFamilies,
      perFamilyAmount: perFamilyAmount,
      expensesByCategory,
      familyCollections,
    };
  }, [selectedFestivalId, festivals, collections, expenses]);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const collectionProgress = analytics.expected > 0 
    ? Math.round((analytics.collected / analytics.expected) * 100) 
    : 0;

  const categoryNames = Object.keys(analytics.expensesByCategory);
  const maxCategoryAmount = Math.max(...Object.values(analytics.expensesByCategory), 0) || 1;
  const maxComparisonValue = Math.max(analytics.collected, analytics.expenses, Math.abs(analytics.balance)) || 1;

  const handleShareWhatsApp = () => {
    const festival = festivals.find((f) => f.id === selectedFestivalId);
    if (!festival) return;

    const message = `*${festival.name} - Financial Summary*\n\n` +
      `💰 Total Collected: ${formatCurrency(analytics.collected)}\n` +
      `💸 Total Expenses: ${formatCurrency(analytics.expenses)}\n` +
      `📊 Balance: ${formatCurrency(analytics.balance)}\n` +
      `👥 Families: ${analytics.families}\n\n` +
      `Collection Progress: ${collectionProgress}%`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">
            <LineChart className="analytics-icon" />
            Analytics
          </h2>
          <p className="analytics-subtitle">Financial overview and insights</p>
        </div>
      </div>

      {/* Festival Selector */}
      <div className="analytics-select-card">
        <div className="festival-select-wrapper">
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
        <button 
          onClick={handleShareWhatsApp}
          className="btn-share-whatsapp"
          disabled={!selectedFestivalId}
        >
          Share via WhatsApp
        </button>
      </div>

      {!selectedFestivalId ? (
        <div className="analytics-empty">
          <p>Please select a festival to view analytics</p>
        </div>
      ) : (
        <div className="analytics-content">
          {/* Top Row: Collection Summary */}
          <div className="analytics-top-row">
            <div className="collection-summary-widget">
              <div className="collection-summary-header">
                <div className="collection-summary-left">
                  <p className="collection-summary-label">Collected: {formatCurrency(analytics.collected)}</p>
                  <p className="collection-summary-label">Expected: {formatCurrency(analytics.expected)}</p>
                  <div className="collection-progress-bar-container">
                    <div 
                      className="collection-progress-bar-fill"
                      style={{ width: `${Math.min(collectionProgress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="collection-progress-percent">{collectionProgress}% collected</p>
                  <p className="collection-families-paid">{analytics.familiesPaid} families paid</p>
                  <p className="collection-calculation">
                    {formatCurrency(analytics.perFamilyAmount)} per family x {analytics.families} families = {formatCurrency(analytics.expected)} expected
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Expenses by Category and Expense Distribution */}
          <div className="analytics-middle-row">
            {/* Expenses by Category */}
            <div className="chart-card">
              <h4 className="chart-title">Expenses by Category</h4>
              <div className="category-chart-with-axis">
                <div className="category-chart-y-axis">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const value = Math.ceil(maxCategoryAmount / 4) * i;
                    return (
                      <div key={i} className="y-axis-label">
                        ₹{value.toLocaleString("en-IN")}
                      </div>
                    );
                  })}
                </div>
                <div className="category-chart-bars">
                  {categoryNames.length > 0 ? (
                    categoryNames.map((category, index) => {
                      const amount = analytics.expensesByCategory[category];
                      const percentage = (amount / maxCategoryAmount) * 100;
                      const colors = ["#f44336", "#2196f3", "#9e9e9e", "#ff9800", "#9c27b0"];
                      return (
                        <div key={category} className="category-bar-item">
                          <div className="category-bar-container">
                            <div
                              className="category-bar"
                              style={{
                                height: `${percentage}%`,
                                backgroundColor: colors[index % colors.length],
                              }}
                              title={`${category} Amount: ${formatCurrency(amount)}`}
                            ></div>
                          </div>
                          <div className="category-bar-label">{category}</div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="chart-empty">No expenses recorded</p>
                  )}
                </div>
              </div>
            </div>

            {/* Expense Distribution Pie Chart */}
            <div className="chart-card">
              <h4 className="chart-title">Expense Distribution</h4>
              <div className="pie-chart-container">
                {categoryNames.length > 0 ? (
                  <>
                    <svg className="pie-chart-svg" viewBox="0 0 200 200">
                      {categoryNames.map((category, index) => {
                        const amount = analytics.expensesByCategory[category];
                        const total = analytics.expenses;
                        const percentage = total > 0 ? (amount / total) * 100 : 0;
                        const colors = ["#f44336", "#2196f3", "#4caf50", "#ff9800", "#9c27b0"];
                        const startAngle = categoryNames.slice(0, index).reduce((sum, c) => {
                          const a = analytics.expensesByCategory[c];
                          return sum + (total > 0 ? (a / total) * 360 : 0);
                        }, 0);
                        const endAngle = startAngle + (percentage * 3.6);
                        const startAngleRad = (startAngle - 90) * (Math.PI / 180);
                        const endAngleRad = (endAngle - 90) * (Math.PI / 180);
                        const x1 = 100 + 100 * Math.cos(startAngleRad);
                        const y1 = 100 + 100 * Math.sin(startAngleRad);
                        const x2 = 100 + 100 * Math.cos(endAngleRad);
                        const y2 = 100 + 100 * Math.sin(endAngleRad);
                        const largeArc = percentage > 50 ? 1 : 0;
                        const pathData = [
                          `M 100 100`,
                          `L ${x1} ${y1}`,
                          `A 100 100 0 ${largeArc} 1 ${x2} ${y2}`,
                          `Z`
                        ].join(' ');
                        const labelAngle = (startAngle + endAngle) / 2;
                        const labelAngleRad = (labelAngle - 90) * (Math.PI / 180);
                        const labelX = 100 + 70 * Math.cos(labelAngleRad);
                        const labelY = 100 + 70 * Math.sin(labelAngleRad);
                        return (
                          <g key={category}>
                            <path
                              d={pathData}
                              fill={colors[index % colors.length]}
                              stroke="#fff"
                              strokeWidth="2"
                            />
                            {percentage > 5 && (
                              <text
                                x={labelX}
                                y={labelY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="12"
                                fill="#fff"
                                fontWeight="600"
                              >
                                {category} {Math.round(percentage)}%
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                    <div className="pie-legend">
                      {categoryNames.map((category, index) => {
                        const amount = analytics.expensesByCategory[category];
                        const total = analytics.expenses;
                        const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
                        const colors = ["#f44336", "#2196f3", "#4caf50", "#ff9800", "#9c27b0"];
                        return (
                          <div key={category} className="pie-legend-item">
                            <span
                              className="pie-legend-color"
                              style={{ backgroundColor: colors[index % colors.length] }}
                            ></span>
                            <span className="pie-legend-label">{category}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="chart-empty">No expenses recorded</p>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row: Collection vs Expenses and Family Collections */}
          <div className="analytics-bottom-row">
            {/* Collection vs Expenses */}
            <div className="chart-card">
              <h4 className="chart-title">Collection vs Expenses</h4>
              <div className="comparison-chart-with-axis">
                <div className="comparison-chart-y-axis">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const value = Math.ceil(maxComparisonValue / 4) * i;
                    const displayValue = value >= 1000 ? `₹${(value / 1000).toFixed(1)}k` : `₹${value}`;
                    return (
                      <div key={i} className="y-axis-label">
                        {displayValue}
                      </div>
                    );
                  })}
                </div>
                <div className="comparison-chart-bars">
                  <div className="comparison-bar-item">
                    <div className="comparison-bar-container">
                      <div
                        className="comparison-bar collected-bar"
                        style={{
                          height: `${Math.min((analytics.collected / maxComparisonValue) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="comparison-bar-label">Collected</div>
                  </div>
                  <div className="comparison-bar-item">
                    <div className="comparison-bar-container">
                      <div
                        className="comparison-bar expense-bar"
                        style={{
                          height: `${Math.min((analytics.expenses / maxComparisonValue) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="comparison-bar-label">Expenses</div>
                  </div>
                  <div className="comparison-bar-item">
                    <div className="comparison-bar-container">
                      <div
                        className={`comparison-bar ${analytics.balance >= 0 ? "balance-bar" : "deficit-bar"}`}
                        style={{
                          height: `${Math.min((Math.abs(analytics.balance) / maxComparisonValue) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="comparison-bar-label">Balance</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Collections */}
            <div className="chart-card">
              <h4 className="chart-title">Family Collections</h4>
              <div className="family-collections">
                {analytics.familyCollections.length > 0 ? (
                  analytics.familyCollections.map((family, index) => {
                    const progress = family.expected > 0 ? (family.paid / family.expected) * 100 : 0;
                    return (
                      <div key={index} className="family-collection-item">
                        <div className="family-name">{family.name}</div>
                        <div className="family-progress-container">
                          <div
                            className="family-progress-bar"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <div className="family-amount">
                          {formatCurrency(family.paid)} / {formatCurrency(family.expected)}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="chart-empty">No collections recorded</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

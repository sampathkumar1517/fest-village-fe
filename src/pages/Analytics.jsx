import { useEffect, useState } from "react";
import "./analytics.css";

// In a real app these would come from context or a backend
const sampleCollections = [
  { paidAmount: 1000 },
  { paidAmount: 1500 },
];
const sampleExpenses = [
  { amount: 500 },
  { amount: 300 },
];

const Analytics = () => {
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    setTotalCollected(sampleCollections.reduce((sum, r) => sum + Number(r.paidAmount), 0));
    setTotalExpenses(sampleExpenses.reduce((sum, e) => sum + Number(e.amount), 0));
  }, []);

  const balance = totalCollected - totalExpenses;

  return (
    <div className="page analytics-page">
      <h2>Analytics</h2>
      <div className="stats">
        <div className="stat">
          <strong>Collected:</strong> ₹{totalCollected}
        </div>
        <div className="stat">
          <strong>Expenses:</strong> ₹{totalExpenses}
        </div>
        <div className="stat">
          <strong>Balance:</strong> ₹{balance}</div>
      </div>
      <p>Comparisons and charts can go here when connected to real data.</p>
    </div>
  );
};

export default Analytics;

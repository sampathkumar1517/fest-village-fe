import { useState } from "react";
import "./expenses.css";

const Expenses = () => {
  const [items, setItems] = useState([]);
  const [expense, setExpense] = useState({
    category: "",
    description: "",
    amount: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense((prev) => ({ ...prev, [name]: value }));
  };

  const addExpense = (e) => {
    e.preventDefault();
    setItems((prev) => [...prev, expense]);
    setExpense({ category: "", description: "", amount: "" });
  };

  return (
    <div className="page expenses-page">
      <h2>Expenses</h2>
      <form onSubmit={addExpense} className="expense-form">
        <label>
          Category
          <select name="category" value={expense.category} onChange={handleChange} required>
            <option value="">-- choose --</option>
            <option value="food">Food</option>
            <option value="flower">Flower</option>
            <option value="festival">Festival Items</option>
            <option value="petrol">Petrol</option>
            <option value="dress">Dress</option>
            <option value="decoration">Decoration</option>
            <option value="retail">Retail Shop</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Description
          <input
            type="text"
            name="description"
            value={expense.description}
            onChange={handleChange}
          />
        </label>
        <label>
          Amount
          <input
            type="number"
            name="amount"
            value={expense.amount}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">Add</button>
      </form>

      <ul className="expense-list">
        {items.map((it, idx) => (
          <li key={idx}>
            {it.category} - {it.description} : ₹{it.amount}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Expenses;

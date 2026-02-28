import { useState } from "react";
import "./collection.css";

const Collection = () => {
  const [records, setRecords] = useState([]);
  const [entry, setEntry] = useState({
    familyName: "",
    paidAmount: "",
    balance: "",
    paymentType: "",
    collectedBy: "",
    mobile: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEntry((prev) => ({ ...prev, [name]: value }));
  };

  const addRecord = (e) => {
    e.preventDefault();
    setRecords((prev) => [...prev, entry]);
    setEntry({
      familyName: "",
      paidAmount: "",
      balance: "",
      paymentType: "",
      collectedBy: "",
      mobile: "",
    });
  };

  return (
    <div className="page collection-page">
      <h2>Collection Records</h2>
      <form onSubmit={addRecord} className="record-form">
        <label>
          Family Name
          <input
            type="text"
            name="familyName"
            value={entry.familyName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Paid Amount
          <input
            type="number"
            name="paidAmount"
            value={entry.paidAmount}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Balance
          <input
            type="number"
            name="balance"
            value={entry.balance}
            onChange={handleChange}
          />
        </label>
        <label>
          Payment Type
          <select
            name="paymentType"
            value={entry.paymentType}
            onChange={handleChange}
          >
            <option value="">-- choose --</option>
            <option value="cash">Cash</option>
            <option value="online">Online</option>
          </select>
        </label>
        <label>
          Collected By
          <input
            type="text"
            name="collectedBy"
            value={entry.collectedBy}
            onChange={handleChange}
          />
        </label>
        <label>
          Mobile Number
          <input
            type="tel"
            name="mobile"
            value={entry.mobile}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Add</button>
      </form>

      <table className="records-table">
        <thead>
          <tr>
            <th>Family</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Type</th>
            <th>Collector</th>
            <th>Mobile</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r, idx) => (
            <tr key={idx}>
              <td>{r.familyName}</td>
              <td>{r.paidAmount}</td>
              <td>{r.balance}</td>
              <td>{r.paymentType}</td>
              <td>{r.collectedBy}</td>
              <td>{r.mobile}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Collection;

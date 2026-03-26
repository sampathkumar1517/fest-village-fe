import { useState, useEffect, useMemo } from "react";
import { IndianRupee, Phone, Plus, Trash2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import "./collection.css";
import { getFestivals, AddPayment } from "../utils/api";

export default function Collection() {
  const [festivals, setFestivals] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedFestivalId, setSelectedFestivalId] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    familyName: "",
    mobile: "",
    amount: "",
    paymentType: "Cash",
    collector: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data from localStorage and API
  useEffect(() => {
    const storedCollections = JSON.parse(localStorage.getItem("collections") || "[]");
    setCollections(storedCollections);

    const fetchFestivals = async () => {
      try {
        const response = await getFestivals();
        if (response && response.listData && response.listData.length > 0) {
          setFestivals(response.listData[0].data || []);
        } else {
          setFestivals([]);
        }
      } catch (error) {
        console.error("Failed to fetch festivals:", error);
      }
    };
    
    fetchFestivals();
  }, []);

  // Get collections for selected festival
  const festivalCollections = useMemo(() => {
    if (!selectedFestivalId) return [];
    return collections.filter((c) => c.festivalId === selectedFestivalId);
  }, [selectedFestivalId, collections]);

  // Calculate summary metrics
  const summary = useMemo(() => {
    if (!selectedFestivalId) {
      return { families: 0, collected: 0, balance: 0 };
    }

    const festival = festivals.find((f) => String(f.id) === String(selectedFestivalId));
    if (!festival) {
      return { families: 0, collected: 0, balance: 0 };
    }

    const uniqueFamilies = new Set(festivalCollections.map((c) => c.familyName)).size;
    const totalCollected = festivalCollections.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const perFamilyAmount = parseFloat(festival.amountPerFamily) || 0;
    const expectedAmount = perFamilyAmount * uniqueFamilies;
    const balance = expectedAmount - totalCollected;

    return {
      families: uniqueFamilies,
      collected: totalCollected,
      balance: balance,
    };
  }, [selectedFestivalId, festivals, festivalCollections]);

  // Calculate balance for each family
  const getFamilyBalance = (familyName) => {
    const festival = festivals.find((f) => String(f.id) === String(selectedFestivalId));
    if (!festival) return 0;
    
    const perFamilyAmount = parseFloat(festival.amountPerFamily) || 0;
    const familyPayments = festivalCollections.filter((c) => c.familyName === familyName);
    const totalPaid = familyPayments.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    return Math.max(0, perFamilyAmount - totalPaid);
  };

  // Get total paid for a family
  const getFamilyPaid = (familyName) => {
    const familyPayments = festivalCollections.filter((c) => c.familyName === familyName);
    return familyPayments.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  };

  // Get status for a family
  const getFamilyStatus = (familyName) => {
    const balance = getFamilyBalance(familyName);
    return balance === 0 ? "Paid" : "Due";
  };

  // Delete collection
  const handleDelete = (collectionId) => {
    if (window.confirm("Are you sure you want to delete this payment record?")) {
      const updatedCollections = collections.filter((c) => c.id !== collectionId);
      setCollections(updatedCollections);
      localStorage.setItem("collections", JSON.stringify(updatedCollections));
    }
  };

  // Calculate per-family totals for display
  const familyTotals = useMemo(() => {
    const totals = {};
    festivalCollections.forEach((collection) => {
      const familyName = collection.familyName;
      if (!totals[familyName]) {
        totals[familyName] = {
          name: familyName,
          mobile: collection.mobile || "",
          totalPaid: 0,
          paymentType: collection.paymentType || "Cash",
          collector: collection.collector || "",
          collections: [],
        };
      }
      totals[familyName].totalPaid += parseFloat(collection.amount) || 0;
      totals[familyName].collections.push(collection);
    });
    return Object.values(totals);
  }, [festivalCollections]);

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const selectedFestival = festivals.find((f) => String(f.id) === String(selectedFestivalId));

  const handleOpenAddPayment = () => {
    setNewPayment({
      familyName: "",
      mobile: "",
      amount: "",
      paymentType: "Cash",
      collector: "",
    });
    setIsAddModalOpen(true);
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setNewPayment((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPayment = async (e) => {
    // 1. Prevent the default browser form submission
    if (e && e.preventDefault) e.preventDefault();

    const amount = parseFloat(newPayment.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 2. Format the payload to exactly match your backend API
      const apiPayload = {
        userId: 1, // NOTE: You may need to dynamically fetch or pass the correct user ID here
        festivalId: parseInt(selectedFestivalId, 10),
        paidAmount: amount,
        paymentStatus: "PENDING",
        paymentMethod: newPayment.paymentType.toUpperCase(), // Converts "Cash" to "CASH"
        paymentDate: new Date().toISOString().split("T")[0], // Gets "YYYY-MM-DD" formatted date
        collectedBy: newPayment.collector.trim() || "Admin User"
      };

      // 3. Make the actual API call
      const response = await AddPayment(apiPayload);
      
      // 4. Update the local React state
      // We map the data back to the fields your table UI currently expects (amount, familyName, etc.)
      const newPaymentData = {
        id: response?.data?.id || `col_${Date.now()}`,
        festivalId: selectedFestivalId,
        familyName: newPayment.familyName.trim(),
        mobile: newPayment.mobile.trim(),
        amount: apiPayload.paidAmount,
        paymentType: newPayment.paymentType,
        collector: apiPayload.collectedBy,
      };

      const updated = [...collections, newPaymentData];
      setCollections(updated);

      // Keep localStorage in sync (optional, as fallback)
      localStorage.setItem("collections", JSON.stringify(updated));
      
      // 5. Success! Close the modal
      setIsAddModalOpen(false);
    } catch (error) {
      // 6. Provide clear error feedback if the API fails
      console.error("Error adding payment:", error);
      alert("Failed to add payment. Please try again.");
    } finally {
      // 7. Always reset the submitting button state
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="collection-container">
      {/* Header */}
      <div className="collection-header">
        <div>
          <h2 className="collection-title">
            <IndianRupee className="collection-icon" />
            Collections
          </h2>
          <p className="collection-subtitle">Track family payments for each festival</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="collection-summary-card">
        <div className="summary-card-header">
          <div>
            <h3 className="summary-card-title">
              <ArrowLeft className="back-icon" />
              Collections
            </h3>
            <p className="summary-card-subtitle">Track family payments for each festival</p>
          </div>
        </div>

        <div className="summary-card-content">
          <div className="festival-select-section">
            <label className="festival-select-label">Select Festival</label>
            <select
              value={selectedFestivalId}
              onChange={(e) => setSelectedFestivalId(e.target.value)}
              className="festival-select"
            >
              <option value="">Choose a festival...</option>
              {festivals.map((fest) => (
                <option key={fest.id} value={fest.id}>
                  {fest.festivalName}
                </option>
              ))}
            </select>
          </div>

          {selectedFestivalId && (
            <div className="summary-metrics">
              <div className="metric-box">
                <div className="metric-label">Families</div>
                <div className="metric-value">{summary.families}</div>
              </div>
              <div className="metric-box collected">
                <div className="metric-label">Collected</div>
                <div className="metric-value">{formatCurrency(summary.collected)}</div>
              </div>
              <div className="metric-box balance">
                <div className="metric-label">Balance</div>
                <div className="metric-value">{formatCurrency(summary.balance)}</div>
              </div>
            </div>
          )}

          <button
            onClick={handleOpenAddPayment}
            className="btn-add-payment"
            disabled={!selectedFestivalId}
          >
            <Plus className="btn-icon" />
            Add Payment
          </button>
        </div>
      </div>

      {/* Payment Records Table */}
      {selectedFestivalId && festivalCollections.length > 0 ? (
        <div className="payment-records-card">
          <h3 className="records-title">
            Payment Records — {selectedFestival?.festivalName || "Festival"}
          </h3>
          <div className="table-wrapper">
            <table className="payment-records-table">
              <thead>
                <tr>
                  <th>Family</th>
                  <th>
                    <Phone className="table-icon" />
                    Mobile
                  </th>
                  <th>Paid (₹)</th>
                  <th>Balance (₹)</th>
                  <th>Type</th>
                  <th>Collector</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {familyTotals.map((family, index) => {
                  const balance = getFamilyBalance(family.name);
                  const status = getFamilyStatus(family.name);
                  
                  return (
                    <tr key={`${family.name}-${index}`}>
                      <td className="family-name-cell">{family.name}</td>
                      <td className="mobile-cell">{family.mobile || "—"}</td>
                      <td className={`paid-cell ${family.totalPaid > 0 ? "paid" : ""}`}>
                        {formatCurrency(family.totalPaid)}
                      </td>
                      <td className={`balance-cell ${balance === 0 ? "paid" : "due"}`}>
                        {formatCurrency(balance)}
                      </td>
                      <td>
                        <span className={`payment-badge ${family.paymentType?.toLowerCase() || "cash"}`}>
                          {family.paymentType || "Cash"}
                        </span>
                      </td>
                      <td>{family.collector || "—"}</td>
                      <td>
                        <span className={`status-badge ${status.toLowerCase()}`}>
                          {status === "Paid" ? (
                            <CheckCircle className="status-icon" />
                          ) : (
                            <AlertCircle className="status-icon" />
                          )}
                          {status}
                        </span>
                      </td>
                      <td className="action-cell">
                        {family.collections.map((collection) => (
                          <button
                            key={collection.id}
                            onClick={() => handleDelete(collection.id)}
                            className="btn-delete"
                            title="Delete payment"
                          >
                            <Trash2 className="delete-icon" />
                          </button>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedFestivalId ? (
        <div className="collection-empty">
          <p>No payment records found for this festival.</p>
          <button
            onClick={handleOpenAddPayment}
            className="btn-add-payment"
          >
            <Plus className="btn-icon" />
            Add First Payment
          </button>
        </div>
      ) : (
        <div className="collection-empty">
          <p>Please select a festival to view collection records</p>
        </div>
      )}

      {/* Add Payment Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Add Payment</h3>
            <form className="modal-form" onSubmit={handleAddPayment}>
              <div className="modal-field">
                <label>Family Name *</label>
                <input
                  name="familyName"
                  value={newPayment.familyName}
                  onChange={handlePaymentChange}
                  type="text"
                  placeholder="e.g., Sampath"
                  required
                />
              </div>
              <div className="modal-field">
                <label>Mobile</label>
                <input
                  name="mobile"
                  value={newPayment.mobile}
                  onChange={handlePaymentChange}
                  type="tel"
                  placeholder="e.g., 93636 08094"
                />
              </div>
              <div className="modal-field">
                <label>Amount (₹) *</label>
                <input
                  name="amount"
                  value={newPayment.amount}
                  onChange={handlePaymentChange}
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g., 1000"
                  required
                />
              </div>
              <div className="modal-field">
                <label>Payment Type</label>
                <select
                  name="paymentType"
                  value={newPayment.paymentType}
                  onChange={handlePaymentChange}
                >
                  <option value="Cash">Cash</option>
                  <option value="Online">Online</option>
                </select>
              </div>
              <div className="modal-field">
                <label>Collector</label>
                <input
                  name="collector"
                  value={newPayment.collector}
                  onChange={handlePaymentChange}
                  type="text"
                  placeholder="e.g., Guna"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button onClick={handleAddPayment} type="submit" className={`modal-btn primary ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`} disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Plus, Trash2 } from "lucide-react";
import { toast } from "../utils/toast";
import {
  getVisibleFestivalsList,
  getFestivalExpenses,
  createExpense,
  deleteExpense,
} from "../utils/api";
import FestivalSelect from "../components/FestivalSelect";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { useConfirm } from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";

export const EXPENSE_CATEGORIES = [
  { label: "Food", value: "Food", icon: "🍜", color: "bg-orange-100 text-orange-800 border-orange-200" },
  { label: "Flower", value: "Flower", icon: "🌸", color: "bg-pink-100 text-pink-800 border-pink-200" },
  { label: "Festival Items", value: "Festival Items", icon: "🪔", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { label: "Petrol", value: "Petrol", icon: "⛽", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { label: "Dress", value: "Dress", icon: "👘", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { label: "Decoration", value: "Decoration", icon: "🎉", color: "bg-red-100 text-red-800 border-red-200" },
  { label: "Retail Shop", value: "Retail Shop", icon: "🏪", color: "bg-green-100 text-green-800 border-green-200" },
  { label: "Others", value: "Others", icon: "📦", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

const getCategoryStyle = (category) =>
  EXPENSE_CATEGORIES.find((c) => c.value === category) || EXPENSE_CATEGORIES[7];

const initialForm = {
  category: "Food",
  description: "",
  amount: "",
};

export default function Expenses() {
  const confirm = useConfirm();
  const { isStaff, canManageFestival } = useAuth();
  const [festivals, setFestivals] = useState([]);
  const [festivalsLoading, setFestivalsLoading] = useState(true);
  const [selectedFestivalId, setSelectedFestivalId] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setFestivalsLoading(true);
      try {
        const list = await getVisibleFestivalsList(isStaff);
        setFestivals(list);
        if (isStaff && list.length === 1) {
          setSelectedFestivalId(String(list[0].id));
        }
      } catch (error) {
        toast.apiError(error, "Failed to load festivals");
      } finally {
        setFestivalsLoading(false);
      }
    })();
  }, [isStaff]);

  const selectedFestival = festivals.find(
    (f) => String(f.id) === String(selectedFestivalId)
  );

  const fetchExpenses = async (festivalId) => {
    if (!festivalId) {
      setExpenses([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getFestivalExpenses(festivalId);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setExpenses(list);
    } catch (error) {
      toast.apiError(error, "Failed to load expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowForm(false);
    setForm(initialForm);
    fetchExpenses(selectedFestivalId);
  }, [selectedFestivalId]);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    [expenses]
  );

  const categoryTotals = useMemo(
    () =>
      EXPENSE_CATEGORIES.map((cat) => ({
        ...cat,
        total: expenses
          .filter((e) => (e.category || e.categoryName) === cat.value)
          .reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
      })).filter((c) => c.total > 0),
    [expenses]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFestivalId) {
      toast.error("Please select a festival first");
      return;
    }
    if (!form.description || !form.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    const amount = Number(form.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await createExpense({
        festivalId: parseInt(selectedFestivalId, 10),
        category: form.category,
        description: form.description.trim(),
        amount,
      });
      toast.success("Expense recorded");
      setForm(initialForm);
      setShowForm(false);
      await fetchExpenses(selectedFestivalId);
    } catch (error) {
      toast.apiError(error, "Failed to record expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (expense) => {
    const ok = await confirm({
      title: "Delete expense?",
      message: `Delete expense "${expense.description}"? This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    try {
      await deleteExpense(expense.id);
      toast.success("Expense deleted");
      setExpenses((prev) => prev.filter((e) => e.id !== expense.id));
    } catch (error) {
      toast.apiError(error, "Failed to delete expense");
    }
  };

  const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
          <ShoppingBag className="h-6 w-6 text-[#d35400]" />
          Expenses
        </h1>
        <p className="text-[#666] text-sm mt-1 font-sans">
          Record and track festival expenses
        </p>
      </div>

      <div className="festive-card">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <FestivalSelect
              festivals={festivals}
              value={selectedFestivalId}
              onChange={setSelectedFestivalId}
              loading={festivalsLoading}
            />
            {isStaff &&
              selectedFestivalId &&
              canManageFestival(selectedFestivalId) && (
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="bg-[#d35400] hover:bg-[#b84400] text-white px-4 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Expense
              </button>
            )}
          </div>
          {selectedFestival && expenses.length > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3">
              <span className="text-sm font-medium">
                Total Expenses — {selectedFestival.festivalName || selectedFestival.name}
              </span>
              <span className="text-xl font-bold balance-negative">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          )}
        </div>
      </div>

      {isStaff &&
        canManageFestival(selectedFestivalId) &&
        showForm &&
        selectedFestival && (
        <div className="festive-card shadow-md">
          <div className="p-4 pb-2">
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <span>🧾</span> Record Expense
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-4 pt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#d35400]"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g., 1500"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Description *</label>
                <input
                  required
                  placeholder="e.g., Prasadam food for 200 people"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(initialForm);
                }}
                className="px-5 py-2 border border-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#d35400] text-white rounded-md text-sm font-medium disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Save Expense"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!selectedFestivalId ? (
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12" />}
          description="Select a festival to view expenses"
        />
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <>
          {categoryTotals.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categoryTotals.map((cat) => (
                <div
                  key={cat.value}
                  className="bg-white rounded-xl border border-[#f0e0c8] p-4 text-center shadow-sm"
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-sm font-medium text-gray-700">{cat.label}</div>
                  <div className="text-lg font-bold text-[#d35400] mt-1">
                    {formatCurrency(cat.total)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {expenses.length === 0 ? (
            <EmptyState description="No expenses recorded yet for this festival." />
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const style = getCategoryStyle(
                  expense.category || expense.categoryName
                );
                return (
                  <div
                    key={expense.id}
                    className="bg-white rounded-xl border border-[#eeeeee] p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="text-xl">{style.icon}</div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border ${style.color}`}
                    >
                      {expense.category || expense.categoryName}
                    </span>
                    <div className="flex-1 min-w-0 font-medium text-gray-800 truncate">
                      {expense.description}
                    </div>
                    <div className="text-lg font-bold text-[#d35400] whitespace-nowrap">
                      {formatCurrency(expense.amount)}
                    </div>
                    {isStaff &&
                      canManageFestival(
                        expense.festivalId || selectedFestivalId
                      ) && (
                      <button
                        type="button"
                        onClick={() => handleDelete(expense)}
                        className="text-gray-400 hover:text-red-500 p-1.5"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

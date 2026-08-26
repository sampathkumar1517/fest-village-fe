import { useEffect, useMemo, useState } from "react";
import {
  IndianRupee,
  Plus,
  Trash2,
  Phone,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import { toast } from "../utils/toast";
import {
  getFestivalsList,
  getCollectionsByFestival,
  createCollection,
  deleteCollection,
} from "../utils/api";
import FestivalSelect from "../components/FestivalSelect";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { useConfirm } from "../components/ConfirmDialog";

const PAYMENT_TYPES = ["Cash", "Online", "Cheque"];

const initialForm = {
  familyName: "",
  mobileNumber: "",
  paidAmount: "",
  paymentType: "Cash",
  collectorName: "",
};

const typeBadge = {
  Cash: "bg-green-100 text-green-800 border-green-200",
  Online: "bg-blue-100 text-blue-700 border-blue-200",
  Cheque: "bg-amber-100 text-amber-800 border-amber-200",
};

export default function Collection() {
  const confirm = useConfirm();
  const [festivals, setFestivals] = useState([]);
  const [festivalsLoading, setFestivalsLoading] = useState(true);
  const [selectedFestivalId, setSelectedFestivalId] = useState("");
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setFestivalsLoading(true);
      try {
        setFestivals(await getFestivalsList());
      } catch (error) {
        toast.apiError(error, "Failed to load festivals");
      } finally {
        setFestivalsLoading(false);
      }
    })();
  }, []);

  const selectedFestival = festivals.find(
    (f) => String(f.id) === String(selectedFestivalId)
  );

  const fetchCollections = async (festivalId) => {
    if (!festivalId) {
      setCollections([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getCollectionsByFestival(festivalId);
      setCollections(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      toast.apiError(error, "Failed to load collections");
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowForm(false);
    setForm(initialForm);
    fetchCollections(selectedFestivalId);
  }, [selectedFestivalId]);

  const summary = useMemo(() => {
    const totalPaid = collections.reduce(
      (sum, c) => sum + (Number(c.paidAmount) || 0),
      0
    );
    const totalBalance = collections.reduce((sum, c) => {
      const total = Number(c.totalAmount) || 0;
      const paid = Number(c.paidAmount) || 0;
      return sum + Math.max(0, total - paid);
    }, 0);
    return {
      families: collections.length,
      collected: totalPaid,
      balance: totalBalance,
    };
  }, [collections]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFestivalId) {
      toast.error("Please select a festival first");
      return;
    }
    if (!form.familyName || !form.mobileNumber || !form.paidAmount) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!/^[0-9]{10}$/.test(form.mobileNumber)) {
      toast.error("Mobile number must be 10 digits");
      return;
    }
    const paid = Number(form.paidAmount);
    if (Number.isNaN(paid) || paid <= 0) {
      toast.error("Enter a valid paid amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await createCollection({
        festivalId: parseInt(selectedFestivalId, 10),
        familyName: form.familyName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        paidAmount: paid,
        paymentType: form.paymentType,
        collectorName: form.collectorName.trim(),
      });
      const perFamily = Number(
        selectedFestival?.amountPerFamily || selectedFestival?.perFamilyAmount || 0
      );
      const balance = perFamily - paid;
      toast.success(
        balance > 0
          ? `Payment recorded. Balance: ₹${balance.toLocaleString("en-IN")}`
          : "Full payment recorded!"
      );
      setForm(initialForm);
      setShowForm(false);
      await fetchCollections(selectedFestivalId);
    } catch (error) {
      toast.apiError(error, "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (c) => {
    const ok = await confirm({
      title: "Delete payment?",
      message: `Delete payment for "${c.familyName}"? This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    try {
      await deleteCollection(c.id);
      toast.success("Record deleted");
      setCollections((prev) => prev.filter((x) => x.id !== c.id));
    } catch (error) {
      toast.apiError(error, "Failed to delete record");
    }
  };

  const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
          <IndianRupee className="h-6 w-6 text-[#d35400]" />
          Collections
        </h1>
        <p className="text-[#666] text-sm mt-1 font-sans">
          Track family payments for each festival
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
            {selectedFestivalId && (
              <button
                type="button"
                onClick={() => setShowForm(!showForm)}
                className="bg-[#d35400] hover:bg-[#b84400] text-white px-4 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="h-4 w-4" /> Add Payment
              </button>
            )}
          </div>

          {selectedFestival && collections.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-gray-100 p-3 text-center">
                <div className="text-xs text-gray-500">Families</div>
                <div className="text-lg font-bold">{summary.families}</div>
              </div>
              <div className="rounded-lg bg-green-50 p-3 text-center">
                <div className="text-xs text-gray-500">Collected</div>
                <div className="text-lg font-bold balance-positive">
                  {formatCurrency(summary.collected)}
                </div>
              </div>
              <div className="rounded-lg bg-red-50 p-3 text-center">
                <div className="text-xs text-gray-500">Balance</div>
                <div className="text-lg font-bold balance-negative">
                  {formatCurrency(summary.balance)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && selectedFestival && (
        <div className="festive-card shadow-md">
          <div className="p-4 pb-2 flex items-center gap-2">
            <span>💰</span>
            <h2 className="text-lg font-serif font-bold">Record Family Payment</h2>
            <span className="ml-auto text-xs border border-gray-200 rounded-full px-2.5 py-1 text-gray-600">
              Per Family: ₹
              {Number(
                selectedFestival.amountPerFamily ||
                  selectedFestival.perFamilyAmount ||
                  0
              ).toLocaleString("en-IN")}
            </span>
          </div>
          <form onSubmit={handleSubmit} className="p-4 pt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Family Name *</label>
                <input
                  required
                  placeholder="e.g., Rajan Family"
                  value={form.familyName}
                  onChange={(e) =>
                    setForm({ ...form, familyName: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Mobile Number *</label>
                <input
                  required
                  placeholder="e.g., 9876543210"
                  value={form.mobileNumber}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Paid Amount (₹) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="e.g., 500"
                  value={form.paidAmount}
                  onChange={(e) =>
                    setForm({ ...form, paidAmount: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Payment Type</label>
                <select
                  value={form.paymentType}
                  onChange={(e) =>
                    setForm({ ...form, paymentType: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-[#d35400]"
                >
                  {PAYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-medium">Collected By</label>
                <input
                  placeholder="e.g., Kumar"
                  value={form.collectorName}
                  onChange={(e) =>
                    setForm({ ...form, collectorName: e.target.value })
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
                className="px-5 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#d35400] text-white rounded-md text-sm font-medium hover:bg-[#b84400] disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Record Payment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!selectedFestivalId ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          description="Select a festival to view collection records"
        />
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : collections.length === 0 ? (
        <EmptyState description="No payment records found. Add a payment to get started." />
      ) : (
        <div className="festive-card overflow-hidden">
          <div className="p-4 pb-2">
            <h3 className="text-lg font-serif font-bold">
              Payment Records — {selectedFestival?.festivalName || selectedFestival?.name}
            </h3>
          </div>
          <div className="overflow-x-auto px-2 pb-4">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-gray-500">
                  <th className="p-3 font-semibold">Family</th>
                  <th className="p-3 font-semibold">
                    <Phone className="w-3.5 h-3.5 inline mr-1" /> Mobile
                  </th>
                  <th className="p-3 font-semibold">Paid (₹)</th>
                  <th className="p-3 font-semibold">Balance (₹)</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold">Collector</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {collections.map((c) => {
                  const paid = Number(c.paidAmount) || 0;
                  const total = Number(c.totalAmount) || 0;
                  const balance = Math.max(0, total - paid);
                  const isPaid = balance <= 0;
                  return (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-[#fef3e6]/50">
                      <td className="p-3 font-semibold">{c.familyName}</td>
                      <td className="p-3 text-gray-600 font-mono text-xs">
                        {c.mobileNumber || "—"}
                      </td>
                      <td className="p-3 font-semibold balance-positive">
                        {formatCurrency(paid)}
                      </td>
                      <td
                        className={`p-3 font-semibold ${
                          isPaid ? "balance-positive" : "balance-negative"
                        }`}
                      >
                        {formatCurrency(balance)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            typeBadge[c.paymentType] || typeBadge.Cash
                          }`}
                        >
                          {c.paymentType || "Cash"}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{c.collectorName || "—"}</td>
                      <td className="p-3">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-xs font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 text-xs font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" /> Due
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="text-gray-400 hover:text-red-500 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

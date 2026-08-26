import { useEffect, useState } from "react";
import { Plus, Trash2, Star, IndianRupee, Calendar, Users, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "../utils/toast";
import {
  getVisibleFestivalsList,
  createFestival,
  deleteFestival,
} from "../utils/api";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { useConfirm } from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  perFamilyAmount: "",
  startDate: "",
  endDate: "",
  organizers: "",
  incharge: "",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export default function FestivalDetails() {
  const confirm = useConfirm();
  const { isOrganizer, isStaff, canManageFestival, refresh } = useAuth();
  const [festivals, setFestivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchFestivals = async () => {
    setIsLoading(true);
    try {
      const list = await getVisibleFestivalsList(isStaff);
      setFestivals(list);
    } catch (error) {
      console.error(error);
      toast.apiError(error, "Failed to load festivals");
      setFestivals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFestivals();
  }, [isStaff]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.perFamilyAmount || !form.startDate || !form.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await createFestival({
        festivalName: form.name.trim(),
        amountPerFamily: parseFloat(form.perFamilyAmount) || 0,
        collectionStartDate: new Date(form.startDate).toISOString(),
        festivalEndDate: new Date(form.endDate).toISOString(),
        isActive: true,
        organizerName: form.organizers.trim(),
        InchargeName: form.incharge.trim(),
      });
      toast.success(`Festival "${form.name}" created successfully!`);
      setForm(initialForm);
      setShowForm(false);
      await fetchFestivals();
      await refresh();
      toast.info("Next: open Users to create a festival admin for this festival.");
    } catch (error) {
      toast.apiError(error, "Failed to create festival");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (festival) => {
    const name = festival.festivalName || festival.name;
    const ok = await confirm({
      title: "Delete festival?",
      message: `Delete "${name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    setDeletingId(festival.id);
    try {
      await deleteFestival(festival.id);
      toast.success("Festival deleted");
      setFestivals((prev) => prev.filter((f) => f.id !== festival.id));
    } catch (error) {
      toast.apiError(error, "Failed to delete festival");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
            <Star className="h-6 w-6 text-[#d35400]" />
            Festivals
          </h1>
          <p className="text-[#666] text-sm mt-1 font-sans">
            Manage your village festival details
          </p>
        </div>
        {isOrganizer && (
          <div className="flex items-center gap-2">
            <Link
              to="/users"
              className="hidden sm:inline-flex border border-[#d35400]/40 text-[#d35400] hover:bg-[#fff3e0] px-3 py-2 rounded-md text-sm font-medium"
            >
              Manage Admins
            </Link>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="bg-[#d35400] hover:bg-[#b84400] text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Festival
            </button>
          </div>
        )}
      </div>

      {isOrganizer && showForm && (
        <div className="festive-card shadow-md">
          <div className="p-5 pb-3">
            <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
              <span className="text-xl">🪔</span> New Festival Details
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-5 pt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Festival Name *</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#d35400] focus:ring-1 focus:ring-[#d35400]"
                  placeholder="e.g., Lord Murugan Festival"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Amount Per Family (₹) *</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#d35400] focus:ring-1 focus:ring-[#d35400]"
                  placeholder="e.g., 500"
                  value={form.perFamilyAmount}
                  onChange={(e) =>
                    setForm({ ...form, perFamilyAmount: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Collection Start Date *</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Festival End Date *</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Organizers</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                  placeholder="e.g., Murugan Temple Committee"
                  value={form.organizers}
                  onChange={(e) => setForm({ ...form, organizers: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Incharge Person</label>
                <input
                  className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                  placeholder="e.g., Mr. Rajan"
                  value={form.incharge}
                  onChange={(e) => setForm({ ...form, incharge: e.target.value })}
                />
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4 flex gap-3 justify-end">
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
                className="px-5 py-2 bg-[#d35400] text-white rounded-md text-sm font-medium hover:bg-[#b84400] disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Create Festival
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : festivals.length === 0 ? (
        <EmptyState
          icon={<span className="text-5xl">🪔</span>}
          title="No festivals yet"
          description={
            isOrganizer
              ? "Create your first festival to start tracking collections"
              : "No festivals published yet. Check back later."
          }
          action={
            isOrganizer ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="bg-[#d35400] text-white px-5 py-2.5 rounded-md font-medium inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add First Festival
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {festivals.map((festival) => (
            <div
              key={festival.id}
              className="festive-card hover:shadow-md transition-shadow"
            >
              <div className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-base text-gray-900 truncate">
                      {festival.festivalName || festival.name}
                    </h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fff3e0] text-[#d35400] border border-[#d35400]/20">
                      Active
                    </span>
                  </div>
                  {isOrganizer && canManageFestival(festival.id) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(festival)}
                      disabled={deletingId === festival.id}
                      className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                      title="Delete festival"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="px-4 pb-4 space-y-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-3.5 w-3.5 text-[#d35400] shrink-0" />
                  <span className="text-gray-500">Per Family:</span>
                  <span className="font-semibold">
                    ₹
                    {Number(
                      festival.amountPerFamily || festival.perFamilyAmount || 0
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#d35400] shrink-0" />
                  <span className="text-gray-500">Collection:</span>
                  <span className="text-xs">
                    {formatDate(festival.collectionStartDate || festival.startDate)} →{" "}
                    {formatDate(festival.festivalEndDate || festival.endDate)}
                  </span>
                </div>
                {(festival.organizerName || festival.organizers) && (
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-[#d35400] shrink-0" />
                    <span className="text-gray-500">Organizers:</span>
                    <span className="text-xs truncate">
                      {festival.organizerName || festival.organizers}
                    </span>
                  </div>
                )}
                {(festival.InchargeName || festival.incharge) && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5 text-[#d35400] shrink-0" />
                    <span className="text-gray-500">Incharge:</span>
                    <span className="text-xs font-medium">
                      {festival.InchargeName || festival.incharge}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

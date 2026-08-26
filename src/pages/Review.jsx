import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Star, CircleCheck, Trash2 } from "lucide-react";
import { toast } from "../utils/toast";
import { getFeedback, submitFeedback, deleteFeedback } from "../utils/api";
import Spinner from "../components/Spinner";
import { useConfirm } from "../components/ConfirmDialog";

const FEATURES = [
  { id: 1, category: "Festivals", label: "Create festival with name, amount, dates" },
  { id: 2, category: "Festivals", label: "Add organizers and incharge person" },
  { id: 3, category: "Festivals", label: "View all festivals as cards" },
  { id: 4, category: "Festivals", label: "Delete festivals" },
  { id: 5, category: "Collections", label: "Festival selector for collections" },
  { id: 6, category: "Collections", label: "Record family payments with mobile" },
  { id: 7, category: "Collections", label: "Payment type: Cash / Online / Cheque" },
  { id: 8, category: "Collections", label: "Show balance (green = paid, red = due)" },
  { id: 9, category: "Collections", label: "Track collector name per payment" },
  { id: 10, category: "Expenses", label: "8 expense categories (Food, Flower, etc.)" },
  { id: 11, category: "Expenses", label: "Record expenses with description & amount" },
  { id: 12, category: "Expenses", label: "Color-coded category badges" },
  { id: 13, category: "Analytics", label: "Summary: Collected / Expenses / Balance" },
  { id: 14, category: "Analytics", label: "Collection progress bar" },
  { id: 15, category: "Analytics", label: "Expense breakdown charts (bar + pie)" },
  { id: 16, category: "Analytics", label: "Share summary via WhatsApp" },
];

const CATEGORY_COLORS = {
  Festivals: "bg-[#fff3e0] text-[#d35400] border-[#d35400]/30",
  Collections: "bg-green-100 text-green-700 border-green-300",
  Expenses: "bg-red-100 text-red-700 border-red-300",
  Analytics: "bg-blue-100 text-blue-700 border-blue-200",
};

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function Review() {
  const confirm = useConfirm();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const res = await getFeedback();
      setFeedbackList(Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
    } catch (error) {
      toast.apiError(error, "Failed to load feedback");
      setFeedbackList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const featuresByCategory = useMemo(
    () =>
      FEATURES.reduce((acc, f) => {
        if (!acc[f.category]) acc[f.category] = [];
        acc[f.category].push(f);
        return acc;
      }, {}),
    []
  );

  const avgRating =
    feedbackList.length > 0
      ? feedbackList.reduce((sum, fb) => sum + Number(fb.rating), 0) /
        feedbackList.length
      : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please add a comment");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitFeedback({ rating, comment: comment.trim() });
      toast.success("Thank you for your feedback!");
      setRating(0);
      setComment("");
      await fetchFeedback();
    } catch (error) {
      toast.apiError(error, "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (fb) => {
    const ok = await confirm({
      title: "Delete feedback?",
      message: "Delete this feedback? This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    try {
      await deleteFeedback(fb.id);
      toast.success("Feedback deleted");
      setFeedbackList((prev) => prev.filter((x) => x.id !== fb.id));
    } catch (error) {
      toast.apiError(error, "Failed to delete feedback");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-[#d35400]" />
          Review & Feedback
        </h1>
        <p className="text-[#666] text-sm mt-1 font-sans">
          Developer review panel and user feedback
        </p>
      </div>

      <div className="festive-card shadow-md">
        <div className="p-4 pb-3 flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold flex items-center gap-2">
            <span>✅</span> Implemented Features
          </h2>
          <span className="bg-green-100 text-green-700 border border-green-300 text-xs font-semibold px-2.5 py-1 rounded-full">
            {FEATURES.length}/{FEATURES.length} Complete
          </span>
        </div>
        <div className="px-4 pb-5 space-y-5">
          {Object.entries(featuresByCategory).map(([category, features]) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    CATEGORY_COLORS[category] || ""
                  }`}
                >
                  {category}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-start gap-2.5 rounded-md px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <CircleCheck className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-800 leading-tight">
                      {feature.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="festive-card">
          <div className="p-4 pb-2">
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <span>💬</span> Share Your Feedback
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-4 pt-2 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rate your experience *</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    aria-label={`Rate ${star} stars`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none rounded transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    {RATING_LABELS[rating]}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Your comment *</label>
              <textarea
                rows={4}
                placeholder="Share your thoughts about the Village Festival Manager..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-[#d35400] focus:ring-1 focus:ring-[#d35400]"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#d35400] hover:bg-[#b84400] text-white py-2.5 rounded-md text-sm font-semibold disabled:opacity-70"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>

        <div className="festive-card">
          <div className="p-4 pb-2 flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <span>⭐</span> Feedback Summary
            </h2>
            {feedbackList.length > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
                <div className="flex items-center gap-0.5 justify-end">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${
                        s <= Math.round(avgRating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-500">
                  {feedbackList.length} review
                  {feedbackList.length !== 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
          <div className="px-4 pb-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : feedbackList.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Star className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No feedback yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {feedbackList.map((fb) => (
                  <div
                    key={fb.id}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${
                                s <= Number(fb.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700">
                          {fb.comment || fb.comments}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {fb.createdAt
                            ? new Date(fb.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(fb)}
                        className="text-gray-300 hover:text-red-500 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="festive-card">
        <div className="p-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div>
            <span className="font-medium text-gray-800">Version:</span> 1.0.0
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div>
            <span className="font-medium text-gray-800">Platform:</span> NestJS +
            PostgreSQL
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div>
            <span className="font-medium text-gray-800">Stack:</span> React + Vite
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div>
            <span className="font-medium text-gray-800">Features:</span>{" "}
            {FEATURES.length} implemented
          </div>
        </div>
      </div>
    </div>
  );
}

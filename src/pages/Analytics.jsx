import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  IndianRupee,
  Wallet,
  Share2,
} from "lucide-react";
import { toast } from "../utils/toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  getVisibleFestivalsList,
  getFestivalSummary,
  getCollectionsByFestival,
  getFestivalExpenses,
} from "../utils/api";
import FestivalSelect from "../components/FestivalSelect";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

const CATEGORY_COLORS = {
  Food: "#ea580c",
  Flower: "#db2777",
  "Festival Items": "#ca8a04",
  Petrol: "#64748b",
  Dress: "#7c3aed",
  Decoration: "#dc2626",
  "Retail Shop": "#16a34a",
  Others: "#6b7280",
};

function SummaryCard({ label, value, icon, color, sub }) {
  const bg =
    color === "jade"
      ? "bg-green-50 border-green-100"
      : "bg-red-50 border-red-100";
  const iconColor = color === "jade" ? "text-green-600" : "text-red-600";
  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={iconColor}>{icon}</div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const { isStaff } = useAuth();
  const [festivals, setFestivals] = useState([]);
  const [festivalsLoading, setFestivalsLoading] = useState(true);
  const [selectedFestivalId, setSelectedFestivalId] = useState("");
  const [summary, setSummary] = useState(null);
  const [collections, setCollections] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!selectedFestivalId) {
      setSummary(null);
      setCollections([]);
      setExpenses([]);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const [sumRes, colRes, expRes] = await Promise.all([
          getFestivalSummary(selectedFestivalId),
          getCollectionsByFestival(selectedFestivalId),
          getFestivalExpenses(selectedFestivalId),
        ]);
        setSummary(sumRes?.data || null);
        setCollections(Array.isArray(colRes?.data) ? colRes.data : []);
        setExpenses(
          Array.isArray(expRes?.data)
            ? expRes.data
            : Array.isArray(expRes)
              ? expRes
              : []
        );
      } catch (error) {
        toast.apiError(error, "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedFestivalId]);

  const totalCollected = summary ? Number(summary.totalCollected) : 0;
  const totalExpenses = summary ? Number(summary.totalExpenses) : 0;
  const balance = summary ? Number(summary.balance) : 0;
  const collectionCount = summary ? Number(summary.collectionCount) : 0;
  const perFamilyAmount = selectedFestival
    ? Number(selectedFestival.amountPerFamily || selectedFestival.perFamilyAmount || 0)
    : 0;
  const expectedTotal = collectionCount * perFamilyAmount || totalCollected;
  const progressPct =
    expectedTotal > 0
      ? Math.min(100, Math.round((totalCollected / expectedTotal) * 100))
      : 0;

  const expenseByCategory = useMemo(
    () =>
      Object.entries(
        expenses.reduce((acc, e) => {
          const name = e.category || e.categoryName || "Others";
          acc[name] = (acc[name] || 0) + Number(e.amount || 0);
          return acc;
        }, {})
      )
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
    [expenses]
  );

  const familyCollections = useMemo(() => {
    const map = {};
    collections.forEach((c) => {
      const name = c.familyName;
      if (!map[name]) {
        map[name] = {
          name,
          paid: 0,
          expected: Number(c.totalAmount) || perFamilyAmount,
        };
      }
      map[name].paid += Number(c.paidAmount) || 0;
    });
    return Object.values(map);
  }, [collections, perFamilyAmount]);

  const comparisonData = [
    { name: "Collected", value: totalCollected, fill: "#4caf50" },
    { name: "Expenses", value: totalExpenses, fill: "#f44336" },
    {
      name: "Balance",
      value: Math.abs(balance),
      fill: balance >= 0 ? "#4caf50" : "#f44336",
    },
  ];

  const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

  const handleShareWhatsApp = () => {
    if (!selectedFestival || !summary) {
      toast.error("Please select a festival first");
      return;
    }
    const balanceSign = balance >= 0 ? "+" : "-";
    const start = selectedFestival.collectionStartDate || selectedFestival.startDate;
    const end = selectedFestival.festivalEndDate || selectedFestival.endDate;
    const msg = `🪔 *${selectedFestival.festivalName || selectedFestival.name} — Festival Summary*

📊 *Financial Summary*
✅ Total Collected: ${formatCurrency(totalCollected)}
💸 Total Expenses: ${formatCurrency(totalExpenses)}
${balance >= 0 ? "💰" : "⚠️"} Balance: ${balanceSign}${formatCurrency(Math.abs(balance))}

👨‍👩‍👧‍👦 Families: ${collectionCount}
📅 Period: ${String(start).slice(0, 10)} to ${String(end).slice(0, 10)}
👤 Incharge: ${selectedFestival.InchargeName || selectedFestival.incharge || "—"}

_Managed by Village Festival Manager_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#d35400]" />
          Analytics
        </h1>
        <p className="text-[#666] text-sm mt-1 font-sans">
          Financial overview and insights
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
                onClick={handleShareWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-md text-sm font-semibold flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" /> Share via WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>

      {!selectedFestivalId ? (
        <EmptyState
          icon={<TrendingUp className="h-12 w-12" />}
          description="Select a festival to view analytics"
        />
      ) : loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              label="Total Collected"
              value={formatCurrency(totalCollected)}
              icon={<IndianRupee className="h-5 w-5" />}
              color="jade"
              sub={`${collectionCount} families`}
            />
            <SummaryCard
              label="Total Expenses"
              value={formatCurrency(totalExpenses)}
              icon={<Wallet className="h-5 w-5" />}
              color="crimson"
              sub={`${expenses.length} items`}
            />
            <SummaryCard
              label="Balance"
              value={`${balance >= 0 ? "+" : ""}${formatCurrency(balance)}`}
              icon={<TrendingUp className="h-5 w-5" />}
              color={balance >= 0 ? "jade" : "crimson"}
              sub={balance >= 0 ? "Surplus" : "Deficit"}
            />
          </div>

          <div className="festive-card p-5 space-y-3">
            <h3 className="text-base font-serif font-bold">Collection Progress</h3>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Collected: {formatCurrency(totalCollected)}</span>
              <span>Expected: {formatCurrency(expectedTotal)}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d35400] rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{progressPct}% collected</span>
              <span className="text-gray-500">{collectionCount} families paid</span>
            </div>
            {perFamilyAmount > 0 && (
              <div className="text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2">
                {formatCurrency(perFamilyAmount)} per family × {collectionCount}{" "}
                families = {formatCurrency(expectedTotal)} expected
              </div>
            )}
          </div>

          {expenseByCategory.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="festive-card p-4">
                <h3 className="text-base font-serif font-bold mb-3">
                  Expenses by Category
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={expenseByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      angle={-30}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) =>
                        v >= 1000 ? `₹${v / 1000}k` : `₹${v}`
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        `₹${Number(value).toLocaleString("en-IN")}`,
                        "Amount",
                      ]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {expenseByCategory.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[entry.name] || "#6b7280"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="festive-card p-4">
                <h3 className="text-base font-serif font-bold mb-3">
                  Expense Distribution
                </h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) =>
                        `${name} ${Math.round(percent * 100)}%`
                      }
                    >
                      {expenseByCategory.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[entry.name] || "#6b7280"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `₹${Number(value).toLocaleString("en-IN")}`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="festive-card p-4">
              <h3 className="text-base font-serif font-bold mb-3">
                Collection vs Expenses
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) =>
                      v >= 1000 ? `₹${(v / 1000).toFixed(1)}k` : `₹${v}`
                    }
                  />
                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {comparisonData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="festive-card p-4">
              <h3 className="text-base font-serif font-bold mb-3">
                Family Collections
              </h3>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {familyCollections.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-8">
                    No collections recorded
                  </p>
                ) : (
                  familyCollections.map((family) => {
                    const progress =
                      family.expected > 0
                        ? Math.min(100, (family.paid / family.expected) * 100)
                        : 0;
                    return (
                      <div key={family.name} className="space-y-1">
                        <div className="text-sm font-semibold">{family.name}</div>
                        <div className="h-5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#d35400] rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(family.paid)} /{" "}
                          {formatCurrency(family.expected)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

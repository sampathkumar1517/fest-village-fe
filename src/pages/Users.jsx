import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, UserPlus, Trash2, Users as UsersIcon, Plus } from "lucide-react";
import {
  createFestivalAdmin,
  getFestivalAdmins,
  removeFestivalAdmin,
  getManageableFestivals,
} from "../utils/api";
import { toast } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";
import Spinner from "../components/Spinner";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  firstName: "",
  email: "",
  phoneNumber: "",
  password: "",
  address: "",
  houseNumber: "",
};

export default function Users() {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [festivals, setFestivals] = useState([]);
  const [festivalId, setFestivalId] = useState("");
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const loadFestivals = async () => {
    setLoading(true);
    try {
      await refresh();
      const res = await getManageableFestivals();
      const list = Array.isArray(res?.data) ? res.data : [];
      setFestivals(list);
      if (list.length) {
        setFestivalId((prev) =>
          prev && list.some((f) => String(f.id) === String(prev))
            ? prev
            : String(list[0].id)
        );
      } else {
        setFestivalId("");
      }
    } catch (err) {
      toast.apiError(err, "Failed to load your festivals");
      setFestivals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFestivals();
  }, []);

  const loadAdmins = async (id) => {
    if (!id) {
      setAdmins([]);
      return;
    }
    setLoadingAdmins(true);
    try {
      const res = await getFestivalAdmins(id);
      setAdmins(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      toast.apiError(err, "Failed to load festival admins");
      setAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    loadAdmins(festivalId);
  }, [festivalId]);

  const handleCreateAdminClick = () => {
    if (!festivals.length) {
      toast.error("Create a festival first, then assign an admin to it.");
      navigate("/");
      return;
    }
    setShowForm((v) => !v);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!festivalId) {
      toast.error("Select a festival first");
      return;
    }
    if (!/^[0-9]{10}$/.test(form.phoneNumber)) {
      toast.error("Phone must be 10 digits");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      await createFestivalAdmin({
        festivalId: parseInt(festivalId, 10),
        firstName: form.firstName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        password: form.password,
        address: form.address.trim() || undefined,
        houseNumber: form.houseNumber.trim() || undefined,
      });
      toast.success("Festival admin created");
      setForm(emptyForm);
      setShowForm(false);
      await loadAdmins(festivalId);
    } catch (err) {
      toast.apiError(err, "Failed to create festival admin");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (assignment) => {
    const ok = await confirm({
      title: "Remove festival admin?",
      message: `Remove admin access for "${assignment.user?.firstName || "this user"}" from this festival?`,
      confirmLabel: "Remove",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    try {
      await removeFestivalAdmin(assignment.id);
      toast.success("Festival admin removed");
      await loadAdmins(festivalId);
    } catch (err) {
      toast.apiError(err, "Failed to remove admin");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-[#d35400]" />
            Festival Admins
          </h1>
          <p className="text-[#666] text-sm mt-1 font-sans">
            Organizers assign admins to a specific festival. Each admin can only manage that festival.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateAdminClick}
          className="bg-[#d35400] hover:bg-[#b84400] text-white px-4 py-2 rounded-md text-sm font-medium inline-flex items-center gap-2 shadow-sm"
        >
          <UserPlus className="w-4 h-4" /> Create Admin
        </button>
      </div>

      {festivals.length === 0 ? (
        <EmptyState
          title="No festivals you own"
          description="Create a festival first, then come back here to assign a festival admin."
          action={
            <Link
              to="/"
              className="bg-[#d35400] text-white px-5 py-2.5 rounded-md font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Festival
            </Link>
          }
        />
      ) : (
        <>
          <div className="festive-card p-4">
            <label className="block text-sm font-medium mb-1.5">Festival</label>
            <select
              value={festivalId}
              onChange={(e) => setFestivalId(e.target.value)}
              className="w-full sm:max-w-md border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
            >
              {festivals.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.festivalName || f.name}
                </option>
              ))}
            </select>
          </div>

          {showForm && (
            <div className="festive-card shadow-md">
              <div className="p-4 pb-2">
                <h2 className="text-lg font-serif font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#d35400]" />
                  New Festival Admin
                </h2>
              </div>
              <form
                onSubmit={handleCreate}
                className="p-4 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Full name *</label>
                  <input
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="Ravi Kumar"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Phone *</label>
                  <input
                    required
                    value={form.phoneNumber}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phoneNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    placeholder="10-digit number"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Password *</label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setForm(emptyForm);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-[#d35400] text-white rounded-md text-sm font-medium disabled:opacity-70"
                  >
                    {submitting ? "Creating..." : "Create Festival Admin"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="festive-card">
            <div className="p-4 border-b border-[#f0e0c8]">
              <h2 className="font-serif font-bold text-gray-900">
                Admins for this festival
              </h2>
            </div>
            {loadingAdmins ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : admins.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No festival admins yet. Click <strong>Create Admin</strong> to assign one.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {admins.map((row) => (
                  <li
                    key={row.id}
                    className="p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {row.user?.firstName} {row.user?.lastName || ""}
                      </div>
                      <div className="text-xs text-gray-500">
                        {row.user?.phoneNumber} · {row.user?.email}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(row)}
                      className="text-gray-400 hover:text-red-500 p-2"
                      title="Remove admin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

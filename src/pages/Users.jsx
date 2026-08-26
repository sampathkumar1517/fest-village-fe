import { useState, useEffect } from "react";
import { Users as UsersIcon, Search, Eye, Edit2, Shield, UserX, UserCheck, X, UserPlus } from "lucide-react";
import { getUsers, getUserById, getUserByPhone, updateUser, createUser } from "../utils/api";
import { toast } from "../utils/toast";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchPhone, setSearchPhone] = useState("");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : (data.data || []));
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users", err);
      const msg = "Failed to load users. Please refresh the page.";
      setError(msg);
      toast.apiError(err, msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchPhone.trim()) {
      fetchUsers();
      return;
    }

    setLoading(true);
    try {
      const userData = await getUserByPhone(searchPhone.trim());
      if (userData && (userData.id || userData.length > 0)) {
        setUsers(Array.isArray(userData) ? userData : [userData]);
        setError(null);
      } else {
        setUsers([]);
        setError("No user found with this phone number.");
        toast.error("No user found with this phone number.");
      }
    } catch (err) {
      setUsers([]);
      setError("User not found or connection error.");
      toast.apiError(err, "User not found or connection error.");
    } finally {
      setLoading(false);
    }
  };

  const openUserModal = async (id, editMode = false) => {
    setIsModalOpen(true);
    setModalLoading(true);
    setIsEditing(editMode);
    setIsCreating(false);
    
    try {
      const userData = await getUserById(id);
      setSelectedUser(userData);
      setEditForm({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        houseNumber: userData.houseNumber || '',
        isActive: userData.isActive !== false
      });
    } catch (err) {
      console.error("Failed to fetch user details", err);
      // Fallback to list data if individual fetch fails
      const fallbackUser = users.find(u => u.id === id);
      if (fallbackUser) {
        setSelectedUser(fallbackUser);
        setEditForm({
          firstName: fallbackUser.firstName || '',
          lastName: fallbackUser.lastName || '',
          email: fallbackUser.email || '',
          phoneNumber: fallbackUser.phoneNumber || '',
          address: fallbackUser.address || '',
          houseNumber: fallbackUser.houseNumber || '',
          isActive: fallbackUser.isActive !== false
        });
      }
    } finally {
      setModalLoading(false);
    }
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
    setIsEditing(true);
    setIsCreating(true);
    setSelectedUser({ firstName: 'New User', lastName: '' }); // Placeholder for modal title
    setEditForm({
      firstName: '',
      email: '',
      phoneNumber: '',
      address: '',
      houseNumber: '',
      isActive: true
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'phoneNumber') {
      setEditForm(prev => ({
        ...prev,
        [name]: value.replace(/\D/g, '').slice(0, 10)
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (isCreating) {
        const result = await createUser(editForm);
        const created = result?.data || result;
        if (created?.id) {
          setUsers((prev) => [created, ...prev]);
        } else {
          await fetchUsers();
        }
        setIsModalOpen(false);
        toast.success(result?.message || "User created successfully!");
      } else {
        const result = await updateUser(selectedUser.id, editForm);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id ? { ...u, ...editForm } : u
          )
        );
        setSelectedUser({ ...selectedUser, ...editForm });
        setIsEditing(false);
        toast.success(result?.message || "User updated successfully!");
      }
    } catch (err) {
      console.error(`Failed to ${isCreating ? "create" : "update"} user`, err);
      toast.apiError(
        err,
        `Failed to ${isCreating ? "create" : "update"} user. Please try again.`
      );
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center gap-1 py-1 px-2 rounded bg-[#e8f5e9] text-[#2e7d32] text-[12px] font-semibold">
        <UserCheck className="w-3 h-3" /> Active
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 py-1 px-2 rounded bg-[#ffebee] text-[#c62828] text-[12px] font-semibold">
        <UserX className="w-3 h-3" /> Inactive
      </span>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-[24px] md:text-[32px] font-bold text-black flex items-center gap-3 mb-2 font-serif">
          <UsersIcon className="w-6 h-6 md:w-8 md:h-8 text-[#d35400]" />
          User Directory
        </h2>
        <p className="text-[14px] text-[#666] font-sans">Manage community members and their access</p>
      </div>

      {/* Action Bar */}
      <div className="bg-[#f8f5f0] border-2 border-[#d35400] rounded-xl p-4 md:p-6 mb-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <form onSubmit={handleSearch} className="w-full md:max-w-md flex relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-l-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#d35400] focus:border-[#d35400] sm:text-sm font-sans"
              placeholder="Search by 10-digit phone number..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            />
            <button 
              type="submit"
              className="bg-[#d35400] hover:bg-[#b84400] text-white px-5 py-3 rounded-r-lg font-medium transition-colors border-none cursor-pointer"
            >
              Search
            </button>
          </form>
          
          {searchPhone && (
            <button 
              onClick={() => { setSearchPhone(''); fetchUsers(); }}
              className="text-[#d35400] font-medium hover:underline cursor-pointer border-none bg-transparent whitespace-nowrap"
            >
              Clear Search
            </button>
          )}
        </div>

        <button 
          onClick={openCreateModal}
          className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white px-6 py-3 rounded-lg font-bold transition-all border-none cursor-pointer flex items-center gap-2 shadow-md hover:-translate-y-0.5"
        >
          <UserPlus className="w-5 h-5" />
          Create User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#eeeeee] overflow-hidden flex-1">
        {loading ? (
          <div className="w-full h-[300px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#d35400]/20 border-t-[#d35400] rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="w-full h-[300px] flex flex-col items-center justify-center text-center p-6">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-sans">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="w-full h-[300px] flex flex-col items-center justify-center text-center p-6">
            <UsersIcon className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-sans">No users found in the system.</p>
          </div>
        ) : (
          <div className="overflow-x-auto h-full">
            <table className="w-full border-collapse min-w-[800px]">
              <thead className="bg-[#fef3e6] sticky top-0 z-10">
                <tr>
                  <th className="p-[12px_16px] text-left text-[12px] font-bold text-[#333] uppercase tracking-wide border-b-2 border-[#e8d4ba] font-sans">Name</th>
                  <th className="p-[12px_16px] text-left text-[12px] font-bold text-[#333] uppercase tracking-wide border-b-2 border-[#e8d4ba] font-sans">Mobile</th>
                  <th className="p-[12px_16px] text-left text-[12px] font-bold text-[#333] uppercase tracking-wide border-b-2 border-[#e8d4ba] font-sans">Email</th>
                  <th className="p-[12px_16px] text-left text-[12px] font-bold text-[#333] uppercase tracking-wide border-b-2 border-[#e8d4ba] font-sans">House No.</th>
                  <th className="p-[12px_16px] text-left text-[12px] font-bold text-[#333] uppercase tracking-wide border-b-2 border-[#e8d4ba] font-sans">Status</th>
                  <th className="p-[12px_16px] text-center text-[12px] font-bold text-[#333] uppercase tracking-wide border-b-2 border-[#e8d4ba] font-sans">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#fcf8f2] transition-colors border-b border-[#f0f0f0]">
                    <td className="p-[16px] text-[#333] font-sans font-semibold">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="p-[16px] text-[#666] font-mono">
                      {user.phoneNumber}
                    </td>
                    <td className="p-[16px] text-[#666] font-sans">
                      {user.email}
                    </td>
                    <td className="p-[16px] text-[#666] font-sans">
                      {user.houseNumber || "-"}
                    </td>
                    <td className="p-[16px] font-sans">
                      {getStatusBadge(user.isActive !== false)}
                    </td>
                    <td className="p-[16px] flex items-center justify-center gap-2">
                      <button
                        onClick={() => openUserModal(user.id, false)}
                        className="p-1.5 text-gray-500 hover:text-[#d35400] hover:bg-[#ffe0cc] rounded transition-colors"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openUserModal(user.id, true)}
                        className="p-1.5 text-gray-500 hover:text-[#d35400] hover:bg-[#ffe0cc] rounded transition-colors"
                        title="Edit user"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[600px] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-[#fef3e6] px-6 py-4 flex justify-between items-center border-b border-[#e8d4ba]">
              <h3 className="text-[20px] font-bold text-[#333] font-serif flex items-center gap-2">
                {isCreating ? <UserPlus className="w-5 h-5 text-[#d35400]" /> : isEditing ? <Edit2 className="w-5 h-5 text-[#d35400]" /> : <Shield className="w-5 h-5 text-[#d35400]" />}
                {isCreating ? "Register New User" : isEditing ? "Edit User Profile" : "User Profile Details"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {modalLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="w-8 h-8 border-4 border-[#d35400]/20 border-t-[#d35400] rounded-full animate-spin"></div>
                </div>
              ) : selectedUser ? (
                isEditing ? (
                  <form id="modal-form" onSubmit={handleModalSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-[#333] font-sans">First Name</label>
                      <input
                        name="firstName"
                        value={editForm.firstName}
                        onChange={handleEditChange}
                        className="p-2.5 rounded-lg border border-gray-300 text-[14px] font-sans focus:outline-none focus:border-[#d35400] focus:ring-1 focus:ring-[#d35400]"
                        required
                        placeholder="e.g. Alice"
                      />
                    </div>
                    
                    {!isCreating && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-[#333] font-sans">Last Name</label>
                        <input
                          name="lastName"
                          value={editForm.lastName}
                          onChange={handleEditChange}
                          className="p-2.5 rounded-lg border border-gray-300 text-[14px] font-sans focus:outline-none focus:border-[#d35400] focus:ring-1 focus:ring-[#d35400]"
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-[#333] font-sans">Email</label>
                        <input
                          name="email"
                          type="email"
                          value={editForm.email}
                          onChange={handleEditChange}
                          className="p-2.5 rounded-lg border border-gray-300 text-[14px] font-sans focus:outline-none focus:border-[#d35400] focus:ring-1 focus:ring-[#d35400]"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-[#333] font-sans">Phone Number</label>
                        <input
                          name="phoneNumber"
                          value={editForm.phoneNumber}
                          onChange={handleEditChange}
                          className={`p-2.5 rounded-lg border border-gray-300 text-[14px] font-sans focus:outline-none focus:border-[#d35400] focus:ring-1 focus:ring-[#d35400] ${!isCreating ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                          readOnly={!isCreating}
                          required
                          placeholder="10-digit mobile"
                          title={!isCreating ? "Phone number cannot be changed" : ""}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[13px] font-semibold text-[#333] font-sans">Address</label>
                      <input
                        name="address"
                        value={editForm.address}
                        onChange={handleEditChange}
                        className="p-2.5 rounded-lg border border-gray-300 text-[14px] font-sans focus:outline-none focus:border-[#d35400] focus:ring-1 focus:ring-[#d35400]"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[13px] font-semibold text-[#333] font-sans">House No.</label>
                        <input
                          name="houseNumber"
                          value={editForm.houseNumber}
                          onChange={handleEditChange}
                          className="p-2.5 rounded-lg border border-gray-300 text-[14px] font-sans focus:outline-none focus:border-[#d35400] focus:ring-1 focus:ring-[#d35400]"
                          required
                        />
                      </div>
                      <div className="flex flex-col justify-end pb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={editForm.isActive}
                            onChange={handleEditChange}
                            className="w-4 h-4 text-[#d35400] focus:ring-[#d35400] border-gray-300 rounded"
                          />
                          <span className="text-[14px] font-semibold text-[#333] font-sans">User is Active</span>
                        </label>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#ffe0cc] text-[#d35400] rounded-full flex items-center justify-center text-[24px] font-bold font-serif shadow-inner">
                          {selectedUser.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <h4 className="text-[20px] font-bold text-gray-900 m-0">
                            {selectedUser.firstName} {selectedUser.lastName}
                          </h4>
                          <span className="text-gray-500 font-sans text-[14px]">{selectedUser.email}</span>
                        </div>
                      </div>
                      <div>{getStatusBadge(selectedUser.isActive !== false)}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <span className="block text-[12px] uppercase text-gray-500 font-semibold mb-1">Phone Number</span>
                        <span className="text-[15px] font-mono font-medium text-gray-800">{selectedUser.phoneNumber}</span>
                      </div>
                      <div>
                        <span className="block text-[12px] uppercase text-gray-500 font-semibold mb-1">House No.</span>
                        <span className="text-[15px] font-sans text-gray-800">{selectedUser.houseNumber || 'N/A'}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="block text-[12px] uppercase text-gray-500 font-semibold mb-1">Address</span>
                        <span className="text-[15px] font-sans text-gray-800 leading-relaxed">{selectedUser.address || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-[12px] uppercase text-gray-500 font-semibold mb-1">Member Since</span>
                        <span className="text-[15px] font-sans text-gray-800">
                          {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN') : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-10 text-gray-500">Failed to load user data.</div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {isEditing ? 'Cancel' : 'Close'}
              </button>
              {isEditing ? (
                <button
                  type="submit"
                  form="modal-form"
                  className="px-5 py-2.5 rounded-lg font-medium bg-[#d35400] text-white border-none hover:bg-[#b84400] transition-colors flex items-center gap-2 shadow-sm"
                  disabled={modalLoading}
                >
                  {modalLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                  {isCreating ? 'Register User' : 'Save Changes'}
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-lg font-medium bg-[#d35400] text-white border-none hover:bg-[#b84400] transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Edit2 className="w-4 h-4" /> Edit User
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

import { useState } from "react";
import { createFestival } from "../utils/api";


export default function AddFestivalModal({ onClose, onCreated }) {
    const [form, setForm] = useState({
        name: "",
        perFamilyAmount: "",
        startDate: "",
        endDate: "",
        organizers: "",
        incharge: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim() || !form.perFamilyAmount.trim() || !form.startDate || !form.endDate) {
            alert("Please fill all required fields (Festival, Amount, Dates).");
            return;
        }

        setIsSubmitting(true);

        try {
            const festivalPayload = {
                festivalName: form.name.trim(),
                amountPerFamily: parseFloat(form.perFamilyAmount) || 0,
                collectionStartDate: new Date(form.startDate).toISOString(),
                festivalEndDate: new Date(form.endDate).toISOString(),
                isActive: true,
                organizerName: form.organizers.trim(),
                InchargeName: form.incharge.trim()
            };

            const response = await createFestival(festivalPayload);

            if (onCreated && response.success) {
                onCreated(response.data);
            }

            onClose();
        } catch (error) {
            console.error("Error creating festival:", error);
            alert("Failed to create festival. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-center items-center overflow-y-auto pt-10 pb-10">
            <div className="bg-[#f8f5f0] border-t-4 border-t-brand rounded-xl shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
                <div className="p-8">
                    <div className="flex items-center mb-8">
                        <img
                            src="https://village-festival-manager-kte.caffeine.xyz/assets/diya-2_rK70C4.svg"
                            alt="Diya"
                            className="w-8 h-8 mr-3 object-contain"
                            onError={(e) => { e.target.style.display = "none"; }}
                        />
                        <h2 className="text-2xl font-bold font-serif text-gray-900">New Festival Details</h2>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium font-serif text-gray-800 mb-2">
                                    Festival Name *
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="e.g., Lord Murugan Festival"
                                    className="w-full bg-transparent border border-gray-300 rounded-md px-4 py-2.5 font-serif text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium font-serif text-gray-800 mb-2">
                                    Amount Per Family (₹) *
                                </label>
                                <input
                                    name="perFamilyAmount"
                                    value={form.perFamilyAmount}
                                    onChange={handleChange}
                                    type="number"
                                    min="0"
                                    placeholder="e.g., 500"
                                    className="w-full bg-transparent border border-gray-300 rounded-md px-4 py-2.5 font-serif text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium font-serif text-gray-800 mb-2">
                                    Collection Start Date *
                                </label>
                                <input
                                    name="startDate"
                                    value={form.startDate}
                                    onChange={handleChange}
                                    type="date"
                                    className="w-full bg-transparent border border-gray-300 rounded-md px-4 py-2.5 font-serif text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium font-serif text-gray-800 mb-2">
                                    Festival End Date *
                                </label>
                                <input
                                    name="endDate"
                                    value={form.endDate}
                                    onChange={handleChange}
                                    type="date"
                                    className="w-full bg-transparent border border-gray-300 rounded-md px-4 py-2.5 font-serif text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium font-serif text-gray-800 mb-2">
                                    Organizers
                                </label>
                                <input
                                    name="organizers"
                                    value={form.organizers}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="e.g., Murugan Temple Committee"
                                    className="w-full bg-transparent border border-gray-300 rounded-md px-4 py-2.5 font-serif text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium font-serif text-gray-800 mb-2">
                                    Incharge Person
                                </label>
                                <input
                                    name="incharge"
                                    value={form.incharge}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="e.g., Mr. Rajan"
                                    className="w-full bg-transparent border border-gray-300 rounded-md px-4 py-2.5 font-serif text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6 mt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors font-serif bg-transparent"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`px-6 py-2 bg-[#d35400] text-white rounded-md font-medium shadow-sm font-serif ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-light transition-colors'}`}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Festival'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import AddFestivalModal from "../components/AddFestivalModal";
import { getFestivals } from "../utils/api";

export default function FestivalDetails() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [festivals, setFestivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    setIsLoading(true);
    try {
      const response = await getFestivals();
      if (response && response.listData && response.listData.length > 0) {
        setFestivals(response.listData[0].data || []);
      } else {
        setFestivals([]);
      }
    } catch (error) {
      console.error("Failed to fetch festivals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFestivalCreated = () => {
    fetchFestivals();
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h2 className="text-3xl font-bold font-serif text-gray-900 flex items-center mb-2">
            <StarOutlineIcon className="w-8 h-8 text-brand mr-2" />
            Festivals
          </h2>
          <p className="text-gray-600 font-serif">Manage your village festival details</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#d35400] text-white px-4 py-2 rounded-md font-medium flex items-center hover:bg-brand-light transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Festival
        </button>
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center -mt-16">
          <p className="text-gray-600 font-serif">Loading festivals...</p>
        </div>
      ) : festivals.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center -mt-16">
          <div className="w-16 h-16 mb-4">
            {/* Approximate diya placeholder icon */}
            <img
              src="https://village-festival-manager-kte.caffeine.xyz/assets/diya-2_rK70C4.svg"
              alt="Diya"
              className="w-full h-full object-contain drop-shadow-sm"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          <h3 className="text-2xl font-bold font-serif text-gray-900 mb-2">No festivals yet</h3>
          <p className="text-gray-600 mb-6 font-serif">
            Create your first festival to start tracking collections
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#d35400] text-white px-6 py-2.5 rounded-md font-medium flex items-center hover:bg-brand-light transition-colors shadow-md"
          >
            <Plus className="w-5 h-5 mr-2" /> Add First Festival
          </button>
        </div>
      ) : (
        <div className="flex-grow -mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {festivals.map((festival) => (
              <div
                key={festival.id}
                className="bg-white rounded-xl shadow-sm border border-[#f0e0c8] p-5"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-gray-900">
                      {festival.festivalName}
                    </h3>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${festival.isActive ? 'bg-[#fff3e0] text-[#d35400]' : 'bg-gray-200 text-gray-600'}`}>
                      {festival.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>Per Family:</strong>{" "}
                    ₹{Number(festival.amountPerFamily || 0).toLocaleString("en-IN")}
                  </p>
                  <p>
                    <strong>Collection:</strong>{" "}
                    {new Date(festival.collectionStartDate).toLocaleDateString()} → {new Date(festival.festivalEndDate).toLocaleDateString()}
                  </p>
                  {festival.organizerName && (
                    <p>
                      <strong>Organizers:</strong> {festival.organizerName}
                    </p>
                  )}
                  {festival.InchargeName && (
                    <p>
                      <strong>Incharge:</strong> {festival.InchargeName}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isModalOpen && (
        <AddFestivalModal
          onClose={() => setIsModalOpen(false)}
          onCreated={handleFestivalCreated}
        />
      )}
    </div>
  );
}

// Custom hollow star icon
function StarOutlineIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

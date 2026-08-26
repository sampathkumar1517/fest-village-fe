import { useState, useEffect } from "react";
import { Calendar, Plus, Users, MapPin, Clock, Edit2, Trash2, CheckCircle } from "lucide-react";
import { getFestivals, getFestivalEvents, createEvent, updateEvent, deleteEvent, registerEvent, unregisterEvent } from "../utils/api";
import { toast } from "../utils/toast";
import { useConfirm } from "../components/ConfirmDialog";

export default function Events() {
  const confirm = useConfirm();
  const [festivals, setFestivals] = useState([]);
  const [selectedFestivalId, setSelectedFestivalId] = useState("");
  const [events, setEvents] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    capacity: "",
    status: "planned"
  });

  useEffect(() => {
    const fetchFests = async () => {
      try {
        const response = await getFestivals();
        if (response && response.listData && response.listData.length > 0) {
          setFestivals(response.listData[0].data || []);
        }
      } catch (error) {
        console.error("Failed to fetch festivals:", error);
        toast.apiError(error, "Failed to load festivals");
      }
    };
    fetchFests();
  }, []);

  useEffect(() => {
    if (selectedFestivalId) {
      const fetchEvents = async () => {
        try {
          const res = await getFestivalEvents(selectedFestivalId);
          setEvents(Array.isArray(res) ? res : (res?.data || []));
        } catch (error) {
          console.error("Failed to fetch events:", error);
          toast.apiError(error, "Failed to load events");
          setEvents([]);
        }
      };
      fetchEvents();
    } else {
      setEvents([]);
    }
  }, [selectedFestivalId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!selectedFestivalId) return;

    try {
      setIsSubmitting(true);
      // Construct ISO strings
      const startDateTime = new Date(`${form.startDate}T${form.startTime}:00`).toISOString();
      let endDateTime = startDateTime;
      if (form.endDate && form.endTime) {
         endDateTime = new Date(`${form.endDate}T${form.endTime}:00`).toISOString();
      }

      const payload = {
        festivalId: parseInt(selectedFestivalId, 10),
        name: form.name.trim(),
        description: form.description.trim(),
        startDate: startDateTime,
        endDate: endDateTime,
        location: form.location.trim(),
        capacity: parseInt(form.capacity, 10) || 100,
        status: form.status
      };

      const result = await createEvent(payload);
      
      const newEvent = {
        id: result?.data?.id || `evt_${Date.now()}`,
        ...payload,
        registeredCount: 0
      };
      
      setEvents([...events, newEvent]);
      setIsAddModalOpen(false);
      setForm({
        name: "", description: "", startDate: "", startTime: "", endDate: "", endTime: "", location: "", capacity: "", status: "planned"
      });
      toast.success("Event created successfully");
    } catch (err) {
      console.error("Error creating event", err);
      toast.apiError(err, "Failed to create the event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: "Delete event?",
      message: "Are you sure you want to delete this event? This cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
    });
    if (!ok) return;
    try {
      await deleteEvent(id);
      setEvents(events.filter(e => e.id !== id));
      toast.success("Event deleted");
    } catch(err) {
      console.error("Failed to delete", err);
      toast.apiError(err, "Failed to delete event");
    }
  };

  const handleToggleRegistration = async (event, isRegistered) => {
    try {
      if (isRegistered) {
         await unregisterEvent(event.id);
         setEvents(events.map(e => e.id === event.id ? { ...e, registeredCount: Math.max(0, (e.registeredCount || 0) - 1), _isUserRegistered: false } : e));
         toast.success("Unregistered from event");
      } else {
         await registerEvent(event.id);
         setEvents(events.map(e => e.id === event.id ? { ...e, registeredCount: (e.registeredCount || 0) + 1, _isUserRegistered: true } : e));
         toast.success("Registered for event");
      }
    } catch(err) {
       console.error("Failed to toggle registration", err);
       toast.apiError(err, "Failed to update participation status");
    }
  };

  const formatShortTime = (isoString) => {
      if (!isoString) return "";
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatShortDate = (isoString) => {
      if (!isoString) return "";
      return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-6">
        <h2 className="text-[32px] font-bold font-serif text-gray-900 flex items-center mb-2">
          <Calendar className="w-8 h-8 text-[#d35400] mr-2" />
          Festival Events
        </h2>
        <p className="text-gray-600 font-sans text-[14px]">Plan schedules, track RSVP's, and manage community itineraries.</p>
      </div>

      <div className="bg-[#f8f5f0] border-2 border-[#d35400] rounded-xl p-4 md:p-5 mb-6 flex flex-col md:flex-row justify-between items-stretch md:items-end gap-4 shadow-sm">
        <div className="flex-1">
          <label className="block text-[14px] font-semibold text-[#333] mb-2 font-sans">Select Festival</label>
          <select
            value={selectedFestivalId}
            onChange={(e) => setSelectedFestivalId(e.target.value)}
            className="w-full p-3 border border-[#ddd] rounded-lg text-[14px] bg-white text-[#333] cursor-pointer font-sans appearance-none outline-none focus:border-[#d35400] focus:ring-4 focus:ring-[#d35400]/10"
          >
            <option value="">Choose a festival...</option>
            {festivals.map((fest) => (
              <option key={fest.id} value={fest.id}>{fest.festivalName || fest.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={!selectedFestivalId}
          className="bg-[#d35400] text-white border-none py-3 px-6 rounded-lg text-[14px] font-semibold cursor-pointer transition-colors flex items-center justify-center gap-1 font-sans hover:bg-[#b84400] disabled:opacity-50"
        >
          <Plus className="w-[18px] h-[18px]" /> Create Event
        </button>
      </div>

      {!selectedFestivalId ? (
        <div className="text-center py-[60px] px-5 text-[#999] text-[16px] font-sans bg-[#f8f5f0] rounded-xl mt-6">
          <p>Please select a festival to manage events</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full py-10 px-5 text-center text-[#999] bg-[#f8f5f0] border border-dashed border-[#ddd] rounded-xl font-sans">
              No events planned yet. Add one to get started!
            </div>
          ) : (
            events.map((evt) => {
              const cap = evt.capacity || 0;
              const reg = evt.registeredCount || 0;
              const progress = cap > 0 ? (reg / cap) * 100 : 0;
              
              return (
                <div key={evt.id} className="bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-[#eeeeee] transition-all duration-300 hover:shadow-[0_8px_25px_rgba(211,84,0,0.1)] flex flex-col h-full overflow-hidden">
                  <div className="bg-[#fef3e6] px-5 py-4 border-b border-[#e8d4ba] flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-[18px] text-[#333] font-serif leading-tight mb-1">{evt.name}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${evt.status === 'ongoing' ? 'bg-green-100 text-green-700' : evt.status === 'completed' ? 'bg-gray-200 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                        {evt.status || 'Planned'}
                      </span>
                    </div>
                    <button onClick={() => handleDelete(evt.id)} className="text-gray-400 hover:text-red-500 bg-transparent border-none p-1 shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-[#666] text-[14px] font-sans mb-5 leading-relaxed flex-1">{evt.description}</p>
                    
                    <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3 text-sm text-[#555] font-sans">
                        <Clock className="w-4 h-4 text-[#d35400] shrink-0" />
                        <span>{formatShortDate(evt.startDate)} <span className="text-gray-300 mx-1">|</span> {formatShortTime(evt.startDate)} <span className="text-gray-400">-</span> {formatShortTime(evt.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#555] font-sans">
                        <MapPin className="w-4 h-4 text-[#d35400] shrink-0" />
                        <span className="truncate">{evt.location || "TBD"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#555] font-sans">
                        <Users className="w-4 h-4 text-[#d35400] shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1 text-xs">
                             <span className="font-semibold text-gray-700">{reg} <span className="font-normal text-gray-500">attending</span></span>
                             <span className="text-gray-400">Max {cap}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                             <div className="h-full bg-[#d35400] transition-all" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleRegistration(evt, evt._isUserRegistered)}
                      className={`w-full py-2.5 rounded-lg font-semibold text-[14px] font-sans transition-colors border ${evt._isUserRegistered ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 flex items-center justify-center gap-2' : 'bg-transparent text-[#d35400] border-[#d35400] hover:bg-[#fff9f5]'}`}
                    >
                      {evt._isUserRegistered ? <><CheckCircle className="w-4 h-4"/> Registered</> : "RSVP Now"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[600px] overflow-hidden">
             <div className="bg-[#fef3e6] px-6 py-4 flex justify-between items-center border-b border-[#e8d4ba]">
              <h3 className="text-[18px] font-bold text-[#333] font-serif flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#d35400]"/> Schedule Event
              </h3>
             </div>
             <form onSubmit={handleCreateEvent} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Event Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required className="w-full p-2.5 rounded border border-gray-300 text-[14px] focus:outline-none focus:border-[#d35400]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} rows="2" className="w-full p-2.5 rounded border border-gray-300 text-[14px] focus:outline-none focus:border-[#d35400]" />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Start Date *</label>
                    <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full p-2.5 rounded border border-gray-300 text-[14px] focus:outline-none focus:border-[#d35400]" />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Start Time *</label>
                    <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required className="w-full p-2.5 rounded border border-gray-300 text-[14px] focus:outline-none focus:border-[#d35400]" />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">End Date</label>
                    <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className="w-full p-2.5 rounded border border-gray-300 text-[14px] focus:outline-none focus:border-[#d35400]" />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">End Time</label>
                    <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="w-full p-2.5 rounded border border-gray-300 text-[14px] focus:outline-none focus:border-[#d35400]" />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Location</label>
                    <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full p-2.5 rounded border border-gray-300 text-[14px] focus:outline-none focus:border-[#d35400]" />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-[#333] mb-1.5 block">Capacity (People)</label>
                    <input type="number" name="capacity" value={form.capacity} onChange={handleChange} min="1" className="w-full p-2.5 rounded border border-gray-300 text-[14px] focus:outline-none focus:border-[#d35400]" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg bg-[#d35400] text-white font-semibold hover:bg-[#b84400] flex items-center gap-2">
                    {isSubmitting ? "Creating..." : "Reserve Event"}
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

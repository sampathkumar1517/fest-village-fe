import { MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

export default function Review() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold font-serif text-gray-900 flex items-center mb-2">
          <MessageSquare className="w-8 h-8 text-brand mr-2" />
          Review & Feedback
        </h2>
        <p className="text-gray-600 font-serif">Audit festival accounts and community feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-serif text-gray-800 border-b border-gray-200 pb-2">Pending Approvals</h3>

          <div className="bg-[#f8f5f0] border-l-4 border-amber-500 rounded-lg p-5 shadow-sm flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-gray-900 font-serif mb-1">Stage Decoration Invoice</h4>
              <p className="text-sm text-gray-600 font-sans mb-4">Submitted by Ram (Decorator) for ₹15,000. Needs committee approval before payment.</p>
              <div className="flex gap-3">
                <button className="px-4 py-1.5 bg-[#d35400] text-white text-sm font-medium rounded hover:bg-brand transition font-sans shadow-sm">Approve</button>
                <button className="px-4 py-1.5 border border-gray-300 text-gray-600 text-sm font-medium rounded hover:bg-gray-100 transition font-sans">Reject</button>
              </div>
            </div>
          </div>

          <div className="bg-[#f8f5f0] border-l-4 border-green-500 rounded-lg p-5 shadow-sm flex items-start gap-4 opacity-80">
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-gray-900 font-serif mb-1">Pooja Items Advance</h4>
              <p className="text-sm text-gray-600 font-sans mb-2">Approved by Treasurer on 10 Oct.</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">Cleared</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold font-serif text-gray-800 border-b border-gray-200 pb-2">Community Comments</h3>

          <div className="bg-[#f8f5f0] rounded-lg p-5 shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="flex justify-between mb-3 border-b border-gray-200 pb-2">
              <span className="font-bold text-gray-800 font-serif text-md">Karthik (North Street)</span>
              <span className="text-xs text-gray-500 font-sans mt-1">2 days ago</span>
            </div>
            <p className="text-sm text-gray-700 font-sans leading-relaxed italic">
              "The Annadanam arrangement last year was excellent. Please ensure we use the same caterer this year and allocate a bit more budget for sweets!"
            </p>
          </div>

          <div className="bg-[#f8f5f0] rounded-lg p-5 shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="flex justify-between mb-3 border-b border-gray-200 pb-2">
              <span className="font-bold text-gray-800 font-serif text-md">Murugan Temple Committee</span>
              <span className="text-xs text-gray-500 font-sans mt-1">5 days ago</span>
            </div>
            <p className="text-sm text-gray-700 font-sans leading-relaxed italic">
              "Reminder: Collection deadline is approaching. 40 families are yet to pay the standard ₹500 amount. We will send volunteers this weekend."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

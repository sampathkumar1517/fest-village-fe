export default function FestivalSelect({
  festivals,
  value,
  onChange,
  loading = false,
  label = "Select Festival",
}) {
  return (
    <div className="flex-1 space-y-1.5 w-full">
      <label className="block text-sm font-medium text-[#333] font-sans">
        {label}
      </label>
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm text-gray-500">
          Loading festivals...
        </div>
      ) : (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border border-[#ddd] rounded-lg text-sm bg-white text-[#333] cursor-pointer font-sans appearance-none pr-10 outline-none focus:border-[#d35400] focus:ring-4 focus:ring-[#d35400]/10 bg-[url('data:image/svg+xml,%3Csvg_xmlns=%27http://www.w3.org/2000/svg%27_width=%2712%27_height=%2712%27_viewBox=%270_0_12_12%27%3E%3Cpath_fill=%27%23333%27_d=%27M6_9L1_4h10z%27/%3E%3C/svg%3E')] bg-no-repeat bg-[center_right_12px]"
        >
          <option value="">Choose a festival...</option>
          {festivals.map((f) => (
            <option key={f.id} value={f.id}>
              {f.festivalName || f.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

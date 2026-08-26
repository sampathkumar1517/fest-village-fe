export default function Spinner({ className = "h-8 w-8" }) {
  return (
    <div
      className={`${className} border-4 border-[#d35400]/20 border-t-[#d35400] rounded-full animate-spin mx-auto`}
      role="status"
      aria-label="Loading"
    />
  );
}

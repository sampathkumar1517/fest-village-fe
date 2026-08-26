export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-12 px-5 text-[#999]">
      {icon && <div className="mb-3 flex justify-center opacity-40">{icon}</div>}
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 font-serif mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm font-sans text-gray-500 mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}

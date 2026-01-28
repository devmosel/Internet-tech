/**
 * StatsCard Component
 * Reusable card for displaying statistics
 */

export default function StatsCard({ icon, label, value, description, shadowColor, className = "" }) {
  // Determine if value is a number or string for styling
  const isNumeric = typeof value === 'number' || !isNaN(value);
  const displayValue = isNumeric ? value : value;

  return (
    <div className={`bg-white rounded-[24px] p-6 relative z-0 group overflow-hidden border-[3px] border-black transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      {/* Subtle Gradient Overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${shadowColor || '#e5e7eb'} 0%, transparent 100%)` }}
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-6 border-2 border-black"
            style={{
              boxShadow: `4px 4px 0px 0px ${shadowColor || '#e5e7eb'}`,
              backgroundColor: 'white'
            }}
          >
            {/* Render Lucide Icon if provided, otherwise fallback to img */}
            {typeof icon === 'function' || typeof icon === 'object' ? (
              <div style={{ color: shadowColor || 'black' }}>
                {icon}
              </div>
            ) : (
              <img src={icon} alt="" className="w-6 h-6" />
            )}
          </div>
          {/* Artsy decorative dot */}
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: shadowColor || '#e5e7eb' }} />
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1 pl-1 border-l-2 border-transparent group-hover:border-current transition-all" style={{ color: shadowColor }}>
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tighter">
              {displayValue}
            </h3>
          </div>
          <p className="text-sm text-gray-500 font-medium opacity-80 mt-1 pl-1">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

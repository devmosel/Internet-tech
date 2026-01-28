'use client';

/**
 * BookedSpaceCard Component
 * Displays a space card for spaces that have been booked by the user
 * Features:
 * - Green top bar indicator
 * - Green border
 * - "Your Booking" button (disabled/informational)
 * - Shows booking time
 */
export default function BookedSpaceCard({ space, bookingTime }) {
  const amenityIcons = {
    'Monitor': '/assets/f710a8532bb7f6be7023184b940c0b2b5746bc70.svg',
    'Power Outlet': '/assets/123375ea5e26ce44b7119cf0c7842bbfe3d1acf6.svg',
    'Standing Desk': '/assets/184edf44907e8ea4d64d9756ae4a72901920ea57.svg',
    'Whiteboard': '/assets/013426a4beb4fcc79d3fa615feda380fd8cc6599.svg',
    'Projector': '/assets/2470b495aa90fa962b67cb001b73a4573bb33800.svg',
    'Video Conference': '/assets/2470b495aa90fa962b67cb001b73a4573bb33800.svg',
  };

  const spaceTypeIcons = {
    'Hot Desk': '/assets/e9a8acb8b17cb2cce7386825cc93d8c3562d4e74.svg',
    'Private Room': '/assets/b63d2480399ef9af5bbee97a82bea049fa954449.svg',
    'Conference Room': '/assets/6efc2681542d8e95ea9d5079af33757db2573221.svg',
  };

  const capacityIcon = '/assets/1dbf88267e140e98fae3960e41794a251cecf12c.svg';

  return (
    <div className="bg-white border-2 border-[#00c950] rounded-[16px] overflow-hidden h-[332px] flex flex-col">
      {/* Green top bar indicator */}
      <div className="h-[8px] bg-[#05df72] flex-shrink-0" />

      <div className="p-6 flex flex-col flex-1">
        {/* Header with icon and name */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-[14px] bg-blue-100 flex items-center justify-center flex-shrink-0">
            <img 
              src={spaceTypeIcons[space.type] || spaceTypeIcons['Hot Desk']} 
              alt="" 
              className="w-6 h-6" 
            />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-normal text-neutral-950 tracking-[-0.3125px] leading-6">
              {space.name}
            </h3>
            <p className="text-sm tracking-[-0.1504px] leading-5 text-[#1447e6]">
              {space.type}
            </p>
          </div>
        </div>

        {/* Capacity badge */}
        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg mb-4 bg-blue-100 border border-transparent h-[22px] w-fit">
          <img src={capacityIcon} alt="" className="w-3 h-3" />
          <span className="text-xs font-medium leading-4 text-[#1447e6]">
            {space.capacity} {space.capacity === 1 ? 'person' : 'people'}
          </span>
        </div>

        {/* Booking time */}
        <div className="flex items-center gap-2 mb-4">
          <img src="/assets/6c19041890678fea04354a56ac73a90d63546598.svg" alt="" className="w-4 h-4" />
          <span className="text-sm text-[#717182] tracking-[-0.1504px] leading-5">
            {bookingTime || '08:00-18:00'}
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-6 flex-grow">
          {space.amenities && space.amenities.slice(0, 2).map((amenity, index) => (
            <div 
              key={index}
              className="bg-gray-50 px-3 py-2 rounded-[10px] flex items-center gap-1.5 h-[32px]"
            >
              <img src={amenityIcons[amenity]} alt="" className="w-3.5 h-3.5" />
              <span className="text-sm text-[#4a5565] tracking-[-0.1504px] leading-5">
                {amenity}
              </span>
            </div>
          ))}
        </div>

        {/* Your Booking button (disabled/informational) */}
        <button 
          disabled
          className="w-full bg-[#00a63e] text-white text-sm font-medium tracking-[-0.1504px] leading-5 px-4 py-2 rounded-[14px] h-[36px] flex items-center justify-center opacity-50 cursor-not-allowed mt-auto"
        >
          Your Booking
        </button>
      </div>
    </div>
  );
}

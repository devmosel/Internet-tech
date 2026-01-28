import { useRef } from 'react';
import { hapticClick } from '@/utils/animations';
import {
  Wifi,
  Monitor,
  Plug,
  Presentation,
  Video,
  Users,
  User,
  Clock,
  Timer,
  Armchair,
  DoorOpen
} from 'lucide-react';

export default function SpaceCard({ space, onBook }) {
  const buttonRef = useRef(null); // Ref for the button

  // Map amenities to Lucide icons
  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'Wi-Fi': Wifi,
      'Monitor': Monitor,
      'Power Outlet': Plug,
      'Standing Desk': Armchair,
      'Whiteboard': Presentation,
      'Projector': Presentation,
      'Video Conference': Video,
    };
    return iconMap[amenity] || null;
  };

  // Get icon and color scheme based on space type
  const getTypeStyles = () => {
    if (space.type === 'Hot Desk') {
      return {
        icon: Armchair,
        headerBg: 'bg-[#E0F2FE]', // Watercolor Blue
        iconBg: 'bg-white',
        iconColor: 'text-blue-600',
        borderColor: 'border-black'
      };
    }
    if (space.type === 'Private Room') {
      return {
        icon: DoorOpen,
        headerBg: 'bg-[#F3E8FF]', // Watercolor Purple
        iconBg: 'bg-white',
        iconColor: 'text-purple-600',
        borderColor: 'border-black'
      };
    }
    // Meeting Room
    return {
      icon: Users,
      headerBg: 'bg-[#FFEDD5]', // Watercolor Orange
      iconBg: 'bg-white',
      iconColor: 'text-orange-600',
      borderColor: 'border-black'
    };
  };

  const typeConfig = getTypeStyles();
  const TypeIcon = typeConfig.icon;

  const handleBookClick = (e) => {
    e.stopPropagation();
    hapticClick(buttonRef.current, () => {
      onBook && onBook(space);
    });
  };

  return (
    <div className="group relative bg-white border-[3px] border-black rounded-[24px] overflow-hidden flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
      {/* Header Section with Watercolor Background */}
      <div className={`p-6 ${typeConfig.headerBg} border-b-[3px] border-black relative`}>
        {/* Paper Texture Overlay (Optional, simple dot pattern could work, but keeping it clean for now) */}

        <div className="flex items-start gap-4 mb-4 relative z-10">
          {/* Icon Box */}
          <div className={`w-14 h-14 rounded-xl ${typeConfig.iconBg} border-[3px] border-black flex items-center justify-center flex-shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-105 transition-transform duration-200`}>
            <TypeIcon className={`w-7 h-7 ${typeConfig.iconColor}`} strokeWidth={2.5} />
          </div>

          {/* Name and Type */}
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-xl font-black text-black tracking-wide mb-1 truncate uppercase" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
              {space.name}
            </h3>
            <p className="text-sm font-bold text-neutral-600 uppercase tracking-wide">
              {space.type}
            </p>
          </div>
        </div>

        {/* Capacity Badge - Sticker Style */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {space.capacity === 1 ? (
            <User className="w-4 h-4 text-black" strokeWidth={2.5} />
          ) : (
            <Users className="w-4 h-4 text-black" strokeWidth={2.5} />
          )}
          <span className="text-xs font-black text-black uppercase tracking-wide">
            {space.capacity} {space.capacity === 1 ? 'person' : 'people'}
          </span>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-6 flex-1 flex flex-col bg-white">
        {/* Opening Hours & Duration */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
            <Clock className="w-5 h-5 text-black" strokeWidth={2.5} />
            <span>{space.opening_hours || '00:00-18:00'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
            <Timer className="w-5 h-5 text-black" strokeWidth={2.5} />
            <span>Max: {space.max_duration} mins</span>
          </div>
        </div>

        {/* Amenities */}
        {space.amenities && space.amenities.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-black text-black uppercase tracking-wider mb-3">
              Included Stuff
            </h4>
            <div className="flex flex-wrap gap-2">
              {space.amenities.map((amenity, index) => {
                const Icon = getAmenityIcon(amenity);
                return (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border-2 border-black rounded-lg font-bold text-xs text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]"
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 text-black" strokeWidth={2.5} />}
                    <span>{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Book Button */}
        <button
          ref={buttonRef}
          onClick={handleBookClick}
          className="w-full mt-auto bg-black text-white text-sm font-bold uppercase tracking-wider px-4 py-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all duration-150 flex items-center justify-center gap-2"
        >
          <span>{space.buttonText || 'Book This Space'}</span>
        </button>
      </div>
    </div>
  );
}

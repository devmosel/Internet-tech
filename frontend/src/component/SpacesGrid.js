/**
 * SpacesGrid component
 * Displays grid of space cards with various states (loading, error, empty)
 */

import SpaceCard from '@/component/SpaceCard';
import { isWeekend } from '@/utils/date';
import DefaultMsg from '@/component/DefaultMsg';

export default function SpacesGrid({
  spaces,
  filteredSpaces,
  loading,
  error,
  hasSearched,
  selectedDate,
  onBookSpace,
}) {
  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4" />
          <p className="text-base text-[#717182] tracking-[-0.3125px] leading-6">
            Loading spaces...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-base text-red-600 tracking-[-0.3125px] leading-6 mb-2">
          Failed to load spaces
        </p>
        <p className="text-sm text-red-500 tracking-[-0.1504px] leading-5">
          {error}
        </p>
      </div>
    );
  }

  // Initial state - no search performed
  if (!hasSearched) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        <div className="col-span-full">
          <DefaultMsg />
        </div>
      </div>
    );
  }

  // No results after search
  if (spaces.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        <div className="col-span-full text-center py-20">
          <div className="flex flex-col items-center gap-4">
            {isWeekend(selectedDate) ? (
              <>
                <div className="text-6xl mb-2">🏖️</div>
                <div>
                  <p className="text-xl text-neutral-950 tracking-[-0.3125px] leading-6 mb-2 font-medium">
                    Who works on weekends? C'mon now! 😄
                  </p>
                  <p className="text-sm text-[#717182] tracking-[-0.1504px] leading-5">
                    Try selecting a weekday to find available spaces
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-2">🎉</div>
                <div>
                  <p className="text-xl text-neutral-950 tracking-[-0.3125px] leading-6 mb-2 font-medium">
                    Looks like a holiday! Time to relax 🌴
                  </p>
                  <p className="text-sm text-[#717182] tracking-[-0.1504px] leading-5">
                    No spaces available for this date. Maybe try a different day?
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Filtered results - no matches
  if (filteredSpaces.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        <div className="col-span-full text-center py-20">
          <p className="text-base text-[#717182] tracking-[-0.3125px] leading-6">
            No spaces found matching your criteria. Try adjusting your filters.
          </p>
        </div>
      </div>
    );
  }

  // Display spaces
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
      {filteredSpaces.map(space => (
        <SpaceCard
          key={space.id}
          space={space}
          onBook={onBookSpace}
        />
      ))}
    </div>
  );
}

/**
 * FloorPlan Component
 * Interactive floor plan view for desk selection - All Floors
 * Uses SVG files from /public/
 */

'use client';

import { useState, useEffect, useRef } from 'react';

export default function FloorPlan({
  occupiedDesks = [],
  onDeskSelect,
  selectedDeskId,
  selectedDate,
  selectedLevel,
  onLevelChange
}) {
  const svgContainerRef = useRef(null);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const [occupiedSvgDoc, setOccupiedSvgDoc] = useState(null);
  const [currentLoadedFloor, setCurrentLoadedFloor] = useState(null);

  // Desk and room metadata for all floors
  const deskInfo = {
    // Lantai 1: hotDesk01-12
    hotDesk01: { number: 1, type: 'hotDesk', floor: 1 },
    hotDesk02: { number: 2, type: 'hotDesk', floor: 1 },
    hotDesk03: { number: 3, type: 'hotDesk', floor: 1 },
    hotDesk04: { number: 4, type: 'hotDesk', floor: 1 },
    hotDesk05: { number: 5, type: 'hotDesk', floor: 1 },
    hotDesk06: { number: 6, type: 'hotDesk', floor: 1 },
    hotDesk07: { number: 7, type: 'hotDesk', floor: 1 },
    hotDesk08: { number: 8, type: 'hotDesk', floor: 1 },
    hotDesk09: { number: 9, type: 'hotDesk', floor: 1 },
    hotDesk10: { number: 10, type: 'hotDesk', floor: 1 },
    hotDesk11: { number: 11, type: 'hotDesk', floor: 1 },
    hotDesk12: { number: 12, type: 'hotDesk', floor: 1 },
    // Lantai 2: hotDesk13-20
    hotDesk13: { number: 13, type: 'hotDesk', floor: 2 },
    hotDesk14: { number: 14, type: 'hotDesk', floor: 2 },
    hotDesk15: { number: 15, type: 'hotDesk', floor: 2 },
    hotDesk16: { number: 16, type: 'hotDesk', floor: 2 },
    hotDesk17: { number: 17, type: 'hotDesk', floor: 2 },
    hotDesk18: { number: 18, type: 'hotDesk', floor: 2 },
    hotDesk19: { number: 19, type: 'hotDesk', floor: 2 },
    hotDesk20: { number: 20, type: 'hotDesk', floor: 2 },
    // Lantai 1: meetingRoom01-03
    meetingRoom01: { number: 1, type: 'meetingRoom', name: 'Ruang Rapat 1', floor: 1 },
    meetingRoom02: { number: 2, type: 'meetingRoom', name: 'Ruang Rapat 2', floor: 1 },
    meetingRoom03: { number: 3, type: 'meetingRoom', name: 'Ruang Rapat 3', floor: 1 },
    // Lantai 2: meetingRoom04-06
    meetingRoom04: { number: 4, type: 'meetingRoom', name: 'Ruang Rapat 4', floor: 2 },
    meetingRoom05: { number: 5, type: 'meetingRoom', name: 'Ruang Rapat 5', floor: 2 },
    meetingRoom06: { number: 6, type: 'meetingRoom', name: 'Ruang Rapat 6', floor: 2 },
    // Lantai 3: meetingRoom07-08
    meetingRoom07: { number: 7, type: 'meetingRoom', name: 'Ruang Rapat 7', floor: 3 },
    meetingRoom08: { number: 8, type: 'meetingRoom', name: 'Ruang Rapat 8', floor: 3 },
    // Lantai 1: privateRoom01-02
    privateRoom01: { number: 1, type: 'privateRoom', floor: 1 },
    privateRoom02: { number: 2, type: 'privateRoom', floor: 1 },
    // Lantai 3: privateRoom03-08
    privateRoom03: { number: 3, type: 'privateRoom', floor: 3 },
    privateRoom04: { number: 4, type: 'privateRoom', floor: 3 },
    privateRoom05: { number: 5, type: 'privateRoom', floor: 3 },
    privateRoom06: { number: 6, type: 'privateRoom', floor: 3 },
    privateRoom07: { number: 7, type: 'privateRoom', floor: 3 },
    privateRoom08: { number: 8, type: 'privateRoom', floor: 3 }
  };

  // Debug: Track when occupiedDesks prop changes
  useEffect(() => {
    console.log('🎨 FloorPlan: occupiedDesks prop changed:', occupiedDesks);
  }, [occupiedDesks]);

  // Get SVG file paths based on floor
  const getSvgPaths = (floor) => {
    switch (floor) {
      case 'lantai1':
        return { main: '/lantai1v2.svg', occupied: '/lantai1v2isOccupied.svg' };
      case 'lantai2':
        return { main: '/lantai2.svg', occupied: '/lantai2isOccupied.svg' };
      case 'lantai3':
        return { main: '/lantai3.svg', occupied: '/lantai3isOccupied.svg' };
      default:
        return { main: '/lantai1v2.svg', occupied: '/lantai1v2isOccupied.svg' };
    }
  };

  // Reset state when floor changes
  useEffect(() => {
    console.log('🔄 FloorPlan: Floor changed to', selectedLevel);
    setSvgLoaded(false);
    setOccupiedSvgDoc(null);
    setCurrentLoadedFloor(null);
  }, [selectedLevel]);

  // Load the occupied SVG document based on selected floor
  useEffect(() => {
    const { occupied: occupiedSvgFile } = getSvgPaths(selectedLevel);

    console.log('🔄 FloorPlan: Loading occupied SVG for', selectedLevel, occupiedSvgFile);

    fetch(occupiedSvgFile)
      .then((response) => response.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        setOccupiedSvgDoc(doc);
        setCurrentLoadedFloor(selectedLevel);
        console.log('✅ FloorPlan: Occupied SVG loaded for', selectedLevel);
      })
      .catch((err) => {
        console.error('Failed to load occupied SVG:', err);
      });
  }, [selectedLevel]);

  // Create a stable string representation of occupiedDesks for dependency tracking
  const occupiedDesksKey = [...occupiedDesks].sort().join(',');

  // Handle SVG interaction - applies click handlers and occupied state styling
  useEffect(() => {
    // Wait for all conditions:
    // 1. Container exists
    // 2. Main SVG is loaded
    // 3. Occupied SVG is loaded for the CURRENT floor
    if (!svgContainerRef.current || !svgLoaded || !occupiedSvgDoc) {
      console.log('⏳ FloorPlan: Waiting for conditions', { 
        container: !!svgContainerRef.current, 
        svgLoaded, 
        occupiedSvgDoc: !!occupiedSvgDoc 
      });
      return;
    }
    
    if (currentLoadedFloor !== selectedLevel) {
      console.log('⏳ FloorPlan: Waiting for occupied SVG to match floor', selectedLevel, 'current:', currentLoadedFloor);
      return;
    }

    const objectElement = svgContainerRef.current.querySelector(`object[data-floor="${selectedLevel}"]`);
    if (!objectElement || !objectElement.contentDocument) {
      console.log('⏳ FloorPlan: Waiting for object element', selectedLevel);
      return;
    }

    const svgDoc = objectElement.contentDocument;
    
    console.log('🔄 FloorPlan: Updating SVG for', selectedLevel, 'with occupied desks:', occupiedDesks);

    // Get all hotDesk, meetingRoom, and privateRoom elements from the SVG
    const hotDeskElements = Array.from(svgDoc.querySelectorAll('[id^="hotDesk"]')).filter(el => {
      return /^hotDesk\d{2}$/.test(el.id);
    });
    const meetingRoomElements = Array.from(svgDoc.querySelectorAll('[id^="meetingRoom"]')).filter(el => {
      return /^meetingRoom\d{2}$/.test(el.id);
    });
    const privateRoomElements = Array.from(svgDoc.querySelectorAll('[id^="privateRoom"]')).filter(el => {
      return /^privateRoom\d{2}$/.test(el.id);
    });
    const allSpaceElements = [...hotDeskElements, ...meetingRoomElements, ...privateRoomElements];

    console.log('📍 FloorPlan: Found elements in', selectedLevel, ':', allSpaceElements.map(e => e.id));

    allSpaceElements.forEach((spaceElement) => {
      const spaceId = spaceElement.id;
      const isOccupied = occupiedDesks.includes(spaceId);
      const isSelected = selectedDeskId === spaceId;
      const spaceMetadata = deskInfo[spaceId];

      // Add click handler - allow clicking even if occupied
      spaceElement.style.cursor = 'pointer';

      const handleClick = (e) => {
        e.preventDefault();
        if (onDeskSelect && spaceMetadata) {
          let spaceName;
          if (spaceMetadata.type === 'meetingRoom') {
            spaceName = spaceMetadata.name || `Meeting Room ${spaceMetadata.number}`;
          } else if (spaceMetadata.type === 'privateRoom') {
            spaceName = `Private Room ${spaceMetadata.number}`;
          } else {
            spaceName = `Hot Desk ${spaceMetadata.number}`;
          }

          onDeskSelect({
            id: spaceId,
            name: spaceName,
            number: spaceMetadata.number,
            type: spaceMetadata.type,
            isOccupied: isOccupied
          });
        }
      };

      // Remove existing listeners by cloning
      spaceElement.replaceWith(spaceElement.cloneNode(true));
      const newSpaceElement = svgDoc.getElementById(spaceId);
      newSpaceElement.addEventListener('click', handleClick);

      // Visual state management
      if (isSelected && !isOccupied) {
        // Add selected state styling with a blue glow
        newSpaceElement.style.filter = 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))';

        // Change the green indicator to blue for selected state
        const greenCircle = newSpaceElement.querySelector('[fill="#10B981"]');
        if (greenCircle) {
          greenCircle.setAttribute('fill', '#3B82F6');
        }
      } else {
        newSpaceElement.style.filter = '';

        // Reset green indicator if not selected
        const blueCircle = newSpaceElement.querySelector('[fill="#3B82F6"]');
        if (blueCircle && !isOccupied) {
          blueCircle.setAttribute('fill', '#10B981');
        }
      }

      // Handle occupied state - replace with occupied version
      if (isOccupied) {
        // Handle ID mapping for occupied SVG (some IDs differ from main SVG)
        let occupiedElementId = spaceId;
        
        // Map meetingRoom02 -> meetingRoom01_2 and meetingRoom03 -> meetingRoom01_3 for Lantai 1
        if (selectedLevel === 'lantai1') {
          if (spaceId === 'meetingRoom02') occupiedElementId = 'meetingRoom01_2';
          if (spaceId === 'meetingRoom03') occupiedElementId = 'meetingRoom01_3';
        }
        
        const occupiedElement = occupiedSvgDoc.getElementById(occupiedElementId);

        if (occupiedElement) {
          const occupiedClone = occupiedElement.cloneNode(true);

          // Replace the current element's innerHTML with the occupied version's innerHTML
          while (newSpaceElement.firstChild) {
            newSpaceElement.removeChild(newSpaceElement.firstChild);
          }

          while (occupiedClone.firstChild) {
            newSpaceElement.appendChild(occupiedClone.firstChild);
          }

          newSpaceElement.setAttribute('data-occupied-replaced', 'true');
        } else {
          console.warn(`⚠️ FloorPlan: Could not find occupied element for ${spaceId} (tried ${occupiedElementId})`);
        }
      } else {
        // Reset to available state if it was previously replaced
        if (newSpaceElement.getAttribute('data-occupied-replaced') === 'true') {
          const { main: originalSvgFile } = getSvgPaths(selectedLevel);
          
          fetch(originalSvgFile)
            .then(response => response.text())
            .then(svgText => {
              const parser = new DOMParser();
              const originalDoc = parser.parseFromString(svgText, 'image/svg+xml');
              const originalElement = originalDoc.getElementById(spaceId);

              if (originalElement) {
                while (newSpaceElement.firstChild) {
                  newSpaceElement.removeChild(newSpaceElement.firstChild);
                }

                const originalClone = originalElement.cloneNode(true);
                while (originalClone.firstChild) {
                  newSpaceElement.appendChild(originalClone.firstChild);
                }

                newSpaceElement.removeAttribute('data-occupied-replaced');
              }
            });
        }
      }
    });
  }, [selectedDeskId, occupiedDesksKey, onDeskSelect, svgLoaded, occupiedSvgDoc, currentLoadedFloor, selectedLevel]);

  // Handle SVG load
  const handleSvgLoad = (floor) => {
    console.log('🎨 FloorPlan: Main SVG loaded for', floor);
    if (floor === selectedLevel) {
      setSvgLoaded(true);
    }
  };

  return (
    <div className="overflow-hidden" style={{ backgroundColor: '#FFFEF8' }}>
      <div>
        <div
          ref={svgContainerRef}
          className="relative w-full overflow-hidden min-h-[600px]"
          style={{ backgroundColor: '#FFFEF8' }}
        >
          <div className="w-full h-full">
            {/* Lantai 1 */}
            <div style={{ display: selectedLevel === 'lantai1' ? 'block' : 'none' }}>
              <object
                key="lantai1-svg"
                data-floor="lantai1"
                data="/lantai1v2.svg"
                type="image/svg+xml"
                className="w-full h-auto"
                style={{ maxWidth: '1551px', display: 'block', backgroundColor: '#FFFEF8' }}
                onLoad={() => handleSvgLoad('lantai1')}
              >
                Your browser does not support SVG
              </object>
            </div>

            {/* Lantai 2 */}
            <div style={{ display: selectedLevel === 'lantai2' ? 'block' : 'none' }}>
              <object
                key="lantai2-svg"
                data-floor="lantai2"
                data="/lantai2.svg"
                type="image/svg+xml"
                className="w-full h-auto"
                style={{ maxWidth: '1551px', display: 'block', backgroundColor: '#FFFEF8' }}
                onLoad={() => handleSvgLoad('lantai2')}
              >
                Your browser does not support SVG
              </object>
            </div>

            {/* Lantai 3 */}
            <div style={{ display: selectedLevel === 'lantai3' ? 'block' : 'none' }}>
              <object
                key="lantai3-svg"
                data-floor="lantai3"
                data="/lantai3.svg"
                type="image/svg+xml"
                className="w-full h-auto"
                style={{ maxWidth: '1551px', display: 'block', backgroundColor: '#FFFEF8' }}
                onLoad={() => handleSvgLoad('lantai3')}
              >
                Your browser does not support SVG
              </object>
            </div>

            {!['lantai1', 'lantai2', 'lantai3'].includes(selectedLevel) && (
              <div className="w-full h-[600px] flex items-center justify-center">
                <p className="text-slate-500">Floor plan not available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

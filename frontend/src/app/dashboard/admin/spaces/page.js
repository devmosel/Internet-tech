'use client';

import { useState, useEffect } from 'react';
import { getAllSpacesForManage, updateSpaceStatus } from '@/services/spaceService';
import { Search, ChevronUp, ChevronDown, RefreshCw, Save, LayoutGrid, CheckCircle, User, Wrench, Users, Sparkles } from 'lucide-react';
import { HotDeskIcon, MeetingRoomIcon, PrivateRoomIcon } from '@/component/icons/SpaceTypeIcons';
import AnimatedStatusToggle from '@/component/AnimatedStatusToggle';
import StatsCard from '@/component/StatsCard';
import { useSpacesWebSocket } from '@/contexts/SpacesWebSocketContext';

export default function AdminSpacesPage() {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [updatingSpaceId, setUpdatingSpaceId] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // WebSocket integration for real-time updates
  const { subscribe } = useSpacesWebSocket();

  useEffect(() => {
    fetchSpaces();

    // Subscribe to real-time space updates
    const handleSpaceUpdated = (space) => {
      console.log('🔄 Real-time space updated:', space);
      setSpaces(prev => prev.map(s => s.id === space.id ? space : s));
      // Clear pending changes for this space if it was updated externally
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[space.id];
        return newChanges;
      });
    };

    const handleSpaceCreated = (space) => {
      console.log('✨ Real-time space created:', space);
      setSpaces(prev => [...prev, space]);
    };

    const handleSpaceDeleted = (data) => {
      console.log('🗑️ Real-time space deleted:', data);
      const deleteId = data.id || data;
      setSpaces(prev => prev.filter(s => s.id !== deleteId));
      // Clear pending changes for deleted space
      setPendingChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[deleteId];
        return newChanges;
      });
    };

    // Subscribe returns unsubscribe functions
    const unsubscribeUpdated = subscribe('space_updated', handleSpaceUpdated);
    const unsubscribeCreated = subscribe('space_created', handleSpaceCreated);
    const unsubscribeDeleted = subscribe('space_deleted', handleSpaceDeleted);

    return () => {
      unsubscribeUpdated();
      unsubscribeCreated();
      unsubscribeDeleted();
    };
  }, [subscribe]);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const response = await getAllSpacesForManage();

      if (response.success && response.data) {
        setSpaces(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch spaces:', error);

      // Use mock data as fallback
      const mockSpaces = [
        { id: 1, name: 'Hot Desk A1', type: 'hot_desk', floor_name: 'Floor 1', capacity: 1, total_amenities: 6, status: 'available' },
        { id: 2, name: 'Hot Desk A2', type: 'hot_desk', floor_name: 'Floor 1', capacity: 1, total_amenities: 5, status: 'available' },
        { id: 3, name: 'Meeting Room B', type: 'meeting_room', floor_name: 'Floor 1', capacity: 8, total_amenities: 5, status: 'occupied' },
        { id: 4, name: 'Private Office C', type: 'private_office', floor_name: 'Floor 2', capacity: 4, total_amenities: 5, status: 'available' },
        { id: 5, name: 'Hot Desk B1', type: 'hot_desk', floor_name: 'Floor 2', capacity: 1, total_amenities: 2, status: 'available' },
        { id: 6, name: 'Hot Desk C1', type: 'hot_desk', floor_name: 'Floor 2', capacity: 1, total_amenities: 2, status: 'maintenance' },
        { id: 7, name: 'Focus Room D', type: 'private_office', floor_name: 'Floor 2', capacity: 2, total_amenities: 1, status: 'available' },
        { id: 8, name: 'Meeting Room E', type: 'meeting_room', floor_name: 'Floor 3', capacity: 12, total_amenities: 4, status: 'available' },
        { id: 9, name: 'Hot Desk D1', type: 'hot_desk', floor_name: 'Floor 3', capacity: 1, total_amenities: 3, status: 'occupied' },
        { id: 10, name: 'Hot Desk D2', type: 'hot_desk', floor_name: 'Floor 3', capacity: 1, total_amenities: 3, status: 'available' },
        { id: 11, name: 'Conference Room F', type: 'meeting_room', floor_name: 'Floor 3', capacity: 20, total_amenities: 6, status: 'available' },
        { id: 12, name: 'Private Office G', type: 'private_office', floor_name: 'Floor 3', capacity: 6, total_amenities: 4, status: 'available' }
      ];

      setSpaces(mockSpaces);
    } finally {
      setLoading(false);
    }
  };

  // Format space type from snake_case
  const formatSpaceType = (type) => {
    return type
      ?.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || type;
  };

  // Get icon component based on space type
  const getSpaceIcon = (type) => {
    switch (type) {
      case 'hot_desk':
      case 'fixed_desk':
        return HotDeskIcon;
      case 'meeting_room':
        return MeetingRoomIcon;
      case 'private_office':
        return PrivateRoomIcon;
      default:
        return HotDeskIcon; // Fallback to HotDesk icon
    }
  };

  // Get status configuration
  const getStatusConfig = (status) => {
    const configs = {
      available: {
        bgColor: 'bg-green-100',
        textColor: 'text-[#016630]',
        label: 'available'
      },
      occupied: {
        bgColor: 'bg-[#ffedd4]',
        textColor: 'text-[#f54900]',
        label: 'occupied'
      },
      maintenance: {
        bgColor: 'bg-[#ffe2e2]',
        textColor: 'text-[#e7000b]',
        label: 'maintenance'
      },
    };
    return configs[status] || configs.available;
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort spaces
  const filteredAndSortedSpaces = spaces
    .filter(space => {
      const matchesSearch = space.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || space.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle special cases
      if (sortField === 'type') {
        aValue = formatSpaceType(a.type);
        bValue = formatSpaceType(b.type);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Handle status toggle (stores pending changes)
  const handleToggleStatus = (space) => {
    const currentStatus = pendingChanges[space.id]?.status || space.status;
    const newStatus = currentStatus === 'available' ? 'maintenance' : 'available';

    setPendingChanges(prev => ({
      ...prev,
      [space.id]: {
        ...space,
        status: newStatus
      }
    }));
  };

  // Get effective status (pending or original)
  const getEffectiveStatus = (space) => {
    return pendingChanges[space.id]?.status || space.status;
  };

  // Save all pending changes
  const handleSaveChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return;

    try {
      setIsSaving(true);

      // Update all changed spaces
      const updatePromises = Object.values(pendingChanges).map(space =>
        updateSpaceStatus(space.id, space.status)
      );

      await Promise.all(updatePromises);

      // Refresh the list
      await fetchSpaces();

      // Clear pending changes
      setPendingChanges({});
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save some changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate stats
  const stats = {
    total: spaces.length,
    available: spaces.filter(s => s.status === 'available').length,
    occupied: spaces.filter(s => s.status === 'occupied').length,
    maintenance: spaces.filter(s => s.status === 'maintenance').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-[#717182]">Loading spaces...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black text-black tracking-widest uppercase mb-4" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
            Workspace Management
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Manage all workspace inventory.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<LayoutGrid size={24} strokeWidth={3} />}
          label="Total Spaces"
          value={stats.total}
          description="All rooms & desks"
          shadowColor="#000000"
        />
        <StatsCard
          icon={<CheckCircle size={24} strokeWidth={3} />}
          label="Available"
          value={stats.available}
          description="Ready to book"
          shadowColor="#22C55E"
        />
        <StatsCard
          icon={<User size={24} strokeWidth={3} />}
          label="Occupied"
          value={stats.occupied}
          description="Currently in use"
          shadowColor="#F97316"
        />
        <StatsCard
          icon={<Wrench size={24} strokeWidth={3} />}
          label="In Maintenance"
          value={stats.maintenance}
          description="Unavailable"
          shadowColor="#EF4444"
        />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex-1 relative w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-black placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-white transition-colors"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-12 px-4 bg-white border-2 border-black rounded-xl font-bold text-black focus:outline-none hover:bg-gray-50 cursor-pointer min-w-[200px]"
        >
          <option value="all">All Types</option>
          <option value="hot_desk">Hot Desk</option>
          <option value="meeting_room">Meeting Room</option>
          <option value="private_room">Private Room</option>
        </select>
        {/* Save Button */}
        <button
          onClick={handleSaveChanges}
          disabled={Object.keys(pendingChanges).length === 0 || isSaving}
          className={`h-12 px-6 rounded-xl font-black uppercase tracking-wider border-2 border-black transition-all flex items-center gap-2 ${Object.keys(pendingChanges).length > 0
            ? 'bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            : 'bg-gray-100 text-gray-400 border-gray-300 shadow-none cursor-not-allowed'
            }`}
        >
          {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Save Changes {Object.keys(pendingChanges).length > 0 && `(${Object.keys(pendingChanges).length})`}</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border-[3px] border-black rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Name</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm cursor-pointer hover:text-yellow-400 transition-colors" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-1">
                    Type {sortField === 'type' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm cursor-pointer hover:text-yellow-400 transition-colors" onClick={() => handleSort('floor_name')}>
                  <div className="flex items-center gap-1">
                    Floor {sortField === 'floor_name' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm cursor-pointer hover:text-yellow-400 transition-colors" onClick={() => handleSort('capacity')}>
                  <div className="flex items-center gap-1">
                    Capacity {sortField === 'capacity' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Amenities</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {filteredAndSortedSpaces.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500 font-medium">
                    {searchQuery || typeFilter !== 'all' ? 'No spaces found matching your filters' : 'No spaces available'}
                  </td>
                </tr>
              ) : (
                filteredAndSortedSpaces.map((space, index) => {
                  const statusConfig = getStatusConfig(space.status);
                  const SpaceIcon = getSpaceIcon(space.type);

                  return (
                    <tr key={space.id || index} className="hover:bg-yellow-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white border-2 border-black flex items-center justify-center flex-shrink-0 shadow-sm">
                            <SpaceIcon size={20} className="text-black" />
                          </div>
                          <span className="font-bold text-black">{space.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {formatSpaceType(space.type)}
                      </td>
                      <td className="px-6 py-4 font-bold text-black">
                        {space.floor_name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border-2 border-gray-200 rounded-lg">
                          <Users size={14} className="text-gray-500" />
                          <span className="font-bold text-black text-sm">
                            {space.capacity} {space.capacity === 1 ? 'Person' : 'People'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border-2 border-gray-200 rounded-lg">
                          <Sparkles size={14} className="text-gray-500" />
                          <span className="font-bold text-black text-sm">
                            {space.total_amenities > 0 ? `${space.total_amenities} Amenities` : 'Standard'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <AnimatedStatusToggle
                          status={getEffectiveStatus(space)}
                          onClick={() => handleToggleStatus(space)}
                          isPending={!!pendingChanges[space.id]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

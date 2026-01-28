'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CalendarX2, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { getAllBlackouts, createBlackout, updateBlackout, deleteBlackout } from '@/services/blackoutService';
import BlackoutDialog from '@/component/BlackoutDialog';
import DeleteConfirmDialog from '@/component/DeleteConfirmDialog';
import StatsCard from '@/component/StatsCard';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getBlackoutStatus = (startAt, endAt) => {
  const now = new Date();
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (now >= start && now <= end) return 'active';
  if (now < start) return 'upcoming';
  return 'completed';
};

export default function AdminBlackoutsPage() {
  const [blackouts, setBlackouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [isBlackoutDialogOpen, setIsBlackoutDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedBlackout, setSelectedBlackout] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [blackoutToDelete, setBlackoutToDelete] = useState(null);

  useEffect(() => {
    fetchBlackouts();
  }, []);

  const fetchBlackouts = async () => {
    try {
      setLoading(true);
      const response = await getAllBlackouts();
      if (response.success) {
        setBlackouts(response.data);
      }
    } catch (error) {
      console.error('Error fetching blackouts:', error);

      // Use mock data as fallback
      const mockBlackouts = [
        {
          id: 1,
          title: 'Annual Maintenance',
          description: 'Complete system maintenance and upgrades for all floors',
          start_at: '2024-12-15T00:00:00Z',
          end_at: '2024-12-16T23:59:59Z',
          created_by_name: 'Admin User'
        },
        {
          id: 2,
          title: 'Holiday Closure',
          description: 'Office closed for Christmas holidays',
          start_at: '2024-12-24T00:00:00Z',
          end_at: '2025-01-02T23:59:59Z',
          created_by_name: 'Sarah Johnson'
        },
        {
          id: 3,
          title: 'HVAC Repair - Floor 2',
          description: 'Air conditioning system repair on second floor',
          start_at: '2024-12-05T08:00:00Z',
          end_at: '2024-12-05T18:00:00Z',
          created_by_name: 'Michael Chen'
        },
        {
          id: 4,
          title: 'Network Upgrade',
          description: 'WiFi infrastructure upgrade across all floors',
          start_at: '2024-11-20T22:00:00Z',
          end_at: '2024-11-21T06:00:00Z',
          created_by_name: 'Emma Wilson'
        }
      ];

      setBlackouts(mockBlackouts);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Blackout
  const handleAddBlackout = () => {
    setDialogMode('create');
    setSelectedBlackout(null);
    setIsBlackoutDialogOpen(true);
  };

  // Handle Edit Blackout
  const handleEditBlackout = (blackout) => {
    setDialogMode('edit');
    setSelectedBlackout(blackout);
    setIsBlackoutDialogOpen(true);
  };

  // Handle Delete Blackout
  const handleDeleteClick = (blackout) => {
    setBlackoutToDelete(blackout);
    setIsDeleteDialogOpen(true);
  };

  // Submit Blackout (Create or Update)
  const handleBlackoutSubmit = async (formData) => {
    try {
      if (dialogMode === 'create') {
        const response = await createBlackout(formData);
        if (response.success) {
          await fetchBlackouts();
          setIsBlackoutDialogOpen(false);
        }
      } else {
        const response = await updateBlackout(selectedBlackout.id, formData);
        if (response.success) {
          await fetchBlackouts();
          setIsBlackoutDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('Error submitting blackout:', error);
      throw error;
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    try {
      const response = await deleteBlackout(blackoutToDelete.id);
      if (response.success) {
        await fetchBlackouts();
        setIsDeleteDialogOpen(false);
        setBlackoutToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting blackout:', error);
    }
  };

  // Calculate stats
  const stats = blackouts.reduce(
    (acc, blackout) => {
      const status = getBlackoutStatus(blackout.start_at, blackout.end_at);
      acc.total++;
      if (status === 'active') acc.active++;
      if (status === 'upcoming') acc.upcoming++;
      if (status === 'completed') acc.completed++;
      return acc;
    },
    { total: 0, active: 0, upcoming: 0, completed: 0 }
  );

  // Filter blackouts
  const filteredBlackouts = blackouts.filter((blackout) => {
    const matchesSearch = blackout.title.toLowerCase().includes(searchQuery.toLowerCase());
    const status = getBlackoutStatus(blackout.start_at, blackout.end_at);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-[#717182]">Loading blackouts...</p>
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
            Blackouts
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Manage space unavailability and maintenance periods.
          </p>
        </div>
        <button
          onClick={handleAddBlackout}
          className="px-6 py-3 bg-black text-white border-[3px] border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Add Blackout</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<CalendarX2 size={24} strokeWidth={3} />}
          label="Total Blackouts"
          value={stats.total}
          description="Recorded periods"
          shadowColor="#000000"
        />
        <StatsCard
          icon={<AlertCircle size={24} strokeWidth={3} />}
          label="Active"
          value={stats.active}
          description="Currently unavailable"
          shadowColor="#EF4444"
        />
        <StatsCard
          icon={<Clock size={24} strokeWidth={3} />}
          label="Upcoming"
          value={stats.upcoming}
          description="Scheduled periods"
          shadowColor="#F97316"
        />
        <StatsCard
          icon={<CheckCircle size={24} strokeWidth={3} />}
          label="Completed"
          value={stats.completed}
          description="Past maintenance"
          shadowColor="#64748B"
        />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex-1 relative w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="Search blackouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-black placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-white transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 px-4 bg-white border-2 border-black rounded-xl font-bold text-black focus:outline-none hover:bg-gray-50 cursor-pointer min-w-[200px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border-[3px] border-black rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Title</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Duration</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Status</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Description</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Created By</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {filteredBlackouts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-black">
                        <Search size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-black uppercase text-black">No blackouts found</h3>
                      <p className="text-gray-500 font-medium">{searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Get started by adding a blackout.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBlackouts.map((blackout) => {
                  const status = getBlackoutStatus(blackout.start_at, blackout.end_at);

                  return (
                    <tr key={blackout.id} className="hover:bg-yellow-50/50 transition-colors">
                      {/* Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                            <CalendarX2 size={20} className="text-black" strokeWidth={2} />
                          </div>
                          <span className="font-bold text-black text-sm">
                            {blackout.title}
                          </span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-black text-sm flex items-center gap-2">
                            {formatDate(blackout.start_at)}
                          </span>
                          <span className="text-xs font-medium text-gray-500 pl-1 border-l-2 border-gray-200 ml-1">
                            to {formatDate(blackout.end_at)}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <div className={`
                            inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 font-bold text-xs uppercase tracking-wide
                            ${status === 'active' ? 'bg-red-100 border-red-200 text-red-700' :
                            status === 'upcoming' ? 'bg-orange-100 border-orange-200 text-orange-700' :
                              'bg-gray-100 border-gray-200 text-gray-500'}
                        `}>
                          {status === 'active' && <AlertCircle size={12} strokeWidth={3} />}
                          {status === 'upcoming' && <Clock size={12} strokeWidth={3} />}
                          {status === 'completed' && <CheckCircle size={12} strokeWidth={3} />}
                          {status}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-500 truncate max-w-[200px]">
                          {blackout.description || 'No description'}
                        </p>
                      </td>

                      {/* Created By */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                            {blackout.created_by_name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-bold text-black text-sm">
                            {blackout.created_by_name}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditBlackout(blackout)}
                            className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-black hover:text-white"
                            title="Edit"
                          >
                            <Edit2 size={16} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(blackout)}
                            className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-[#e7000b] hover:text-white hover:border-[#e7000b]"
                            title="Delete"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blackout Dialog */}
      <BlackoutDialog
        isOpen={isBlackoutDialogOpen}
        onClose={() => setIsBlackoutDialogOpen(false)}
        mode={dialogMode}
        blackoutData={selectedBlackout}
        onSubmit={handleBlackoutSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Blackout"
        message="Are you sure to delete this blackout?"
      />
    </div>
  );
}

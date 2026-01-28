'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Megaphone, Calendar, Users, Edit2, Trash2 } from 'lucide-react';
import StatsCard from '@/component/StatsCard';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '@/services/announcementService';
import { getTeamUsers } from '@/services/userService';
import { useToast } from '@/contexts/ToastContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import DeleteConfirmDialog from '@/component/DeleteConfirmDialog';

export default function ManagerAnnouncementsPage() {
  const { showToastMessage } = useToast();
  const { isConnected, announcements: wsAnnouncements, subscribe } = useWebSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scope: 'all' // 'all' or 'management'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState(null);

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [department, setDepartment] = useState(null);

  // Use WebSocket announcements when connected, otherwise use local state
  const displayAnnouncements = isConnected && wsAnnouncements.length > 0 ? wsAnnouncements : announcements;

  // Mock stats (keep for now as API doesn't provide stats yet)
  const stats = {
    totalAnnouncements: displayAnnouncements.length,
    thisWeek: displayAnnouncements.filter(a => {
      const date = new Date(a.created_at);
      const now = new Date();
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
      return date > oneWeekAgo;
    }).length,
    thisMonth: displayAnnouncements.filter(a => {
      const date = new Date(a.created_at);
      const now = new Date();
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
      return date > oneMonthAgo;
    }).length,
    totalReads: 0 // Not available in API yet
  };

  // Subscribe to real-time WebSocket updates
  useEffect(() => {
    const unsubscribeNew = subscribe('announcement_new', (newAnnouncement) => {
      console.log('📢 Manager page: New announcement received:', newAnnouncement);
      showToastMessage({
        type: 'success',
        title: '📢 New Announcement',
        message: `"${newAnnouncement.title}" has been created`,
        duration: 5000,
      });
    });

    const unsubscribeUpdate = subscribe('announcement_update', (updatedAnnouncement) => {
      console.log('✏️ Manager page: Announcement updated:', updatedAnnouncement);
      showToastMessage({
        type: 'info',
        title: '✏️ Announcement Updated',
        message: `"${updatedAnnouncement.title}" has been updated`,
        duration: 5000,
      });
    });

    const unsubscribeDelete = subscribe('announcement_delete', (deletedAnnouncement) => {
      console.log('🗑️ Manager page: Announcement deleted:', deletedAnnouncement);
      showToastMessage({
        type: 'warning',
        title: '🗑️ Announcement Deleted',
        message: 'An announcement has been removed',
        duration: 5000,
      });
    });

    return () => {
      unsubscribeNew();
      unsubscribeUpdate();
      unsubscribeDelete();
    };
  }, [subscribe, showToastMessage]);

  useEffect(() => {
    fetchAnnouncements();
    fetchDepartmentInfo();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAnnouncements();
      if (response.success) {
        setAnnouncements(response.data);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);

      // Use mock data as fallback
      const mockAnnouncements = [
        {
          id: 1,
          title: 'New Office Hours',
          description: 'Starting next week, our office hours will be 9 AM to 6 PM. Please plan your schedules accordingly.',
          creator_name: 'Emma Wilson',
          created_at: '2024-12-08T10:00:00Z',
          department_id: null
        },
        {
          id: 2,
          title: 'Team Building Event',
          description: 'Join us for a team building event this Friday at 4 PM. We will have games, food, and fun activities!',
          creator_name: 'Michael Chen',
          created_at: '2024-12-07T14:30:00Z',
          department_id: 1
        },
        {
          id: 3,
          title: 'System Maintenance',
          description: 'The booking system will be down for maintenance on Saturday from 2 AM to 6 AM.',
          creator_name: 'Sarah Johnson',
          created_at: '2024-12-05T09:15:00Z',
          department_id: null
        },
        {
          id: 4,
          title: 'Holiday Schedule',
          description: 'Please note that the office will be closed from December 24th to January 2nd for the holidays.',
          creator_name: 'David Martinez',
          created_at: '2024-12-01T11:00:00Z',
          department_id: null
        }
      ];

      setAnnouncements(mockAnnouncements);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentInfo = async () => {
    try {
      const response = await getTeamUsers();
      if (response.success && response.department) {
        setDepartment(response.department);
      }
    } catch (err) {
      console.error('Error fetching department info:', err);
    }
  };

  const handleCreateClick = () => {
    setDialogMode('create');
    setSelectedAnnouncement(null);
    setFormData({
      title: '',
      description: '',
      scope: 'all'
    });
    setIsCreateModalOpen(true);
  };

  const handleEditClick = (announcement) => {
    setDialogMode('edit');
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      scope: announcement.department_id ? 'management' : 'all'
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim()) {
      showToastMessage({
        type: 'error',
        title: 'Validation Error',
        message: 'Title is required',
        duration: 3000
      });
      return;
    }

    if (!formData.description.trim()) {
      showToastMessage({
        type: 'error',
        title: 'Validation Error',
        message: 'Description is required',
        duration: 3000
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        title: formData.title,
        description: formData.description,
        department_id: formData.scope === 'management' ? department?.id : null
      };

      if (dialogMode === 'create') {
        const response = await createAnnouncement(requestData);
        showToastMessage({
          type: 'success',
          title: 'Announcement created!',
          message: response.message || 'Announcement has been created successfully.',
          duration: 5000
        });
      } else {
        const response = await updateAnnouncement(selectedAnnouncement.id, requestData);
        showToastMessage({
          type: 'success',
          title: 'Announcement updated!',
          message: response.message || 'Announcement has been updated successfully.',
          duration: 5000
        });
      }

      // Refresh announcements list
      await fetchAnnouncements();

      // Close modal and reset form
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        description: '',
        scope: 'all'
      });
    } catch (error) {
      showToastMessage({
        type: 'error',
        title: dialogMode === 'create' ? 'Failed to create announcement' : 'Failed to update announcement',
        message: error.message || 'An error occurred. Please try again.',
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (announcement) => {
    setAnnouncementToDelete(announcement);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteAnnouncement(announcementToDelete.id);
      showToastMessage({
        type: 'success',
        title: 'Announcement deleted!',
        message: response.message || 'Announcement has been deleted successfully.',
        duration: 5000
      });

      // Refresh announcements list
      await fetchAnnouncements();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      // Close the dialog immediately on error (e.g., permission denied)
      setIsDeleteDialogOpen(false);

      showToastMessage({
        type: 'error',
        title: 'Failed to delete announcement',
        message: error.message || 'An error occurred. Please try again.',
        duration: 5000
      });
    }
  };

  const getPriorityConfig = (priority = 'normal') => {
    const configs = {
      urgent: { bg: 'bg-red-100', text: 'text-[#e7000b]', label: 'URGENT' },
      high: { bg: 'bg-orange-100', text: 'text-[#f97316]', label: 'HIGH' },
      normal: { bg: 'bg-blue-100', text: 'text-[#1447e6]', label: 'NORMAL' },
      low: { bg: 'bg-gray-100', text: 'text-[#364153]', label: 'LOW' }
    };
    return configs[priority] || configs.normal;
  };

  const filteredAnnouncements = displayAnnouncements.filter(announcement => {
    const matchesSearch =
      announcement.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || announcement.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black text-black tracking-widest uppercase mb-4" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
            Announcements
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Create and manage team announcements.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          className="px-6 py-3 bg-black text-white border-[3px] border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={3} />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<Megaphone size={24} strokeWidth={3} />}
          label="Total Announcements"
          value={stats.totalAnnouncements}
          description="All announcements"
          shadowColor="#000000"
        />
        <StatsCard
          icon={<Calendar size={24} strokeWidth={3} />}
          label="This Week"
          value={stats.thisWeek}
          description="Posted this week"
          shadowColor="#22C55E"
        />
        <StatsCard
          icon={<Calendar size={24} strokeWidth={3} />}
          label="This Month"
          value={stats.thisMonth}
          description="Posted this month"
          shadowColor="#3B82F6"
        />
        <StatsCard
          icon={<Users size={24} strokeWidth={3} />}
          label="Total Reads"
          value={stats.totalReads}
          description="All time reads"
          shadowColor="#F59E0B"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex-1 relative w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-black placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-white transition-colors"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-12 px-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-black focus:outline-none focus:ring-0 focus:bg-white transition-colors"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Announcements List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-500 font-bold">Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white border-[3px] border-black rounded-2xl p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-black mx-auto">
              <Search size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-black uppercase text-black">No announcements found</h3>
            <p className="text-gray-500 font-medium">Try adjusting your search or create a new announcement.</p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => {
            const priorityConfig = getPriorityConfig('normal'); // Default to normal as API doesn't return priority yet
            const formattedDate = new Date(announcement.created_at).toLocaleDateString();

            return (
              <div
                key={announcement.id}
                className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2 bg-blue-100 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Megaphone size={20} className="text-blue-600" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-black mb-1">{announcement.title}</h3>
                        <p className="text-gray-600 font-medium text-sm">{announcement.description}</p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} strokeWidth={2.5} />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={14} strokeWidth={2.5} />
                        <span>{announcement.creator_name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(announcement)}
                      className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-black hover:text-white"
                    >
                      <Edit2 size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(announcement)}
                      className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-[#e7000b] hover:text-white hover:border-[#e7000b]"
                    >
                      <Trash2 size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal Placeholder */}
      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsCreateModalOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white border-[3px] border-black rounded-2xl w-full max-w-[520px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 p-2 bg-white border-2 border-transparent hover:border-black rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all z-10"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Header */}
            <div className="bg-black text-white px-8 py-6 border-b-[3px] border-black">
              <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
                {dialogMode === 'create' ? 'New Announcement' : 'Edit Announcement'}
              </h2>
              <p className="text-white/70 font-medium text-sm mt-1">
                {dialogMode === 'create' ? 'Share news with your team or everyone' : 'Update announcement details'}
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-8 bg-[#FFFEF8] flex flex-col gap-5">
              {/* Title Input */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm uppercase tracking-wider text-black">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                  className="h-12 px-4 bg-white border-2 border-black rounded-xl font-bold text-black placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                />
              </div>

              {/* Description Input */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm uppercase tracking-wider text-black">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's happening?"
                  rows={4}
                  className="p-4 bg-white border-2 border-black rounded-xl font-bold text-black placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-none"
                />
              </div>

              {/* Scope Selection */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-sm uppercase tracking-wider text-black">
                  Scope
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormData({ ...formData, scope: 'all' })}
                    className={`p-3 border-2 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${formData.scope === 'all'
                      ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] translate-y-[-1px]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
                      }`}
                  >
                    <Users size={18} />
                    <span>All Users</span>
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, scope: 'management' })}
                    className={`p-3 border-2 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${formData.scope === 'management'
                      ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] translate-y-[-1px]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
                      }`}
                  >
                    <Users size={18} className="rotate-180" />
                    <span>My Team</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4 pt-6 border-t-2 border-dashed border-black/20">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 bg-white text-black border-[3px] border-black rounded-xl h-14 flex items-center justify-center font-black uppercase tracking-wider hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] active:shadow-none active:translate-y-0 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-black text-white border-[3px] border-black rounded-xl h-14 flex items-center justify-center font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    dialogMode === 'create' ? 'Create' : 'Update'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${announcementToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}

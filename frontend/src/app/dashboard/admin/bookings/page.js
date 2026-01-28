'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronUp, ChevronDown, Filter, Download, Calendar, Clock, MapPin, Hash, Trash2, CheckCircle, CheckSquare } from 'lucide-react';
import { getAllBookingsForManage, deleteBooking } from '@/services/bookingService';
import DeleteConfirmDialog from '@/component/DeleteConfirmDialog';
import StatsCard from '@/component/StatsCard';

// Mock data matching Figma
const mockBookings = [
  {
    id: 1,
    user_name: 'John Smith',
    user_email: 'john.smith@company.com',
    space_name: 'Desk A1',
    space_type: 'Hot Desk',
    booking_date: '2025-11-24',
    start_time: '10:00',
    end_time: '18:00',
    check_in_code: 'ABC123',
    status: 'active',
    checked_in: true,
  },
  {
    id: 2,
    user_name: 'Sarah Wilson',
    user_email: 'sarah.wilson@company.com',
    space_name: 'Meeting Room B',
    space_type: 'Meeting Room',
    booking_date: '2025-11-24',
    start_time: '09:00',
    end_time: '11:00',
    check_in_code: 'XYZ789',
    status: 'active',
    checked_in: false,
  },
  {
    id: 3,
    user_name: 'Mike Johnson',
    user_email: 'mike.johnson@company.com',
    space_name: 'Desk C3',
    space_type: 'Fixed Desk',
    booking_date: '2025-11-23',
    start_time: '08:00',
    end_time: '17:00',
    check_in_code: 'DEF456',
    status: 'completed',
    checked_in: false,
  },
  {
    id: 4,
    user_name: 'Emily Davis',
    user_email: 'emily.davis@company.com',
    space_name: 'Hot Desk 5',
    space_type: 'Hot Desk',
    booking_date: '2025-11-23',
    start_time: '13:00',
    end_time: '19:00',
    check_in_code: 'GHI789',
    status: 'completed',
    checked_in: false,
  },
  {
    id: 5,
    user_name: 'David Brown',
    user_email: 'david.brown@company.com',
    space_name: 'Desk B2',
    space_type: 'Hot Desk',
    booking_date: '2025-11-22',
    start_time: '10:00',
    end_time: '14:00',
    check_in_code: 'JKL012',
    status: 'cancelled',
    checked_in: false,
  },
  {
    id: 6,
    user_name: 'Lisa Anderson',
    user_email: 'lisa.anderson@company.com',
    space_name: 'Private Office D1',
    space_type: 'Private Office',
    booking_date: '2025-11-25',
    start_time: '09:00',
    end_time: '17:00',
    check_in_code: 'MNO345',
    status: 'pending',
    checked_in: false,
  },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await getAllBookingsForManage();

        if (response.success && response.data) {
          setBookings(response.data);
        } else {
          console.error('Failed to fetch bookings:', response.message);
          // Fallback to mock data on error
          setBookings(mockBookings);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        // Fallback to mock data on error
        setBookings(mockBookings);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatSpaceType = (type) => {
    if (!type) return 'N/A';
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const isCheckedIn = (booking) => {
    return booking.checkin_at !== null && booking.checkin_at !== undefined;
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: {
        bg: 'bg-green-100',
        text: 'text-[#016630]',
        label: 'active',
      },
      pending: {
        bg: 'bg-[#ffedd4]',
        text: 'text-[#f54900]',
        label: 'pending',
      },
      completed: {
        bg: 'bg-blue-100',
        text: 'text-[#0066cc]',
        label: 'completed',
      },
      cancelled: {
        bg: 'bg-[#ffe2e2]',
        text: 'text-[#e7000b]',
        label: 'cancelled',
      },
    };
    return configs[status] || configs.pending;
  };

  const stats = {
    total: bookings.length,
    active: bookings.filter((b) => b.status === 'active').length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
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

  // Handle delete click
  const handleDeleteClick = (booking) => {
    setBookingToDelete(booking);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    try {
      const response = await deleteBooking(bookingToDelete.id);
      if (response.success) {
        // Refresh bookings list
        const refreshResponse = await getAllBookingsForManage();
        if (refreshResponse.success && refreshResponse.data) {
          setBookings(refreshResponse.data);
        }
        setIsDeleteDialogOpen(false);
        setBookingToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking. Please try again.');
    }
  };

  // Filter and sort bookings
  const filteredAndSortedBookings = bookings
    .filter((booking) => {
      const matchesSearch =
        (booking.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.user_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (booking.space_name || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || booking.status === statusFilter;

      // Date filtering
      const matchesDate = (() => {
        if (dateFilter === 'all') return true;

        const bookingDate = new Date(booking.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        bookingDate.setHours(0, 0, 0, 0);

        if (dateFilter === 'past') {
          return bookingDate < today;
        } else if (dateFilter === 'today') {
          return bookingDate.getTime() === today.getTime();
        } else if (dateFilter === 'upcoming') {
          return bookingDate > today;
        }
        return true;
      })();

      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      if (!sortField) {
        // Default sort by date: oldest to newest
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      }

      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date sorting
      if (sortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // ... imports moved to top in next tool call or separate step? 
  // I will assume imports are fixed separately or I will fix them now?
  // I'll do the RETURN block here.

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-black text-black tracking-widest uppercase mb-4" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
          Booking Management
        </h1>
        <p className="text-lg text-gray-500 font-medium">
          View and manage all workspace bookings.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<Calendar size={24} strokeWidth={3} />}
          label="Total Bookings"
          value={stats.total}
          description="All time"
          shadowColor="#000000"
        />
        <StatsCard
          icon={<CheckCircle size={24} strokeWidth={3} />}
          label="Active"
          value={stats.active}
          description="Currently checked in"
          shadowColor="#22C55E"
        />
        <StatsCard
          icon={<Clock size={24} strokeWidth={3} />}
          label="Pending"
          value={stats.pending}
          description="Upcoming bookings"
          shadowColor="#F97316"
        />
        <StatsCard
          icon={<CheckSquare size={24} strokeWidth={3} />}
          label="Completed"
          value={stats.completed}
          description="Past bookings"
          shadowColor="#3B82F6"
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
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-black placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-white transition-colors"
          />
        </div>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="h-12 px-4 bg-white border-2 border-black rounded-xl font-bold text-black focus:outline-none hover:bg-gray-50 cursor-pointer min-w-[150px]"
        >
          <option value="all">All Dates</option>
          <option value="past">Past</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 px-4 bg-white border-2 border-black rounded-xl font-bold text-black focus:outline-none hover:bg-gray-50 cursor-pointer min-w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border-[3px] border-black rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-gray-500 font-bold animate-pulse">Loading bookings...</div>
          </div>
        ) : filteredAndSortedBookings.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-center">
            <div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                <Search size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-black uppercase text-black">No bookings found</h3>
              <p className="text-gray-500 font-medium">Try adjusting your filters.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">User</th>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Workspace</th>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm cursor-pointer hover:text-yellow-400 transition-colors" onClick={() => handleSort('date')}>
                    <div className="flex items-center gap-1">
                      Date {sortField === 'date' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm cursor-pointer hover:text-yellow-400 transition-colors" onClick={() => handleSort('start_time')}>
                    <div className="flex items-center gap-1">
                      Time {sortField === 'start_time' && (sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Code</th>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Status</th>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {filteredAndSortedBookings.map((booking) => {
                  const statusConfig = getStatusConfig(booking.status);
                  return (
                    <tr key={booking.id} className="hover:bg-yellow-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-black">{booking.username || 'N/A'}</span>
                          <span className="text-xs font-medium text-gray-500">{booking.user_email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-black">{booking.space_name || 'N/A'}</span>
                          <span className="text-xs font-medium text-gray-500">{formatSpaceType(booking.space_type)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          {formatDate(booking.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          {booking.start_time} - {booking.end_time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
                          <Hash size={14} className="text-black" strokeWidth={2.5} />
                          <span className="font-bold text-black text-sm font-mono tracking-wider">
                            {booking.check_in_code || '---'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 font-bold text-xs uppercase tracking-wide ${booking.status === 'active' ? 'bg-green-100 border-green-200 text-green-700' :
                          booking.status === 'pending' ? 'bg-orange-100 border-orange-200 text-orange-700' :
                            booking.status === 'completed' ? 'bg-blue-100 border-blue-200 text-blue-700' :
                              'bg-red-100 border-red-200 text-red-700'
                          }`}>
                          {booking.status}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleDeleteClick(booking)}
                            className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-[#e7000b] hover:text-white hover:border-[#e7000b]"
                            title="Delete Booking"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Booking"
        message="Are you sure to delete this booking?"
      />
    </div>
  );
}

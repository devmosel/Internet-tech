'use client';

import { useState, useEffect } from 'react';
import { getTeamUsers, createTeamUser, updateTeamUser, deleteTeamUser } from '@/services/userService';
import { Plus, Search, Edit2, Trash2, UserCircle2, Star, Circle, Users, Activity, Shield, Briefcase, BookMarked } from 'lucide-react';
import StatsCard from '@/component/StatsCard';
import UserDialog from '@/component/UserDialog';
import DeleteConfirmDialog from '@/component/DeleteConfirmDialog';
import { useToast } from '@/contexts/ToastContext';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getRoleConfig = (role) => {
  const configs = {
    user: {
      bg: 'bg-gray-100',
      text: 'text-[#364153]',
      icon: null
    },
    manager: {
      bg: 'bg-blue-100',
      text: 'text-[#1447e6]',
      icon: <Star className="w-[12px] h-[12px]" fill="currentColor" strokeWidth={0} />
    },
    admin: {
      bg: 'bg-purple-100',
      text: 'text-[#8200db]',
      icon: <Circle className="w-[12px] h-[12px]" fill="currentColor" strokeWidth={0} />
    },
    superadmin: {
      bg: 'bg-purple-100',
      text: 'text-[#8200db]',
      icon: <Circle className="w-[12px] h-[12px]" fill="currentColor" strokeWidth={0} />
    }
  };
  return configs[role] || configs.user;
};

const getStatusConfig = (status) => {
  const configs = {
    active: {
      bg: 'bg-green-100',
      text: 'text-[#016630]',
      label: 'active'
    },
    inactive: {
      bg: 'bg-[#ffe2e2]',
      text: 'text-[#e7000b]',
      label: 'inactive'
    }
  };
  return configs[status] || configs.active;
};

export default function ManagerUsersPage() {
  const { showToastMessage } = useToast();
  const [users, setUsers] = useState([]);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getTeamUsers();
      if (response.success && response.data) {
        setUsers(response.data);
        setDepartment(response.department);
      }
    } catch (error) {
      console.error('Error fetching team users:', error);

      // Use mock data as fallback
      const mockUsers = [
        {
          id: 1,
          username: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          phone: '+49 151 1234 5678',
          role: 'employee',
          is_active: true,
          total_bookings: 24,
          created_at: '2024-01-15'
        },
        {
          id: 2,
          username: 'Michael Chen',
          email: 'michael.chen@company.com',
          phone: '+49 151 2345 6789',
          role: 'employee',
          is_active: true,
          total_bookings: 18,
          created_at: '2024-02-20'
        },
        {
          id: 3,
          username: 'Emma Wilson',
          email: 'emma.wilson@company.com',
          phone: '+49 151 3456 7890',
          role: 'manager',
          is_active: true,
          total_bookings: 31,
          created_at: '2024-03-10'
        },
        {
          id: 4,
          username: 'David Martinez',
          email: 'david.martinez@company.com',
          phone: '+49 151 4567 8901',
          role: 'employee',
          is_active: true,
          total_bookings: 12,
          created_at: '2024-01-05'
        },
        {
          id: 5,
          username: 'Lisa Anderson',
          email: 'lisa.anderson@company.com',
          phone: '+49 151 5678 9012',
          role: 'employee',
          is_active: false,
          total_bookings: 8,
          created_at: '2024-04-12'
        },
        {
          id: 6,
          username: 'James Taylor',
          email: 'james.taylor@company.com',
          phone: '+49 151 6789 0123',
          role: 'employee',
          is_active: true,
          total_bookings: 15,
          created_at: '2024-05-08'
        },
        {
          id: 7,
          username: 'Anna Schmidt',
          email: 'anna.schmidt@company.com',
          phone: '+49 151 7890 1234',
          role: 'employee',
          is_active: true,
          total_bookings: 22,
          created_at: '2024-06-18'
        },
        {
          id: 8,
          username: 'Robert Garcia',
          email: 'robert.garcia@company.com',
          phone: '+49 151 8901 2345',
          role: 'employee',
          is_active: true,
          total_bookings: 19,
          created_at: '2024-07-22'
        }
      ];

      setUsers(mockUsers);
      setDepartment({
        name: 'Engineering Team',
        description: 'Software development and technical operations'
      });

      showToastMessage({
        type: 'warning',
        title: 'Using mock data',
        message: 'Could not connect to backend. Displaying sample data.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handlers for user operations
  const handleAddUser = () => {
    setDialogMode('create');
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleEditUser = (user) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleUserSubmit = async (userData) => {
    try {
      if (dialogMode === 'create') {
        const response = await createTeamUser(userData);
        showToastMessage({
          type: 'success',
          title: 'User created!',
          message: response.message || 'User has been created successfully.',
          duration: 5000
        });
      } else {
        const response = await updateTeamUser(selectedUser.id, userData);
        showToastMessage({
          type: 'success',
          title: 'User updated!',
          message: response.message || 'User has been updated successfully.',
          duration: 5000
        });
      }

      // Refresh users list
      await fetchUsers();

      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      showToastMessage({
        type: 'error',
        title: dialogMode === 'create' ? 'Failed to create user' : 'Failed to update user',
        message: error.message || 'An error occurred. Please try again.',
        duration: 5000
      });
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteTeamUser(userToDelete.id);
      showToastMessage({
        type: 'success',
        title: 'User deleted!',
        message: response.message || 'User has been deleted successfully.',
        duration: 5000
      });

      await fetchUsers();

      // Close the dialog
      setIsDeleteDialogOpen(false);
    } catch (error) {
      showToastMessage({
        type: 'error',
        title: 'Failed to delete user',
        message: error.message || 'An error occurred. Please try again.',
        duration: 5000
      });
      throw error;
    }
  };

  // Calculate stats - ensure users is always an array
  const usersList = Array.isArray(users) ? users : [];
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(u => u.is_active).length;
  const adminUsers = usersList.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
  const managerUsers = usersList.filter(u => u.role === 'manager').length;

  // Filter users
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-[#717182]">Loading users...</p>
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
            {department?.name || 'User Management'}
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            {department?.description || 'Manage user accounts and permissions.'}
          </p>
          {department && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border-2 border-black rounded-lg">
              <Users size={16} strokeWidth={2.5} className="text-blue-600" />
              <span className="text-sm font-bold text-black">
                {totalUsers} Team {totalUsers === 1 ? 'Member' : 'Members'}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleAddUser}
          className="px-6 py-3 bg-black text-white border-[3px] border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<Users size={24} strokeWidth={3} />}
          label="Total Users"
          value={totalUsers}
          description="Registered accounts"
          shadowColor="#000000"
        />
        <StatsCard
          icon={<Activity size={24} strokeWidth={3} />}
          label="Active Users"
          value={activeUsers}
          description="Currently active"
          shadowColor="#22C55E"
        />
        <StatsCard
          icon={<Shield size={24} strokeWidth={3} />}
          label="Administrators"
          value={adminUsers}
          description="Admin accounts"
          shadowColor="#8B5CF6"
        />
        <StatsCard
          icon={<Briefcase size={24} strokeWidth={3} />}
          label="Managers"
          value={managerUsers}
          description="Manager accounts"
          shadowColor="#3B82F6"
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
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-black placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-12 px-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-black focus:outline-none focus:ring-0 focus:bg-white transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-12 px-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-black focus:outline-none focus:ring-0 focus:bg-white transition-colors"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-[3px] border-black rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">User</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Email</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Phone</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Role</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Bookings</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Status</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-black">
                        <Search size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-black uppercase text-black">No users found</h3>
                      <p className="text-gray-500 font-medium">Try adjusting your filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleConfig = getRoleConfig(user.role);
                  const statusConfig = getStatusConfig(user.is_active ? 'active' : 'inactive');

                  return (
                    <tr key={user.id} className="hover:bg-yellow-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="font-bold text-black">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-600">{user.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-600">{user.phone || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-black ${roleConfig.bg} ${roleConfig.text} font-bold text-xs uppercase`}>
                          {roleConfig.icon}
                          <span>{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg border-2 border-black">
                          <BookMarked size={14} strokeWidth={2.5} className="text-black" />
                          <span className="font-bold text-black text-sm">{user.total_bookings || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border-2 border-black ${statusConfig.bg} ${statusConfig.text} font-bold text-xs uppercase`}>
                          {statusConfig.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-black hover:text-white"
                          >
                            <Edit2 size={16} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-[#e7000b] hover:text-white hover:border-[#e7000b]"
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

      {/* Dialogs */}
      <UserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleUserSubmit}
        mode={dialogMode}
        userData={selectedUser}
        isManager={true}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.username}? This action cannot be undone.`}
      />
    </div>
  );
}

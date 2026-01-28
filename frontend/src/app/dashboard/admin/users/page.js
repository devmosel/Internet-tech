'use client';

import { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser } from '@/services/userService';
import { Plus, Search, Edit2, Trash2, UserCircle2, Star, Circle, Users, Activity, Shield, Briefcase } from 'lucide-react';
import StatsCard from '@/component/StatsCard';
import UserDialog from '@/component/UserDialog';
import DeleteConfirmDialog from '@/component/DeleteConfirmDialog';
import { useToast } from '@/contexts/ToastContext';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Mock data for fallback
const mockUsers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@company.com',
    department: 'Engineering',
    role: 'user',
    bookings: 24,
    joinedDate: 'Jan 15, 2024',
    status: 'active'
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    department: 'Marketing',
    role: 'manager',
    bookings: 18,
    joinedDate: 'Feb 20, 2024',
    status: 'active'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    department: 'Sales',
    role: 'user',
    bookings: 31,
    joinedDate: 'Mar 10, 2024',
    status: 'active'
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    department: 'IT',
    role: 'admin',
    bookings: 12,
    joinedDate: 'Jan 5, 2024',
    status: 'active'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@company.com',
    department: 'Design',
    role: 'user',
    bookings: 8,
    joinedDate: 'Apr 12, 2024',
    status: 'inactive'
  },
  {
    id: 6,
    name: 'Lisa Anderson',
    email: 'lisa.anderson@company.com',
    department: 'HR',
    role: 'manager',
    bookings: 15,
    joinedDate: 'May 8, 2024',
    status: 'active'
  },
  {
    id: 7,
    name: 'Robert Garcia',
    email: 'robert.garcia@company.com',
    department: 'Finance',
    role: 'user',
    bookings: 22,
    joinedDate: 'Jun 18, 2024',
    status: 'active'
  },
  {
    id: 8,
    name: 'Jennifer Martinez',
    email: 'jennifer.martinez@company.com',
    department: 'Operations',
    role: 'user',
    bookings: 19,
    joinedDate: 'Jul 22, 2024',
    status: 'active'
  },
];

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

export default function UsersPage() {
  const { showToastMessage } = useToast();
  const [users, setUsers] = useState([]);
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
      const response = await getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Use mock data as fallback
      setUsers(mockUsers);
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
        const response = await createUser(userData);
        showToastMessage({
          type: 'success',
          title: 'User created!',
          message: response.message || 'User has been created successfully.',
          duration: 5000
        });
      } else {
        const response = await updateUser(selectedUser.id, userData);
        showToastMessage({
          type: 'success',
          title: 'User updated!',
          message: response.message || 'User has been updated successfully.',
          duration: 5000
        });
      }

      // Refresh users list
      await fetchUsers();
    } catch (error) {
      showToastMessage({
        type: 'error',
        title: dialogMode === 'create' ? 'Failed to create user' : 'Failed to update user',
        message: error.message || 'An error occurred. Please try again.',
        duration: 5000
      });
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await deleteUser(userToDelete.id);
      showToastMessage({
        type: 'success',
        title: 'User deleted!',
        message: response.message || 'User has been deleted successfully.',
        duration: 5000
      });

      // Refresh users list
      await fetchUsers();
    } catch (error) {
      showToastMessage({
        type: 'error',
        title: 'Failed to delete user',
        message: error.message || 'An error occurred. Please try again.',
        duration: 5000
      });
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.is_active).length;
  const adminUsers = users.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
  const managerUsers = users.filter(u => u.role === 'manager').length;

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });



  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-5xl font-black text-black tracking-widest uppercase mb-4" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
            User Management
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Manage user accounts and permissions.
          </p>
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
          label="Active"
          value={activeUsers}
          description="Currently active"
          shadowColor="#22C55E"
        />
        <StatsCard
          icon={<Shield size={24} strokeWidth={3} />}
          label="Admins"
          value={adminUsers}
          description="System administrators"
          shadowColor="#A855F7"
        />
        <StatsCard
          icon={<Briefcase size={24} strokeWidth={3} />}
          label="Managers"
          value={managerUsers}
          description="Team leads"
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
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-black placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-white transition-colors"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-12 px-4 bg-white border-2 border-black rounded-xl font-bold text-black focus:outline-none hover:bg-gray-50 cursor-pointer"
        >
          <option value="all">All Roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 px-4 bg-white border-2 border-black rounded-xl font-bold text-black focus:outline-none hover:bg-gray-50 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border-[3px] border-black rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 font-bold animate-pulse">Loading users...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-center">
            <div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                <Search size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-black uppercase text-black">No users found</h3>
              <p className="text-gray-500 font-medium">Try adjusting your filters.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">User</th>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Department</th>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Role</th>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Bookings</th>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Joined</th>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Status</th>
                  <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-100">
                {filteredUsers.map((user) => {
                  const roleConfig = getRoleConfig(user.role);
                  const statusConfig = getStatusConfig(user.is_active ? 'active' : 'inactive');

                  return (
                    <tr key={user.id} className="hover:bg-yellow-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white border-2 border-black flex items-center justify-center text-black font-bold flex-shrink-0 shadow-sm">
                            {user.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-black">{user.username || 'N/A'}</span>
                            <span className="text-xs font-medium text-gray-500">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {user.department_name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border-2 font-bold text-xs uppercase tracking-wide ${user.role === 'admin' || user.role === 'superadmin' ? 'bg-purple-100 border-purple-200 text-purple-700' :
                          user.role === 'manager' ? 'bg-blue-100 border-blue-200 text-blue-700' :
                            'bg-gray-100 border-gray-200 text-gray-700'
                          }`}>
                          {user.role}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold tabular-nums">
                        {user.total_bookings || 0}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-500 text-sm">
                        {user.created_at ? formatDate(user.created_at) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex px-3 py-1 rounded-full border-2 font-bold text-xs uppercase tracking-wide ${user.is_active
                          ? 'bg-green-100 border-green-200 text-green-700'
                          : 'bg-red-100 border-red-200 text-red-700'
                          }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-black hover:text-white"
                            title="Edit User"
                          >
                            <Edit2 size={16} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-[#e7000b] hover:text-white hover:border-[#e7000b]"
                            title="Delete User"
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

      {/* User Dialog */}
      <UserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        mode={dialogMode}
        userData={selectedUser}
        onSubmit={handleUserSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        userName={userToDelete?.username || ''}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

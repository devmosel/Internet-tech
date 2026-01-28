'use client';

import { useState, useEffect } from 'react';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '@/services/departmentService';
import { Plus, Search, Edit2, Trash2, Building2, Users, ChevronUp, ChevronDown, BarChart3 } from 'lucide-react';
import DepartmentDialog from '@/component/DepartmentDialog';
import DeleteConfirmDialog from '@/component/DeleteConfirmDialog';
import StatsCard from '@/component/StatsCard';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Dialog states
  const [isDepartmentDialogOpen, setIsDepartmentDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await getAllDepartments();

      if (response.success && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);

      // Use mock data as fallback
      const mockDepartments = [
        {
          id: 1,
          name: 'Engineering',
          manager_name: 'Emma Wilson',
          manager_email: 'emma.wilson@company.com',
          total_users: 24,
          description: 'Software development and technical operations',
          created_at: '2024-01-15'
        },
        {
          id: 2,
          name: 'Marketing',
          manager_name: 'Michael Chen',
          manager_email: 'michael.chen@company.com',
          total_users: 12,
          description: 'Brand management and digital marketing',
          created_at: '2024-02-10'
        },
        {
          id: 3,
          name: 'Sales',
          manager_name: 'Sarah Johnson',
          manager_email: 'sarah.johnson@company.com',
          total_users: 18,
          description: 'Business development and client relations',
          created_at: '2024-01-20'
        },
        {
          id: 4,
          name: 'Human Resources',
          manager_name: 'David Martinez',
          manager_email: 'david.martinez@company.com',
          total_users: 6,
          description: 'Talent acquisition and employee relations',
          created_at: '2024-03-05'
        },
        {
          id: 5,
          name: 'Finance',
          manager_name: 'Lisa Anderson',
          manager_email: 'lisa.anderson@company.com',
          total_users: 8,
          description: 'Financial planning and accounting',
          created_at: '2024-02-28'
        }
      ];

      setDepartments(mockDepartments);
    } finally {
      setLoading(false);
    }
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

  // Filter and sort departments
  const filteredAndSortedDepartments = departments
    .filter(dept =>
      dept.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.manager_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Calculate stats
  const stats = {
    totalDepartments: departments.length,
    totalEmployees: departments.reduce((sum, dept) => sum + (dept.total_users || 0), 0),
    avgPerDepartment: departments.length > 0
      ? Math.round(departments.reduce((sum, dept) => sum + (dept.total_users || 0), 0) / departments.length)
      : 0,
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Handle Add Department
  const handleAddDepartment = () => {
    setDialogMode('create');
    setSelectedDepartment(null);
    setIsDepartmentDialogOpen(true);
  };

  // Handle Edit Department
  const handleEditDepartment = (department) => {
    setDialogMode('edit');
    setSelectedDepartment(department);
    setIsDepartmentDialogOpen(true);
  };

  // Handle Delete Department
  const handleDeleteClick = (department) => {
    setDepartmentToDelete(department);
    setIsDeleteDialogOpen(true);
  };

  // Submit Department (Create or Update)
  const handleDepartmentSubmit = async (formData) => {
    try {
      if (dialogMode === 'create') {
        const response = await createDepartment(formData);
        if (response.success) {
          await fetchDepartments();
          setIsDepartmentDialogOpen(false);
        }
      } else {
        const response = await updateDepartment(selectedDepartment.id, formData);
        if (response.success) {
          await fetchDepartments();
          setIsDepartmentDialogOpen(false);
        }
      }
    } catch (error) {
      console.error('Error submitting department:', error);
      throw error;
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    try {
      const response = await deleteDepartment(departmentToDelete.id);
      if (response.success) {
        await fetchDepartments();
        setIsDeleteDialogOpen(false);
        setDepartmentToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-[#717182]">Loading departments...</p>
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
            Departments
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Manage organizational departments and teams.
          </p>
        </div>
        <button
          onClick={handleAddDepartment}
          className="px-6 py-3 bg-black text-white border-[3px] border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={3} />
          <span>Add Department</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          icon={<Building2 size={24} strokeWidth={3} />}
          label="Total Departments"
          value={stats.totalDepartments}
          description="Active teams"
          shadowColor="#000000"
        />
        <StatsCard
          icon={<Users size={24} strokeWidth={3} />}
          label="Total Employees"
          value={stats.totalEmployees}
          description="Across organisation"
          shadowColor="#22C55E"
        />
        <StatsCard
          icon={<BarChart3 size={24} strokeWidth={3} />}
          label="Avg. Size"
          value={stats.avgPerDepartment}
          description="Employees per department"
          shadowColor="#F97316"
        />
      </div>

      {/* Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex-1 relative w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-black placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-[3px] border-black rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black text-white">
              <tr>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Department</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Manager</th>
                <th
                  className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm cursor-pointer hover:text-yellow-400 transition-colors"
                  onClick={() => handleSort('total_employees')}
                >
                  <div className="flex items-center gap-1">
                    Employees
                    {sortField === 'total_employees' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Description</th>
                <th
                  className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm cursor-pointer hover:text-yellow-400 transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    Created
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {filteredAndSortedDepartments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-black">
                        <Search size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-black uppercase text-black">No departments found</h3>
                      <p className="text-gray-500 font-medium">{searchQuery ? 'Try adjusting your search.' : 'Get started by creating a new department.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedDepartments.map((dept, index) => (
                  <tr
                    key={dept.id || index}
                    className="hover:bg-yellow-50/50 transition-colors group"
                  >
                    {/* Department Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
                          <Building2 size={20} className="text-black" strokeWidth={2} />
                        </div>
                        <span className="font-bold text-black text-base">
                          {dept.name}
                        </span>
                      </div>
                    </td>

                    {/* Manager */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-black text-sm">
                          {dept.manager_name || 'Not assigned'}
                        </span>
                        {dept.manager_email && (
                          <span className="text-xs font-medium text-gray-500">
                            {dept.manager_email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Employees */}
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-none transition-all">
                        <Users size={14} className="text-black" strokeWidth={2.5} />
                        <span className="font-bold text-black text-sm">
                          {dept.total_users || 0}
                        </span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4">
                      <div className="max-w-[250px]">
                        <p className="text-sm font-medium text-gray-500 truncate">
                          {dept.description || 'No description'}
                        </p>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 font-mono text-xs font-medium text-gray-500">
                        {formatDate(dept.created_at)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditDepartment(dept)}
                          className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-black hover:text-white"
                          title="Edit"
                        >
                          <Edit2 size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(dept)}
                          className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-[#e7000b] hover:text-white hover:border-[#e7000b]"
                          title="Delete"
                        >
                          <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Dialog */}
      <DepartmentDialog
        isOpen={isDepartmentDialogOpen}
        onClose={() => setIsDepartmentDialogOpen(false)}
        mode={dialogMode}
        departmentData={selectedDepartment}
        onSubmit={handleDepartmentSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        message={`Are you sure to delete this department?`}
      />
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, ClipboardList, Calendar, Users, Edit2, Trash2, CheckCircle, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import StatsCard from '@/component/StatsCard';
import AssignmentDialog from '@/component/AssignmentDialog';
import TaskDialog from '@/component/TaskDialog';
import { getAllAssignments, createAssignment, updateAssignment, deleteAssignment } from '@/services/assignmentService';
import { getTasksByAssignment, createTask, updateTask, deleteTask } from '@/services/taskService';
import { getTeamUsers } from '@/services/userService';
import { useToast } from '@/contexts/ToastContext';
import DeleteConfirmDialog from '@/component/DeleteConfirmDialog';

export default function ManagerAssignmentsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'completed'
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [assignmentToEdit, setAssignmentToEdit] = useState(null);
    const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);
    const [assignmentTasks, setAssignmentTasks] = useState({});
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [currentAssignmentForTask, setCurrentAssignmentForTask] = useState(null);
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [assignmentToDelete, setAssignmentToDelete] = useState(null);
    const { showToastMessage } = useToast();

    // Fetch assignments and users on mount
    useEffect(() => {
        fetchAssignments();
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await getTeamUsers();
            if (response.success) {
                // Extract users array from the response
                setUsers(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await getAllAssignments();
            if (response.success) {
                setAssignments(response.data || []);
            }
        } catch (error) {
            showToastMessage({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to fetch assignments',
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAssignment = async () => {
        if (!assignmentToDelete) return;

        try {
            await deleteAssignment(assignmentToDelete.id);
            showToastMessage({
                type: 'success',
                title: 'Success',
                message: 'Assignment deleted successfully',
                duration: 3000
            });
            fetchAssignments();
        } catch (error) {
            showToastMessage({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to delete assignment',
                duration: 5000
            });
        } finally {
            setDeleteDialogOpen(false);
            setAssignmentToDelete(null);
        }
    };

    const handleCreateAssignment = async (formData) => {
        try {
            const response = await createAssignment(formData);
            showToastMessage({
                type: 'success',
                title: 'Success',
                message: 'Assignment created successfully',
                duration: 3000
            });
            fetchAssignments();
            setIsCreateModalOpen(false);
        } catch (error) {
            showToastMessage({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to create assignment',
                duration: 5000
            });
            throw error;
        }
    };

    const handleEditAssignment = async (formData) => {
        if (!assignmentToEdit) return;

        try {
            const response = await updateAssignment(assignmentToEdit.id, formData);
            showToastMessage({
                type: 'success',
                title: 'Success',
                message: 'Assignment updated successfully',
                duration: 3000
            });
            fetchAssignments();
            setIsEditModalOpen(false);
            setAssignmentToEdit(null);
        } catch (error) {
            showToastMessage({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to update assignment',
                duration: 5000
            });
            throw error;
        }
    };

    const fetchAssignmentTasks = async (assignmentId) => {
        console.log('Fetching tasks for assignment:', assignmentId);
        try {
            const response = await getTasksByAssignment(assignmentId);
            console.log('Tasks response:', response);
            if (response.success) {
                setAssignmentTasks(prev => ({
                    ...prev,
                    [assignmentId]: response.data
                }));
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            showToastMessage({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to fetch tasks',
                duration: 3000
            });
        }
    };

    const handleToggleExpand = (assignmentId) => {
        console.log('Toggle expand for assignment:', assignmentId);
        console.log('Current expanded ID:', expandedAssignmentId);
        console.log('Current tasks cache:', assignmentTasks);
        
        const newExpandedId = expandedAssignmentId === assignmentId ? null : assignmentId;
        setExpandedAssignmentId(newExpandedId);
        
        // Fetch tasks when expanding if not already loaded
        if (newExpandedId && !assignmentTasks[assignmentId]) {
            console.log('Fetching tasks...');
            fetchAssignmentTasks(assignmentId);
        } else {
            console.log('Not fetching - either collapsing or tasks already loaded');
        }
    };

    const handleCreateTask = async (taskData) => {
        if (!currentAssignmentForTask) return;

        try {
            await createTask(currentAssignmentForTask, taskData);
            showToastMessage({
                type: 'success',
                title: 'Success',
                message: 'Task created successfully',
                duration: 3000
            });
            // Refresh tasks for this assignment
            fetchAssignmentTasks(currentAssignmentForTask);
            setIsTaskDialogOpen(false);
            setCurrentAssignmentForTask(null);
        } catch (error) {
            showToastMessage({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to create task',
                duration: 5000
            });
            throw error;
        }
    };

    const handleEditTask = async (taskData) => {
        if (!taskToEdit) return;

        try {
            await updateTask(taskToEdit.id, taskData);
            showToastMessage({
                type: 'success',
                title: 'Success',
                message: 'Task updated successfully',
                duration: 3000
            });
            // Refresh tasks for the assignment
            fetchAssignmentTasks(taskToEdit.assignment_id);
            setIsEditTaskDialogOpen(false);
            setTaskToEdit(null);
        } catch (error) {
            showToastMessage({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to update task',
                duration: 5000
            });
            throw error;
        }
    };

    const handleToggleTaskDone = async (task, assignmentId) => {
        try {
            await updateTask(task.id, {
                title: task.title,
                priority: task.priority,
                user_id: task.user_id,
                is_done: !task.is_done
            });
            // Refresh tasks for this assignment
            fetchAssignmentTasks(assignmentId);
        } catch (error) {
            showToastMessage({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to update task',
                duration: 3000
            });
        }
    };

    const handleDeleteTask = async () => {
        if (!taskToDelete) return;

        try {
            await deleteTask(taskToDelete.task.id);
            showToastMessage({
                type: 'success',
                title: 'Success',
                message: 'Task deleted successfully',
                duration: 3000
            });
            // Refresh tasks for the assignment
            fetchAssignmentTasks(taskToDelete.assignmentId);
        } catch (error) {
            showToastMessage({
                type: 'error',
                title: 'Error',
                message: error.message || 'Failed to delete task',
                duration: 5000
            });
        } finally {
            setDeleteTaskDialogOpen(false);
            setTaskToDelete(null);
        }
    };

    // Calculate stats from assignments
    const stats = {
        totalAssignments: assignments.length,
        activeAssignments: assignments.filter(a => a.task_done < a.task_count).length,
        completedAssignments: assignments.filter(a => a.task_done === a.task_count).length,
        departments: [...new Set(assignments.map(a => a.department_name))].length
    };

    const getProgressStatus = (taskDone, taskCount) => {
        if (taskCount === 0) return 'empty';
        if (taskDone === taskCount) return 'completed';
        if (taskDone > 0) return 'in_progress';
        return 'not_started';
    };

    const getStatusConfig = (taskDone, taskCount) => {
        const status = getProgressStatus(taskDone, taskCount);
        const configs = {
            completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'COMPLETED' },
            in_progress: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'ACTIVE' },
            not_started: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'PENDING' },
            empty: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'NO TASKS' }
        };
        return configs[status] || configs.not_started;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    const filteredAssignments = assignments.filter(assignment => {
        const matchesSearch =
            assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assignment.department_name?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const status = getProgressStatus(assignment.task_done, assignment.task_count);
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'completed' && status === 'completed') ||
            (statusFilter === 'active' && status !== 'completed');
        
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex flex-col gap-8 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-5xl font-black text-black tracking-tighter uppercase mb-2" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
                        Assignments
                    </h1>
                    <p className="text-lg text-gray-500 font-medium">
                        Create and manage team assignments.
                    </p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 bg-black text-white border-[3px] border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all flex items-center gap-2"
                >
                    <Plus size={20} strokeWidth={3} />
                    <span>New Assignment</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    icon={<ClipboardList size={24} strokeWidth={3} />}
                    label="Total Assignments"
                    value={loading ? '...' : stats.totalAssignments}
                    description="All assignments"
                    shadowColor="#000000"
                />
                <StatsCard
                    icon={<Users size={24} strokeWidth={3} />}
                    label="Active Assignments"
                    value={loading ? '...' : stats.activeAssignments}
                    description="In progress"
                    shadowColor="#F59E0B"
                />
                <StatsCard
                    icon={<CheckCircle size={24} strokeWidth={3} />}
                    label="Completed"
                    value={loading ? '...' : stats.completedAssignments}
                    description="Finished"
                    shadowColor="#22C55E"
                />
                <StatsCard
                    icon={<Calendar size={24} strokeWidth={3} />}
                    label="Departments"
                    value={loading ? '...' : stats.departments}
                    description="Involved departments"
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
                        placeholder="Search assignments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-black placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-white transition-colors"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-12 px-4 bg-gray-50 border-2 border-black rounded-xl font-bold text-black focus:outline-none focus:ring-0 focus:bg-white transition-colors"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Assignments List */}
            <div className="flex flex-col gap-4">
                {loading ? (
                    // Loading state
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white border-[3px] border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                                <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredAssignments.length === 0 ? (
                    <div className="bg-white border-[3px] border-black rounded-2xl p-12 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-black mx-auto">
                            <Search size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-black uppercase text-black">No assignments found</h3>
                        <p className="text-gray-500 font-medium">Try adjusting your search or create a new assignment.</p>
                    </div>
                ) : (
                    filteredAssignments.map((assignment) => {
                        const statusConfig = getStatusConfig(assignment.task_done, assignment.task_count);
                        const completionPercentage = assignment.task_count > 0 
                            ? Math.round((assignment.task_done / assignment.task_count) * 100) 
                            : 0;
                        const isExpanded = expandedAssignmentId === assignment.id;
                        const overdueStatus = isOverdue(assignment.due_date);

                        return (
                            <div
                                key={assignment.id}
                                className={`bg-white border-[3px] border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${isExpanded ? 'translate-y-[-2px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]' : ''}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 cursor-pointer" onClick={() => handleToggleExpand(assignment.id)}>
                                        {/* Header */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="p-2 bg-purple-100 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                <ClipboardList size={20} className="text-purple-600" strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    <h3 className="text-xl font-black text-black">{assignment.title}</h3>
                                                </div>
                                                <p className="text-gray-600 font-medium text-sm mb-3">{assignment.description}</p>

                                                {/* Progress Bar */}
                                                <div className="mb-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-bold text-gray-600 uppercase">Task Progress</span>
                                                        <span className="text-xs font-black text-black">{assignment.task_done}/{assignment.task_count} tasks • {completionPercentage}%</span>
                                                    </div>
                                                    <div className="w-full h-3 bg-gray-100 border-2 border-black rounded-lg overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-300 ${
                                                                completionPercentage === 100 
                                                                    ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                                                    : 'bg-gradient-to-r from-purple-500 to-purple-600'
                                                            }`}
                                                            style={{ width: `${completionPercentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-6 text-sm font-medium text-gray-500 flex-wrap">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} strokeWidth={2.5} />
                                                <span>Created: {formatDate(assignment.created_at)}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users size={14} strokeWidth={2.5} />
                                                <span>{assignment.creator_name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-bold text-xs">
                                                    {assignment.department_name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 font-bold text-blue-600">
                                                <Calendar size={14} strokeWidth={2.5} />
                                                <span>Due: {formatDateTime(assignment.due_date)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions & Expand Toggle */}
                                    <div className="flex flex-col gap-2 items-end">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAssignmentToEdit(assignment);
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-black hover:text-white"
                                            >
                                                <Edit2 size={16} strokeWidth={2.5} />
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAssignmentToDelete(assignment);
                                                    setDeleteDialogOpen(true);
                                                }}
                                                className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-[#e7000b] hover:text-white hover:border-[#e7000b]"
                                            >
                                                <Trash2 size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => handleToggleExpand(assignment.id)}
                                            className="mt-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            {isExpanded ? <ChevronUp size={24} strokeWidth={2.5} /> : <ChevronDown size={24} strokeWidth={2.5} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details - Task List */}
                                {isExpanded && (
                                    <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200">
                                        {!assignmentTasks[assignment.id] ? (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                            </div>
                                        ) : assignmentTasks[assignment.id].tasks?.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-8 gap-4">
                                                <p className="text-sm text-gray-500 font-medium">
                                                    No tasks found for this assignment
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        setCurrentAssignmentForTask(assignment.id);
                                                        setIsTaskDialogOpen(true);
                                                    }}
                                                    className="px-4 py-2 bg-black text-white border-2 border-black rounded-lg font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all flex items-center gap-2"
                                                >
                                                    <Plus size={16} strokeWidth={3} />
                                                    <span>Add Task</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-sm font-bold uppercase tracking-wider text-gray-600">
                                                        Task Breakdown
                                                    </h4>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-gray-500">
                                                            {assignmentTasks[assignment.id].completed_tasks}/{assignmentTasks[assignment.id].total_tasks} completed
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                setCurrentAssignmentForTask(assignment.id);
                                                                setIsTaskDialogOpen(true);
                                                            }}
                                                            className="p-1.5 bg-black text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all"
                                                            title="Add Task"
                                                        >
                                                            <Plus size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </div>
                                                {assignmentTasks[assignment.id].tasks?.map((task) => {
                                                    const priorityColors = {
                                                        high: 'bg-red-100 text-red-700 border-red-300',
                                                        medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                                                        low: 'bg-green-100 text-green-700 border-green-300'
                                                    };
                                                    
                                                    return (
                                                        <div 
                                                            key={task.id}
                                                            className="flex items-start gap-3 p-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-black transition-colors cursor-pointer"
                                                            onClick={() => {
                                                                setTaskToEdit(task);
                                                                setIsEditTaskDialogOpen(true);
                                                            }}
                                                        >
                                                            {/* Checkbox */}
                                                            <div className="flex-shrink-0 mt-0.5">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleToggleTaskDone(task, assignment.id);
                                                                    }}
                                                                    className={`w-5 h-5 border-2 border-black rounded flex items-center justify-center hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                                                                        task.is_done ? 'bg-black' : 'bg-white'
                                                                    }`}
                                                                >
                                                                    {task.is_done && (
                                                                        <svg className="w-3 h-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path d="M5 13l4 4L19 7"></path>
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                            </div>
                                                            
                                                            {/* Task Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                                    <p className={`font-bold text-sm ${
                                                                        task.is_done ? 'text-gray-400 line-through' : 'text-black'
                                                                    }`}>
                                                                        {task.title}
                                                                    </p>
                                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                                        <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded border ${
                                                                            priorityColors[task.priority] || 'bg-gray-100 text-gray-700 border-gray-300'
                                                                        }`}>
                                                                            {task.priority}
                                                                        </span>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setTaskToDelete({ task, assignmentId: assignment.id });
                                                                                setDeleteTaskDialogOpen(true);
                                                                            }}
                                                                            className="p-1 bg-white text-black border-2 border-black rounded hover:bg-[#e7000b] hover:text-white hover:border-[#e7000b] transition-all"
                                                                            title="Delete task"
                                                                        >
                                                                            <Trash2 size={14} strokeWidth={2.5} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
                                                                    <span className="flex items-center gap-1">
                                                                        <Users size={12} strokeWidth={2.5} />
                                                                        {task.user_name}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>{formatDate(task.created_at)}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={deleteDialogOpen}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setAssignmentToDelete(null);
                }}
                onConfirm={handleDeleteAssignment}
                title="Delete Assignment"
                message={`Are you sure you want to delete "${assignmentToDelete?.title}"? This action cannot be undone.`}
            />

            {/* Create Assignment Dialog */}
            <AssignmentDialog
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                mode="create"
                onSubmit={handleCreateAssignment}
            />

            {/* Edit Assignment Dialog */}
            <AssignmentDialog
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setAssignmentToEdit(null);
                }}
                mode="edit"
                assignmentData={assignmentToEdit}
                onSubmit={handleEditAssignment}
            />

            {/* Task Dialog */}
            <TaskDialog
                isOpen={isTaskDialogOpen}
                onClose={() => {
                    setIsTaskDialogOpen(false);
                    setCurrentAssignmentForTask(null);
                }}
                onSubmit={handleCreateTask}
                assignmentId={currentAssignmentForTask}
                users={users}
                mode="create"
            />

            {/* Edit Task Dialog */}
            <TaskDialog
                isOpen={isEditTaskDialogOpen}
                onClose={() => {
                    setIsEditTaskDialogOpen(false);
                    setTaskToEdit(null);
                }}
                onSubmit={handleEditTask}
                assignmentId={taskToEdit?.assignment_id}
                users={users}
                mode="edit"
                taskData={taskToEdit}
            />

            {/* Delete Task Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={deleteTaskDialogOpen}
                onClose={() => {
                    setDeleteTaskDialogOpen(false);
                    setTaskToDelete(null);
                }}
                onConfirm={handleDeleteTask}
                title="Delete Task"
                message={`Are you sure you want to delete "${taskToDelete?.task?.title}"? This action cannot be undone.`}
            />
        </div>
    );
}

'use client';

import { useState, useRef } from 'react';
import StatsCard from '@/component/StatsCard';
import CheckInTimer from '@/component/CheckInTimer';
import { useAuth } from '@/lib/useAuth';
import { useCurrentUser, useDashboardStats, useUserBookings } from '@/hooks';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useToast } from '@/contexts/ToastContext';
import { getUserDisplayName } from '@/utils/user';
import { useRouter } from 'next/navigation';
import { Activity, Calendar, Clock, MapPin } from 'lucide-react';
import { updateTask } from '@/services/taskService';
import dynamic from 'next/dynamic';

// Dynamically import Pomodoro to prevent SSR issues
const PomodoroOverlay = dynamic(() => import('@/component/PomodoroOverlay'), { ssr: false });

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentUser } = useCurrentUser();
  const { showToastMessage } = useToast();
  const router = useRouter();
  const pomodoroButtonRef = useRef(null);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [pomodoroPosition, setPomodoroPosition] = useState({ x: 50, y: 50 });

  const { data: response, isLoading: loading, error, refetch } = useDashboardStats();
  const stats = response?.data;

  // Get real data from API with WebSocket for announcements
  const { announcements, isConnected: wsConnected, hasNewAnnouncement } = useAnnouncements(stats?.announcements || []);
  const todoTasks = (stats?.todo_list?.tasks || []).sort((a, b) => a.task_id - b.task_id);
  const incompleteTasks = todoTasks.filter(task => !task.is_done);

  // Get user's bookings to check for active check-in
  const { data: bookingsResponse } = useUserBookings();
  const bookingsData = bookingsResponse?.data || [];
  const checkedInBooking = bookingsData.find(booking => booking.status === 'checkin');

  // Handle task completion toggle
  const handleTaskToggle = async (task) => {
    try {
      await updateTask(task.task_id, {
        is_done: !task.is_done
      });
      
      // Refetch dashboard stats to get updated tasks
      refetch();
      
      showToastMessage({
        type: 'success',
        title: task.is_done ? 'Task Uncompleted' : 'Task Completed!',
        message: task.is_done ? `"${task.task_title}" marked as incomplete` : `"${task.task_title}" marked as complete`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error toggling task:', error);
      showToastMessage({
        type: 'error',
        title: 'Error',
        message: 'Failed to update task',
        duration: 3000
      });
    }
  };

  // Helper function to format relative time
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // Helper function to format due date
  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const day = date.getDate();
    const ordinal = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    const formatted = `${monthNames[date.getMonth()]} ${day}${ordinal}`;
    
    if (diffDays < 0) return { text: formatted, color: 'text-red-600', bg: 'bg-red-50', status: 'OVERDUE' };
    if (diffDays === 0) return { text: 'Today', color: 'text-orange-600', bg: 'bg-orange-50', status: 'TODAY' };
    if (diffDays === 1) return { text: 'Tomorrow', color: 'text-yellow-600', bg: 'bg-yellow-50', status: null };
    if (diffDays <= 3) return { text: formatted, color: 'text-yellow-600', bg: 'bg-yellow-50', status: null };
    if (diffDays <= 7) return { text: formatted, color: 'text-blue-600', bg: 'bg-blue-50', status: null };
    return { text: formatted, color: 'text-gray-600', bg: 'bg-gray-50', status: null };
  };

  // Helper function to get department color
  const getDepartmentColor = (departmentName) => {
    if (!departmentName) return 'bg-gray-500';
    
    const colors = {
      'HR': 'bg-blue-500',
      'IT': 'bg-cyan-500',
      'Engineering': 'bg-green-500',
      'Marketing': 'bg-pink-500',
      'Sales': 'bg-orange-500',
      'Finance': 'bg-yellow-500',
      'Operations': 'bg-purple-500',
      'Support': 'bg-indigo-500',
      'Admin': 'bg-red-500',
      'Management': 'bg-emerald-500',
    };
    
    // Return matched color or generate consistent color based on string
    if (colors[departmentName]) {
      return colors[departmentName];
    }
    
    // Generate consistent color for unknown departments
    const colorOptions = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-cyan-500'];
    const index = departmentName.charCodeAt(0) % colorOptions.length;
    return colorOptions[index];
  };

  // Helper function to get announcement priority
  const getAnnouncementPriority = (index) => {
    if (index === 0) return 'high';
    if (index <= 2) return 'medium';
    return 'low';
  };

  if (error) {
    showToastMessage({
      type: 'error',
      title: 'Error',
      message: error.message || 'Failed to load statistics',
      duration: 5000
    });
  }

  return (
    <div className="min-h-full px-4 sm:px-6 md:px-8 py-8 md:py-10 bg-[#FFFEF8]" style={{ backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)', backgroundSize: '24px 24px' }}>

      <div className="relative z-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-gray-500 font-medium mb-1 pl-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>
              Good morning, <span className="text-gray-400 font-bold">{getUserDisplayName(user).split(' ')[0]}</span>
            </h1>
          </div>

          <div className="flex gap-3">
            {/* Check-in Timer - shown when user is checked in */}
            {checkedInBooking && <CheckInTimer booking={checkedInBooking} />}
            <button
              ref={pomodoroButtonRef}
              onClick={(e) => {
                const buttonElement = e.currentTarget;
                const rect = buttonElement.getBoundingClientRect();
                const xPercent = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
                const yPercent = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
                setPomodoroPosition({ x: xPercent, y: yPercent });
                setShowPomodoro(true);
              }}
              className="group relative px-6 py-3 bg-black text-white rounded-xl font-bold text-base overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none border-2 border-black"
            >
              <span className="relative z-10 flex items-center gap-2">
                ⏱️ Pomodoro Timer
              </span>
            </button>
          </div>
        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Left Column: Stats & Schedule (8/12) */}
          <div className="xl:col-span-8 flex flex-col gap-8">

            {/* Announcements - Bulletin Board Style */}
            <div className="bg-[#D4A574] rounded-3xl p-8 border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
              {/* Cork texture overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
                backgroundImage: 'radial-gradient(circle at 20% 50%, transparent 0%, rgba(139, 90, 43, 0.3) 100%)',
                mixBlendMode: 'multiply'
              }} />
              
              <div className="mb-6 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white border-2 border-black px-4 py-2 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -rotate-1">
                      <h2 className="text-2xl font-black text-black tracking-tight uppercase" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>📌 Notice Board</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-xs font-bold text-black uppercase tracking-wide">
                      {wsConnected ? 'LIVE' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {announcements.length > 0 ? (
                  announcements.slice(0, 4).map((announcement, idx) => {
                    const priority = getAnnouncementPriority(idx);
                    const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'];
                    const colors = ['bg-yellow-100', 'bg-blue-100', 'bg-pink-100', 'bg-green-100'];
                    const rotation = rotations[idx % rotations.length];
                    const bgColor = colors[idx % colors.length];
                    
                    return (
                      <div 
                        key={announcement.id} 
                        className={`${bgColor} rounded-lg p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all cursor-pointer group relative ${rotation}`}
                      >
                        {/* Pushpin */}
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full border-2 border-black shadow-lg z-20" />
                        
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {announcement.department_name && (
                              <span className={`px-2 py-0.5 ${getDepartmentColor(announcement.department_name)} text-white text-[9px] font-bold uppercase rounded border-2 border-black`}>{announcement.department_name}</span>
                            )}
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{getRelativeTime(announcement.created_at)}</span>
                          </div>
                          <h3 className="font-black text-base text-black leading-tight uppercase" style={{ fontFamily: 'Tanker-Regular, sans-serif' }}>{announcement.title}</h3>
                          <p className="text-xs font-medium text-gray-700 leading-relaxed line-clamp-2">{announcement.description}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-[10px] font-bold text-gray-500">by {announcement.creator_name}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 bg-white rounded-lg p-8 text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-black/50 font-bold uppercase tracking-wide">No notices posted yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {loading ? (
                [1, 2].map(i => <div key={i} className="h-40 bg-white rounded-3xl animate-pulse border-2 border-black" />)
              ) : (
                <>
                  <StatsCard
                    icon={<Clock size={24} strokeWidth={3} />}
                    label="Weekly Focus"
                    value={stats?.weekly_booking_hours.toFixed(1)}
                    description="Hours dedicated this week"
                    shadowColor="#A855F7" // Purple
                  />
                  <StatsCard
                    icon={<MapPin size={24} strokeWidth={3} />}
                    label="Go-To Space"
                    value={stats?.favorite_space ? stats.favorite_space.space_name : 'Explore'}
                    description={stats?.favorite_space ? `Most visited (${stats.favorite_space.booking_count})` : 'Find your favorite spot'}
                    shadowColor="#F97316" // Orange
                  />
                </>
              )}
            </div>

            {/* Mini-Promo Canvas - Artsy Style */}
            <div className="bg-[#1D1D1F] rounded-[24px] p-6 text-white relative overflow-hidden min-h-[200px] flex flex-col justify-end group cursor-pointer border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" onClick={() => router.push('/dashboard/booking')}>
              <img src="https://images.unsplash.com/photo-1519752594763-2633d8d4ea29?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" alt="Workspace" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

              <div className="relative z-20 transform group-hover:translate-x-1 transition-transform">
                <span className="inline-block px-2 py-1 bg-yellow-400 text-black text-xs font-black uppercase tracking-wider mb-2 border border-black transform -rotate-2">Featured Space</span>
                <h3 className="text-3xl font-black mb-1">THE STUDIO</h3>
                <p className="text-gray-300 text-sm font-medium">For the makers & creators.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Timeline & Activity (4/12) */}
          <div className="xl:col-span-4 flex flex-col">

            {/* Today's Schedule - Notebook Style */}
            <div className="bg-[#FFFDF5] rounded-[24px] border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex-1 overflow-hidden flex flex-col relative px-8 py-10"
              style={{
                backgroundImage: `linear-gradient(#E5E7EB 1px, transparent 1px)`,
                backgroundSize: '100% 32px',
                backgroundPosition: '0 24px' // Align lines
              }}>

              <div className="pl-6 relative z-10 flex-1 flex flex-col">
                {/* Title */}
                <h2 className="text-3xl font-black text-black border-b-4 border-yellow-300 text-center pb-2" style={{ marginBottom: '40px' }}>ASSIGNMENTS</h2>

                {loading ? (
                  <div className="flex flex-col gap-[64px]">
                    {[1, 2, 3].map(i => <div key={i} className="h-8 bg-black/5 rounded-lg animate-pulse" />)}
                  </div>
                ) : (todoTasks.length > 0 ? (
                  <div className="flex flex-col">
                    {/* Group tasks by assignment */}
                    {Object.entries(
                      todoTasks.reduce((groups, task) => {
                        const assignmentTitle = task.assignment_title || 'Other';
                        if (!groups[assignmentTitle]) {
                          groups[assignmentTitle] = [];
                        }
                        groups[assignmentTitle].push(task);
                        return groups;
                      }, {})
                    ).map(([assignmentTitle, tasks]) => {
                      // Get the assignment due date from the first task
                      const assignmentDueDate = tasks[0]?.assignment_due_date;
                      const dueDateInfo = assignmentDueDate ? formatDueDate(assignmentDueDate) : null;
                      
                      return (
                      <div key={assignmentTitle} className="mb-8">
                        {/* Assignment Header */}
                        <div className="flex items-start gap-2 mb-4">
                          <div className="w-4 h-4 rounded-full bg-[#1a1a1a] shadow-inner flex-shrink-0 mt-1" style={{ marginLeft: '-16px' }} />
                          <div className="flex-1">
                            {dueDateInfo && (
                              <span className="inline-block text-[10px] font-bold text-gray-600 mb-2 uppercase tracking-wider">
                                Due {dueDateInfo.text}
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-base text-black">
                                {assignmentTitle}
                              </h3>
                              <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-md">
                                {tasks.length}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Tasks under this assignment */}
                        <div className="flex flex-col pl-8">
                          {tasks.map((task) => {
                            const priorityColor = task.task_priority === 'high' ? 'bg-red-400 border-red-600 text-white' : task.task_priority === 'medium' ? 'bg-yellow-300 border-yellow-500' : 'bg-gray-400 border-gray-600 text-white';
                            
                            return (
                              <div key={task.task_id} className="relative group flex items-start gap-4 mb-4" style={{ minHeight: '32px' }}>
                                <button
                                  onClick={() => handleTaskToggle(task)}
                                  className={`w-6 h-6 border-2 border-black rounded-md flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-110 transition-transform ${task.is_done ? 'bg-green-400' : 'bg-white hover:bg-gray-100'}`}
                                >
                                  {task.is_done && <span className="text-black font-bold">✓</span>}
                                </button>

                                <div className={`flex-1 transition-all ${task.is_done ? 'opacity-50 line-through decoration-black decoration-2' : ''}`}>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-base text-black">{task.task_title}</h4>
                                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded ${priorityColor} border border-black/20`}>
                                      {task.task_priority}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center mt-10">
                    <div className="w-24 h-24 border-[3px] border-black rounded-full flex items-center justify-center mb-4 text-4xl bg-white">✨</div>
                    <p className="font-bold text-xl text-black">Nothing scheduled!</p>
                    <p className="text-base text-gray-500 font-medium">Time to create something new.</p>
                    <button onClick={() => router.push('/dashboard/booking')} className="mt-6 px-6 py-2 bg-blue-500 text-white font-bold rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition-all">
                      Book a spot
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Pomodoro Overlay - renders on top without unmounting dashboard */}
      {showPomodoro && (
        <PomodoroOverlay
          position={pomodoroPosition}
          onClose={() => setShowPomodoro(false)}
        />
      )}
    </div>
  );
}

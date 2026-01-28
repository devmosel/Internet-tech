'use client';

import { useState, useEffect } from 'react';
import { getAllFloors } from '@/services';
import { Plus, Layers, Grid3x3, CheckCircle, TrendingUp, Search, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import StatsCard from '@/component/StatsCard';

export default function AdminFloorsPage() {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchFloors();
  }, []);

  const fetchFloors = async () => {
    try {
      setLoading(true);
      const response = await getAllFloors();
      if (response.success) {
        setFloors(response.data);
      }
    } catch (error) {
      console.error('Error fetching floors:', error);

      // Use mock data as fallback
      const mockFloors = [
        { id: 1, name: 'Floor 1', total_spaces: 15 },
        { id: 2, name: 'Floor 2', total_spaces: 18 },
        { id: 3, name: 'Floor 3', total_spaces: 22 },
        { id: 4, name: 'Floor 4', total_spaces: 12 }
      ];

      setFloors(mockFloors);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    totalFloors: floors.length,
    totalSpaces: floors.reduce((sum, floor) => sum + (floor.total_spaces || 0), 0),
    // Mock data for available and occupancy since API doesn't provide it
    available: 50,
    occupancy: '72%'
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

  // Filter and sort floors
  const filteredAndSortedFloors = floors
    .filter(floor => floor.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-[#717182]">Loading floors...</p>
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
            Floors
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Manage building floors and capacity.
          </p>
        </div>
        <button className="px-6 py-3 bg-black text-white border-[3px] border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all flex items-center gap-2">
          <Plus size={20} strokeWidth={3} />
          <span>Add Floor</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          icon={<Layers size={24} strokeWidth={3} />}
          label="Total Floors"
          value={stats.totalFloors}
          description="Active levels"
          shadowColor="#000000"
        />
        <StatsCard
          icon={<Grid3x3 size={24} strokeWidth={3} />}
          label="Total Spaces"
          value={stats.totalSpaces}
          description="Workspaces across floors"
          shadowColor="#8B5CF6"
        />
        <StatsCard
          icon={<CheckCircle size={24} strokeWidth={3} />}
          label="Available"
          value={stats.available}
          description="Free workspaces"
          shadowColor="#22C55E"
        />
        <StatsCard
          icon={<TrendingUp size={24} strokeWidth={3} />}
          label="Occupancy"
          value={stats.occupancy}
          description="Current utilization"
          shadowColor="#F59E0B"
        />
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 border-[3px] border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex-1 relative w-full">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            placeholder="Search floors..."
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
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Floor</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Building</th>
                <th
                  className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm cursor-pointer hover:text-gray-300 transition-colors"
                  onClick={() => handleSort('total_spaces')}
                >
                  <div className="flex items-center gap-1">
                    Total Spaces
                    {sortField === 'total_spaces' && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Available</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Capacity</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {filteredAndSortedFloors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-black">
                        <Search size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-black uppercase text-black">No floors found</h3>
                      <p className="text-gray-500 font-medium">{searchQuery ? 'Try adjusting your search.' : 'Get started by creating a new floor.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedFloors.map((floor) => (
                  <tr key={floor.id} className="hover:bg-yellow-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 border-2 border-gray-200 rounded-lg">
                          <Layers size={20} className="text-black" strokeWidth={2} />
                        </div>
                        <span className="font-bold text-black text-sm">
                          {floor.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-500 text-sm">
                        Main Building
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <Grid3x3 size={14} className="text-black" />
                        <span className="font-bold text-black text-sm">
                          {floor.total_spaces}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-green-100 text-green-700 border border-green-200">
                        {/* Mock available count */}
                        {Math.floor(floor.total_spaces * 0.3)} Available
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-black text-sm">
                        {/* Mock capacity */}
                        {floor.total_spaces + 15} Max
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-black hover:text-white"
                          onClick={() => console.log('Edit floor:', floor.id)}
                          title="Edit"
                        >
                          <Edit2 size={16} strokeWidth={2.5} />
                        </button>
                        <button
                          className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-[#e7000b] hover:text-white hover:border-[#e7000b]"
                          onClick={() => console.log('Delete floor:', floor.id)}
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
    </div>
  );
}

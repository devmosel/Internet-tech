'use client';

import React, { useState, useEffect } from 'react';
import { getAllAmenities } from '@/services';
import {
  Plus, Search, Edit2, Trash2, Grid3x3, Wifi, Snowflake, Monitor,
  Cable, Video, Tv, Printer, BarChart3, Armchair, Presentation,
  Lock, Phone, Wrench, CheckCircle
} from 'lucide-react';
import StatsCard from '@/component/StatsCard';

// Icon and category mapping based on API icon field
const getAmenityConfig = (icon) => {
  const configs = {
    wifi: { icon: Wifi, category: 'Technology', color: '#155dfc', bg: 'bg-blue-100', text: 'text-[#1447e6]' },
    ac: { icon: Snowflake, category: 'Technology', color: '#155dfc', bg: 'bg-blue-100', text: 'text-[#1447e6]' },
    monitor: { icon: Monitor, category: 'Technology', color: '#155dfc', bg: 'bg-blue-100', text: 'text-[#1447e6]' },
    usbc: { icon: Cable, category: 'Technology', color: '#155dfc', bg: 'bg-blue-100', text: 'text-[#1447e6]' },
    video_conference: { icon: Video, category: 'Technology', color: '#155dfc', bg: 'bg-blue-100', text: 'text-[#1447e6]' },
    tv_display: { icon: Tv, category: 'Technology', color: '#155dfc', bg: 'bg-blue-100', text: 'text-[#1447e6]' },
    printer: { icon: Printer, category: 'Technology', color: '#155dfc', bg: 'bg-blue-100', text: 'text-[#1447e6]' },
    standing_desk: { icon: BarChart3, category: 'Furniture', color: '#00a63e', bg: 'bg-green-100', text: 'text-[#008236]' },
    ergonomic_chair: { icon: Armchair, category: 'Furniture', color: '#00a63e', bg: 'bg-green-100', text: 'text-[#008236]' },
    whiteboard: { icon: Presentation, category: 'Facilities', color: '#9810fa', bg: 'bg-purple-100', text: 'text-[#8200db]' },
    locker: { icon: Lock, category: 'Facilities', color: '#9810fa', bg: 'bg-purple-100', text: 'text-[#8200db]' },
    phone_booth: { icon: Phone, category: 'Facilities', color: '#9810fa', bg: 'bg-purple-100', text: 'text-[#8200db]' },
  };

  return configs[icon] || { icon: Wrench, category: 'Other', color: '#717182', bg: 'bg-gray-100', text: 'text-[#717182]' };
};

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAmenity, setExpandedAmenity] = useState(null);

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const response = await getAllAmenities();
      if (response.success) {
        setAmenities(response.data);
      }
    } catch (error) {
      console.error('Error fetching amenities:', error);

      // Use mock data as fallback
      const mockAmenities = [
        { id: 1, name: 'WiFi', icon: 'wifi', space_id: 1, space_name: 'Hot Desk A1' },
        { id: 2, name: 'WiFi', icon: 'wifi', space_id: 2, space_name: 'Hot Desk A2' },
        { id: 3, name: 'WiFi', icon: 'wifi', space_id: 3, space_name: 'Meeting Room B' },
        { id: 4, name: 'Air Conditioning', icon: 'ac', space_id: 1, space_name: 'Hot Desk A1' },
        { id: 5, name: 'Air Conditioning', icon: 'ac', space_id: 3, space_name: 'Meeting Room B' },
        { id: 6, name: 'Monitor', icon: 'monitor', space_id: 1, space_name: 'Hot Desk A1' },
        { id: 7, name: 'Monitor', icon: 'monitor', space_id: 2, space_name: 'Hot Desk A2' },
        { id: 8, name: 'Monitor', icon: 'monitor', space_id: 4, space_name: 'Private Office C' },
        { id: 9, name: 'USB-C Charging', icon: 'usbc', space_id: 1, space_name: 'Hot Desk A1' },
        { id: 10, name: 'USB-C Charging', icon: 'usbc', space_id: 2, space_name: 'Hot Desk A2' },
        { id: 11, name: 'Video Conference', icon: 'video_conference', space_id: 3, space_name: 'Meeting Room B' },
        { id: 12, name: 'Video Conference', icon: 'video_conference', space_id: 4, space_name: 'Private Office C' },
        { id: 13, name: 'TV Display', icon: 'tv_display', space_id: 3, space_name: 'Meeting Room B' },
        { id: 14, name: 'Printer Access', icon: 'printer', space_id: 5, space_name: 'Hot Desk B1' },
        { id: 15, name: 'Standing Desk', icon: 'standing_desk', space_id: 1, space_name: 'Hot Desk A1' },
        { id: 16, name: 'Standing Desk', icon: 'standing_desk', space_id: 2, space_name: 'Hot Desk A2' },
        { id: 17, name: 'Ergonomic Chair', icon: 'ergonomic_chair', space_id: 1, space_name: 'Hot Desk A1' },
        { id: 18, name: 'Ergonomic Chair', icon: 'ergonomic_chair', space_id: 2, space_name: 'Hot Desk A2' },
        { id: 19, name: 'Ergonomic Chair', icon: 'ergonomic_chair', space_id: 4, space_name: 'Private Office C' },
        { id: 20, name: 'Whiteboard', icon: 'whiteboard', space_id: 3, space_name: 'Meeting Room B' },
        { id: 21, name: 'Whiteboard', icon: 'whiteboard', space_id: 4, space_name: 'Private Office C' },
        { id: 22, name: 'Locker', icon: 'locker', space_id: 6, space_name: 'Hot Desk C1' },
        { id: 23, name: 'Phone Booth', icon: 'phone_booth', space_id: 7, space_name: 'Focus Room D' }
      ];

      setAmenities(mockAmenities);
    } finally {
      setLoading(false);
    }
  };

  // Group amenities by space to get unique amenities with space count
  const uniqueAmenities = amenities.reduce((acc, amenity) => {
    const existing = acc.find(a => a.name === amenity.name);
    if (existing) {
      existing.spaces.push({
        id: amenity.space_id,
        name: amenity.space_name
      });
    } else {
      acc.push({
        ...amenity,
        spaces: [{
          id: amenity.space_id,
          name: amenity.space_name
        }]
      });
    }
    return acc;
  }, []);

  // Calculate stats
  const stats = {
    total: uniqueAmenities.length,
    totalSpaces: amenities.length,
  };

  // Filter amenities
  const filteredAmenities = uniqueAmenities.filter(amenity => {
    const matchesSearch = amenity.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-[#717182]">Loading amenities...</p>
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
            Amenities
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            Manage workspace amenities and features.
          </p>
        </div>
        <button className="px-6 py-3 bg-black text-white border-[3px] border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all flex items-center gap-2">
          <Plus size={20} strokeWidth={3} />
          <span>Add Amenity</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatsCard
          icon={<Grid3x3 size={24} strokeWidth={3} />}
          label="Total Amenities"
          value={stats.total}
          description="Available features"
          shadowColor="#000000"
        />
        <StatsCard
          icon={<CheckCircle size={24} strokeWidth={3} />}
          label="Total Assignments"
          value={stats.totalSpaces}
          description="Amenities in use"
          shadowColor="#22C55E"
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
            placeholder="Search amenities..."
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
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Amenity</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Spaces Using</th>
                <th className="text-left px-6 py-4 font-black uppercase tracking-wider text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-gray-100">
              {filteredAmenities.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-2 border-black">
                        <Search size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-black uppercase text-black">No amenities found</h3>
                      <p className="text-gray-500 font-medium">{searchQuery ? 'Try adjusting your search.' : 'Get started by creating a new amenity.'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAmenities.map((amenity) => {
                  const config = getAmenityConfig(amenity.icon);
                  const IconComponent = config.icon;
                  const isExpanded = expandedAmenity === amenity.id;

                  return (
                    <React.Fragment key={amenity.id}>
                      <tr
                        className={`border-t border-gray-200 transition-colors cursor-pointer group ${isExpanded ? 'bg-gray-50' : 'hover:bg-yellow-50/50'}`}
                        onClick={() => setExpandedAmenity(isExpanded ? null : amenity.id)}
                      >
                        {/* Amenity Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${config.bg}`}>
                              <IconComponent size={20} className="text-black" strokeWidth={2} />
                            </div>
                            <div>
                              <span className="font-bold text-black text-base block">{amenity.name}</span>
                              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{config.category}</span>
                            </div>
                          </div>
                        </td>

                        {/* Spaces Count */}
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Grid3x3 size={14} className="text-black" />
                            <span className="font-bold text-black text-sm">
                              {amenity.spaces.length} {amenity.spaces.length === 1 ? 'Space' : 'Spaces'}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-black hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Edit amenity:', amenity.id);
                              }}
                              title="Edit"
                            >
                              <Edit2 size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              className="p-2 bg-white text-black border-2 border-black rounded-lg transition-all hover:bg-[#e7000b] hover:text-white hover:border-[#e7000b]"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Delete amenity:', amenity.id);
                              }}
                              title="Delete"
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50 border-t-0 border-b-2 border-black">
                          <td colSpan="3" className="px-6 py-6 pt-2">
                            <div className="ml-[52px] p-6 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                <Grid3x3 size={14} />
                                Spaces using this amenity
                              </p>
                              {amenity.spaces.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {amenity.spaces.map((space) => (
                                    <div
                                      key={space.id}
                                      className="bg-gray-50 border-2 border-gray-200 hover:border-black hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all rounded-lg px-4 py-3"
                                    >
                                      <p className="font-bold text-black text-sm">
                                        {space.name}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 italic text-sm">No spaces currently assigned to this amenity.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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

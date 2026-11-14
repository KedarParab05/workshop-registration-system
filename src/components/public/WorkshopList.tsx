import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSeats } from '../../utils/workshopRules';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Filter,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BookOpen,
  X,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WorkshopList: React.FC = () => {
  const { workshops, registrations, navigateTo, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

  const categories = useMemo(() => {
    const set = new Set(workshops.map((w) => w.category));
    return ['All', ...Array.from(set)];
  }, [workshops]);

  const today = new Date().toISOString().split('T')[0];

  const filteredWorkshops = useMemo(() => {
    return workshops.filter((workshop) => {
      // Normal visitors & participants only see PUBLISHED workshops
      // Organizers see PUBLISHED + their own DRAFTS
      if (workshop.status === 'DRAFT') {
        if (!currentUser) return false;
        if (workshop.organizerId !== currentUser.id && currentUser.role !== 'SUPER_ADMIN') {
          return false;
        }
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = workshop.title.toLowerCase().includes(q);
        const matchesSummary = workshop.summary.toLowerCase().includes(q);
        const matchesDesc = workshop.description.toLowerCase().includes(q);
        const matchesOrganizer = workshop.organizerNameSnapshot.toLowerCase().includes(q);
        const matchesVenue = workshop.venue.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesDesc && !matchesOrganizer && !matchesVenue) {
          return false;
        }
      }

      // Category match
      if (selectedCategory !== 'All' && workshop.category !== selectedCategory) {
        return false;
      }

      // Time filter
      if (timeFilter === 'upcoming' && workshop.date < today) {
        return false;
      }
      if (timeFilter === 'past' && workshop.date >= today) {
        return false;
      }

      return true;
    });
  }, [workshops, searchQuery, selectedCategory, timeFilter, currentUser, today]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setTimeFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8 transition-colors duration-200">
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#DCE4D6] dark:border-[#233d2e] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold bg-[#DAE7C7] dark:bg-[#1e3828] text-[#08482D] dark:text-[#9ee2b8] mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Schedule & Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-[#101410] dark:text-[#f0f5ee] tracking-tight">
            Explore Workshops
          </h1>
          <p className="text-xs sm:text-sm text-[#5E5E61] dark:text-[#8ba895] mt-1">
            Browse upcoming workshops, verify available seats, and register for free and paid sessions.
          </p>
        </div>

        {/* Workshop Trust Tag */}
        <div className="text-xs text-[#5E5E61] dark:text-[#8ba895] bg-white dark:bg-[#14231b] border border-[#DCE4D6] dark:border-[#233d2e] px-4 py-2.5 rounded-2xl shadow-xs self-start md:self-auto flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#08482D] dark:bg-[#9ee2b8]" />
          <span><strong className="text-[#101410] dark:text-[#f0f5ee] font-semibold">Academic Workshops</strong> · Free & Paid Sessions</span>
        </div>
      </div>

      {/* Filter Bar: Search, Category Buttons, Time Segmented Control */}
      <div className="space-y-4 bg-white dark:bg-[#14231b] p-4 sm:p-5 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5E5E61] dark:text-[#8ba895] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword, venue, or speaker..."
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-[#DCE4D6] dark:border-[#233d2e] bg-[#F5F8EF]/60 dark:bg-[#1b3025] text-xs text-[#101410] dark:text-[#f0f5ee] focus:outline-none focus:ring-2 focus:ring-[#08482D]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E5E61] dark:text-[#95ad9e] hover:text-[#101410] dark:hover:text-[#f0f5ee] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Time Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-[#F5F8EF] dark:bg-[#1b3025] border border-[#DCE4D6] dark:border-[#233d2e] rounded-2xl shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setTimeFilter('upcoming')}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-colors ${
                timeFilter === 'upcoming'
                  ? 'bg-[#08482D] text-[#F5F8EF] shadow-xs'
                  : 'text-[#5E5E61] dark:text-[#8ba895] hover:text-[#101410] dark:hover:text-[#f0f5ee]'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-colors ${
                timeFilter === 'all'
                  ? 'bg-[#08482D] text-[#F5F8EF] shadow-xs'
                  : 'text-[#5E5E61] dark:text-[#8ba895] hover:text-[#101410] dark:hover:text-[#f0f5ee]'
              }`}
            >
              All Dates
            </button>
            <button
              onClick={() => setTimeFilter('past')}
              className={`px-3 py-1.5 rounded-xl text-xs font-heading font-semibold transition-colors ${
                timeFilter === 'past'
                  ? 'bg-[#08482D] text-[#F5F8EF] shadow-xs'
                  : 'text-[#5E5E61] dark:text-[#8ba895] hover:text-[#101410] dark:hover:text-[#f0f5ee]'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#08482D] text-[#F5F8EF] shadow-xs'
                  : 'bg-[#F5F8EF] dark:bg-[#1b3025] text-[#5E5E61] dark:text-[#8ba895] hover:bg-[#DAE7C7] hover:text-[#08482D] border border-[#DCE4D6] dark:border-[#233d2e]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Clear */}
      <div className="flex items-center justify-between text-xs text-[#5E5E61] dark:text-[#8ba895] px-1">
        <div>
          Showing <strong className="text-[#101410] dark:text-[#f0f5ee]">{filteredWorkshops.length}</strong> available {filteredWorkshops.length === 1 ? 'workshop' : 'workshops'}
        </div>
        {(searchQuery || selectedCategory !== 'All' || timeFilter !== 'upcoming') && (
          <button
            onClick={clearFilters}
            className="text-[#08482D] dark:text-[#9ee2b8] hover:underline font-heading font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Workshop Cards Grid */}
      {filteredWorkshops.length === 0 ? (
        <div className="bg-white dark:bg-[#14231b] p-12 rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] text-center space-y-3">
          <Compass className="w-10 h-10 text-[#5E5E61] dark:text-[#8ba895] mx-auto opacity-60" />
          <h3 className="font-heading font-bold text-base text-[#101410] dark:text-[#f0f5ee]">
            No matching workshops found
          </h3>
          <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or viewing all dates.
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 px-4 py-2 bg-[#08482D] text-[#F5F8EF] rounded-xl text-xs font-heading font-semibold hover:bg-[#0c5c3b] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredWorkshops.map((workshop) => {
            const seats = calculateSeats(workshop, registrations);
            return (
              <motion.div
                key={workshop.id}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-[#14231b] rounded-3xl border border-[#DCE4D6] dark:border-[#233d2e] overflow-hidden shadow-xs hover:shadow-xl transition-all flex flex-col justify-between"
              >
                {/* Banner Thumbnail with 16:10 Aspect Ratio */}
                <div className="relative aspect-[16/10] bg-[#E8F0DF] dark:bg-[#1b3025] overflow-hidden">
                  <img
                    src={workshop.bannerImageUrl}
                    alt={workshop.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/assets/images/fullstack-web-workshop-banner.jpg';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-[#DAE7C7] text-[#08482D] text-[10px] font-heading font-bold px-2.5 py-1 rounded-full shadow-xs shrink-0 whitespace-nowrap">
                    {workshop.category}
                  </div>
                  <div className={`absolute top-3 right-3 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shadow-xs shrink-0 whitespace-nowrap ${
                    workshop.pricingType === 'PAID'
                      ? 'bg-[#08482D] text-[#DAE7C7] border border-[#DAE7C7]/40'
                      : 'bg-[#08482D] text-[#F5F8EF]'
                  }`}>
                    {workshop.pricingType === 'PAID' ? `₹${workshop.price}` : '100% FREE'}
                  </div>
                  {seats.isFull && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-wider bg-rose-600 px-3 py-1 rounded-full shadow-lg">
                        Capacity Reached
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs text-[#5E5E61] dark:text-[#8ba895] mb-1.5 flex items-center gap-1.5">
                      <span>Led by</span>
                      <strong className="text-[#101410] dark:text-[#f0f5ee] font-medium">{workshop.organizerNameSnapshot}</strong>
                    </div>

                    <h3 className="text-base font-heading font-bold text-[#101410] dark:text-[#f0f5ee] line-clamp-1 mb-2">
                      {workshop.title}
                    </h3>

                    <p className="text-xs text-[#5E5E61] dark:text-[#8ba895] line-clamp-2 leading-relaxed">
                      {workshop.summary}
                    </p>

                    <div className="space-y-1.5 text-xs text-[#5E5E61] dark:text-[#8ba895] pt-3 mt-3 border-t border-[#DCE4D6]/70 dark:border-[#233d2e]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#08482D] dark:text-[#9ee2b8] shrink-0" />
                        <span>{workshop.date}</span>
                        <span aria-hidden="true">·</span>
                        <Clock className="w-3.5 h-3.5 text-[#08482D] dark:text-[#9ee2b8] shrink-0" />
                        <span>{workshop.startTime} - {workshop.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#08482D] dark:text-[#9ee2b8] shrink-0" />
                        <span className="truncate">{workshop.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with Mobile-Friendly Action */}
                  <div className="pt-3 border-t border-[#DCE4D6]/70 dark:border-[#233d2e] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="text-xs">
                      {seats.isFull ? (
                        <span className="text-rose-600 font-semibold">0 seats remaining</span>
                      ) : (
                        <span className="text-[#5E5E61] dark:text-[#8ba895]">
                          <strong className="text-[#08482D] dark:text-[#9ee2b8] font-bold">{seats.availableSeats}</strong> of {workshop.capacity} seats left
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigateTo('workshop-detail', workshop.id)}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-heading font-semibold text-[#08482D] dark:text-[#9ee2b8] bg-[#E8F0DF] dark:bg-[#1b3025] hover:bg-[#DAE7C7] dark:hover:bg-[#223f2f] rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateSeats } from '../../utils/workshopRules';
import { normalizeBannerUrl } from '../../data/seedData';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  BookOpen,
  X,
  Compass,
} from 'lucide-react';
import { motion } from 'motion/react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[#101D32] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-heading font-extrabold uppercase tracking-wider bg-[#FFD6B0] border border-[#101D32] text-[#101D32] mb-2 shadow-[2px_2px_0px_0px_#101D32]">
            <BookOpen className="w-3.5 h-3.5 text-[#F4511E]" />
            <span>Academic Schedule &amp; Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-[#101D32] tracking-tight">
            Explore Workshops
          </h1>
          <p className="text-xs sm:text-sm text-[#101D32]/80 mt-1 font-sans">
            Browse upcoming workshops, verify available seats, and register with Razorpay Secure Checkout.
          </p>
        </div>

        {/* Workshop Trust Tag */}
        <div className="text-xs text-[#101D32] bg-white border-2 border-[#101D32] px-4 py-2.5 rounded-xl shadow-[4px_4px_0px_0px_#101D32] self-start md:self-auto flex items-center gap-2 font-sans font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F4511E]" />
          <span><strong className="text-[#101D32] font-bold">Academic Workshops</strong> · Razorpay Instant Checkout</span>
        </div>
      </div>

      {/* Filter Bar: Search, Category Buttons, Time Segmented Control */}
      <div className="space-y-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 font-sans">
            <Search className="w-4 h-4 text-[#101D32]/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, keyword, venue, or speaker..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border-2 border-[#101D32] bg-white text-xs text-[#101D32] placeholder:text-[#101D32]/50 focus:outline-none focus:ring-2 focus:ring-[#F4511E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#101D32]/70 hover:text-[#101D32] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Time Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-[#FFF5E9] border-2 border-[#101D32] rounded-xl shrink-0 self-start sm:self-auto font-sans">
            <button
              onClick={() => setTimeFilter('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                timeFilter === 'upcoming'
                  ? 'bg-[#F4511E] text-white border border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                  : 'text-[#101D32] hover:bg-[#FFD6B0]'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                timeFilter === 'all'
                  ? 'bg-[#F4511E] text-white border border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                  : 'text-[#101D32] hover:bg-[#FFD6B0]'
              }`}
            >
              All Dates
            </button>
            <button
              onClick={() => setTimeFilter('past')}
              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                timeFilter === 'past'
                  ? 'bg-[#F4511E] text-white border border-[#101D32] shadow-[2px_2px_0px_0px_#101D32]'
                  : 'text-[#101D32] hover:bg-[#FFD6B0]'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-sans">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold whitespace-nowrap transition-all border-2 border-[#101D32] cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#F4511E] text-white shadow-[2px_2px_0px_0px_#101D32]'
                  : 'bg-white text-[#101D32] hover:bg-[#FFD6B0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count & Clear */}
      <div className="flex items-center justify-between text-xs text-[#101D32]/80 px-1 font-sans">
        <div>
          Showing <strong className="text-[#101D32] font-bold">{filteredWorkshops.length}</strong> available {filteredWorkshops.length === 1 ? 'workshop' : 'workshops'}
        </div>
        {(searchQuery || selectedCategory !== 'All' || timeFilter !== 'upcoming') && (
          <button
            onClick={clearFilters}
            className="text-[#F4511E] hover:underline font-heading font-bold cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Workshop Cards Grid */}
      {filteredWorkshops.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border-2 border-[#101D32] shadow-[4px_4px_0px_0px_#101D32] text-center space-y-3 font-sans">
          <Compass className="w-10 h-10 text-[#101D32]/40 mx-auto" />
          <h3 className="font-heading font-extrabold text-base text-[#101D32]">
            No matching workshops found
          </h3>
          <p className="text-xs text-[#101D32]/70 max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or viewing all dates.
          </p>
          <button
            onClick={clearFilters}
            className="mt-2 px-4 py-2 bg-[#F4511E] hover:bg-[#E84316] text-white rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] text-xs font-heading font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredWorkshops.map((workshop) => {
            const seats = calculateSeats(workshop, registrations);
            return (
              <div
                key={workshop.id}
                className="bg-white rounded-2xl border-2 border-[#101D32] overflow-hidden shadow-[4px_4px_0px_0px_#101D32] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#101D32] transition-all flex flex-col justify-between"
              >
                {/* Banner Thumbnail with 16:10 Aspect Ratio */}
                <div className="relative aspect-[16/10] bg-[#FFF5E9] overflow-hidden border-b-2 border-[#101D32]">
                  <img
                    src={normalizeBannerUrl(workshop.bannerImageUrl, workshop)}
                    alt={workshop.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = normalizeBannerUrl('', workshop);
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-[#FFD6B0] text-[#101D32] border border-[#101D32] text-[10px] font-heading font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-[2px_2px_0px_0px_#101D32] shrink-0 whitespace-nowrap">
                    {workshop.category}
                  </div>
                  <div className="absolute top-3 right-3 text-[11px] font-mono font-extrabold px-2.5 py-1 rounded-md shadow-[2px_2px_0px_0px_#101D32] shrink-0 whitespace-nowrap bg-[#F4511E] text-white border border-[#101D32]">
                    {workshop.pricingType === 'FREE' || !workshop.price ? 'FREE' : `₹${workshop.price}`}
                  </div>
                  {seats.isFull && (
                    <div className="absolute inset-0 bg-[#101D32]/80 backdrop-blur-xs flex items-center justify-center">
                      <span className="text-white text-xs font-heading font-extrabold uppercase tracking-wider bg-[#E84316] border-2 border-[#101D32] px-3 py-1 rounded-md shadow-[3px_3px_0px_0px_#101D32]">
                        Capacity Reached
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs text-[#101D32]/70 mb-1.5 flex items-center gap-1.5 font-sans">
                      <span>Led by</span>
                      <strong className="text-[#101D32] font-semibold">{workshop.organizerNameSnapshot}</strong>
                    </div>

                    <h3 className="text-base font-heading font-extrabold text-[#101D32] line-clamp-1 mb-2">
                      {workshop.title}
                    </h3>

                    <p className="text-xs text-[#101D32]/80 line-clamp-2 leading-relaxed font-sans">
                      {workshop.summary}
                    </p>

                    <div className="space-y-1.5 text-xs text-[#101D32]/80 pt-3 mt-3 border-t-2 border-[#101D32]/10 font-sans">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                        <span className="font-medium">{workshop.date}</span>
                        <span aria-hidden="true">·</span>
                        <Clock className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                        <span className="font-medium">{workshop.startTime} - {workshop.endTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#F4511E] shrink-0" />
                        <span className="truncate font-medium">{workshop.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer with Mobile-Friendly Action */}
                  <div className="pt-3 border-t-2 border-[#101D32]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-sans">
                    <div className="text-xs">
                      {seats.isFull ? (
                        <span className="text-[#E84316] font-bold">0 seats remaining</span>
                      ) : (
                        <span className="text-[#101D32]/80">
                          <strong className="text-[#F4511E] font-extrabold">{seats.availableSeats}</strong> of {workshop.capacity} seats left
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => navigateTo('workshop-detail', workshop.id)}
                      className="w-full sm:w-auto px-4 py-2 text-xs font-heading font-bold text-white bg-[#F4511E] hover:bg-[#E84316] rounded-lg border-2 border-[#101D32] shadow-[2px_2px_0px_0px_#101D32] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_#101D32] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

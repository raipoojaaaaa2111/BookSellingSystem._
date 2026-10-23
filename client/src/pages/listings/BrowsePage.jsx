import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getListings } from '../../services/listingService';
import useAuthStore from '../../store/authStore';
import ListingCard from '../../components/listings/ListingCard';

/**
 * useDebounce — delays updating a value until the user stops typing.
 *
 * Without debounce: every keystroke fires an API call
 *   "c" → API call
 *   "ca" → API call
 *   "cal" → API call  (too many requests!)
 *
 * With debounce (500ms delay):
 *   "c", "ca", "cal", "calc" (user types fast) → only ONE API call after they stop
 */
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Set a timer — if value changes again before timer fires, timer resets
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // cleanup: cancel timer on next change
  }, [value, delay]);

  return debounced;
}

// Skeleton card — shown while listings are loading
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-1/4 mt-3" />
      </div>
    </div>
  );
}

function BrowsePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Raw search input (updates on every keystroke)
  const [searchInput, setSearchInput] = useState('');
  // Debounced value — only updates after user stops typing for 500ms
  const debouncedSearch = useDebounce(searchInput, 500);

  const [condition, setCondition] = useState('');
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Reset to page 1 when any filter changes
  useEffect(() => { setPage(1); }, [debouncedSearch, condition, type, minPrice, maxPrice, sort]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['listings', { search: debouncedSearch, condition, type, minPrice, maxPrice, sort, page }],
    queryFn: () => getListings({ search: debouncedSearch, condition, type, minPrice, maxPrice, sort, page, limit: 12 }),
    keepPreviousData: true,
  });

  const activeFilterCount = [condition, type, minPrice, maxPrice].filter(Boolean).length;

  const clearFilters = () => {
    setCondition('');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setSearchInput('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">📚 BookExchange</Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/listings/new')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              + Post a Book
            </button>
            <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">
              {user?.name}
            </Link>
            <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {/* Show spinner in search box while fetching */}
            {isFetching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin block" />
              </span>
            )}
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition ${
              activeFilterCount > 0
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
            }`}
          >
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
        </div>

        {/* Expandable filter panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4">

            {/* Condition */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Any</option>
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Any</option>
                <option value="sale">For Sale</option>
                <option value="exchange">For Exchange</option>
                <option value="donation">Free / Donation</option>
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Min Price ($)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Max Price ($)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="999"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="sm:col-span-4 text-sm text-red-500 hover:text-red-700 text-left"
              >
                ✕ Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Sort + result count row */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            {data ? `${data.count} listing${data.count !== 1 ? 's' : ''} found` : ''}
          </p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && data?.listings?.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-600 text-lg font-medium">No listings found</p>
            <p className="text-gray-400 text-sm mt-1">
              {activeFilterCount > 0
                ? 'Try adjusting or clearing your filters'
                : 'Be the first to post a book!'}
            </p>
            {activeFilterCount > 0 ? (
              <button
                onClick={clearFilters}
                className="mt-5 text-indigo-600 text-sm font-medium hover:underline"
              >
                Clear filters
              </button>
            ) : (
              <button
                onClick={() => navigate('/listings/new')}
                className="mt-5 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Post a Book
              </button>
            )}
          </div>
        )}

        {/* Listings Grid */}
        {!isLoading && data?.listings?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">Page {page} of {data.totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowsePage;

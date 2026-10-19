import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getListings } from '../../services/listingService';
import useAuthStore from '../../store/authStore';

// Condition labels — maps DB values to human-friendly text
const CONDITION_LABELS = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

// Condition badge colors
const CONDITION_COLORS = {
  new: 'bg-green-100 text-green-700',
  like_new: 'bg-blue-100 text-blue-700',
  good: 'bg-yellow-100 text-yellow-700',
  fair: 'bg-orange-100 text-orange-700',
  poor: 'bg-red-100 text-red-700',
};

// Type badge colors
const TYPE_COLORS = {
  sale: 'bg-indigo-100 text-indigo-700',
  exchange: 'bg-purple-100 text-purple-700',
  donation: 'bg-green-100 text-green-700',
};

/**
 * ListingCard — a single book card in the browse grid.
 * Shows photo (or placeholder), title, author, condition, type badges, price.
 */
function ListingCard({ listing }) {
  return (
    <Link
      to={`/listings/${listing.id}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
    >
      {/* Book cover photo or placeholder */}
      <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
        {listing.photos?.length > 0 ? (
          <img
            src={listing.photos[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="text-5xl">📖</div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Type badges */}
        <div className="flex gap-1 flex-wrap mb-2">
          {listing.type.map((t) => (
            <span
              key={t}
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[t]}`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-1">
          {listing.title}
        </h3>

        {/* Author */}
        <p className="text-xs text-gray-500 mb-2">{listing.author}</p>

        {/* Condition badge */}
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CONDITION_COLORS[listing.condition]}`}>
          {CONDITION_LABELS[listing.condition]}
        </span>

        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-gray-900">
            {listing.type.includes('sale') && listing.price
              ? `$${parseFloat(listing.price).toFixed(2)}`
              : <span className="text-green-600 font-semibold">Free</span>}
          </span>
          <span className="text-xs text-gray-400">
            {listing.seller?.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * BrowsePage — the main book discovery page.
 * Shows all active listings in a responsive grid with search/filter/sort.
 */
function BrowsePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Filter state — these control what we pass to the API
  const [search, setSearch] = useState('');
  const [condition, setCondition] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // React Query fetches listings whenever any filter changes
  // queryKey includes all filters — when they change, a fresh fetch runs
  const { data, isLoading, isError } = useQuery({
    queryKey: ['listings', { search, condition, type, sort, page }],
    queryFn: () => getListings({ search, condition, type, sort, page, limit: 12 }),
    keepPreviousData: true, // Show old data while new data loads (smooth pagination)
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">📚 BookExchange</Link>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/listings/new')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              + Post a Book
            </button>
            <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
              {user?.name}
            </Link>
            <button onClick={logout} className="text-sm text-red-500 hover:text-red-700">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, author, or ISBN..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Search
          </button>
        </form>

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Condition filter */}
          <select
            value={condition}
            onChange={(e) => { setCondition(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Conditions</option>
            <option value="new">New</option>
            <option value="like_new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>

          {/* Type filter */}
          <select
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">All Types</option>
            <option value="sale">For Sale</option>
            <option value="exchange">For Exchange</option>
            <option value="donation">Free / Donation</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          {/* Result count */}
          {data && (
            <span className="ml-auto text-sm text-gray-500 self-center">
              {data.count} listing{data.count !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="text-center py-20 text-red-500">
            Failed to load listings. Please try again.
          </div>
        )}

        {/* Empty state */}
        {!isLoading && data?.listings?.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No listings found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            <button
              onClick={() => navigate('/listings/new')}
              className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
            >
              Be the first to post a book
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {data?.listings?.length > 0 && (
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
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
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

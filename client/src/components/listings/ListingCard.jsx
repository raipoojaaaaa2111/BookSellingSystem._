import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { saveToWatchlist, removeFromWatchlist, checkSaved } from '../../services/watchlistService';
import useAuthStore from '../../store/authStore';

const CONDITION_LABELS = {
  new: 'New', like_new: 'Like New', good: 'Good', fair: 'Fair', poor: 'Poor',
};
const CONDITION_COLORS = {
  new: 'bg-green-100 text-green-700',
  like_new: 'bg-blue-100 text-blue-700',
  good: 'bg-yellow-100 text-yellow-700',
  fair: 'bg-orange-100 text-orange-700',
  poor: 'bg-red-100 text-red-700',
};
const TYPE_COLORS = {
  sale: 'bg-indigo-100 text-indigo-700',
  exchange: 'bg-purple-100 text-purple-700',
  donation: 'bg-green-100 text-green-700',
};

/**
 * HeartButton — the save/unsave toggle on each listing card.
 *
 * Uses React Query to:
 *   1. Check if already saved (useQuery)
 *   2. Toggle saved state (useMutation)
 *
 * Only shown to logged-in users. Hidden for the listing's own owner.
 */
function HeartButton({ listingId, ownerId }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Don't show heart on your own listings
  if (!user || user.id === ownerId) return null;

  const { data: saved = false } = useQuery({
    queryKey: ['watchlist-status', listingId],
    queryFn: () => checkSaved(listingId),
  });

  const mutation = useMutation({
    mutationFn: () => saved ? removeFromWatchlist(listingId) : saveToWatchlist(listingId),
    onSuccess: () => {
      // Refresh the heart status and the watchlist page
      queryClient.invalidateQueries({ queryKey: ['watchlist-status', listingId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // Don't navigate to listing detail when clicking heart
        mutation.mutate();
      }}
      className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow transition ${
        saved
          ? 'bg-red-500 text-white'
          : 'bg-white text-gray-400 hover:text-red-400'
      }`}
      title={saved ? 'Remove from watchlist' : 'Save to watchlist'}
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}

/**
 * ListingCard — reusable card used on Browse, Profile, and Watchlist pages.
 *
 * Props:
 *   listing — the listing object from the API
 *   showStatus — shows sold/exchanged/donated badge (used on My Listings tab)
 */
function ListingCard({ listing, showStatus = false }) {
  return (
    <Link
      to={`/listings/${listing.id}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative"
    >
      {/* Book photo or placeholder */}
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

        {/* Status overlay for closed listings */}
        {showStatus && listing.status !== 'active' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
              {listing.status}
            </span>
          </div>
        )}
      </div>

      {/* Heart save button */}
      <HeartButton listingId={listing.id} ownerId={listing.userId} />

      {/* Card body */}
      <div className="p-4">
        {/* Type badges */}
        <div className="flex gap-1 flex-wrap mb-2">
          {listing.type?.map((t) => (
            <span key={t} className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[t]}`}>
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

        {/* Price + Seller */}
        <div className="mt-3 flex items-center justify-between">
          <span className="font-bold text-gray-900 text-sm">
            {listing.type?.includes('sale') && listing.price
              ? `$${parseFloat(listing.price).toFixed(2)}`
              : <span className="text-green-600">Free</span>}
          </span>
          {listing.seller?.name && (
            <span className="text-xs text-gray-400 truncate ml-2">{listing.seller.name}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default ListingCard;

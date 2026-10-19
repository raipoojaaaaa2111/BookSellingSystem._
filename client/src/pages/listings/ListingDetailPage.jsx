import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getListingById, deleteListing, closeListingStatus } from '../../services/listingService';
import useAuthStore from '../../store/authStore';

const CONDITION_LABELS = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

const TYPE_COLORS = {
  sale: 'bg-indigo-100 text-indigo-700',
  exchange: 'bg-purple-100 text-purple-700',
  donation: 'bg-green-100 text-green-700',
};

/**
 * ListingDetailPage — full detail view of a single listing.
 *
 * Uses the :id URL param to fetch the listing.
 * Shows different actions depending on whether you own the listing:
 *   Owner  → Edit / Delete / Mark as Sold|Exchanged|Donated
 *   Others → Contact Seller (coming Day 8 — messaging)
 */
function ListingDetailPage() {
  const { id } = useParams(); // Get :id from the URL /listings/:id
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch the listing
  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListingById(id),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      navigate('/browse');
    },
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: (status) => closeListingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      deleteMutation.mutate();
    }
  };

  const isOwner = user && listing && listing.userId === user.id;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-2">Listing not found</p>
          <Link to="/browse" className="text-indigo-600 text-sm hover:underline">← Back to Browse</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/browse" className="text-gray-400 hover:text-gray-600">←</Link>
          <span className="text-sm text-gray-500">Back to Browse</span>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ── Left: Photo ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden h-80 md:h-auto flex items-center justify-center">
            {listing.photos?.length > 0 ? (
              <img
                src={listing.photos[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-8xl">📖</div>
            )}
          </div>

          {/* ── Right: Details ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col">

            {/* Status badge */}
            {listing.status !== 'active' && (
              <div className="bg-gray-100 text-gray-600 text-xs font-semibold uppercase px-3 py-1.5 rounded-full w-fit mb-4">
                {listing.status}
              </div>
            )}

            {/* Type badges */}
            <div className="flex gap-2 flex-wrap mb-3">
              {listing.type.map((t) => (
                <span key={t} className={`text-xs font-medium px-2.5 py-1 rounded-full ${TYPE_COLORS[t]}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              ))}
            </div>

            {/* Title & Author */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{listing.title}</h1>
            <p className="text-gray-500 mb-4">by {listing.author}</p>

            {/* Price */}
            <div className="text-3xl font-bold text-indigo-600 mb-4">
              {listing.type.includes('sale') && listing.price
                ? `$${parseFloat(listing.price).toFixed(2)}`
                : <span className="text-green-600">Free</span>}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Condition</p>
                <p className="text-gray-700 font-medium mt-0.5">{CONDITION_LABELS[listing.condition]}</p>
              </div>
              {listing.edition && (
                <div>
                  <p className="text-gray-400 text-xs uppercase font-medium">Edition</p>
                  <p className="text-gray-700 font-medium mt-0.5">{listing.edition}</p>
                </div>
              )}
              {listing.isbn && (
                <div>
                  <p className="text-gray-400 text-xs uppercase font-medium">ISBN</p>
                  <p className="text-gray-700 font-mono text-xs mt-0.5">{listing.isbn}</p>
                </div>
              )}
              {listing.subject && (
                <div>
                  <p className="text-gray-400 text-xs uppercase font-medium">Subject</p>
                  <p className="text-gray-700 font-medium mt-0.5">{listing.subject}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Views</p>
                <p className="text-gray-700 font-medium mt-0.5">{listing.viewCount}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase font-medium">Posted</p>
                <p className="text-gray-700 font-medium mt-0.5">
                  {new Date(listing.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="mb-6">
                <p className="text-gray-400 text-xs uppercase font-medium mb-1">Description</p>
                <p className="text-gray-700 text-sm leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Seller info */}
            <div className="border-t border-gray-100 pt-4 mb-6">
              <p className="text-gray-400 text-xs uppercase font-medium mb-2">Seller</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                  {listing.seller?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-900">{listing.seller?.name}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-auto space-y-2">
              {isOwner ? (
                // Owner actions
                <>
                  <div className="flex gap-2">
                    <Link
                      to={`/listings/${id}/edit`}
                      className="flex-1 text-center border border-indigo-600 text-indigo-600 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-50 transition"
                    >
                      Edit Listing
                    </Link>
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex-1 border border-red-300 text-red-500 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>

                  {/* Mark as complete */}
                  {listing.status === 'active' && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5">Mark transaction as complete:</p>
                      <div className="flex gap-2">
                        {listing.type.includes('sale') && (
                          <button
                            onClick={() => statusMutation.mutate('sold')}
                            disabled={statusMutation.isPending}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-green-700 transition disabled:opacity-50"
                          >
                            Mark Sold
                          </button>
                        )}
                        {listing.type.includes('exchange') && (
                          <button
                            onClick={() => statusMutation.mutate('exchanged')}
                            disabled={statusMutation.isPending}
                            className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs font-medium hover:bg-purple-700 transition disabled:opacity-50"
                          >
                            Mark Exchanged
                          </button>
                        )}
                        {listing.type.includes('donation') && (
                          <button
                            onClick={() => statusMutation.mutate('donated')}
                            disabled={statusMutation.isPending}
                            className="flex-1 bg-orange-500 text-white py-2 rounded-lg text-xs font-medium hover:bg-orange-600 transition disabled:opacity-50"
                          >
                            Mark Donated
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Buyer/viewer actions
                <button
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
                  onClick={() => alert('Messaging coming in Day 8!')}
                >
                  Contact Seller
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ListingDetailPage;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { getMyListings, deleteListing, closeListingStatus } from '../services/listingService';
import { getWatchlist } from '../services/watchlistService';
import useAuthStore from '../store/authStore';
import ListingCard from '../components/listings/ListingCard';

const ROLE_BADGE = {
  student: 'bg-blue-100 text-blue-700',
  college_coordinator: 'bg-purple-100 text-purple-700',
  platform_admin: 'bg-red-100 text-red-700',
};

// ── Tab: Overview ────────────────────────────────────────────────────────────
function OverviewTab({ user }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Bio</p>
          <p className="text-gray-700 text-sm">
            {user?.bio || <span className="text-gray-400 italic">No bio yet — add one in Edit Profile</span>}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Email Verified</p>
          <p className="text-sm">
            {user?.isVerified
              ? <span className="text-green-600 font-medium">✓ Verified</span>
              : <span className="text-amber-600 font-medium">⚠ Not verified</span>}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Member Since</p>
          <p className="text-gray-700 text-sm">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Account ID</p>
          <p className="text-gray-400 text-xs font-mono">{user?.id}</p>
        </div>
      </div>
      <div className="pt-4 border-t border-gray-100">
        <Link
          to="/profile/edit"
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition inline-block"
        >
          Edit Profile
        </Link>
      </div>
    </div>
  );
}

// ── Tab: My Listings ──────────────────────────────────────────────────────────
function MyListingsTab() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['myListings'],
    queryFn: getMyListings,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteListing,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myListings'] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => closeListingStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myListings'] }),
  });

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (listings.length === 0) return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3">📦</div>
      <p className="text-gray-500 mb-4">You haven't posted any listings yet</p>
      <Link to="/listings/new" className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        Post Your First Book
      </Link>
    </div>
  );

  // Stats
  const active = listings.filter((l) => l.status === 'active').length;
  const closed = listings.length - active;
  const totalViews = listings.reduce((sum, l) => sum + (l.viewCount || 0), 0);

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Listed', value: listings.length },
          { label: 'Active', value: active },
          { label: 'Total Views', value: totalViews },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Listings grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <div key={listing.id} className="relative">
            <ListingCard listing={listing} showStatus />
            {/* Quick action buttons below each card */}
            <div className="flex gap-1 mt-1">
              <button
                onClick={() => navigate(`/listings/${listing.id}/edit`)}
                className="flex-1 text-xs py-1.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Delete this listing?')) {
                    deleteMutation.mutate(listing.id);
                  }
                }}
                className="flex-1 text-xs py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Saved (Watchlist) ────────────────────────────────────────────────────
function SavedTab() {
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: getWatchlist,
  });

  if (isLoading) return (
    <div className="flex justify-center py-10">
      <div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (listings.length === 0) return (
    <div className="text-center py-12">
      <div className="text-4xl mb-3">♡</div>
      <p className="text-gray-500 mb-4">No saved listings yet</p>
      <Link to="/browse" className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
        Browse Books
      </Link>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}

// ── Main ProfilePage ──────────────────────────────────────────────────────────
function ProfilePage() {
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.user;
    },
  });

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'listings', label: 'My Listings' },
    { id: 'saved', label: 'Saved' },
  ];

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">📚 BookExchange</Link>
          <div className="flex items-center gap-4">
            <Link to="/browse" className="text-sm text-gray-600 hover:text-gray-900">Browse</Link>
            <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 font-medium">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

          {/* Profile header */}
          <div className="p-6 flex items-center gap-5 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 flex-shrink-0">
              {user?.profilePhoto
                ? <img src={user.profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                : user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 ${ROLE_BADGE[user?.role]}`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <Link to="/profile/edit"
              className="hidden sm:block text-sm text-indigo-600 border border-indigo-300 px-4 py-2 rounded-lg hover:bg-indigo-50 transition">
              Edit Profile
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium transition border-b-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab user={user} />}
            {activeTab === 'listings' && <MyListingsTab />}
            {activeTab === 'saved'    && <SavedTab />}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;

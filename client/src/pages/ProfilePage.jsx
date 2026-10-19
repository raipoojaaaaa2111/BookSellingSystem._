import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import useAuthStore from '../store/authStore';

/**
 * ProfilePage — shows the logged-in user's account details.
 *
 * Uses React Query's useQuery to fetch data from GET /api/auth/me.
 *
 * React Query gives us:
 *   isLoading  — true while the request is in flight
 *   isError    — true if the request failed
 *   data       — the response data once fetched
 *   It also automatically caches the result so if you navigate
 *   away and come back, it shows the cached data instantly
 *   while silently refetching in the background.
 */
function ProfilePage() {
  const { logout } = useAuthStore();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],         // cache key — React Query stores this result under 'me'
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.user;
    },
  });

  // Role badge colors
  const roleBadge = {
    student: 'bg-blue-100 text-blue-700',
    college_coordinator: 'bg-purple-100 text-purple-700',
    platform_admin: 'bg-red-100 text-red-700',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Failed to load profile. Please try again.</p>
          <Link to="/" className="text-indigo-600 text-sm mt-2 inline-block hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">📚 BookExchange</Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
            <button
              onClick={logout}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Card */}
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm p-8">

          {/* Avatar + Name section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            {/* Avatar: shows profile photo or initials fallback */}
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600 flex-shrink-0">
              {data?.profilePhoto ? (
                <img
                  src={data.profilePhoto}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                data?.name?.charAt(0).toUpperCase() // First letter of name
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data?.name}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{data?.email}</p>
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-2 ${roleBadge[data?.role]}`}>
                {data?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Bio
              </p>
              <p className="text-gray-700 text-sm">
                {data?.bio || <span className="text-gray-400 italic">No bio yet</span>}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Email Verified
              </p>
              <p className="text-sm">
                {data?.isVerified ? (
                  <span className="text-green-600 font-medium">✓ Verified</span>
                ) : (
                  <span className="text-amber-600 font-medium">⚠ Not verified</span>
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Member Since
              </p>
              <p className="text-gray-700 text-sm">
                {data?.createdAt
                  ? new Date(data.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                Account ID
              </p>
              <p className="text-gray-400 text-xs font-mono">{data?.id}</p>
            </div>
          </div>

          {/* Edit Profile button — we'll wire this up on Day 7 */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              disabled
              title="Coming in Day 7"
            >
              Edit Profile
            </button>
            <span className="text-xs text-gray-400 ml-3">Edit profile coming soon</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;

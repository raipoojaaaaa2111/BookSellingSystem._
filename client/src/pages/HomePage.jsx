import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function HomePage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600">📚 BookExchange</Link>

          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-gray-600">Hello, {user.name}</span>
                <Link
                  to="/profile"
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  My Profile
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Buy, Sell &amp; Exchange College Books
        </h2>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          Save money and help your fellow students by trading textbooks on campus.
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/browse"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            Browse Listings
          </a>
          <a
            href="/listings/new"
            className="bg-white text-indigo-600 border border-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-indigo-50 transition"
          >
            Post a Book
          </a>
        </div>
      </main>

      {/* Stats strip */}
      <div className="bg-white border-t border-gray-100 py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-3xl font-bold text-indigo-600">0</p>
            <p className="text-gray-500 text-sm mt-1">Active Listings</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-600">0</p>
            <p className="text-gray-500 text-sm mt-1">Books Exchanged</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-600">0</p>
            <p className="text-gray-500 text-sm mt-1">Students Joined</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

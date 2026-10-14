import useAuthStore from '../store/authStore';

/**
 * HomePage — the landing page after login.
 * Tailwind classes like "min-h-screen", "flex", "text-3xl" are utility classes
 * that map directly to CSS properties.
 */
function HomePage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">📚 BookExchange</h1>
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-gray-600">Hello, {user.name}</span>
                <button
                  onClick={logout}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Buy, Sell, and Exchange College Books
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Save money and help your fellow students by trading textbooks on campus.
        </p>
        <a
          href="/browse"
          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Browse Listings
        </a>
      </main>
    </div>
  );
}

export default HomePage;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createListing } from '../../services/listingService';

/**
 * CreateListingPage — form to post a new book listing.
 *
 * Uses React Query's useMutation for the create operation.
 * useMutation is like useQuery but for POST/PUT/DELETE operations.
 *
 * On success: invalidates the 'listings' query cache so the browse
 * page automatically refetches and shows the new listing.
 */
function CreateListingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    edition: '',
    subject: '',
    description: '',
    condition: '',
    type: [],
    price: '',
  });

  const [errors, setErrors] = useState({});

  // Update a single field in the form state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field when user starts typing
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Toggle a listing type checkbox (sale / exchange / donation)
  const handleTypeToggle = (value) => {
    setForm((prev) => ({
      ...prev,
      type: prev.type.includes(value)
        ? prev.type.filter((t) => t !== value) // remove if already selected
        : [...prev.type, value],               // add if not selected
    }));
  };

  // useMutation handles the POST request
  const mutation = useMutation({
    mutationFn: createListing,
    onSuccess: (newListing) => {
      // Invalidate the listings cache — browse page will refetch automatically
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      // Go to the new listing's detail page
      navigate(`/listings/${newListing.id}`);
    },
  });

  // Client-side validation before sending to server
  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.author.trim()) newErrors.author = 'Author is required';
    if (!form.condition) newErrors.condition = 'Condition is required';
    if (form.type.length === 0) newErrors.type = 'Select at least one listing type';
    if (form.type.includes('sale') && !form.price) {
      newErrors.price = 'Price is required for sale listings';
    }
    if (form.type.includes('sale') && form.price && parseFloat(form.price) < 0.01) {
      newErrors.price = 'Price must be at least $0.01';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    mutation.mutate({
      ...form,
      price: form.price ? parseFloat(form.price) : null,
    });
  };

  const isSale = form.type.includes('sale');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/browse" className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
          <h1 className="text-lg font-bold text-gray-900">Post a Book</h1>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">

          {/* Server error */}
          {mutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
              {mutation.error?.response?.data?.message || 'Failed to create listing. Try again.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ── Book Info ───────────────────────────────────────── */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Book Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Introduction to Algorithms"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={form.author}
                    onChange={handleChange}
                    placeholder="e.g. Thomas H. Cormen"
                    className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.author ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author}</p>}
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ISBN <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    placeholder="e.g. 978-0262033848"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Edition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Edition <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="edition"
                    value={form.edition}
                    onChange={handleChange}
                    placeholder="e.g. 3rd Edition"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* ── Condition ───────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['new', 'like_new', 'good', 'fair', 'poor'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { setForm((p) => ({ ...p, condition: c })); }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                      form.condition === c
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {c.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </button>
                ))}
              </div>
              {errors.condition && <p className="text-xs text-red-500 mt-1">{errors.condition}</p>}
            </div>

            {/* ── Listing Type ─────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Listing Type <span className="text-red-500">*</span>
                <span className="text-gray-400 text-xs ml-1">(select all that apply)</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { value: 'sale', label: '💰 For Sale', desc: 'You want money for it' },
                  { value: 'exchange', label: '🔄 For Exchange', desc: 'Swap for another book' },
                  { value: 'donation', label: '🎁 Donation', desc: 'Give it away free' },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleTypeToggle(value)}
                    className={`flex-1 min-w-[140px] p-3 rounded-xl border-2 text-left transition ${
                      form.type.includes(value)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
            </div>

            {/* ── Price (only shown if sale is selected) ───────────── */}
            {isSale && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asking Price <span className="text-red-500">*</span>
                </label>
                <div className="relative w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full border rounded-lg pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
                  />
                </div>
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
            )}

            {/* ── Description ──────────────────────────────────────── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the book's condition, any highlights or notes, why you're selling it..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* ── Submit ───────────────────────────────────────────── */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {mutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting...
                  </span>
                ) : (
                  'Post Listing'
                )}
              </button>
              <Link
                to="/browse"
                className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateListingPage;

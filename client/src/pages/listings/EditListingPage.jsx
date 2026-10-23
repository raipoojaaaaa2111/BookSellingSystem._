import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getListingById, updateListing } from '../../services/listingService';
import useAuthStore from '../../store/authStore';

function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  // Fetch the existing listing to pre-fill the form
  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListingById(id),
  });

  // When listing loads, populate the form state
  useEffect(() => {
    if (listing) {
      setForm({
        title:       listing.title       || '',
        author:      listing.author      || '',
        isbn:        listing.isbn        || '',
        edition:     listing.edition     || '',
        subject:     listing.subject     || '',
        description: listing.description || '',
        condition:   listing.condition   || '',
        type:        listing.type        || [],
        price:       listing.price       || '',
      });
    }
  }, [listing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleTypeToggle = (value) => {
    setForm((prev) => ({
      ...prev,
      type: prev.type.includes(value)
        ? prev.type.filter((t) => t !== value)
        : [...prev.type, value],
    }));
  };

  const mutation = useMutation({
    mutationFn: (data) => updateListing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      navigate(`/listings/${id}`);
    },
  });

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.author.trim()) newErrors.author = 'Author is required';
    if (!form.condition) newErrors.condition = 'Condition is required';
    if (form.type.length === 0) newErrors.type = 'Select at least one type';
    if (form.type.includes('sale') && !form.price) newErrors.price = 'Price is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({ ...form, price: form.price ? parseFloat(form.price) : null });
  };

  // Ownership guard — redirect if not the owner
  useEffect(() => {
    if (listing && user && listing.userId !== user.id) {
      navigate(`/listings/${id}`);
    }
  }, [listing, user, id, navigate]);

  if (isLoading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSale = form.type.includes('sale');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to={`/listings/${id}`} className="text-gray-400 hover:text-gray-600 text-xl">←</Link>
          <h1 className="text-lg font-bold text-gray-900">Edit Listing</h1>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">

          {mutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
              {mutation.error?.response?.data?.message || 'Failed to update. Try again.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Book Title *</label>
              <input type="text" name="title" value={form.title} onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.title ? 'border-red-400' : 'border-gray-300'}`} />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
              <input type="text" name="author" value={form.author} onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.author ? 'border-red-400' : 'border-gray-300'}`} />
              {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author}</p>}
            </div>

            {/* ISBN + Edition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input type="text" name="isbn" value={form.isbn} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edition</label>
                <input type="text" name="edition" value={form.edition} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
              <div className="flex flex-wrap gap-2">
                {['new', 'like_new', 'good', 'fair', 'poor'].map((c) => (
                  <button key={c} type="button"
                    onClick={() => setForm((p) => ({ ...p, condition: c }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                      form.condition === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}>
                    {c.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </button>
                ))}
              </div>
              {errors.condition && <p className="text-xs text-red-500 mt-1">{errors.condition}</p>}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type *</label>
              <div className="flex gap-3 flex-wrap">
                {[
                  { value: 'sale', label: '💰 For Sale' },
                  { value: 'exchange', label: '🔄 For Exchange' },
                  { value: 'donation', label: '🎁 Donation' },
                ].map(({ value, label }) => (
                  <button key={value} type="button" onClick={() => handleTypeToggle(value)}
                    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition ${
                      form.type.includes(value) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
            </div>

            {/* Price */}
            {isSale && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <div className="relative w-48">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input type="number" name="price" value={form.price} onChange={handleChange}
                    min="0.01" step="0.01"
                    className={`w-full border rounded-lg pl-7 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.price ? 'border-red-400' : 'border-gray-300'}`} />
                </div>
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                rows={4} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button type="submit" disabled={mutation.isPending}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-60">
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <Link to={`/listings/${id}`}
                className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default EditListingPage;

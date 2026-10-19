const { Op } = require('sequelize');
const { Listing, User } = require('../models/index');

// Seller fields we include when returning listings
// We never want to expose the seller's password, role, etc.
const SELLER_ATTRIBUTES = ['id', 'name', 'profilePhoto'];

/**
 * createListing — POST /api/listings
 * Protected: must be logged in
 *
 * Creates a new book listing owned by the logged-in user.
 * req.user is set by the protect middleware.
 */
const createListing = async (req, res, next) => {
  try {
    const {
      title, author, isbn, edition, subject,
      description, condition, type, price, photos,
    } = req.body;

    // Enforce: if type includes 'sale', price must exist
    if (type.includes('sale') && (!price || parseFloat(price) < 0.01)) {
      return res.status(400).json({
        success: false,
        message: 'Price is required for sale listings',
      });
    }

    const listing = await Listing.create({
      title,
      author,
      isbn: isbn || null,
      edition: edition || null,
      subject: subject || null,
      description: description || null,
      condition,
      type,
      // Only store price if it's a sale listing, otherwise null
      price: type.includes('sale') ? parseFloat(price) : null,
      photos: photos || [],
      userId: req.user.id, // from protect middleware
    });

    res.status(201).json({
      success: true,
      message: 'Listing created successfully',
      listing,
    });
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: error.errors.map((e) => e.message).join(', '),
      });
    }
    next(error);
  }
};

/**
 * getListings — GET /api/listings
 * Public: anyone can browse listings
 *
 * Returns all active listings with the seller's name.
 * Supports:
 *   ?search=calculus    → filter by title/author/isbn
 *   ?condition=good     → filter by condition
 *   ?type=sale          → filter by listing type
 *   ?minPrice=10        → price range filter
 *   ?maxPrice=50
 *   ?sort=price_asc     → sorting
 *   ?page=1&limit=12    → pagination
 */
const getListings = async (req, res, next) => {
  try {
    const {
      search,
      condition,
      type,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;

    // Build the WHERE clause dynamically based on query params
    const where = { status: 'active' }; // Only show active listings

    // Search: check if title OR author OR isbn contains the search term
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },   // LIKE '%calculus%'
        { author: { [Op.like]: `%${search}%` } },
        { isbn: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by condition
    if (condition) {
      where.condition = condition;
    }

    // Filter by type — JSON_CONTAINS checks if the JSON array contains a value
    // We handle this at the application level after fetching for simplicity
    // (Full MySQL JSON search would require raw queries)

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice); // >=
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice); // <=
    }

    // Sorting
    let order;
    switch (sort) {
      case 'price_asc':   order = [['price', 'ASC']];       break;
      case 'price_desc':  order = [['price', 'DESC']];      break;
      case 'oldest':      order = [['createdAt', 'ASC']];   break;
      default:            order = [['createdAt', 'DESC']];  break; // newest first
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum; // skip rows from previous pages

    // Execute the query
    const { count, rows: listings } = await Listing.findAndCountAll({
      where,
      order,
      limit: limitNum,
      offset,
      // JOIN with users table to include seller name
      include: [
        {
          model: User,
          as: 'seller',
          attributes: SELLER_ATTRIBUTES,
        },
      ],
    });

    // Filter by type after fetch (simple approach for now)
    let filteredListings = listings;
    if (type) {
      filteredListings = listings.filter((l) => l.type.includes(type));
    }

    res.status(200).json({
      success: true,
      count: filteredListings.length,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      listings: filteredListings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * getListingById — GET /api/listings/:id
 * Public: anyone can view a listing
 *
 * Returns a single listing and increments its view count.
 */
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: SELLER_ATTRIBUTES,
        },
      ],
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Increment view count every time this listing is fetched
    // increment() is a Sequelize helper that does UPDATE listings SET viewCount = viewCount + 1
    await listing.increment('viewCount');

    res.status(200).json({
      success: true,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * updateListing — PUT /api/listings/:id
 * Protected: must be the listing owner
 *
 * Updates a listing. Only the owner can edit their own listing.
 */
const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Ownership check — compare listing's userId with logged-in user's id
    if (listing.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own listings',
      });
    }

    const {
      title, author, isbn, edition, subject,
      description, condition, type, price, photos,
    } = req.body;

    // Update only the fields that were sent
    // Sequelize's update() only changes the fields you pass
    await listing.update({
      title:       title       ?? listing.title,
      author:      author      ?? listing.author,
      isbn:        isbn        ?? listing.isbn,
      edition:     edition     ?? listing.edition,
      subject:     subject     ?? listing.subject,
      description: description ?? listing.description,
      condition:   condition   ?? listing.condition,
      type:        type        ?? listing.type,
      price:       price !== undefined ? parseFloat(price) : listing.price,
      photos:      photos      ?? listing.photos,
    });

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * deleteListing — DELETE /api/listings/:id
 * Protected: must be the listing owner (or admin)
 *
 * Permanently removes a listing from the database.
 */
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findByPk(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    // Allow owner OR platform admin to delete
    if (listing.userId !== req.user.id && req.user.role !== 'platform_admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own listings',
      });
    }

    await listing.destroy(); // DELETE FROM listings WHERE id = ?

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * closeListingStatus — PATCH /api/listings/:id/status
 * Protected: must be the listing owner
 *
 * Marks a listing as sold, exchanged, or donated.
 * Used when the transaction is complete.
 */
const closeListingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['sold', 'exchanged', 'donated', 'active'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(', ')}`,
      });
    }

    const listing = await Listing.findByPk(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found',
      });
    }

    if (listing.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update status of your own listings',
      });
    }

    await listing.update({ status });

    res.status(200).json({
      success: true,
      message: `Listing marked as ${status}`,
      listing,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * getMyListings — GET /api/listings/my
 * Protected: returns all listings by the logged-in user
 */
const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  closeListingStatus,
  getMyListings,
};

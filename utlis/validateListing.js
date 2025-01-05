const ExpressError = require("./ExpressError");

const validateListing = (req, res, next) => {
    const { listing } = req.body;
    if (!listing || !listing.title) {
        throw new ExpressError("Invalid listing data: Title is required", 400);
    }
    next();
};

module.exports = validateListing;

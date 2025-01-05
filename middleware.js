const Listing = require("./models/listing");
const Review = require("./models/review")
const ExpressError = require("./utlis/ExpressError.js");
const {listingSchema ,reviewSchema } = require("./schema.js");


module.exports.isLoggedIn= (req,res,next)=>{
    // console.log("User:", req.user);
      if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error" , "You must be logged in to create a new listing")
         return res.redirect("/login")
      }
      next(); 
}

module.exports.saveRedirectUrl = (req,res,next)=>{
    if (req.session && req.session.redirectUrl) {
        // console.log("Redirect URL set:", req.session.redirectUrl); // Log the redirect URL
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req,res,next)=>{
    let {id} = req.params ;
    let listing = await  Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
      req.flash("error","You are not owner of this listing");
       return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports. validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
  };


  module.exports. validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


module.exports.isReviewAuthor = async (req,res,next)=>{
    try {
        let { id, reviewId } = req.params;
        let review = await Review.findById(reviewId);
        
        if (!review) {
            req.flash("error", "Review not found");
            return res.redirect(`/listings/${id}`);
        }
        
        if (!review.author.equals(res.locals.currUser._id)) {
            req.flash("error", "You are not the author of this review");
            return res.redirect(`/listings/${id}`);
        }
        next();
    } catch (err) {
        req.flash("error", "Something went wrong");
        return res.redirect(`/listings/${id}`);
    }
}
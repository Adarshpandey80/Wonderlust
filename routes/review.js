const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utlis/wrapAsync.js")
const ExpressError = require("../utlis/ExpressError.js");
 
const Review = require("../models/review.js")
const Listing = require("../models/listing.js")
const {validateReview, isLoggedIn, isReviewAuthor} =  require("../middleware.js")

const reviewsController = require("../controller/reviews.js")


//review post raoute

router.post("/" ,
    isLoggedIn,
    validateReview, wrapAsync( reviewsController.createReview ));
    
    //review delete route
    
   router.delete("/:reviewId" ,
        isLoggedIn,
        isReviewAuthor,
        wrapAsync( reviewsController.destroyReview ));
    
    

    module.exports = router;
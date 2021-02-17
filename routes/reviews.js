const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campgrounds");
const Review = require("../models/review");
const { reviewSchema } = require("../schemas.js");
const catchAsync = require("../utils/catchAsync");
const expressErrors = require("../utils/ExpressError");


// Validation Middleware **********************************************************

const validateReviews = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new expressErrors(msg, 400);
    } else {
        next();
    }
}

// Add Review to Campground **********************************************************

router.post("/", validateReviews, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "New Review Created Successfully!");
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete Review **********************************************************

router.delete("/:reviewId", catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted Successfully!");
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;
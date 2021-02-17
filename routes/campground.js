const express = require("express");
const router = express.Router();
const { campgroundSchema } = require("../schemas.js");
const Campground = require("../models/campgrounds");
const catchAsync = require("../utils/catchAsync");
const expressErrors = require("../utils/ExpressError");
const { isLoggedin } = require("../middleware");

// Validation Middleware **********************************************************

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(",");
        throw new expressErrors(msg, 400);
    } else {
        next();
    }
}

// Get Campground Routes **********************************************************

router.get("/", isLoggedin, catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds });
}));

router.get("/new", isLoggedin, (req, res) => {
    res.render("campgrounds/new");
});

// Add New Campground **********************************************************

router.post("/", isLoggedin, validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash("success", "Campground created Successfully!");
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Single Campground Show Page **********************************************************

router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews").populate("author");
    console.log(campground.author.username);
    if (!campground) {
        req.flash("error", "Cannot find that Campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
}));

// Edit Campground **********************************************************

router.get("/:id/edit", isLoggedin, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash("error", "Cannot find that Edit Campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}));

// Update Campground **********************************************************

router.put("/:id", isLoggedin, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash("success", "Campground Updated Successfully!");
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Delete Campground **********************************************************

router.delete("/:id", isLoggedin, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground Deleted Successfully!");
    res.redirect("/campgrounds/");
}));

module.exports = router;
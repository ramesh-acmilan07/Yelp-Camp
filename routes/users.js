const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

// Registration Form **********************************************************
router.get("/register", (req, res) => {
    res.render("users/register");
});

// Registration Form POST **********************************************************
router.post("/register", catchAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to Yelp-Camp!");
            res.redirect("/campgrounds");
        })
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("register");
    }
}));

// Login Form **********************************************************
router.get("/login", (req, res) => {
    res.render("users/login");
});

// Login Form Post **********************************************************
router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), async (req, res) => {
    const { username } = req.body;
    req.flash("success", `Welcome back ${username}`);
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

// Logout Form **********************************************************
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Successfully Logged Out!");
    res.redirect("/login");
})

module.exports = router;
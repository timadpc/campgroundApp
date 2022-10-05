const Campground = require("../models/campground");
const Review = require("../models/reviews");
const { reviewSchema } = require('../schema.js');
const ExpressError = require('../utils/ExpressErrors');
const { campgroundSchema } = require('../schema.js');


module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; //saves original url to currentUrl
    req.flash('error', 'You must be logged in first!');
    return res.redirect('/login')
  };
  next();
}

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    console.log(error)
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
} ////throws errors and renders names, validation in postman for examle



module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
}


module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  if (!camp.author.equals(req.user._id)) {
    req.flash('error', 'You dont have permission, campground is not yours');
    return res.redirect(`/campgrounds/${id}`)
  }
  next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash('info', 'You dont have permission, review is not yours');
    return res.redirect(`/campgrounds/${id}`)
  }
  next();
}

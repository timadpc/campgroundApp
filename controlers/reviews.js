const Review = require('../models/reviews')
const Campground = require("../models/campground");//require Campground model


module.exports.createReview = async (req, res, next) => {
  // console.log(req.params)
  // console.log(req.body)
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id
  campground.reviews.push(review);
  await campground.save();
  await review.save();
  console.log()
  req.flash('success', 'Thank you for leaving a review')
  res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview = async (req, res, next) => {
  // console.log(req.params)
  // console.log(req.body)
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); ///takes out review from campground
  await Review.findByIdAndDelete(reviewId); /// deletes from mongoDB
  req.flash('info', 'Your review was deleted')
  res.redirect(`/campgrounds/${id}`)

}
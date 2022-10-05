const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../utils/middleware');
const { createReview, deleteReview } = require('../controlers/reviews');


router.post('/', isLoggedIn, validateReview, catchAsync(createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(deleteReview))


module.exports = router;
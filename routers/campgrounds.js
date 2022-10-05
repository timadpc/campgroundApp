const express = require('express');
const router = express.Router();

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const multer = require('multer')
const { storage } = require('../cloudinary')
const upload = multer({ storage })

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../utils/middleware');
const { createCampground, renderNewForm, renderIndex, renderShow, renderUpdateForm, updateCampground, deleteCampground } = require('../controlers/campgrounds');



// console.log(process.env.CLOUDINARY_KEY)



router.get('/', catchAsync(renderIndex));

router.get('/new', isLoggedIn, renderNewForm);
router.post('/', isLoggedIn, upload.array('image'), validateCampground, catchAsync(createCampground));


router.get('/:id', catchAsync(renderShow));

router.get('/:id/update', isLoggedIn, isAuthor, catchAsync(renderUpdateForm));
router.put('/:id', isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(updateCampground));

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(deleteCampground));


module.exports = router
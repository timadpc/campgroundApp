const { cloudinary } = require("../cloudinary");
const Campground = require("../models/campground")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapToken })




module.exports
  .renderIndex = async (req, res, next) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds });
  }

module.exports
  .createCampground = async (req, res, next) => {
    const geodata = await geocoder.forwardGeocode({
      query: req.body.campground.location,
      limit: 1
    })
      .send()
    res.send(geodata.body.features[0].geometry)
    console.log(req.files)
    let newCampground = new Campground(req.body.campground);
    newCampground.geometry = geodata.body.features[0].geometry;
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    newCampground.author = req.user._id;
    newCampground.images = images;
    await newCampground.save();
    req.flash('success', 'Successfully made a new campground');// creating massage for flash -> casted as middleware in app.js
    res.redirect(`/campgrounds/${newCampground._id}`);
  }

module.exports
  .renderNewForm = (req, res) => {
    res.render('campgrounds/new')
  }

module.exports
  .renderShow = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
      .populate({
        path: 'reviews',
        populate: {
          path: 'author'
        }
      })
      .populate('author');
    // console.log(campground.geometry.coordinates)
    if (!campground) {
      req.flash('err or', 'Cannot find that campground');
      return res.redirect('/campgrounds')
    }
    res.render("campgrounds/show", { campground });
  }

module.exports
  .renderUpdateForm = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/update', { campground })
  }

module.exports
  .updateCampground = async (req, res, next) => {
    const geodata = await geocoder.forwardGeocode({
      query: req.body.campground.location,
      limit: 1
    })
      .send()
    // console.log(req.body)
    const campground = await Campground.findByIdAndUpdate({ _id: req.params.id }, req.body.campground, { runValidators: true, new: true });
    campground.geometry = geodata.body.features[0].geometry;
    const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...newImages);
    // console.log(campground)
    if (req.body.deleteImages) {
      for (let filename of req.body.deleteImages) {
        await cloudinary.uploader.destroy(filename);
      };
      await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    await campground.save();
    // console.log(campground)
    req.flash('success', 'Successfully updated!');
    res.redirect(`/campgrounds/${campground._id}`);
  }

module.exports
  .deleteCampground = async (req, res, next) => {
    const { id } = req.params
    const campground = await Campground.findById(id)
    const images = campground.images;
    for (let image of images) {
      cloudinary.uploader.destroy(image.filename)
    }
    await Campground.findByIdAndDelete({ _id: req.params.id });
    req.flash('info', 'Your campground was deleted')
    res.redirect('/campgrounds')
  }
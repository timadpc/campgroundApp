const mongoose = require('mongoose');

const Review = require('./reviews');

const Schema = mongoose.Schema;


const imageSchema = new Schema({
  url: String,
  filename: String
});

imageSchema.virtual('thnail').get(function () {
  return this.url.replace('/upload', '/upload/w_100');
});

imageSchema.virtual('resizedUrl').get(function () {
  return this.url.replace('/upload', '/upload/w_800');
});


const opts = { toJSON: { virtuals: true } }; //to enable virtuals in stringified json

const campgroundSchema = new Schema({
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  images: [imageSchema],
  title: String,
  price: Number,
  location: String,
  description: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  author: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
}, opts)


campgroundSchema.virtual('properties.popupMarkup').get(function () {
  return `<a href='/campgrounds/${this._id}'>${this.title}</a><br>
  <span>location:${this.location}</span><br>
  <span>price:${this.price}$</span>`
});


///mongoose middleware to delete reviews in campground, while deleting campground
//// !..... in rout must be findByIdAndDelete
campgroundSchema.post('findOneAndDelete', async function (doc) {
  // console.log(doc)
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
})


module.exports = mongoose.model('Campground', campgroundSchema)
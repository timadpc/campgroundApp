const mongoose = require('mongoose');
const Campground = require("../models/campground");
const { cities } = require("./cities.js")
const { places, descriptors, l } = require("./helpers.js")

mongoose.connect('mongodb://localhost:27017/yelpcamp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('database CONNECTED')
})

const sample = function (array) {
  return array[Math.floor(Math.random() * array.length)];
}


const seedCampground = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const r1000 = Math.floor(Math.random() * 1000);
    const price = 10 + Math.floor(Math.random() * 20);
    let c = new Campground({
      geometry: {
        type: 'Point',
        coordinates: [cities[r1000].longitude, cities[r1000].latitude]
      },
      author: '6326c8a69f488df9e3b48f4b',
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[r1000].city} ${cities[r1000].state}`,
      images: [{
        url: 'https://res.cloudinary.com/dtr2lufqd/image/upload/v1663780234/yr4653uejta3snbxns0f.jpg',
        filename: 'YelpCamp/cuqjcvadrswnduxxtbs0'
      },
      {
        url: 'https://res.cloudinary.com/dtr2lufqd/image/upload/w_900/v1663875387/YelpCamp/upegzvsuhlgiqnyz1rga.jpg',
        filename: 'YelpCamp/cuqjcvadrswnduxxtbs0'
      }],
      description: 'Camping is an outdoor activity involving overnight stays away from home, either without shelter or using basic shelter such as a tent or a recreational vehicle. Typically participants leave developed areas to spend time outdoors in more natural ones in pursuit of activities providing them enjoyment or an educational experience.',
      price: price
    });
    await c.save()
  };
}

seedCampground().then(() => {
  mongoose.connection.close();
})
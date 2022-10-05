if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');//to access ejs files
const mongoose = require('mongoose');//to connect to mongo database
const methodOverride = require('method-override');//to add methods like delete, put etc
const ejsMate = require('ejs-mate');//adds layouts for htmls
const passport = require('passport');// for passwords
const LocalStrategy = require('passport-local');// for passwords
const flash = require('connect-flash');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const session = require('express-session')/// autentification, keep users logged in
const MongoStore = require('connect-mongo');


const User = require('./models/user')
const ExpressError = require('./utils/ExpressErrors');
const campgroundsRouter = require('./routers/campgrounds')
const reviewsRouter = require('./routers/reviews')
const userRouter = require('./routers/users')

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelpcamp'


mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log('database CONNECTED')
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))//to get accessibility from any other dir

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))//allows to use scripts and css from public dir in other ejs of html
// app.use(morgan('tiny')); //middleware - shows info about last processes
app.use(mongoSanitize()) // doesnt allow to take some symbols as req.query or params||mongo/sql injection
app.use(
  mongoSanitize({
    replaceWith: '_',
  }),
);

const secret = process.env.CLOUDINARY_SECRET || 'thisshouldbeabettersercret'

const store = new MongoStore({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
})

store.on('error', function (e) {
  console.log('there is ERRRRRORRRR', e)
})

//////////...............................................sessions
const sessionConfig = {
  store: store,
  name: 'session',
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true, //user cannot access cookies over secure connections: https, so cannot access through localhost
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
};

app.use(session(sessionConfig));
app.use(flash());


// /............................HELMET

app.use(
  helmet()
);

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  'https://ajax.googleapis.com/',
  "https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/js/bootstrap.min.js",
  "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js",
  "https://smtpjs.com/",
  "https://smtpjs.com/v3/smtp.js",
  'https://smtpjs.com/v3/'

];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dtr2lufqd/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  }),
  helmet.crossOriginEmbedderPolicy({ policy: 'credentialless' })
);




////..............................Passwords

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  // console.log(req.session.returnTo)
  // res.locals.authenticated = !req.user.anonymous;
  next();
})



//////.....................................ROUTS
app.use('/campgrounds', campgroundsRouter) //use camoground routers
app.use('/campgrounds/:id/reviews', reviewsRouter)
app.use('/', userRouter)






app.get('/', (req, res) => {
  res.render('home')
});

app.all('*', (req, res, next) => {
  next(new ExpressError('page not found', 404))
})

app.use((err, req, res, next) => {
  const { status = 500 } = err
  if (!err.message) {
    err.message = "something got wrong: error errror errrrooor"
  } else {
    console.log(err)
    res.status(status).render('Error', { err, status })
  }
});

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`serving on port 3000`)
});
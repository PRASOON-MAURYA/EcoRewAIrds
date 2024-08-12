const express = require('express');
const createHttpError = require('http-errors');

const mongoose = require('mongoose');
const Teacher = require('./models/user.model');

const bodyParser = require('body-parser');
require('dotenv').config();
const session = require('express-session');
const connectFlash = require('connect-flash');
const passport = require('passport');
const connectMongo = require('connect-mongo');
const path = require('path');
const { log } = require('console');



// Initialization
const app = express();
app.set('view engine', 'ejs');
// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


const MongoStore = connectMongo(session);
// Init Session
const store = new MongoStore({ mongooseConnection: mongoose.connection, collection: 'newsessiion' })
// const store = new MongoStore({ url: process.env.MONGODB_URI+'/'+process.env.DB_NAME, ttl: 60 * 60 * 24 * 7 // 7 days 
// })
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        // saveUninitialized: true,
        store: store,
        cookie: {
            // secure: true,
            httpOnly: true,
        },
        // store: store,
    })
);
// For Passport JS Authentication
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.auth');

app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Connect Flash
app.use(connectFlash());
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});


app.get('/testing', permissionCheck(1), async (req, res, next) => {

    res.send('hi dss');
});

function permissionCheck(permitValue) {
    return function (req, res, next) {
        if (req.user && req.user.role === 'teacher') {
            log(permitValue);
            next();
        }
        else {
            res.send('test passed'); return;
            res.redirect('/');
        }
    };
}

// Set up routes
app.use('/', require('./routes/index.route'));
app.use('/auth', require('./routes/auth.route'));
app.use('/score', require('./routes/score.route'));
app.use('/balance', require('./routes/balance.route'));
app.use('/users', require('./routes/user.route'));
app.use('/scanner', require('./routes/scanner.route'));

// app.use('/notifications', require('./routes/notifications'));
// app.use('/user', require('./routes/user.route'));




// 404 Handler
app.use((req, res, next) => {
    next(createHttpError.NotFound());
});

// Error Handler
app.use((error, req, res, next) => {
    error.status = error.status || 500;
    res.status(error.status);
    res.render('error_40x', { error });
});


// Setting the PORT
const port = process.env.PORT || 4000;


// const now = new Date();
// const weekdayAsString = now.toLocaleString('en-US', { weekday: 'long' });
// console.log(weekdayAsString);

// Making a connection to MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//     dbName: process.env.DB_NAME
// dbName: weekdayAsString
mongoose.connect(process.env.ONLINE_MONGODB_URI, {
    dbName: process.env.ONLINE_DB_NAME
}).then(() => {
    console.log('💾 connected...');
    // Start the server
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}).catch((err) => console.log(err.message));

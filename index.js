const express = require("express")
const mongoose = require('mongoose');
const bodyparser = require('body-parser')
const passport = require('passport');

//bring all routes
const auth = require('./routes/api/auth')
const profile = require('./routes/api/profile');
const question = require('./routes/api/question')


const app = express();

//middleware for bodyparser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());


//mongoDB configuration
const db = require('./setup/myurl').mongoURL;

//attempt to connect to database
mongoose
    .connect(db)
    .then(() => console.log("MongoDB connected sucessfylly"))
    .catch(err => console.log(err));

//passport  middleware
app.use(passport.initialize());

//config for JWT strategy
require('./stategies/jsonwtStrategy')(passport);



//just for testing -> route
app.get('/', (req, res) => {
    res.send("Hey there Big stack");
});

//actual routes
app.use('/api/auth', auth);
app.use('/api/profile', profile);
app.use('/api/question', question);


const port = process.env.PORT || 3000;


app.listen(port, () => {
    console.log(`server is working at ${port}`);
})
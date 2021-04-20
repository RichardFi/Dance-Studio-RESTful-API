const express = require('express');
const app = express();
const mongoose = require('mongoose');

require('dotenv/config');

app.use(express.json());

// import routes
const usersRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const coursesRoute = require('./routes/courses');
const classesRoute = require('./routes/classes');

//const userRoute = require('./routes/user');

app.use('/api/users', usersRoute);
app.use('/api/auth', authRoute);
app.use('/api/courses', coursesRoute);
app.use('/api/classes', classesRoute);

// middlewares
// app.use(auth)

// routes
app.get('/', (req,res)=>{
    res.send('We are on home');
})

// connect to DB
// will change

mongoose.connect(process.env.DB_CONNECTION,
    { useNewUrlParser: true, useUnifiedTopology: true }, () =>{
    console.log('connected to DB!');
});

// listen to the server
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`listening on port ${port}...`));
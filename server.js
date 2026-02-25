const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);

const express = require('express') ;
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const rooms = require('./routes/coworkingspaces');
const auth = require('./routes/auth');
const reserves = require('./routes/reserves');

dotenv.config({path:'./config/config.env'});

connectDB();    

const app = express() ;
app.set('query parser' , 'extended') ; 
app.use(express.json());//translate json
app.use(cookieParser());

app.use('/api/v1/rooms' , rooms);
app.use('/api/v1/auth',auth) ;
app.use('/api/v1/reserveations' , reserves);

const PORT = process.env.PORT || 5000 ;
const server = app.listen(PORT , console.log('SERVER IS RUNNING IN ', process.env.NODE_ENV , 'mode on port ', PORT));

process.on('unhandledRejection' ,(err,promises)=>{
    console.log(`Error : ${err.message}`);
    
    server.close(() => process.exit(1));
} )

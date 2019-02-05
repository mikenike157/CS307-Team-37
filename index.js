const express = require('express');
const app = express();
const port = process.env.PORT || 80;
const io = require('socket.io')();
const path = require('path')




app.get('/', (req, res) => res.send('Hello World'))

app.listen(port)

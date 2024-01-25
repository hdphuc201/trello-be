// const express = require('express')
import express from 'express'

const app  = express();

const hostname = 'localhost'
const port = 3000

app.get('/', function (req, res) {
    res.send('Hello World')
})

app.listen(port, hostname, () => {
    console.log(`Hello Phucdev, running server http://${hostname}:${port}/`)
})
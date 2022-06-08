const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const { TonClient } = require('@tonclient/core')
const { libNode } = require('@tonclient/lib-node')

const host = "127.0.0.1"
const port = "3000"


const app = express()

app.use(bodyParser.json())

app.get("/auth", cors(), (req, res) => {
    var body = req.query
})

app.post("/auth/did", cors(), (req, res) => {

})


app.post("/answer", cors(), bodyParser.json(), (req, res) => {

})



app.listen(port, host, () => {
    console.log(`Server listens http://${host}:${port}`)
    TonClient.useBinaryLibrary(libNode)
})


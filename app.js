const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const session = require('express-session')
const redisStorage = require('connect-redis')(session)
const redis = require('redis')
const clientSession = redis.createClient()

const { TonClient } = require('@tonclient/core')
const { libNode } = require('@tonclient/lib-node')

const auth = require('./src/auth')

const host = "127.0.0.1"
const port = "3000"


const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
    session({
        store: new redisStorage({
            host: host,
            port: 6379,
            client: clientSession,
        }),
        secret: 'you secret key',
        saveUninitialized: true,
    })
)

app.get("/auth", cors(), (req, res) => {
    if(!req.session.key) {
        req.session.key = req.sessionID
    }

    if(!req.query.endpoint) {
        if(!req.query.method) {
            if(!req.query.data) {
                req.session.key[req.sessionID] = {
                    did: "",
                    authorized: false,
                    value: auth.generateMessage(),
                    endpoint: req.query.endpoint,
                    data: req.query.data
                }
            } else {
                req.session.key[req.sessionID] = {
                    value: auth.generateMessage(),
                    endpoint: req.query.endpoint
                }
            }

            var dataQr = {
                endpoint: `http://${host}:${port}/response`,
                method: "post",
                message: req.session.key[req.sessionID].value,
                sessionToken: req.sessionID
            }
        }
    } else {
        res.sendStatus(400)
    }
})

app.post("/auth/login", cors(), (req, res) => {
    
})


app.post("/response", cors(), async (req, res) => {
    //Тут должна быть проверка что запрос прислало именно наше приложение

    var check = auth.signin(req.body.did, req.session.key[req.body.sessionToken], req.body.parameter)

    if(check) {
        req.session.key[req.body.sessionToken].did = req.body.did,
        req.session.key[req.body.sessionToken].authorized = true
    }
})



app.listen(port, host, () => {
    console.log(`Server listens http://${host}:${port}`)
    TonClient.useBinaryLibrary(libNode)
})


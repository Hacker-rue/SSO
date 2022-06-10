const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')  
const session = require('express-session')
const redisStorage = require('connect-redis')(session)
const redis = require('redis')
const clientSession = redis.createClient({ legacyMode: true })

const { TonClient } = require('@tonclient/core')
const { libNode } = require('@tonclient/lib-node')
const { initSettings } = require('everscale-did-sdk-radiance')

const auth = require('./src/auth')

const host = "127.0.0.1"
const port = "3000"

const app = express()

let Session = {

}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.use(
    session({
        store: new redisStorage({
            host: host,
            port: 6379,
            client: clientSession,
        }),
        secret: 'session',
        saveUninitialized: true,
        resave: false
    })
)

app.get("/auth", cors(), (req, res) => {
    if(req?.query?.endpoint && req?.query?.method) {
        Session[req.sessionID] = auth.generateMessage()
        req.session.endpoint = req.query.endpoint
        req.session.method = req.query.method
        if(req.query?.data) req.session.data = req.query.data
        
        var dataQr = {
            endpoint: `http://${host}:${port}/response`,
            method: "post",
            message: Session[req.sessionID],
            sessionToken: req.sessionID
        }
        console.log(dataQr)
        res.sendStatus(302)
    } else {
        res.sendStatus(400)
    }
})

app.get("/request", cors(), (req, res) => {
    if(!req.session.key) {
        res.sendStatus(403)
    } else {
        if(Session[req.sessionID].authorized) {
            // res.send(JSON.stringify({
            //     did: req.session.key[req.sessionID],
            //     authorized: req.session.key[req.sessionID]
            // }))
            res.json({
                did: Session[req.sessionID].did,
                authorized: Session[req.sessionID].authorized
            })
            res.redirect(req.session.endpoint)
        } else {
            res.sendStatus(102)
        }
    }
})


// app.post("/auth/login", cors(), (req, res) => {
    
// })

app.post("/response", cors(), async (req, res) => {
    //Тут должна быть проверка что запрос прислало именно наше приложение
    if(req.body?.did && req.body?.parameter && req.body?.sessionToken) {
        var check = auth.signin(req.body.did, Session[req.body.sessionToken], req.body.parameter)
        if(check) {
            Session[req.body.sessionToken].did = req.body.did
            Session[req.body.sessionToken].authorized = true
            res.sendStatus(200)
        } else {
            res.sendStatus(401)
        }
    } else {
        res.sendStatus(400)
    }

    

    
})

app.listen(port, host, async () => {
    console.log(`Server listens http://${host}:${port}`)
    await clientSession.connect()
    initSettings("devNet", libNode)
})

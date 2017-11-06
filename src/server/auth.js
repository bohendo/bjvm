
// Node built-ins
import crypto from 'crypto'

// My modules
import { err } from '../utils'
import bj from '../blackjack'
import db from './mongo'

const stateInit = (req, res, next) => {
  // save a new bj doc in mongo for this user
  req.state = bj()
  console.log(`AUTH: initializing state for ${req.id.substring(0,8)}...`)

  db.states.insert({
    cookie: req.id,
    state: req.state,
  }).then(() => {
    console.log(`AUTH: state initialized for ${req.id.substring(0,8)}`)
    next()
  }).catch(err('AUTH states.insert'))

}

const auth = (req, res, next) => {

  console.log(`AUTH: new req received w headers: ${JSON.stringify(req.headers, null, 2)}`)

  const id = req.universalCookies.get('id')

  // have I tagged this client with a cookie yet?
  if (id && id.length === 64) {
    req.id = id
    console.log('AUTH: states.findOne...')
    db.states.findOne({ cookie: req.id }).then((doc) => {
      if (doc && doc.state) {
        console.log(`AUTH: Found old friend ${req.id.substring(0,8)}`)
        req.state = doc.state
        next()

      } else {
        console.log(`AUTH: Found forgotten friend ${req.id.substring(0,8)}`)
        stateInit(req, res, next)

      }
    }).catch(err('AUTH states.findOne'))

  // tag this client with a cookie
  } else {
    const hash = crypto.createHash('sha256');
    hash.update(req.headers['user-agent'].toString())
    hash.update(Date.now().toString())
    hash.update(crypto.randomBytes(16))
    req.id = hash.digest('hex')

    console.log(`AUTH: New friend ${req.id.substring(0,8)}`)

    const spery = 365*24*60*60 // seconds per year
    res.cookie('id', req.id, {
      'expires': new Date(Date.now() + spery*1000),
      'maxAge': spery,
      'secure': true,
      'httpOnly': true,
      'sameSite': true,
    })
    stateInit(req, res, next)

  }
}

export default auth

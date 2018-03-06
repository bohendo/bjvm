import db from './database'
import sigUtil from 'eth-sig-util'
import agreement from '../Agreement.txt'

////////////////////////////////////////
// Internal Utilities

const log = (msg) => {
  if (true) console.log(`${new Date().toISOString()} [AUTH] ${msg}`)
}

const verify = (usr, sig) => {
  const signee = sigUtil.recoverTypedSignature({
    data: [{ type: 'string', name: 'Agreement', value: agreement }],
    sig
  })
  return (signee.toLowerCase() === usr.toLowerCase())
}

////////////////////////////////////////
// Define Exported Object

const auth = (req, res, next) => {
  log(`New req received for ${req.path}`)

  let id = req.universalCookies.get('bjvm_id') // id for IDentifier aka account
  let ag = req.universalCookies.get('bjvm_ag') // ag for AutoGraph aka signature
  if (! id || id.length !== 42 || ! ag || ag.length !== 132) {
    log(`No signature cookies, aborting`)
    return res.json({ message: "I need your autograph first" })
  }

  id = id.toLowerCase()
  ag = ag.toLowerCase()

  if (!verify(id, ag)) { // autograph is valid
    log(`Player ${id.substring(0,10)} provided an invalid signature`)
    return res.json({ message: "Sorry bud, this autograph don't look right" })
  }

  log(`Player ${id.substring(0,10)} Successfully Authenticated!`)

  req.id = id
  req.ag = ag
  return next()
}

export default auth

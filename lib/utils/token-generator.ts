import crypto from "crypto"

export function generateToken() {
  const token = crypto.randomBytes(64).toString('hex')
  return token
}
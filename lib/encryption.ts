/**
 * lib/encryption.ts
 * AES-256-GCM encryption for bank account numbers.
 *
 * Security rules:
 * - Fresh IV (randomBytes(16)) generated on EVERY encrypt call — never static
 * - Stored as: iv:authTag:encrypted (all hex-encoded)
 * - Key loaded from BANK_ENCRYPTION_KEY env var only — never hardcoded
 * - decryptBankDetail is called ONLY in lib/pdf at PDF generation time
 *   Do NOT call it from any route, component, or other module
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getEncryptionKey(): Buffer {
  const key = process.env.BANK_ENCRYPTION_KEY
  if (!key) {
    throw new Error('BANK_ENCRYPTION_KEY environment variable is not set.')
  }
  const keyBuffer = Buffer.from(key, 'hex')
  if (keyBuffer.length !== 32) {
    throw new Error('BANK_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes).')
  }
  return keyBuffer
}

/**
 * Encrypt a bank account number before writing to the database.
 * A fresh IV is generated on every call — identical plaintexts produce different ciphertexts.
 */
export function encryptBankDetail(plaintext: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(16)                                        // fresh IV per operation
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()
  // Format: iv:authTag:encrypted (all hex-encoded)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

/**
 * Decrypt a stored bank account number.
 * ONLY call this inside lib/pdf — never in routes or components.
 */
export function decryptBankDetail(stored: string): string {
  const key = getEncryptionKey()
  const parts = stored.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted bank detail format.')
  }
  const [ivHex, authTagHex, encryptedHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
}

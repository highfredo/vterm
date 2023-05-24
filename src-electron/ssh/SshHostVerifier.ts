import lineReader from 'line-reader'
import readLastsLines from 'read-last-lines'
import { appendFile } from 'fs'
import { homedir } from 'os'
import { ensureFile } from 'fs-extra'

const FILE = `${homedir()}/.ssh/known_hosts`

const verifyKey = (line: string, key: Buffer) => {
  return line === key.toString('base64')
}

export const verify = async (host: string, key: Buffer): Promise<boolean> => {
  return new Promise((resolve) => {
    lineReader.eachLine(FILE, (line, last, cb) => {
      const [l_host, type, data] = line.split(' ')

      // TODO soportar known file con salt
      if(host === l_host && verifyKey(data, key)) {
        cb && cb(false)
        return resolve(true)
      }

      if(last) {
        return resolve(false)
      }

      cb && cb(true)
    }, () => resolve(false))
  })
}

export const addToKnownHost = async (host: string, key: Buffer) => {
  await ensureFile(FILE)
  const dec = new TextDecoder()
  const type = dec.decode(key).split('\x00\x00\x00')[1]
  const line = await readLastsLines.read(FILE, 1)
  let newline = `${host} ${type.replace(/\p{C}/gu, '').trim()} ${Buffer.from(key).toString('base64')}\n`
  if(line && !line.endsWith('\n')) {
    newline = '\n' + newline
  }
  appendFile(FILE, newline, () => ({}))
}

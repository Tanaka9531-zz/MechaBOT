const { WAConnection, MessageType, Presence, MessageOptions, Mimetype, WALocationMessage, WA_MESSAGE_STUB_TYPES, ReconnectMode, ProxyAgent, waChatKey, GroupSettingChange } = require("@adiwajshing/baileys")
const qrcode = require('qrcode-terminal')
const fs = require('fs')
const chalk = require('chalk')
const moment = require('moment')
const time = moment().format('DD/MM HH:mm:ss')
let blokir = []


function INFOLOG(info) {
     console.log('\x1b[1;34m~\x1b[1;37m>>', '[\x1b[1;33mINF\x1b[1;37m]', time, color(info))
}

function ERRLOG(e) {
     console.log('\x1b[1;31m~\x1b[1;37m>>', '[\x1b[1;31mERROR\x1b[1;37m]', time, color('\tname: ' + e.name + ' message: ' + e.message + ' at: ' + e.at))
}

require('./myHandler')
require('./revokeHandler')
nocache('./myHandler', module => INFOLOG(`${module} Telah diupdate!`))
nocache('./revokeHandler', module => INFOLOG(`${module} Telah diupdate!`))

// global.conn = new WAConnection()
// conn.logger.level = 'debug'

const mulai = async (sesi, conn = new WAConnection()) => {

     conn.on('qr', qr => {
          qrcode.generate(qr, { small: true })
          console.log(`[ ${moment().format('HH:mm:ss')} ] Silahkan scan,,`)
     })

     conn.on('credentials-updated', () => {
          console.log(`Berhasil update kredensial`)
          const authInfo = conn.base64EncodedAuthInfo()
          fs.writeFileSync('./sessions/' + sesi + '.sesi.json', JSON.stringify(authInfo, null, 2))
     })

     fs.existsSync('./sessions/' + sesi + '.sesi.json') && conn.loadAuthInfo('./sessions/' + sesi + '.sesi.json')

     conn.connect()

     conn.on('chat-update', async (chat) => {
          if (chat.imgUrl) {
               INFOLOG('imgUrl of chat changed ', chat.imgUrl)
               return
          }
          // only do something when a new message is received
          if (!chat.hasNewMessage) {
               if (chat.messages) {
                    // INFOLOG('updated message: ', chat.messages.first)
               }
               return
          }
          const hurtz = chat.messages.all()[0];
          require('./myHandler')(GroupSettingChange, Mimetype, MessageType, conn, hurtz, chat)
     })

     conn.on('close', ({ reason, isReconnecting }) => (
          INFOLOG('TERDISKONEK! : ' + reason + ', ' + chalk.blue('Menkoneksi ulang : ' + isReconnecting))
     ))

     conn.on('CB:action,,battery', json => {
          const batteryLevelStr = json[2][0][1].value
          const batterylevel = parseInt(batteryLevelStr)
          INFOLOG('battery level: ' + batterylevel)
          fs.writeFileSync('./lib/database/batt.json', JSON.stringify(json[2][0], null, 2))
     })

     conn.on('CB:Blocklist', json => {
          if (blokir.length > 2) return
          for (let index of json[1].blocklist) {
               blokir.push(index.replace(/@c.us/g, '@s.whatsapp.net'))
          }
     })

     conn.on('message-update', async (hurtzz) => {
          require('./revokeHandler')(WA_MESSAGE_STUB_TYPES, hurtzz, conn, Mimetype, MessageType)
     })
}




/**
 * Uncache if there is file change
 * @param {string} module Module name or path
 * @param {function} cb <optional> 
 */
function nocache(module, cb = () => { }) {
     console.log('Module', `'${module}'`, 'is now being watched for changes')
     fs.watchFile(require.resolve(module), async () => {
          await uncache(require.resolve(module))
          cb(module)
     })
}

/**
 * Uncache a module
 * @param {string} module Module name or path
 */
function uncache(module = '.') {
     return new Promise((resolve, reject) => {
          try {
               delete require.cache[require.resolve(module)]
               resolve()
          } catch (e) {
               reject(e)
          }
     })
}



mulai('MRHRTZ')
     .catch(e => ERRLOG(e))
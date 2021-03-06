const { getFilesize } = require('./lib/func')
const fs = require('fs')
const moment = require('moment')
const time = moment().format('DD/MM HH:mm:ss')
const exec = require('child_process').exec
const { createExif } = require('./lib/create-exif')


module.exports = revokejs = async (sesi, WA_MESSAGE_STUB_TYPES, hurtz, conn, Mimetype, MessageType) => {
     try {
          // console.log('sup');
          let settings = JSON.parse(fs.readFileSync('./src/settings.json'))
          // const mtchat = mt ? sender != nomerOwner[0] : false
          if (settings.Maintenance) return
          const from = hurtz.key.remoteJid
          const messageStubType = WA_MESSAGE_STUB_TYPES[hurtz.messageStubType] || 'MESSAGE'
          const dataRevoke = JSON.parse(fs.readFileSync('./lib/database/RevokedGroup.json'))
          const isRevoke = dataRevoke.includes(from)
          // console.log(hurtz.message.protocolMessage);
          if (isRevoke) {
               const from = hurtz.key.remoteJid
               const isGroup = hurtz.key.remoteJid.endsWith('@g.us') ? true : false
               const sender = hurtz.key.fromMe ? conn.user.jid : isGroup ? hurtz.participant : hurtz.key.remoteJid
               let int
               let infoMSG = JSON.parse(fs.readFileSync('./lib/database/msgInfo-' + sesi + '.json'))
               const id_deleted = hurtz.message.protocolMessage.key.id
               const conts = hurtz.key.fromMe ? conn.user.jid : conn.contacts[sender] || { notify: jid.replace(/@.+/, '') }
               const pushname = hurtz.key.fromMe ? conn.user.name : conts.notify || conts.vname || conts.name || '-'
               for (let i = 0;i < infoMSG.length;i++) {
                    if (infoMSG[i].key.id == id_deleted) {
                         // console.log('go on');
                         const dataInfo = infoMSG[i]
                         const type = Object.keys(infoMSG[i].message)[0]
                         const timestamp = infoMSG[i].messageTimestamp
                         int = {
                              no: i,
                              type: type,
                              timestamp: timestamp,
                              data: dataInfo
                         }
                    }
               }
               // return console.log(id_deleted);
               const opt4tag = {
                    quoted: int.data,
                    contextInfo: { mentionedJid: [sender] }
               }
               const index = Number(int.no)
               const body = int.type == 'conversation' ? infoMSG[index].message.conversation : int.type == 'extendedTextMessage' ? infoMSG[index].message.extendedTextMessage.text : int.type == 'imageMessage' ? infoMSG[index].message.imageMessage.caption : int.type == 'stickerMessage' ? 'Sticker' : int.type == 'audioMessage' ? 'Audio' : int.type == 'videoMessage' ? infoMSG[index].message.videoMessage.caption : '-'
               const mediaData = int.type === 'extendedTextMessage' ? JSON.parse(JSON.stringify(int.data).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : int.data
               if (int.type == 'conversation' || int.type == 'extendedTextMessage') {
                    const strConversation = `\`\`\`[ ?????? Terdeteksi Penghapusan Pesan ?????? ]

Nama : ${pushname} ( @${sender.replace('@s.whatsapp.net', '')} )
Tipe : Text
Waktu : ${moment.unix(int.timestamp).format('HH:mm:ss DD/MM/YYYY')}
Pesan : ${body ? body : '-'}\`\`\`
`
                    conn.sendMessage(from, strConversation, MessageType.text, opt4tag)
               } else if (int.type == 'stickerMessage') {
                    createExif('Created By MechaBOT', 'Follow Insta Dev @hanif.thetakeovers_')
                    const filename = `${sender.replace('@s.whatsapp.net', '')}-${moment().unix()}`
                    const savedFilename = await conn.downloadAndSaveMediaMessage(int.data, `./media/sticker/${filename}`);
                    const sizestik = getFilesize(savedFilename)
                    const strConversation = `\`\`\`[ ?????? Terdeteksi Penghapusan Pesan ?????? ]

Nama : ${pushname} ( @${sender.replace('@s.whatsapp.net', '')} )
Tipe : Sticker
Ukuran : ${sizestik}
Waktu : ${moment.unix(int.timestamp).format('HH:mm:ss DD/MM/YYYY')}\`\`\`
`
                    exec(`webpmux -set exif ./media/sticker/data.exif ${savedFilename} -o ./media/sticker/${filename}-done.webp`, (err, stdout, stderr) => {
                         if (err) {
                              console.error(err);
                              return
                         }
                         const buff = fs.readFileSync(`./media/sticker/${filename}-done.webp`)
                         conn.sendMessage(from, buff, MessageType.sticker, opt4tag)
                              .then((data) => {
                                   conn.sendMessage(from, strConversation, MessageType.text, { quoted: data })
                              })
                         // console.log(stdout)
                         fs.unlinkSync(savedFilename)
                         fs.unlinkSync(`./media/sticker/${filename}-done.webp`)
                    })

               } else if (int.type == 'imageMessage') {
                    const filename = `${sender.replace('@s.whatsapp.net', '')}-${moment().unix()}`
                    const savedFilename = await conn.downloadAndSaveMediaMessage(int.data, `./media/revoke/${filename}`);
                    const sizes = getFilesize(savedFilename)
                    const buff = fs.readFileSync(savedFilename)
                    const strConversation = `\`\`\`[ ?????? Terdeteksi Penghapusan Pesan ?????? ]

Nama : ${pushname} ( @${sender.replace('@s.whatsapp.net', '')} )
Tipe : Image
Ukuran : ${sizes}
Waktu : ${moment.unix(int.timestamp).format('HH:mm:ss DD/MM/YYYY')}
Pesan : ${body ? body : '-'}\`\`\`
`
                    conn.sendMessage(from, buff, MessageType.image, { quoted: int.data, contextInfo: { mentionedJid: [sender] }, caption: strConversation })
                    fs.unlinkSync(savedFilename)
               } else if (int.type == 'videoMessage') {
                    const filename = `${sender.replace('@s.whatsapp.net', '')}-${moment().unix()}`
                    const savedFilename = await conn.downloadAndSaveMediaMessage(int.data, `./media/revoke/${filename}`);
                    const sizes = getFilesize(savedFilename)
                    const buff = fs.readFileSync(savedFilename)
                    const strConversation = `\`\`\`[ ?????? Terdeteksi Penghapusan Pesan ?????? ]

Nama : ${pushname} ( @${sender.replace('@s.whatsapp.net', '')} )
Tipe : Video
Ukuran : ${sizes}
Waktu : ${moment.unix(int.timestamp).format('HH:mm:ss DD/MM/YYYY')}
Pesan : ${body ? body : '-'}\`\`\`
`
                    conn.sendMessage(from, buff, MessageType.video, { quoted: int.data, contextInfo: { mentionedJid: [sender] }, caption: strConversation })
                    fs.unlinkSync(savedFilename)
               } else if (int.type == 'audioMessage') {
                    const filename = `${sender.replace('@s.whatsapp.net', '')}-${moment().unix()}`
                    const savedFilename = await conn.downloadAndSaveMediaMessage(int.data, `./media/revoke/${filename}`);
                    const sizes = getFilesize(savedFilename)
                    const buff = fs.readFileSync(savedFilename)
                    const strConversation = `\`\`\`[ ?????? Terdeteksi Penghapusan Pesan ?????? ]

Nama : ${pushname} ( @${sender.replace('@s.whatsapp.net', '')} )
Tipe : ${mediaData.message.audioMessage.ptt ? 'Voice Note' : 'Audio'}
Ukuran : ${sizes}
Waktu : ${moment.unix(int.timestamp).format('HH:mm:ss DD/MM/YYYY')}
Pesan : ${body ? body : '-'}\`\`\`
`
                    conn.sendMessage(from, buff, MessageType.audio, { quoted: int.data, ptt: mediaData.message.audioMessage.ptt, contextInfo: { mentionedJid: [sender] } })
                         .then((data) => {
                              conn.sendMessage(from, strConversation, MessageType.text, { quoted: data })
                         })
                    fs.unlinkSync(savedFilename)
               }
          }
     } catch (error) {
          // console.log('%s' + error)
     }
}
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log('--- امسح الرمز المربع (QR Code) لتشغيل البوت ---');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            console.log('جاري إعادة الاتصال...');
            startBot();
        } else if (connection === 'open') {
            console.log('✅ تم اتصال بوت الواتساب بنجاح وهو جاهز الآن!');
        }
    });

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const messageType = Object.keys(msg.message)[0];
        const text = messageType === 'conversation' ? msg.message.conversation : 
                     messageType === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : '';

        // أمر تجريبي بسيط للرد التلقائي
        if (text.toLowerCase() === 'هلا') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'هلا بك عيوني! أنا بوت الواتساب الخاص بك شغال 100%' });
        }
    });
}

startBot();
 

const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, 
        logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    const phoneNumber = "966573677930"; 

    if (!sock.authState.creds.registered) {
        await delay(3000); 
        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log('\n======================================');
            console.log(`🔑 كود الربط الخاص بك هو: ${code}`);
            console.log('======================================\n');
        } catch (error) {
            console.log('خطأ في طلب الكود، تأكد من الرقم:', error);
        }
    }

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
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

        if (text.toLowerCase() === 'هلا') {
            await sock.sendMessage(msg.key.remoteJid, { text: 'هلا بك! أنا بوت الواتساب الخاص بك شغال 100%' });
        }
    });
}

startBot();

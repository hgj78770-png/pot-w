const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, 
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    sock.ev.on('creds.update', saveCreds);

    const phoneNumber = "966573677930"; 

    // طلب الكود مباشرة بدون شروط مسبقة
    setTimeout(async () => {
        try {
            console.log('\n======================================');
            console.log('جاري طلب كود الربط من سيرفرات الواتساب...');
            const code = await sock.requestPairingCode(phoneNumber);
            console.log(`🔑 كود الربط الخاص بك هو: ${code}`);
            console.log('======================================\n');
        } catch (error) {
            console.log('❌ خطأ أثناء طلب الكود، جاري إعادة المحاولة خلال ثواني...');
        }
    }, 5000); // ينتظر 5 ثواني فقط ويطبع الكود فوراً

    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'close') {
            console.log('جاري إعادة الاتصال...');
            startBot();
        } else if (connection === 'open') {
            console.log('✅ تم اتصال بوت الواتساب بنجاح وهو جاهز الآن!');
        }
    });
}

startBot();

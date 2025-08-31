import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

const { Client, LocalAuth, MessageMedia } = pkg;

let client;
let isReady = false;

const initWhatsapp = () => {
  client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true }
  });


  client.on("qr", (qr) => {
    console.log("📱 Scan this QR:");
    qrcode.generate(qr, { small: true });
  });

  client.on("loading_screen", (percent, message) => {
    console.log("⌛ Loading screen:", percent, message);
  });

  client.on("authenticated", () => {
    console.log("✅ Authenticated!");
    isReady = true;
  });

  client.on("auth_failure", (msg) => {
    console.error("❌ Authentication failed:", msg);
  });

  client.on("ready", () => {
    console.log("🚀 WhatsApp client is ready!");
    isReady = true;
  });

  client.on("disconnected", (reason) => {
    console.log("❌ Client disconnected:", reason);
    isReady = false;
  });

  client.on("change_state", (state) => {
    console.log("🔄 State changed:", state);
  });

  client.initialize();
};

const waitForConnected = () => {
  return new Promise((resolve) => {
    const check = () => {
      if (client.info && client.info.wid && isReady) {
        resolve();
      } else {
        setTimeout(check, 1000);
      }
    };
    check();
  });
};

export const sendWhatsappMessage = async (phoneNumber, messageText, imageBuffer, imageType = "image/png") => {
  if (!client) throw new Error("WhatsApp client not initialized");
  if (!isReady) {
    console.log("⚠️ WhatsApp client not ready yet. Message not sent.");
    return;
  }

  try {
    let media = null;
    if (imageBuffer) {
      media = new MessageMedia(imageType, imageBuffer.toString("base64"));
    }

    if (media) {
      await client.sendMessage(`91${phoneNumber}@c.us`, media, { caption: messageText });
    } else {
      await client.sendMessage(`91${phoneNumber}@c.us`, messageText);
    }

    console.log("📩 WhatsApp message sent to", phoneNumber);
  } catch (error) {
    console.error("⚠️ Error sending message:", error);
  }
};

export { initWhatsapp };

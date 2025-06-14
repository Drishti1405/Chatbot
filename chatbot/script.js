const API_KEY = "AIzaSyA7rRSCcmw4j2WPJrpoTNdCU2HG_pSaYVY"; 
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const chatForm = document.querySelector(".chat-form");
const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const fileInput = document.querySelector("#file-input");
const fileUploadBtn = document.querySelector("#file-upload");
const emojiBtn = document.querySelector("#emoji-btn");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const emojiPicker = document.querySelector("emoji-picker");

// Add message
function addMessage(sender, text) {
  const div = document.createElement("div");
  div.classList.add("message", sender === "user" ? "user-message" : "bot-message");
  div.innerHTML = `
    ${sender === "bot" ? `<div class="bot-icon-circle"><span class="material-symbols-outlined">robot_2</span></div>` : ""}
    <div class="message-text">${text}</div>`;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
  return div;
}

// Submit text
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  addMessage("user", text);
  messageInput.value = "";

  const loading = addMessage("bot", `<div class="thinking-indicator"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text }] }] })
    });
    const data = await res.json();
    loading.remove();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No reply.";
    addMessage("bot", reply);
  } catch (err) {
    loading.remove();
    addMessage("bot", `Error: ${err.message}`);
  }
});

// File upload (PDF)
fileUploadBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  if (file.type === "application/pdf") {
    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(" ") + "\n";
      }
      messageInput.value = text.trim().slice(0, 4000);
      alert("PDF text added. Click send.");
    };
    reader.readAsArrayBuffer(file);
  }
});

// Emoji picker
emojiBtn.addEventListener("click", () => {
  document.body.classList.toggle("show-emoji-picker");
});

emojiPicker.addEventListener("emoji-click", (e) => {
  messageInput.value += e.detail.unicode;
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("emoji-picker") && e.target.id !== "emoji-btn") {
    document.body.classList.remove("show-emoji-picker");
  }
});

// Toggle chatbot
chatbotToggler.addEventListener("click", () => {
  document.body.classList.toggle("show-chatbot");
});
closeChatbot.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
});

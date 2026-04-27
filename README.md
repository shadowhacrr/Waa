# WhatsApp Pakistani Chat App - Deployment Guide

## Project Overview
Ye ek **Real WhatsApp Web Clone** hai jo 10 Pakistani characters (6 girls + 4 boys) ke saath real-time chat karta hai. Har character ka alag personality, behavior, aur reply style hai.

## Features
- WhatsApp jesa original design (green ticks, bubbles, typing indicator)
- 10 unique Pakistani characters with different personalities
- Real-time AI responses without loading
- No database - sirf JSON files
- Mobile responsive
- End-to-end encrypted feel

---

## File Structure

```
whatsapp-chat-app/
├── server.js              # Main backend file
├── seed.js                # Initial greetings setup
├── package.json           # Dependencies
├── ai/
│   └── engine.js          # AI chat brain
├── data/
│   ├── characters.json    # All 10 characters data
│   └── chats/             # Chat history JSON files
└── frontend/
    ├── index.html         # Main HTML
    ├── css/
    │   └── style.css      # WhatsApp styling
    ├── js/
    │   └── app.js         # Frontend logic
    └── images/            # 10 character DPs
        ├── zara.jpg
        ├── aisha.jpg
        ├── fatima.jpg
        ├── mehak.jpg
        ├── sana.jpg
        ├── hiba.jpg
        ├── ahmed.jpg
        ├── bilal.jpg
        ├── usman.jpg
        └── hamza.jpg
```

---

## Local Setup

### Step 1: Install Node.js
Pehle Node.js install karein: https://nodejs.org (LTS version recommended)

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the App
```bash
npm start
```

Ya development mode mein:
```bash
npm run dev
```

Browser mein open karein: `http://localhost:3000`

---

## Customization Guide

### 1. Character Names Change Karna

**File:** `data/characters.json`

Har character ka object mein `name` field change karein:

```json
{
  "id": "zara",
  "name": "Zara ✨",    <-- Yahan change karein
  "gender": "female",
  ...
}
```

### 2. Display Pictures (DP) Change Karna

**Location:** `frontend/images/`

1. Apni pasand ki images is folder mein rakhein
2. File name same rakhne hain: `zara.jpg`, `aisha.jpg`, etc.
3. Size: 500x500 ya 1:1 ratio best hai
4. Format: JPG recommended

**Important:** Agar image ka naam change karna ho toh `data/characters.json` mein bhi update karein image path.

### 3. Character Personality Change Karna

**File:** `data/characters.json`

Har character ke ye fields change kar sakte hain:

- `personality`: Character ka overall nature
- `style`: Baat karne ka tarika
- `greeting`: Pehla message jo user dekhega
- `replyDelay`: Minimum aur maximum reply time (milliseconds)
- `typingSpeed`: `slow`, `medium`, ya `fast`
- `mood`: `loving`, `playful`, `caring`, `happy`, `confident`, etc.

### 4. Messages aur Replies Change Karna

**File:** `data/characters.json`

Har character ke `responsePatterns` mein categories hain:

```json
"responsePatterns": {
  "greeting": ["Assalam o alaikum jaan ❤️", "..."],
  "love": ["Tum se kitna pyar hai...", "..."],
  "miss": ["Main tumhe bohot miss kar rahi thi...", "..."],
  "angry": ["Hmph! Mujhe nahi baat karni...", "..."],
  "goodnight": ["Allah hafiz jaan...", "..."],
  "morning": ["Subha bakhair...", "..."],
  "default": ["Hmm... interesting...", "..."]
}
```

**Categories:**
- `greeting` - Jab user pehli baar message kare
- `love` - Jab pyar/mohabbat wale words aaye
- `miss` - Jab "miss", "yaad" wagera aaye
- `angry` - Jab user naraz ho
- `goodnight` - Raat ko bye kehne pe
- `morning` - Subha ke messages pe
- `default` - Koi bhi aur message

### 5. Naya Character Add Karna

**Step 1:** `data/characters.json` mein new object add karein:

```json
{
  "id": "newname",
  "name": "New Name 🌟",
  "gender": "female",
  "age": 24,
  "personality": "unique_trait",
  "style": "description of talking style",
  "greeting": "Pehla message",
  "language": "urdu_romantic",
  "replyDelay": [1000, 2500],
  "typingSpeed": "medium",
  "mood": "happy",
  "topics": ["love", "fun"],
  "quirks": ["unique behavior 1", "unique behavior 2"],
  "responsePatterns": {
    "greeting": ["Hi!"],
    "love": ["I love you too!"],
    "default": ["Interesting!"]
  }
}
```

**Step 2:** DP add karein: `frontend/images/newname.jpg`

**Step 3:** App restart karein

### 6. Boy/Girl Ratio Change Karna

Currently 6 girls, 4 boys hain. Agar ratio change karna ho:

1. `data/characters.json` mein characters add/remove karein
2. `frontend/images/` mein matching DPs add/remove karein
3. `ai/engine.js` mein koi change nahi chahiye - auto-detect kar lega

---

## Backend Code Changes

### Port Change Karna
**File:** `server.js`

```javascript
const PORT = process.env.PORT || 3000;  // <-- 3000 ko change kar sakte hain
```

### CORS Settings
**File:** `server.js`

```javascript
app.use(cors());  // <-- Specific domains ke liye restrict kar sakte hain
```

### Message History Limit
**File:** `ai/engine.js`

```javascript
// Keep last 100 messages for context
if (chat.messages.length > 100) {  // <-- 100 change kar sakte hain
  chat.messages = chat.messages.slice(-100);
}
```

---

## Frontend Code Changes

### Colors Change Karna
**File:** `frontend/css/style.css`

```css
:root {
  --whatsapp-teal: #075E54;     /* Header color */
  --whatsapp-green: #128C7E;    /* Secondary green */
  --whatsapp-light-green: #25D366;  /* Ticks, buttons */
  --chat-bg: #E5DDD5;           /* Chat background */
  --message-out: #DCF8C6;       /* Sent message bubble */
  --message-in: #FFFFFF;        /* Received message bubble */
}
```

### API Base URL
**File:** `frontend/js/app.js`

```javascript
const API_BASE = '';  // <-- Empty for same origin
```

Agar frontend alag server pe ho toh:
```javascript
const API_BASE = 'https://your-backend-url.com';
```

---

## Deployment Options

### Option 1: Vercel (Recommended - Free)

**Step 1:** Vercel CLI install karein:
```bash
npm i -g vercel
```

**Step 2:** Project root mein `vercel.json` banaein:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

**Step 3:** Deploy karein:
```bash
vercel
```

**Note:** Vercel pe data persistent nahi rahega (serverless), isliye chat history reset hogi. Iske liye **Option 2** ya **3** behtar hain.

---

### Option 2: Render (Recommended - Free with Persistent Data)

**Step 1:** [render.com](https://render.com) pe free account banaein

**Step 2:** "New Web Service" select karein

**Step 3:** GitHub se connect karein ya code upload karein

**Step 4:** Settings:
- **Name:** `whatsapp-pakistani-chat`
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free

**Step 5:** Deploy!

Data persistent rahega kyunki Render disk storage deta hai.

---

### Option 3: Railway (Free Tier)

**Step 1:** [railway.app](https://railway.app) pe account banaein

**Step 2:** "New Project" → "Deploy from GitHub repo"

**Step 3:** Repo select karein aur deploy karein

**Step 4:** Environment variables add karein agar chahiye:
- `PORT` → auto-detect hoga

---

### Option 4: VPS/Dedicated Server

Agar apna server hai (DigitalOcean, AWS, Linode, etc.):

```bash
# Code clone karein
git clone <your-repo-url>
cd whatsapp-chat-app

# Install dependencies
npm install

# PM2 se run karein (recommended for production)
npm install -g pm2
pm2 start server.js --name "whatsapp-chat"
pm2 save
pm2 startup

# Nginx reverse proxy setup karein (optional)
```

---

## Environment Variables

Agar production mein deploy karna ho, `.env` file banaein:

```
PORT=3000
NODE_ENV=production
```

Aur `server.js` mein ye add karein:
```javascript
require('dotenv').config();
```

Aur `package.json` mein:
```bash
npm install dotenv
```

---

## Important Notes

### Data Persistence
- Chat history `data/chats/` folder mein JSON files mein save hoti hai
- Agar server restart hota hai, data safe rehti hai
- Lekin agar serverless platform (Vercel) use karte hain, data reset hogi

### Character Images
- Generated AI images hain
- Agar real photos use karni hain, toh `frontend/images/` folder mein replace karein
- Sirf `.jpg` format aur same file names use karein

### AI Responses
- Built-in AI engine use karta hai - external API nahi chahiye
- Responses character personality ke hisab se randomized hain
- Har reply context-aware hai (keywords detect hote hain)

---

## Troubleshooting

### Port Already in Use
```bash
# Error: EADDRINUSE
# Solution: Port change karein server.js mein
```

### Images Not Loading
- Check `frontend/images/` mein files hain
- File names exactly match honi chahien character IDs se

### Chat History Lost
- Serverless platforms pe normal hai
- Persistent storage ke liye Render ya VPS use karein

---

## Support

Agar koi problem ho toh check karein:
1. `npm install` dubara run karein
2. `data/chats/` folder exist karta hai
3. `frontend/images/` mein all 10 images hain
4. Port 3000 free hai

---

## License
MIT License - Free to use and modify.

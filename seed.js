const fs = require('fs');
const path = require('path');
const characters = require('./data/characters.json').characters;

const chatsDir = path.join(__dirname, 'data', 'chats');
if (!fs.existsSync(chatsDir)) {
  fs.mkdirSync(chatsDir, { recursive: true });
}

characters.forEach(char => {
  const chatFile = path.join(chatsDir, `${char.id}.json`);
  
  if (!fs.existsSync(chatFile)) {
    const greetingMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      sender: 'them',
      text: char.greeting,
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      status: 'sent',
      characterId: char.id
    };
    
    fs.writeFileSync(chatFile, JSON.stringify({ messages: [greetingMessage] }, null, 2));
    console.log(`Seeded greeting for ${char.name}`);
  } else {
    // Check if greeting already exists
    const chat = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
    const hasGreeting = chat.messages.some(m => m.text === char.greeting);
    if (!hasGreeting && chat.messages.length === 0) {
      const greetingMessage = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        sender: 'them',
        text: char.greeting,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'sent',
        characterId: char.id
      };
      chat.messages.push(greetingMessage);
      fs.writeFileSync(chatFile, JSON.stringify(chat, null, 2));
      console.log(`Added greeting for ${char.name}`);
    }
  }
});

console.log('All characters seeded with initial greetings!');

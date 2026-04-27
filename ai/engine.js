const fs = require('fs');
const path = require('path');

const charactersFile = path.join(__dirname, '../data/characters.json');
const chatsDir = path.join(__dirname, '../data/chats');

// Ensure chats directory exists
if (!fs.existsSync(chatsDir)) {
  fs.mkdirSync(chatsDir, { recursive: true });
}

// Load characters
function loadCharacters() {
  const data = fs.readFileSync(charactersFile, 'utf8');
  return JSON.parse(data).characters;
}

// Get chat history for a character
function getChatHistory(characterId) {
  const chatFile = path.join(chatsDir, `${characterId}.json`);
  if (fs.existsSync(chatFile)) {
    return JSON.parse(fs.readFileSync(chatFile, 'utf8'));
  }
  return { messages: [] };
}

// Save chat message
function saveMessage(characterId, message) {
  const chatFile = path.join(chatsDir, `${characterId}.json`);
  let chat = getChatHistory(characterId);
  chat.messages.push(message);
  
  // Keep last 100 messages for context
  if (chat.messages.length > 100) {
    chat.messages = chat.messages.slice(-100);
  }
  
  fs.writeFileSync(chatFile, JSON.stringify(chat, null, 2));
  return message;
}

// Analyze message intent
function analyzeIntent(message) {
  const msg = message.toLowerCase();
  const intents = [];
  
  // Greeting detection
  if (/\b(assalam|salaam|salam|hi|hello|hey|hii|oye|sun)\b/.test(msg)) {
    intents.push('greeting');
  }
  
  // Love detection
  if (/\b(pyar|love|ishq|mohabbat|like|chaht|dil|heart|jaan|janu|baby)\b/.test(msg)) {
    intents.push('love');
  }
  
  // Miss detection
  if (/\b(miss|yaad| Missing|udas|alone|akela|tanha)\b/.test(msg)) {
    intents.push('miss');
  }
  
  // Angry detection
  if (/\b(naraz|gussa|angry|upset| annoyed|frustrat|bhool|busy)\b/.test(msg)) {
    intents.push('angry');
  }
  
  // Goodnight detection
  if (/\b(goodnight|night|allah hafiz|so jao|sleep|sote|khwab)\b/.test(msg)) {
    intents.push('goodnight');
  }
  
  // Morning detection
  if (/\b(good morning|morning|subha|utho|uthe|fajr)\b/.test(msg)) {
    intents.push('morning');
  }
  
  // Question detection
  if (/\b(kya|what|kaise|how|kahan|where|kyun|why|kaun|who|kab|when)\b/.test(msg)) {
    intents.push('question');
  }
  
  // Default if no intent detected
  if (intents.length === 0) {
    intents.push('default');
  }
  
  return intents;
}

// Get contextual keywords from message
function getContextualKeywords(message) {
  const msg = message.toLowerCase();
  const keywords = [];
  
  const keywordMap = {
    'kya': ['kya'],
    'what': ['kya'],
    'kaise': ['kaise'],
    'how': ['kaise'],
    'kahan': ['kahan'],
    'where': ['kahan'],
    'kab': ['kab'],
    'when': ['kab']
  };
  
  for (const [key, values] of Object.entries(keywordMap)) {
    if (msg.includes(key)) {
      keywords.push(...values);
    }
  }
  
  return keywords;
}

// Generate contextual response
function generateContextualResponse(character, userMessage, intents, keywords) {
  const responses = character.responsePatterns;
  let responsePool = [];
  
  // Add responses based on detected intents
  for (const intent of intents) {
    if (responses[intent]) {
      responsePool.push(...responses[intent]);
    }
  }
  
  // Add contextual responses based on keywords
  if (character.contextualResponses) {
    for (const ctx of character.contextualResponses) {
      for (const kw of keywords) {
        if (ctx.keywords.includes(kw)) {
          responsePool.push(...ctx.responses);
        }
      }
    }
  }
  
  // Add default responses if pool is empty
  if (responsePool.length === 0) {
    responsePool.push(...responses['default']);
  }
  
  // Pick a random response
  const response = responsePool[Math.floor(Math.random() * responsePool.length)];
  
  // Add some contextual flair based on recent conversation
  const chat = getChatHistory(character.id);
  const recentMessages = chat.messages.slice(-5);
  
  // If user asked a question, make response more engaging
  if (intents.includes('question') && response.length < 30) {
    const followUps = [
      ' Tum batao kya chal raha hai?',
      ' Aur sunao, kya special hai aaj?',
      ' Tumhari zindagi mein kya naya hai?'
    ];
    return response + followUps[Math.floor(Math.random() * followUps.length)];
  }
  
  return response;
}

// Generate a typing delay based on character
function getTypingDelay(character) {
  const [min, max] = character.replyDelay;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simulate typing indicator time
function getTypingDuration(character, responseLength) {
  const baseSpeed = character.typingSpeed === 'fast' ? 50 : 
                   character.typingSpeed === 'slow' ? 120 : 80;
  return Math.min(responseLength * baseSpeed, 3000);
}

// Main function to process user message and generate AI response
async function processMessage(characterId, userMessage) {
  const characters = loadCharacters();
  const character = characters.find(c => c.id === characterId);
  
  if (!character) {
    throw new Error('Character not found');
  }
  
  // Analyze the message
  const intents = analyzeIntent(userMessage);
  const keywords = getContextualKeywords(userMessage);
  
  // Generate response
  const responseText = generateContextualResponse(character, userMessage, intents, keywords);
  
  // Calculate delays
  const typingDelay = getTypingDelay(character);
  const typingDuration = getTypingDuration(character, responseText.length);
  
  // Create message object
  const aiMessage = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    sender: 'them',
    text: responseText,
    timestamp: new Date().toISOString(),
    status: 'sent',
    characterId: character.id
  };
  
  // Save to chat history
  saveMessage(characterId, aiMessage);
  
  return {
    message: aiMessage,
    typingDelay,
    typingDuration,
    character
  };
}

// Get all characters with their last message info
function getAllCharacters() {
  const characters = loadCharacters();
  return characters.map(char => {
    const chat = getChatHistory(char.id);
    const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
    return {
      ...char,
      lastMessage: lastMessage ? {
        text: lastMessage.text.substring(0, 50) + (lastMessage.text.length > 50 ? '...' : ''),
        timestamp: lastMessage.timestamp,
        sender: lastMessage.sender
      } : null,
      unreadCount: chat.messages.filter(m => m.sender === 'them' && m.status !== 'read').length
    };
  });
}

// Get chat for a specific character
function getChat(characterId) {
  return getChatHistory(characterId);
}

// Clear chat history
function clearChat(characterId) {
  const chatFile = path.join(chatsDir, `${characterId}.json`);
  if (fs.existsSync(chatFile)) {
    fs.writeFileSync(chatFile, JSON.stringify({ messages: [] }, null, 2));
  }
}

// Mark messages as read
function markAsRead(characterId) {
  const chatFile = path.join(chatsDir, `${characterId}.json`);
  const chat = getChatHistory(characterId);
  chat.messages.forEach(m => {
    if (m.sender === 'them') {
      m.status = 'read';
    }
  });
  fs.writeFileSync(chatFile, JSON.stringify(chat, null, 2));
}

module.exports = {
  processMessage,
  getAllCharacters,
  getChat,
  clearChat,
  saveMessage,
  markAsRead,
  loadCharacters
};

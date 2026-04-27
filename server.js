const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const aiEngine = require('./ai/engine');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'frontend')));

// ========== API ROUTES ==========

// Get all characters with chat preview
app.get('/api/characters', (req, res) => {
  try {
    const characters = aiEngine.getAllCharacters();
    // Remove sensitive data from response
    const safeCharacters = characters.map(c => ({
      id: c.id,
      name: c.name,
      gender: c.gender,
      age: c.age,
      personality: c.personality,
      mood: c.mood,
      lastMessage: c.lastMessage,
      unreadCount: c.unreadCount,
      image: `/images/${c.id}.jpg`
    }));
    res.json(safeCharacters);
  } catch (error) {
    console.error('Error getting characters:', error);
    res.status(500).json({ error: 'Failed to get characters' });
  }
});

// Get chat history for a character
app.get('/api/chat/:characterId', (req, res) => {
  try {
    const { characterId } = req.params;
    const chat = aiEngine.getChat(characterId);
    res.json(chat);
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({ error: 'Failed to get chat' });
  }
});

// Send message to a character
app.post('/api/chat/:characterId/send', async (req, res) => {
  try {
    const { characterId } = req.params;
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    
    // Save user message
    const userMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      sender: 'me',
      text: message.trim(),
      timestamp: new Date().toISOString(),
      status: 'read'
    };
    
    aiEngine.saveMessage(characterId, userMessage);
    
    // Process AI response
    const aiResponse = await aiEngine.processMessage(characterId, message.trim());
    
    res.json({
      userMessage,
      aiResponse: {
        message: aiResponse.message,
        typingDelay: aiResponse.typingDelay,
        typingDuration: aiResponse.typingDuration
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
app.post('/api/chat/:characterId/read', (req, res) => {
  try {
    const { characterId } = req.params;
    aiEngine.markAsRead(characterId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Clear chat history
app.delete('/api/chat/:characterId', (req, res) => {
  try {
    const { characterId } = req.params;
    aiEngine.clearChat(characterId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing chat:', error);
    res.status(500).json({ error: 'Failed to clear chat' });
  }
});

// Get character details
app.get('/api/character/:characterId', (req, res) => {
  try {
    const { characterId } = req.params;
    const characters = aiEngine.loadCharacters();
    const character = characters.find(c => c.id === characterId);
    
    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }
    
    // Remove sensitive patterns from response
    const safeCharacter = {
      id: character.id,
      name: character.name,
      gender: character.gender,
      age: character.age,
      personality: character.personality,
      mood: character.mood,
      style: character.style,
      image: `/images/${character.id}.jpg`
    };
    
    res.json(safeCharacter);
  } catch (error) {
    console.error('Error getting character:', error);
    res.status(500).json({ error: 'Failed to get character' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Chat Server running on port ${PORT}`);
  console.log(`📱 Open http://localhost:${PORT} to access the app`);
});

module.exports = app;

/**
 * WhatsApp Pakistani Chat App
 * Frontend JavaScript
 */

// ===== STATE =====
let currentCharacterId = null;
let currentChat = null;
let characters = [];
let isTyping = false;
let autoScroll = true;

// ===== DOM ELEMENTS =====
const chatListEl = document.getElementById('chat-list');
const chatMessagesEl = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const micIcon = document.getElementById('mic-icon');
const sendIcon = document.getElementById('send-icon');
const typingIndicator = document.getElementById('typing-indicator');
const emptyState = document.getElementById('empty-state');
const activeChat = document.getElementById('active-chat');
const contactName = document.getElementById('contact-name');
const contactStatus = document.getElementById('contact-status');
const contactAvatar = document.getElementById('contact-avatar');
const backBtn = document.getElementById('back-btn');
const searchInput = document.getElementById('search-input');
const clearSearch = document.getElementById('clear-search');
const searchBox = document.getElementById('search-box');
const searchBtn = document.getElementById('search-btn');

// ===== API CONFIG =====
const API_BASE = '';

// ===== UTILITY FUNCTIONS =====
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatFullDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
        return 'Today';
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== CHAT LIST =====
async function loadCharacters() {
    try {
        const response = await fetch(`${API_BASE}/api/characters`);
        characters = await response.json();
        renderChatList();
    } catch (error) {
        console.error('Error loading characters:', error);
        chatListEl.innerHTML = '<div class="chat-item">Error loading chats</div>';
    }
}

function renderChatList(searchTerm = '') {
    let filtered = characters;
    
    if (searchTerm) {
        filtered = characters.filter(c => 
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    chatListEl.innerHTML = filtered.map(char => {
        const hasUnread = char.unreadCount > 0;
        const isActive = char.id === currentCharacterId;
        const avatar = char.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(char.name)}&background=random&color=fff&size=128`;
        
        let lastMsgText = '';
        let lastMsgStatus = '';
        
        if (char.lastMessage) {
            const isMe = char.lastMessage.sender === 'me';
            const status = char.lastMessage.status;
            
            if (isMe) {
                const tickColor = status === 'read' ? 'read' : 'sent';
                lastMsgStatus = `<i class="fas fa-check-double tick-icon ${tickColor}"></i>`;
            }
            
            lastMsgText = char.lastMessage.text;
        } else {
            lastMsgText = char.mood === 'online' ? 'online' : 'Tap to start chatting';
        }
        
        return `
            <div class="chat-item ${isActive ? 'active' : ''} ${hasUnread ? 'has-unread' : ''}" 
                 data-id="${char.id}" 
                 onclick="openChat('${char.id}')">
                <img src="${avatar}" alt="${escapeHtml(char.name)}" class="chat-avatar">
                ${char.mood === 'online' || char.mood === 'loving' || char.mood === 'playful' || char.mood === 'happy' ? '<span class="online-indicator"></span>' : ''}
                <div class="chat-info">
                    <div class="chat-header-row">
                        <span class="chat-name">${escapeHtml(char.name)}</span>
                        <span class="chat-time ${hasUnread ? 'unread' : ''}">${char.lastMessage ? formatTime(char.lastMessage.timestamp) : ''}</span>
                    </div>
                    <div class="chat-preview-row">
                        <span class="chat-message">${lastMsgStatus}${escapeHtml(lastMsgText)}</span>
                        ${hasUnread ? `<span class="unread-count">${char.unreadCount}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== CHAT MESSAGES =====
async function openChat(characterId) {
    currentCharacterId = characterId;
    const character = characters.find(c => c.id === characterId);
    
    if (!character) return;
    
    // Update UI
    emptyState.classList.add('hidden');
    activeChat.classList.remove('hidden');
    
    contactName.textContent = character.name;
    contactStatus.textContent = character.mood === 'online' || character.mood === 'loving' || character.mood === 'playful' || character.mood === 'happy' ? 'online' : 'last seen today at ' + formatTime(new Date());
    contactAvatar.src = character.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=random&color=fff&size=128`;
    
    // Mark messages as read
    try {
        await fetch(`${API_BASE}/api/chat/${characterId}/read`, { method: 'POST' });
    } catch (e) {}
    
    // Load messages
    await loadMessages(characterId);
    
    // Mobile: show chat area
    if (window.innerWidth <= 900) {
        document.getElementById('chat-area').classList.add('open');
        document.getElementById('sidebar').style.display = 'none';
    }
    
    // Update chat list to show active
    renderChatList();
    
    // Scroll to bottom
    scrollToBottom();
    
    // Focus input
    messageInput.focus();
}

async function loadMessages(characterId) {
    try {
        const response = await fetch(`${API_BASE}/api/chat/${characterId}`);
        const data = await response.json();
        currentChat = data;
        renderMessages(data.messages);
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

function renderMessages(messages) {
    if (!messages || messages.length === 0) {
        chatMessagesEl.innerHTML = `
            <div class="date-divider">${formatFullDate(new Date())}</div>
            <div class="message received">
                <div class="message-text">${escapeHtml(getGreeting(currentCharacterId))}</div>
                <div class="message-meta">
                    <span class="message-time">${formatTime(new Date())}</span>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `<div class="date-divider">${formatFullDate(messages[0].timestamp)}</div>`;
    let lastDate = new Date(messages[0].timestamp).toDateString();
    
    messages.forEach((msg, index) => {
        const msgDate = new Date(msg.timestamp).toDateString();
        
        if (msgDate !== lastDate) {
            html += `<div class="date-divider">${formatFullDate(msg.timestamp)}</div>`;
            lastDate = msgDate;
        }
        
        const isMe = msg.sender === 'me';
        const status = msg.status || 'sent';
        
        let statusHtml = '';
        if (isMe) {
            if (status === 'read') {
                statusHtml = '<span class="tick read">✓✓</span>';
            } else if (status === 'delivered') {
                statusHtml = '<span class="tick">✓✓</span>';
            } else {
                statusHtml = '<span class="tick">✓</span>';
            }
        }
        
        html += `
            <div class="message ${isMe ? 'sent' : 'received'}" data-id="${msg.id}">
                <div class="message-text">${escapeHtml(msg.text)}</div>
                <div class="message-meta">
                    <span class="message-time">${formatTime(msg.timestamp)}</span>
                    ${isMe ? `<div class="message-status">${statusHtml}</div>` : ''}
                </div>
            </div>
        `;
    });
    
    chatMessagesEl.innerHTML = html;
    scrollToBottom();
}

function getGreeting(characterId) {
    const character = characters.find(c => c.id === characterId);
    return character ? character.greeting || 'Assalam o alaikum! ❤️' : 'Assalam o alaikum! ❤️';
}

function scrollToBottom() {
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

// ===== SEND MESSAGE =====
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentCharacterId) return;
    
    // Clear input
    messageInput.value = '';
    updateSendButton();
    
    // Add message to UI immediately
    const tempId = 'temp-' + Date.now();
    const messageHtml = `
        <div class="message sent" data-id="${tempId}">
            <div class="message-text">${escapeHtml(text)}</div>
            <div class="message-meta">
                <span class="message-time">${formatTime(new Date())}</span>
                <div class="message-status">
                    <span class="tick">✓</span>
                </div>
            </div>
        </div>
    `;
    
    // Remove empty date divider if exists
    const existingDivider = chatMessagesEl.querySelector('.date-divider');
    if (!existingDivider) {
        chatMessagesEl.innerHTML = `<div class="date-divider">${formatFullDate(new Date())}</div>`;
    }
    
    chatMessagesEl.insertAdjacentHTML('beforeend', messageHtml);
    scrollToBottom();
    
    // Send to server
    try {
        const response = await fetch(`${API_BASE}/api/chat/${currentCharacterId}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        
        const data = await response.json();
        
        // Update tick to double (delivered)
        const tempMsg = chatMessagesEl.querySelector(`[data-id="${tempId}"]`);
        if (tempMsg) {
            const statusEl = tempMsg.querySelector('.message-status');
            if (statusEl) {
                statusEl.innerHTML = '<span class="tick">✓✓</span>';
            }
        }
        
        // After delay, mark as read (green ticks)
        setTimeout(() => {
            const tempMsg2 = chatMessagesEl.querySelector(`[data-id="${tempId}"]`);
            if (tempMsg2) {
                const statusEl2 = tempMsg2.querySelector('.message-status');
                if (statusEl2) {
                    statusEl2.innerHTML = '<span class="tick read">✓✓</span>';
                }
            }
        }, 1500);
        
        // Show typing indicator
        if (data.aiResponse) {
            showTyping(data.aiResponse.typingDelay, data.aiResponse.typingDuration);
            
            // After typing, show AI response
            setTimeout(() => {
                hideTyping();
                addMessageToUI(data.aiResponse.message);
                
                // Update chat list preview
                loadCharacters();
            }, data.aiResponse.typingDelay + data.aiResponse.typingDuration);
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function addMessageToUI(message) {
    const messageHtml = `
        <div class="message received new-message" data-id="${message.id}">
            <div class="message-text">${escapeHtml(message.text)}</div>
            <div class="message-meta">
                <span class="message-time">${formatTime(message.timestamp)}</span>
            </div>
        </div>
    `;
    
    chatMessagesEl.insertAdjacentHTML('beforeend', messageHtml);
    scrollToBottom();
    
    // Remove new-message class after animation
    setTimeout(() => {
        const el = chatMessagesEl.querySelector(`[data-id="${message.id}"]`);
        if (el) el.classList.remove('new-message');
    }, 2000);
}

// ===== TYPING INDICATOR =====
function showTyping(delay, duration) {
    isTyping = true;
    
    setTimeout(() => {
        typingIndicator.classList.remove('hidden');
        scrollToBottom();
        
        // Update status to "typing..."
        contactStatus.textContent = 'typing...';
        contactStatus.classList.add('typing');
    }, delay);
    
    setTimeout(() => {
        hideTyping();
    }, delay + duration);
}

function hideTyping() {
    isTyping = false;
    typingIndicator.classList.add('hidden');
    
    // Update status back to online
    const character = characters.find(c => c.id === currentCharacterId);
    if (character) {
        contactStatus.textContent = character.mood === 'online' || character.mood === 'loving' || character.mood === 'playful' || character.mood === 'happy' ? 'online' : 'last seen just now';
    }
    contactStatus.classList.remove('typing');
}

// ===== UI HELPERS =====
function updateSendButton() {
    const hasText = messageInput.value.trim().length > 0;
    
    if (hasText) {
        micIcon.classList.add('hidden');
        sendIcon.classList.remove('hidden');
    } else {
        micIcon.classList.remove('hidden');
        sendIcon.classList.add('hidden');
    }
}

// ===== EVENT LISTENERS =====
messageInput.addEventListener('input', updateSendButton);

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

sendBtn.addEventListener('click', sendMessage);

backBtn.addEventListener('click', () => {
    document.getElementById('chat-area').classList.remove('open');
    document.getElementById('sidebar').style.display = 'flex';
    currentCharacterId = null;
    renderChatList();
});

// Search functionality
searchBtn.addEventListener('click', () => {
    searchBox.classList.toggle('active');
    if (searchBox.classList.contains('active')) {
        searchInput.focus();
    }
});

searchInput.addEventListener('input', (e) => {
    const term = e.target.value;
    if (term) {
        clearSearch.classList.add('visible');
    } else {
        clearSearch.classList.remove('visible');
    }
    renderChatList(term);
});

clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch.classList.remove('visible');
    renderChatList();
});

// Chat scroll - show/hide scroll to bottom button
chatMessagesEl.addEventListener('scroll', () => {
    const scrollBottomBtn = document.querySelector('.scroll-bottom');
    const isNearBottom = chatMessagesEl.scrollHeight - chatMessagesEl.scrollTop - chatMessagesEl.clientHeight < 100;
    
    if (scrollBottomBtn) {
        if (isNearBottom) {
            scrollBottomBtn.classList.add('hidden');
        } else {
            scrollBottomBtn.classList.remove('hidden');
        }
    }
});

// Responsive
window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
        document.getElementById('sidebar').style.display = 'flex';
        if (currentCharacterId) {
            document.getElementById('chat-area').classList.remove('open');
        }
    }
});

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    loadCharacters();
    
    // Add scroll to bottom button
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-bottom hidden';
    scrollBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
    scrollBtn.onclick = () => scrollToBottom();
    document.querySelector('.active-chat').appendChild(scrollBtn);
});

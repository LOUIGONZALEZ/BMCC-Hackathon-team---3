const chatDiv = document.getElementById('chat');
const form = document.getElementById('form');
const promptInput = document.getElementById('prompt');

function addMessage(text, who = 'ai') {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${who}`;
  // optional meta (timestamp)
  const meta = document.createElement('div');
  meta.className = 'meta';
  const now = new Date();
  meta.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  msgDiv.appendChild(meta);
  const content = document.createElement('div');
  content.className = 'content';
  content.textContent = text;
  msgDiv.appendChild(content);
  chatDiv.appendChild(msgDiv);
  // scroll down
  chatDiv.scrollTop = chatDiv.scrollHeight;
  return msgDiv;
}

async function askBackend(prompt) {
  try {
    const resp = await fetch('http://localhost:5000/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const j = await resp.json();
    if (j.reply) return j.reply;
    else return `Error: ${j.error || 'No reply'}`;
  } catch (err) {
    console.error('Network error', err);
    return `Network error: ${err.message}`;
  }
}

// Try to render math in a message (if LaTeX markup)
function renderMath(msgDiv) {
  const contentDiv = msgDiv.querySelector('.content');
  const txt = contentDiv.textContent;
  // if it has \( ... \) or $$ ... $$ markup, render
  try {
    katex.render(txt, contentDiv, { throwOnError: false, displayMode: true });
  } catch (e) {
    // fallback leave text
  }
}

form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) return;
  // user message
  const userMsg = addMessage(prompt, 'user');
  promptInput.value = '';
  // placeholder AI “thinking…”
  const thinking = addMessage('Thinking…', 'ai');
  const reply = await askBackend(prompt);
  // replace thinking message
  thinking.querySelector('.content').textContent = reply;
  renderMath(thinking);
});

// welcome
addMessage('Hello! Ask me a calculus question like “differentiate x^2 sin x” or “integrate x^2 from 0 to 1”.', 'ai');

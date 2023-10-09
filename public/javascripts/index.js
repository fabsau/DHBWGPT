// javascripts/index.js

// DOM elements reference cache
const domElements = {
  chatForm: document.getElementById('chat-form'),
  tokenInput: document.getElementById('token-input'),
  inputField: document.getElementById('message-input'),
  modelSelector: document.getElementById('model-selector'),
  temperatureInput: document.getElementById('temperature-input'),
  topPInput: document.getElementById('top-p-input'),
  frequencyPenaltyInput: document.getElementById('frequency-penalty-input'),
  presencePenaltyInput: document.getElementById('presence-penalty-input'),
  chat: document.getElementById('chat'),
  sendButton: document.getElementById('sendButton'),
  stopButton: document.getElementById('stopButton')
};

// Array to hold messages
let messages = [];

// Fetch controller
let controller;

function showStopButton() {
  domElements.sendButton.style.display = 'none';
  domElements.stopButton.style.display = 'block';
  domElements.stopButton.disabled = false;
}

function showSendButton() {
  domElements.stopButton.style.display = 'none';
  domElements.sendButton.style.display = 'block';
}

function fetchValues() {
  const { inputField, modelSelector, tokenInput, temperatureInput, topPInput, frequencyPenaltyInput, presencePenaltyInput } = domElements;

  return {
    inputText: inputField.value,
    model: modelSelector.value,
    token: parseInt(tokenInput.value),
    temperature: parseFloat(temperatureInput.value),
    topP: parseFloat(topPInput.value),
    frequencyPenalty: parseFloat(frequencyPenaltyInput.value),
    presencePenalty: parseFloat(presencePenaltyInput.value),
  }
}

async function generateResponse() {
  const { inputText, model, token, temperature, topP, frequencyPenalty, presencePenalty } = fetchValues();

  appendMessageToChat('user', inputText);
  domElements.inputField.value = '';
  domElements.inputField.focus();

  controller = new AbortController();
  showStopButton();

  try {
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        token,
        temperature,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        messages,
      }),
      signal: controller.signal,
    });

    showSendButton();

    if (!response.ok) throw response;

    const data = await response.json();
    const outputText = data.choices[0].message.content;

    appendMessageToChat('SwagGPT', outputText);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Fetch aborted');
    } else {
      console.error(`Error: ${error.statusText || error}`);
    }
  }

  // Event listener for stopButton click
  domElements.stopButton.addEventListener('click', () => {
    if (controller) controller.abort();
    appendMessageToChat('assistant', outputText);
    showSendButton();
  });
}

function appendMessageToChat(role, message) {
  const displayRole = role === 'user' ? 'You' : 'SwagGPT';
  domElements.chat.insertAdjacentHTML('beforeend', `<li>${displayRole}: ${message}</li>`);

  const apiRole = role === 'user' ? 'user' : 'assistant';
  messages.push({ role: apiRole, content: message });
}

function setupEventListeners() {
  domElements.chatForm.addEventListener('submit', event => {
    event.preventDefault();
    generateResponse();
  });

  domElements.inputField.addEventListener('keydown', event => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      generateResponse();
    }
  });
}

setupEventListeners();

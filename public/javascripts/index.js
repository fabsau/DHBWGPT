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

// Boolean to keep track of whether a request is being processed
let isProcessing = false;

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
  isProcessing = true;
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

    const data = await response.json();

    if (data.error) { // New block to handle error messages
      appendMessageToChat('Error', data.message); // Append error message to the chat
    } else {
      const outputText = data.choices[0].message.content;
      appendMessageToChat(APPLICATION_NAME, outputText);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Fetch aborted');
    } else {
      console.error(`Error: ${error.statusText || error}`);
    }
  } finally {
    // Re-enable the send button
    isProcessing = false;
    showSendButton();
    controller = null; // Reset the controller
  }
}
function appendMessageToChat(role, message) {
  const displayRole = role === 'user' ? 'You' : APPLICATION_NAME;
  domElements.chat.insertAdjacentHTML('beforeend', `<li>${displayRole}: ${message}</li>`);

  const apiRole = role === 'user' ? 'user' : 'assistant';
  messages.push({ role: apiRole, content: message });
}

function setupEventListeners() {
  domElements.chatForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!isProcessing) {
      generateResponse();
    }
  });

  domElements.stopButton.addEventListener('click', () => {
    if (controller) controller.abort();
  });

  domElements.tokenInput.addEventListener('wheel', scrollValue);
  domElements.temperatureInput.addEventListener('wheel', scrollValue);
  domElements.topPInput.addEventListener('wheel', scrollValue);
  domElements.frequencyPenaltyInput.addEventListener('wheel', scrollValue);
  domElements.presencePenaltyInput.addEventListener('wheel', scrollValue);

  domElements.inputField.addEventListener('keydown', event => {
    if (event.ctrlKey && event.key === 'Enter' && !isProcessing) {
      event.preventDefault();
      generateResponse();
    }
  });
}

setupEventListeners();

async function getSettings() {
  const response = await fetch('/settings');
  const data = await response.json();

  // Set the value of the input fields in the modal
  document.getElementById('endpoint-selector').value = data.endpoint;
  document.getElementById('custom-endpoint-input').value = data.custom_endpoint || '';
  document.getElementById('api-key-input').value = data.api_key;
  document.getElementById('system-message-input').value = data.system_message;
  document.getElementById('user-message-suffix-input').value = data.user_message_suffix;
}

async function updateSettings() {
  const endpoint = document.getElementById('endpoint-selector').value;
  const custom_endpoint = document.getElementById('custom-endpoint-input').value;
  const api_key = document.getElementById('api-key-input').value;
  const system_message = document.getElementById('system-message-input').value;
  const user_message_suffix = document.getElementById('user-message-suffix-input').value;

  const response = await fetch('/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      endpoint,
      custom_endpoint,
      system_message,
      user_message_suffix,
      api_key
    }),
  });

  const data = await response.json();

  if (data.status === 'success') {
    console.log(data.message);
    $('#settingsModal').modal('hide');
  }
}

// Event listener for system settings button click
document.getElementById('system-settings-button').addEventListener('click', getSettings);

// Event listener for save button click in the modal
document.getElementById('save-settings-button').addEventListener('click', updateSettings);

function scrollValue(event) {
  event.preventDefault();

  let step = 0.05;
  let min = 0;
  let max = 0;

  if (event.target.id === 'token-input') {
    step = 0.5;
    min = 0;
    max = 32768;
  } else if (event.target.id === 'temperature-input') {
    min = 0.0;
    max = 2.0;
  } else if (event.target.id === 'top-p-input') {
    min = 0.0;
    max = 1.0;
  } else if (event.target.id === 'frequency-penalty-input' || event.target.id === 'presence-penalty-input') {
    min = -2.0;
    max = 2.0;
  }

  let value = parseFloat(event.target.value) || 0;

  if (event.deltaY < 0) {
    value = Math.min(value + step, max);
  } else {
    value = Math.max(value - step, min);
  }

  let valueStr = (value % 1 === 0) ? value.toString() : value.toFixed(2);

  // Remove trailing zero in the decimal part
  if (valueStr.slice(-1) === '0' && valueStr.includes('.')) {
    valueStr = valueStr.slice(0, -1);
  }

  event.target.value = valueStr;
}


// Event listener for endpoint selection
document.addEventListener('DOMContentLoaded', function() {
  // Event listener for endpoint selection
  document.getElementById('endpoint-selector').addEventListener('change', function() {
    const customEndpointInput = document.getElementById('custom-endpoint-div');

    if (this.value === 'CUSTOM') {
      customEndpointInput.style.display = 'block';
    } else {
      customEndpointInput.style.display = 'none';
    }
  });
});
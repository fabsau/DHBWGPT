// DOM elements reference cache
// These are the elements we will interact with in the DOM
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
// This array will store the chat history
let messages = [];

// Add this variable to hold your fetch controller
let controller;

// Event listener for chat form submission
// Prevents page reload on form submission and calls generateResponse function
domElements.chatForm.addEventListener('submit', event => {
  event.preventDefault();
  generateResponse();
});

/**
 * Asynchronous function to generate a chat response using AI.
 * This function fetches the user's input and the AI model's settings,
 * sends a request to the server, then processes and displays the response.
 */
async function generateResponse() {
  const { chat, inputField, sendButton, stopButton, modelSelector, tokenInput, temperatureInput, topPInput, frequencyPenaltyInput, presencePenaltyInput } = domElements;

  // Fetch the user's input and the selected model settings
  const inputText = inputField.value;
  const model = modelSelector.value;
  const token = parseInt(tokenInput.value);
  const temperature = parseFloat(temperatureInput.value);
  const topP = parseFloat(topPInput.value);
  const frequencyPenalty = parseFloat(frequencyPenaltyInput.value);
  const presencePenalty = parseFloat(presencePenaltyInput.value);

  // Display the user's message in the chat
  appendMessageToChat('user', inputText);

  // Clear the input field and set focus back to it
  inputField.value = '';
  inputField.focus();

  // Create a new AbortController instance and assign it to the controller variable
  controller = new AbortController();

  // Change the send button to stop
  sendButton.style.display = 'none';
  stopButton.style.display = 'block';
  stopButton.disabled = false;

  // Send a POST request to the server with the chat and model settings
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
      signal: controller.signal, // Add this line
    });

    // Change the stop button back to send
    stopButton.style.display = 'none';
    sendButton.style.display = 'block';

    // If the response contains an error, throw it
    if (!response.ok) throw response;

    // Parse the response data
    const data = await response.json();
    const outputText = data.choices[0].message.content;

    // Display the AI's message in the chat
    appendMessageToChat('SwagGPT', outputText);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Fetch aborted');
    } else {
      console.error(`Error: ${error.statusText || error}`);
    }
  }
}

/**
 * Function to append a message to the chat and the messages array.
 * @param {string} role - The role of the message sender. It should be 'user' or 'assistant'.
 * @param {string} message - The message content.
 */
function appendMessageToChat(role, message) {
  // If the role is 'user', display 'You' in the chat. Otherwise, display 'SwagGPT'.
  const displayRole = role === 'user' ? 'You' : 'SwagGPT';
  domElements.chat.insertAdjacentHTML('beforeend', `<li>${displayRole}: ${message}</li>`);

  // But in the messages array, use 'assistant' as the role when it's not 'user'.
  const apiRole = role === 'user' ? 'user' : 'assistant';
  messages.push({ role: apiRole, content: message });
}
// Add this function to handle stop button click
domElements.stopButton.addEventListener('click', () => {
  if (controller) controller.abort();

// Display the AI's message in the chat
  appendMessageToChat('assistant', outputText);

  // Change the stop button back to send
  domElements.stopButton.style.display = 'none';
  domElements.sendButton.style.display = 'block';
});

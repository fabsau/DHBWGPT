// public/javascripts/index.js
// DOM elements reference cache
const domElements = {
  chatForm: document.getElementById('chat-form'), // Chat form element
  tokenInput: document.getElementById('token-input'), // Token input element
  inputField: document.getElementById('message-input'), // Message input field element
  modelSelector: document.getElementById('model-selector'), // Model selector element
  temperatureInput: document.getElementById('temperature-input'), // Temperature input element
  topPInput: document.getElementById('top-p-input'), // Top P input element
  frequencyPenaltyInput: document.getElementById('frequency-penalty-input'), // Frequency penalty input element
  presencePenaltyInput: document.getElementById('presence-penalty-input'), // Presence penalty input element
  chat: document.getElementById('chat'), // Chat element
  sendButton: document.getElementById('sendButton'), // Send button element
  stopButton: document.getElementById('stopButton') // Stop button element
};

// Array to hold messages
let messages = [];

// Fetch controller
let controller;

// Boolean to keep track of whether a request is being processed
let isProcessing = false;

/**
 * Shows the stop button and hides the send button.
 *
 * @returns {void}
 */
function showStopButton() {
  domElements.sendButton.style.display = 'none';
  domElements.stopButton.style.display = 'block';
  domElements.stopButton.disabled = false;
}

/**
 * Shows the send button and hides the stop button.
 *
 * @returns {void}
 */
function showSendButton() {
  domElements.stopButton.style.display = 'none';
  domElements.sendButton.style.display = 'block';
}

/**
 * Fetches the values of the input fields and returns them as an object.
 *
 * @returns {object} - The input values
 */
function fetchValues() {
  const { inputField, modelSelector, tokenInput, temperatureInput, topPInput, frequencyPenaltyInput, presencePenaltyInput } = domElements;

  return {
    inputText: inputField.value, // The user input text
    model: modelSelector.value, // The selected model
    token: parseInt(tokenInput.value), // The token value
    temperature: parseFloat(temperatureInput.value), // The temperature value
    topP: parseFloat(topPInput.value), // The top P value
    frequencyPenalty: parseFloat(frequencyPenaltyInput.value), // The frequency penalty value
    presencePenalty: parseFloat(presencePenaltyInput.value), // The presence penalty value
  }
}

/**
 * Sends a chat request to the AI and handles the response.
 *
 * @returns {void}
 */
async function generateResponse() {
  isProcessing = true;
  const { inputText, model, token, temperature, topP, frequencyPenalty, presencePenalty } = fetchValues();

  // Append the user message to the chat
  appendMessageToChat('user', inputText);
  domElements.inputField.value = '';
  domElements.inputField.focus();

  // Create an AbortController to be able to cancel the request if needed
  controller = new AbortController();
  showStopButton();

  try {
    // Send the chat request to the server
    const response = await fetch('/chat', {
      method: 'POST', // Use the POST method
      headers: {
        'Content-Type': 'application/json', // Specify the content type as JSON
      },
      body: JSON.stringify({ // Send the chat parameters as a JSON string
        model,
        token,
        temperature,
        top_p: topP,
        frequency_penalty: frequencyPenalty,
        presence_penalty: presencePenalty,
        messages,
      }),
      signal: controller.signal, // Use the AbortController signal to be able to cancel the request if needed
    });

    const data = await response.json();

    if (data.error) { // Handling error messages
      appendMessageToChat('Error', data.message); // Append error message to the chat
    } else {
      const outputText = data.choices[0].message.content; // Get the AI's response text from the returned data
      appendMessageToChat(APPLICATION_NAME, outputText); // Append the AI's response to the chat
    }
  } catch (error) {
    if (error.name === 'AbortError') { // Check if the error was caused by aborting the request
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

/**
 * Appends a new message to the chat.
 *
 * @param {string} role - The role of the message sender ('user' or 'assistant')
 * @param {string} message - The message content
 * @returns {void}
 */
function appendMessageToChat(role, message) {
  const displayRole = role === 'user' ? 'You' : APPLICATION_NAME; // If the sender is the user, display 'You', otherwise display the application name
  domElements.chat.insertAdjacentHTML('beforeend', `<li>${displayRole}: ${message}</li>`); // Append the message to the chat

  const apiRole = role === 'user' ? 'user' : 'assistant'; // If the sender is the user, use 'user', otherwise use 'assistant'
  messages.push({ role: apiRole, content: message }); // Add the message to the list of messages
}

/**
 * Sets up event listeners for the chat form and input fields.
 *
 * @returns {void}
 */
function setupEventListeners() {
  // Add event listener for submit button click
  domElements.chatForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!isProcessing) {
      generateResponse();
    }
  });

  // Add event listener for stop button click
  domElements.stopButton.addEventListener('click', () => {
    if (controller) controller.abort(); // Abort the request if it is still processing
  });

  // Add event listeners for the scroll wheel events on the input fields
  domElements.tokenInput.addEventListener('wheel', scrollValue);
  domElements.temperatureInput.addEventListener('wheel', scrollValue);
  domElements.topPInput.addEventListener('wheel', scrollValue);
  domElements.frequencyPenaltyInput.addEventListener('wheel', scrollValue);
  domElements.presencePenaltyInput.addEventListener('wheel', scrollValue);

  // Add event listener for Ctrl+Enter keydown on the input field
  domElements.inputField.addEventListener('keydown', event => {
    if (event.ctrlKey && event.key === 'Enter' && !isProcessing) {
      event.preventDefault();
      generateResponse();
    }
  });
}

// Call the setupEventListeners function to initialize the event listeners
setupEventListeners();

/**
 * Gets the current chat settings from the server and displays them in the settings modal.
 *
 * @returns {void}
 */
async function getSettings() {
  const response = await fetch('/settings'); // Send a GET request to the server to get the current settings
  const data = await response.json();

  // Set the value of the input fields in the modal
  // document.getElementById('endpoint-selector').value = data.endpoint;
  // document.getElementById('custom-endpoint-input').value = data.custom_endpoint || '';
  // document.getElementById('api-key-input').value = data.api_key;
  document.getElementById('system-message-input').value = data.system_message;
  document.getElementById('user-message-suffix-input').value = data.user_message_suffix;
}

/**
 * Updates the chat settings on the server and hides the settings modal.
 *
 * @returns {void}
 */
async function updateSettings() {
  // Get the values of the input fields in the modal
  // const endpoint = document.getElementById('endpoint-selector').value;
  // const custom_endpoint = document.getElementById('custom-endpoint-input').value;
  // const api_key = document.getElementById('api-key-input').value;
  const system_message = document.getElementById('system-message-input').value;
  const user_message_suffix = document.getElementById('user-message-suffix-input').value;

  const response = await fetch('/settings', {
    method: 'POST', // Use the POST method
    headers: {
      'Content-Type': 'application/json', // Specify the content type as JSON
    },
    body: JSON.stringify({ // Send the updated settings as a JSON string
      // endpoint,
      // custom_endpoint,
      system_message,
      user_message_suffix,
      // api_key
    }),
  });

  const data = await response.json();

  if (data.status === 'success') { // If the server successfully updated the settings
    console.log(data.message);
    $('#settingsModal').modal('hide'); // Hide the settings modal
  }
}

// Add event listener for system settings button click
document.getElementById('system-settings-button').addEventListener('click', getSettings);

// Add event listener for save button click in the modal
document.getElementById('save-settings-button').addEventListener('click', updateSettings);

/**
 * Scrolls the value of the input field up or down.
 *
 * @param {Event} event - The scroll event
 * @returns {void}
 */
function scrollValue(event) {
  event.preventDefault();

  let step = 0.05;
  let min = 0;
  let max = 0;

  // Step size is halfed due to a bug counting the scroll event twice
  if (event.target.id === 'token-input') { // If the target is the token input field
    step = 0.5; // Set the step to 0.5
    min = 0; // Set the minimum value to 0
    max = 32768; // Set the maximum value to 32768
  } else if (event.target.id === 'temperature-input') { // If the target is the temperature input field
    min = 0.0; // Set the minimum value to 0.0
    max = 2.0; // Set the maximum value to 2.0
  } else if (event.target.id === 'top-p-input') { // If the target is the top P input field
    min = 0.0; // Set the minimum value to 0.0
    max = 1.0; // Set the maximum value to 1.0
  } else if (event.target.id === 'frequency-penalty-input' || event.target.id === 'presence-penalty-input') { // If the target is the frequency penalty or presence penalty input field
    min = -2.0; // Set the minimum value to -2.0
    max = 2.0; // Set the maximum value to 2.0
  }

  let value = parseFloat(event.target.value) || 0; // Get the current value of the input field

  if (event.deltaY < 0) { // If the scroll event is scrolling up
    value = Math.min(value + step, max); // Increment the value by the step, up to the maximum value
  } else { // If the scroll event is scrolling down
    value = Math.max(value - step, min); // Decrement the value by the step, down to the minimum value
  }

  let valueStr = (value % 1 === 0) ? value.toString() : value.toFixed(2); // Convert the value to a string, with two decimal places if it is not an integer

  // Remove trailing zero in the decimal part
  if (valueStr.slice(-1) === '0' && valueStr.includes('.')) {
    valueStr = valueStr.slice(0, -1);
  }

  event.target.value = valueStr; // Set the new value of the input field
}

// Add event listener for endpoint selection
/*
document.addEventListener('DOMContentLoaded', function() {
  // Add event listener for endpoint selection
  document.getElementById('endpoint-selector').addEventListener('change', function() {
    const customEndpointInput = document.getElementById('custom-endpoint-div');

    if (this.value === 'CUSTOM') { // If the selected value is 'CUSTOM'
      customEndpointInput.style.display = 'block'; // Show the custom endpoint input field
    } else { // If the selected value is not 'CUSTOM'
      customEndpointInput.style.display = 'none'; // Hide the custom endpoint input field
    }
  });
})*/;
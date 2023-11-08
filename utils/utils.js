// utils/utils.js
// Import required modules
const fetch = require('node-fetch');

/**
 * Utility functions to handle various tasks related to chat with the AI.
 */

// Load environment variables
require('dotenv').config();

module.exports = {
  /**
   * Extracts request parameters from the request body and environment variables.
   *
   * @param {object} body - The request body
   * @returns {object} - The extracted request parameters
   */
  extractRequestParams: function(body) {
    // Extract request parameters from the request body and environment variables
    const { messages, model, token, temperature, top_p, frequency_penalty, presence_penalty } = body;
    const { AZURE_RESOURCE_NAME, API_KEY, SYSTEM_MESSAGE, USER_MESSAGE_SUFFIX, AZURE_API_VERSION } = process.env;

    return { messages, model, token, temperature, top_p, frequency_penalty, presence_penalty, AZURE_RESOURCE_NAME, API_KEY, SYSTEM_MESSAGE, USER_MESSAGE_SUFFIX, AZURE_API_VERSION };
  },

  /**
   * Formats messages by appending the user message suffix and prepending the system message.
   *
   * @param {array} messages - The messages to be formatted
   * @returns {array} - The formatted messages
   */
  formatMessages: function(messages) {
    // Format the messages by appending the user message suffix and prepending the system message
    console.log("Received user prompt:", messages);

    let sentMessages = messages.map(message => {
      if (message.role === 'user') {
        return {...message, content: message.content + "/n" + (process.env.USER_MESSAGE_SUFFIX || '')};
      } else {
        return message;
      }
    });

    if (process.env.SYSTEM_MESSAGE) {
      sentMessages.unshift({role: 'system', content: process.env.SYSTEM_MESSAGE});
    }

    console.log("System message:", process.env.SYSTEM_MESSAGE);
    return sentMessages;
  },

  /**
   * Makes a request to the AI with the given request parameters and messages.
   *
   * @param {object} requestParams - The request parameters
   * @param {array} sentMessages - The messages to be sent to the AI
   * @returns {object} - The response from the AI
   */
  makeRequest: async function(requestParams, sentMessages) {
    // Make a request to the AI with the given request parameters and messages
    const { model, token, temperature, top_p, frequency_penalty, presence_penalty, AZURE_RESOURCE_NAME, CUSTOM_ENDPOINT, API_KEY, AZURE_API_VERSION } = requestParams;

    const requestBody = {
      model,
      messages: sentMessages,
      max_tokens: token,
      temperature,
      top_p,
      frequency_penalty,
      presence_penalty,
    };

    // Define the endpoint and URL to be used based on the environment variable `ENDPOINT`
    const ENDPOINT = process.env.ENDPOINT || 'AZURE';
    let url, headers;

    if (ENDPOINT === 'AZURE') {
      console.log("Request to Azure:", requestBody);
      url = `https://${AZURE_RESOURCE_NAME}.openai.azure.com/openai/deployments/${model}/chat/completions?api-version=${AZURE_API_VERSION}`;
      headers = {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      };
    } else if (ENDPOINT === 'OPENAI') {
      console.log("Request to OpenAI:", requestBody);
      requestBody.model = model.replace('35', '3.5'); // Correct the model name for OpenAI
      url = `https://api.openai.com/v1/chat/completions`;
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      };
    } else if (ENDPOINT === 'CUSTOM') {
      console.log("Request to custom endpoint:", requestBody);
      requestBody.model = model.replace('35', '3.5'); // Correct the model name for OpenAI
      url = CUSTOM_ENDPOINT;
      headers = {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      };
    } else {
      throw new Error(`Invalid endpoint: ${ENDPOINT}`);
    }

    return await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });
  },

  /**
   * Processes the response from the AI.
   *
   * @param {object} response - The response from the AI
   * @param {object} res - The Express response object
   */
  processResponse: async function(response, res) {
    // Process the response from the AI and send the processed response to the client
    if (response.ok) {
      const data = await response.json();
      console.log("Response data:", data);
      console.log("AI Response:", data.choices[0].message.content);
      res.json(data);
    } else {
      const errorData = await response.json();
      console.error("Error data:", errorData);
      res.status(response.status).json({ error: `Error: ${response.status}`, message: errorData.error.message });
    }
  },

  /**
   * Handles errors that occur during the chat request.
   *
   * @param {object} error - The error
   * @param {object} res - The Express response object
   */
  handleError: function(error, res) {
    // Handle errors that occur during the chat request and send an error response to the client
    console.error("Caught error:", error);
    res.status(500).json({ error: `Error: ${error}`, message: "An error occurred during the chat request." });
  }
};

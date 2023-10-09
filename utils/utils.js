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
    const { messages, model, token, temperature, top_p, frequency_penalty, presence_penalty } = body;
    const { RESSOURCE_NAME, OPENAI_API_KEY, SYSTEM_MESSAGE, USER_MESSAGE_SUFFIX, API_VERSION } = process.env;

    return { messages, model, token, temperature, top_p, frequency_penalty, presence_penalty, RESSOURCE_NAME, OPENAI_API_KEY, SYSTEM_MESSAGE, USER_MESSAGE_SUFFIX, API_VERSION };
  },

  /**
   * Formats messages by appending the user message suffix and prepending the system message.
   *
   * @param {array} messages - The messages to be formatted
   * @returns {array} - The formatted messages
   */
  formatMessages: function(messages) {
    console.log("Received user prompt:", messages);

    let sentMessages = messages.map(message => {
      if (message.role === 'user') {
        return {...message, content: message.content + (process.env.USER_MESSAGE_SUFFIX || '')};
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
    const { model, token, temperature, top_p, frequency_penalty, presence_penalty, RESSOURCE_NAME, OPENAI_API_KEY, API_VERSION } = requestParams;

    const requestBody = {
      model,
      messages: sentMessages,
      max_tokens: token,
      temperature,
      top_p,
      frequency_penalty,
      presence_penalty,
    };

    console.log("Request to Azure:", requestBody);

    return await fetch(`https://${RESSOURCE_NAME}.openai.azure.com/openai/deployments/${model}/chat/completions?${API_VERSION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': OPENAI_API_KEY,
      },
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
    if (response.ok) {
      const data = await response.json();
      console.log("Response data:", data);
      res.json(data);
    } else {
      const errorData = await response.json();
      console.error("Error data:", errorData);
      res.status(response.status).json({ error: `Error: ${response.status}` });
    }
  },

  /**
   * Handles errors that occur during the chat request.
   *
   * @param {object} error - The error
   * @param {object} res - The Express response object
   */
  handleError: function(error, res) {
    console.error("Caught error:", error);
    res.status(500).json({ error: `Error: ${error}` });
  }
};

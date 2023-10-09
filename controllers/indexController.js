// /controllers/indexController.js
var express = require('express');
var { body } = require('express-validator');
const fetch = require('node-fetch');
require('dotenv').config();

/**
 * Index controller to manage chat operations
 */
var indexController = {
  getIndex: function(req, res, next) {
    res.render('index', { title: 'Express' });
  },

  /**
   * Post chat and get response from AI
   */
  postChat: async function(req, res, next) {
    // Trim and sanitize received messages
    body('messages').trim().escape();

    // Extract variables from request body and environment
    const { messages, model, token, temperature, top_p, frequency_penalty, presence_penalty } = req.body;
    const { RESSOURCE_NAME, OPENAI_API_KEY, SYSTEM_MESSAGE, USER_MESSAGE_SUFFIX, API_VERSION } = process.env;

    // Log received messages
    console.log("Received user prompt:", messages);

    // Append suffix to user messages
    const sentMessages = messages.map(message => {
      if (message.role === 'user') {
        return {...message, content: message.content + (USER_MESSAGE_SUFFIX || '')};
      } else {
        return message;
      }
    });

    // Prepend system message
    if (SYSTEM_MESSAGE) {
      sentMessages.unshift({role: 'system', content: SYSTEM_MESSAGE});
    }

    console.log("System message:", SYSTEM_MESSAGE);

    try {
      // Prepare request body
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

      // Make request to Azure
      const response = await fetch(`https://${RESSOURCE_NAME}.openai.azure.com/openai/deployments/${model}/chat/completions?${API_VERSION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': OPENAI_API_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      // Process response
      if (response.ok) {
        const data = await response.json();
        console.log("Response data:", data);
        res.json(data);
      } else {
        const errorData = await response.json();
        console.error("Error data:", errorData);
        res.status(response.status).json({ error: `Error: ${response.status}` });
      }
    } catch (error) {
      console.error("Caught error:", error);
      res.status(500).json({ error: `Error: ${error}` });
    }
  }
}

// Exporting the module
module.exports = indexController;
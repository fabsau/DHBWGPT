// controller/indexController.js
// Import required modules
const { body } = require('express-validator');

// Import local modules
const utils = require('../utils/utils');

// Load environment variables
require('dotenv').config();

/**
 * This controller handles requests for the index route.
 * It includes the function to render the index page and the function to handle chat requests.
 */
const indexController = {
  /**
   * Handles GET requests for the index route.
   * Renders the index page.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  getIndex: function(req, res) {
    // Render the index page with the APPLICATION_NAME environment variable
    res.render('index', { title: 'Express', APPLICATION_NAME: process.env.APPLICATION_NAME });
  },

  /**
   * Handles POST requests for chat.
   * Retrieves chat settings from the request, sends them to the AI, and processes the response.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  postChat: async function(req, res) {
    // Sanitize the messages body parameter
    body('messages').trim().escape();

    // Extract request parameters from the request body
    const requestParams = utils.extractRequestParams(req.body);

    // Format the messages to be sent to the AI
    const sentMessages = utils.formatMessages(requestParams.messages);

    try {
      // Send the chat request to the AI and get the response
      const response = await utils.makeRequest(requestParams, sentMessages);

      // Process the AI response and send the processed response to the client
      await utils.processResponse(response, res);
    } catch (error) {
      // Handle errors and send an error response to the client
      utils.handleError(error, res);
    }
  },

  /**
   * Handles GET requests for system settings.
   * Sends the system settings to the client.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  getSettings: function(req, res) {
    // Get the system settings from the environment variables and send them to the client
    res.json({
      // endpoint: process.env.ENDPOINT,
      // custom_endpoint: process.env.CUSTOM_ENDPOINT,
      // api_key: process.env.API_KEY,
      system_message: process.env.SYSTEM_MESSAGE,
      user_message_suffix: process.env.USER_MESSAGE_SUFFIX,
    });
  },

  /**
   * Handles POST requests for system settings.
   * Updates the system settings with the provided values.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  updateSettings: async function(req, res) {
    // Extract the new system settings from the request body
    const { endpoint, custom_endpoint, api_key, system_message, user_message_suffix } = req.body;

    // Update the environment variables with the new system settings
    // if(endpoint) process.env.ENDPOINT = endpoint;
    // if(custom_endpoint) process.env.CUSTOM_ENDPOINT = custom_endpoint;
    // if(api_key) process.env.API_KEY = api_key;
    if(system_message) process.env.SYSTEM_MESSAGE = system_message;
    if(user_message_suffix) process.env.USER_MESSAGE_SUFFIX = user_message_suffix;

    // Send a success response to the client
    res.json({
      status: "success",
      message: "Settings updated successfully"
    });
  }
}

// Export the controller
module.exports = indexController;

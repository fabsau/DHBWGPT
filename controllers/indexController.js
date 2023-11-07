// /controllers/indexController.js
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
    res.render('index', { title: 'Express' });
  },

  /**
   * Handles POST requests for chat.
   * Retrieves chat settings from the request, sends them to the AI, and processes the response.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  postChat: async function(req, res) {
    body('messages').trim().escape();

    // Extract request parameters
    const requestParams = utils.extractRequestParams(req.body);

    // Format messages
    const sentMessages = utils.formatMessages(requestParams.messages);

    try {
      // Make request to AI
      const response = await utils.makeRequest(requestParams, sentMessages);

      // Process AI response
      await utils.processResponse(response, res);
    } catch (error) {
      // Handle error
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
    res.json({
      endpoint: process.env.ENDPOINT,
      custom_endpoint: process.env.CUSTOM_ENDPOINT,
      api_key: process.env.API_KEY,
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
    console.log("UPDATE Settings request received with data:", req.body);
    const { endpoint, custom_endpoint, api_key, system_message, user_message_suffix } = req.body;
    if(endpoint) process.env.ENPOINT = endpoint;
    if(custom_endpoint) process.env.CUSTOM_ENDPOINT = custom_endpoint;
    if(api_key) process.env.API_KEY = api_key;
    if(system_message) process.env.SYSTEM_MESSAGE = system_message;
    if(user_message_suffix) process.env.USER_MESSAGE_SUFFIX = user_message_suffix;

    res.json({
      status: "success",
      message: "Settings updated successfully"
    });
  }
}

// Export the controller
module.exports = indexController;

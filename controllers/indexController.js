// /controllers/indexController.js
// Import required modules
const express = require('express');
const { body } = require('express-validator');
const fetch = require('node-fetch');

// Import local modules
const utils = require('../utils/utils');

// Load environment variables
require('dotenv').config();

/**
 * This controller handles requests for the index route.
 * It includes the function to render the index page and the function to handle chat requests.
 */
var indexController = {
  /**
   * Handles GET requests for the index route.
   * Renders the index page.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  getIndex: function(req, res, next) {
    res.render('index', { title: 'Express' });
  },

  /**
   * Handles POST requests for chat.
   * Retrieves chat settings from the request, sends them to the AI, and processes the response.
   *
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   * @param {function} next - Express next middleware function
   */
  postChat: async function(req, res, next) {
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
   * @param {function} next - Express next middleware function
   */
  getSettings: function(req, res, next) {
    res.json({
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
   * @param {function} next - Express next middleware function
   */
  updateSettings: async function(req, res, next) {
    console.log("UPDATE Settings request received with data:", req.body);
    const { system_message, user_message_suffix } = req.body;

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

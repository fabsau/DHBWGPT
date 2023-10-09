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
  }
}

// Export the controller
module.exports = indexController;

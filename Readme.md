# DHBWGPT

DHBWGPT is an adaptable ChatGPT frontend web client that interfaces with Azure OpenAI, OpenAI, or a custom API endpoint to generate AI-powered chat responses. The application is built with Node.js, Express.js, Pug and Bootstrap, providing a responsive and user-friendly interface.

## Features

- Supports the OpenAI models `GPT 3.5 Turbo`, `GPT 3.5 Turbo 16K`, `GPT-4`, and `GPT-4 32K`.
- Provides customization options, including the selection of the model, adjustment of response length (maximum tokens), control over the randomness and diversity of responses (temperature and top P values), and tuning of frequency and presence penalties.
- Includes a user-friendly GUI for tailoring system messages and user message suffixes.
- Enables users to modify System Settings such as the chat endpoint (be it Azure OpenAI, OpenAI, or a custom defined endpoint), the system message, and user message suffix. These adjustments can be made either through environment variables or directly within the web application.
- Features a responsive frontend designed with Pug and Bootstrap for seamless usage across different devices.

## Project Structure

Here's a brief overview of the important files and directories:

- `index.pug`: This is the main Pug file for the frontend. It extends the layout and sets up the chat interface.
- `layout.pug`: This is the main layout file for the application. It includes Bootstrap for styling and sets up the main structure of the site.
- `app.js`: This is the main entry point of the application. It sets up the Express app and its configurations.
- `utils/utils.js`: This file contains various utility functions for handling the chat with the AI, including extracting request parameters, formatting messages, making requests to the AI, and handling responses and errors.
- `routes/index.js`: This file is responsible for defining the routes for the application.
- `javascripts/index.js`: This is the main JavaScript file for the frontend. It sets up the chat interface and handles sending user inputs to the backend and displaying the responses.
- `controllers/indexController.js`: This controller handles requests for the index route. It renders the main page and handles requests to the AI.

## Environment Variables

The application requires the following environment variables to be set in a `.env` file in the root directory. A template for the `.env` file is provided in `.env.example`.

- `APPLICATION_NAME`: The name of the application.
- `ENDPOINT`: The endpoint to use for AI chat requests. Options are AZURE, OPENAI, or CUSTOM.
- `CUSTOM_ENDPOINT`: If ENDPOINT is set to CUSTOM, this should be the URL of the custom endpoint.
- `API_KEY`: The API key that is used for the authenticating with the endpoint.
- `AZURE_RESOURCE_NAME`: The name of your Azure resource.
- `AZURE_API_VERSION`: The version of the Azure API being used. Current latest is: 2023-07-01-preview.
- `SYSTEM_MESSAGE`: The system message that needs to be set for each chat.
- `USER_MESSAGE_SUFFIX`: A suffix to add to each user messages.

## Local Installation

Make sure you have [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm) installed.

1. Clone this repository:
    ```bash
    git clone https://github.com/fabsau/DHBWGPT.git
    ```

2. Navigate into the project directory:
    ```bash
    cd DHBWGPT
    ```

3. Install the dependencies:
    ```bash
    npm install
    ```

4. Run the application:
    ```bash
    npm start
    ```

The application will run on `http://localhost:3000`.

## Docker Installation
Docker aids in running applications in a secure, isolated container. Here's the shortened guide to use DHBWGPT with Docker:

### Docker Run

1. Install Docker from [here](https://www.docker.com/products/docker-desktop) if not done already.

2. Run the application using the image from Docker Hub:
    ```bash
    docker run -p 3000:3000 -d ghcr.io/fabsau/dhbwgpt:latest
    ```

Your application will be accessible at `http://localhost:3000`.

### Docker Compose

Docker Compose helps in managing multi-container Docker applications.

1. Install Docker Compose from [here](https://docs.docker.com/compose/install/) if not done already.

2. Create a `docker-compose.yml` file in the project root directory and add:

    ```yaml
    version: "3"
    services:
      dhbwgpt:
        image: ghcr.io/fabsau/dhbwgpt:latest
        ports:
          - "3000:3000"
        environment:
          - APPLICATION_NAME=your_application_name
          - ENDPOINT=
          - API_KEY=your_api_key
          - AZURE_RESOURCE_NAME=your_azure_resource_name
          - AZURE_API_VERSION=2023-07-01-preview
          - SYSTEM_MESSAGE="your_custom_system_message"
          - USER_MESSAGE_SUFFIX="your_custom_user_message_suffix"
    ```

   Replace the placeholder values with your actual values.

3. Run the application:
    ```bash
    docker-compose up
    ```

Your application will be accessible at `http://localhost:3000`.

### Building The Docker Image

You can build the Docker image yourself by following these steps:

1. Clone the project repository:
    ```bash
    git clone https://github.com/fabsau/DHBWGPT.git
    ```

2. Move into the project directory:
    ```bash
    cd DHBWGPT
    ```

3. Build the Docker image:
    ```bash
    docker build -t your_custom_name:latest .
    ```

Replace `your_custom_name` with the name you want to give to your Docker image.

## Acknowledgments

- Inspired by [SwagGPT](https://www.youtube.com/watch?v=0vRa0pf9cI0)

## Detailed Documentation
### app.js
The `app.js` file is the main entry point of the application. It sets up the Express app and its configurations, including the view engine, middleware, and error handlers. It also includes the route definitions for the app. This file begins by requiring necessary dependencies such as express, path, and other middleware like morgan for logging. It also loads environment variables from the `.env` file using `dotenv`. After that, it imports the router from `./routes/index` to handle the incoming HTTP requests. The app is then configured to use the Pug template engine and serve static files from the `public` directory. In middleware setup, it uses morgan for request logging in the 'dev' format, and express.json and express.urlencoded for parsing incoming request bodies. The app then uses the imported router to handle the root routes. It also includes error handling middleware for handling 404 errors and other errors, rendering an error page in response. Finally, the express app is exported for use in other modules.

### utils/utils.js
The `utils/utils.js` file is a utility module that provides helper functions for handling various aspects of the AI chat feature. It includes functions for extracting request parameters from the request body and environment variables, formatting messages, making requests to the AI, processing responses from the AI, and handling errors. It also loads environment variables using `dotenv`. The `extractRequestParams()` function retrieves parameters such as messages, model, token, temperature, and others from the request body and environment variables. The `formatMessages()` function formats the incoming messages by appending user message suffix and prepending system message. The `makeRequest()` function sends a request to the AI with the given request parameters and messages and it supports different endpoints based on the `ENDPOINT` environment variable. The `processResponse()` function processes the response from the AI and sends the processed response to the client. Finally, the `handleError()` function handles errors that occur during the chat request and sends an error response to the client. These utility functions are exported as a module for use in other files.

### routes/index.js
The `routes/index.js` file is responsible for defining the routes for the application. It imports the express router and the `indexController` from `../controllers/indexController`. It defines five routes: a GET route for the home page (`/`), a POST route for chat completion requests (`/chat`), and two routes (GET and POST) for system settings (`/settings`). Each route is associated with a corresponding controller function. For instance, GET requests to the home page are handled by the `getIndex` function in `indexController`, whereas POST requests to `/chat` are handled by the `postChat` function. After defining the routes, the router is exported for use in `app.js`.

### public/javascripts/index.js
The `public/javascripts/index.js` file contains the front-end JavaScript code that interacts with the DOM and makes requests to the server. It starts by caching references to various DOM elements. It also defines a messages array to hold chat messages, and a controller for aborting fetch requests. The file includes several functions for managing the chat interface, such as `showStopButton()`, `showSendButton()`, and `appendMessageToChat()`. The `generateResponse()` function is responsible for making a POST request to the `/chat` endpoint to get a chat completion from the AI. Event listeners are set up to handle form submission, button clicks, and other user interactions. The `getSettings()` and `updateSettings()` functions are used to fetch and update system settings from the server. The `scrollValue()` function handles scroll events on input elements. Finally, an event listener is set up to show or hide the custom endpoint input based on the selected endpoint.

### controllers/indexController.js
The `controllers/indexController.js` file defines the controllers for handling HTTP requests. It imports the `body` function from `express-validator` for sanitizing request parameters, and the utility functions from `../utils/utils.js` for handling AI chat requests. It also loads environment variables using `dotenv`. The `getIndex()` function handles GET requests for the index route and renders the index page. The `postChat()` function handles POST requests for chat, extracts request parameters, sends a chat request to the AI, and processes the response. The `getSettings()` function handles GET requests for system settings and sends the system settings to the client. The `updateSettings()` function handles POST requests for system settings, updates the system settings with provided values, and sends a success response to the client. The controller functions are exported as a module for use in `routes/index.js`.
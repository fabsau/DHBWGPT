# DHBW-GPT

DHBW-GPT is a chatbot project inspired by SWAGGPT. It's a Node.js application built with Express.js and Pug for the frontend. It leverages the Azure OpenAI API to generate chat responses.

## Features

- Enables dynamic interaction with Azure OpenAI to generate chat responses.
- Provides extensive customization options, including the selection of the model, adjustment of response length (maximum tokens), control over the randomness and diversity of responses (temperature and top P values), and tuning of frequency and presence penalties.
- Includes a user-friendly GUI for tailoring system messages and user message suffixes.
- Features a responsive frontend designed with Pug and Bootstrap for seamless usage across different devices.

## Environment Variables

The application requires the following environment variables:

- `AZURE_RESSOURCE_NAME`: The name of your resource.
- `API_KEY`: Your Azure API key.
- `AZURE_API_VERSION`: The version of the API using.
- `DEFAULT_MODEL`: The default model to use.
- `SYSTEM_MESSAGE`: An introductory system message. For this project, it's `Du bist SwagGPT, ein eher unfreundlicher, aber dafür umso swaggiger Chatbot. Du bist der beste Rapper der Welt, wie Moneyboy. Benutze Füllwörter wie "sheesh", "Diggi","turn up". Ersetze "ein" immer durch "1". Benutze "vong".`
- `USER_MESSAGE_SUFFIX`: A suffix to add to user messages. For this project, it's `\n Antworte als SwagGPT in maximal 30 Wörtern.`

## Project Setup

Make sure you have [Node.js](https://nodejs.org/en/download/) and [npm](https://www.npmjs.com/get-npm) installed.

1. Clone this repository:
    ```bash
    git clone https://github.com/fabsau/DHBW-GPT.git
    ```

2. Navigate into the project directory:
    ```bash
    cd DHBW-GPT
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

## Project Structure

Here's a brief overview of the important files and directories:

- `index.pug`: This is the main Pug file for the frontend. It extends the layout and sets up the chat interface.
- `layout.pug`: This is the main layout file for the application. It includes Bootstrap for styling and sets up the main structure of the site.
- `javascripts/index.js`: This is the main JavaScript file for the frontend. It sets up the chat interface and handles sending user inputs to the backend and displaying the responses.
- `controllers/indexController.js`: This controller handles requests for the index route. It renders the main page and handles requests to the AI.
- `utils/utils.js`: This file contains various utility functions for handling the chat with the AI, including extracting request parameters, formatting messages, making requests to the AI, and handling responses and errors.

## Deployment

This project can be deployed on any platform that supports Node.js applications, such as Heroku or Azure. Make sure to set the required environment variables as per your platform's instructions.

## Acknowledgments

- Inspired by [SWAGGPT](https://www.youtube.com/watch?v=0vRa0pf9cI0)
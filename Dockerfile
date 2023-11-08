# Use an official Node.js runtime as the parent image
FROM node:lts-alpine as build

# Set the working directory in the Docker container and other steps
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app

# Switch to non-root user "node"
USER node

# Specify the "working directory" for the rest of the Dockerfile
WORKDIR /usr/src/app

# Install app dependencies
COPY --chown=node:node package*.json ./
RUN npm ci --only=production

# Copy app source to /usr/src/app
COPY --chown=node:node . .

# Start from a clean image
FROM node:lts-alpine as dhbwgpt

# Define arguments for labels
ARG APP_VERSION=1.0.0
ARG BUILD_VERSION
ARG BUILD_DATE
ARG VCS_REF

LABEL maintainer="github@sauna.re" \
      org.opencontainers.image.title="DHBWGPT" \
      org.opencontainers.image.version=$BUILD_VERSION \
      org.opencontainers.image.created=$BUILD_DATE \
      org.opencontainers.image.revision=$VCS_REF \
      org.opencontainers.image.source="https://github.com/fabsau/DHBWGPT" \
      org.opencontainers.image.documentation="https://github.com/fabsau/DHBWGPT/blob/master/README.md"

# Create app directory and specify the "working directory"
RUN mkdir -p /usr/src/app/cert && chown -R node:node /usr/src/app && apk --no-cache add curl
WORKDIR /usr/src/app
COPY --from=build --chown=node:node /usr/src/app .

# Switch to non-root user "node"
USER node

# The service listens on port 3000.
EXPOSE 3000

# Define command to start your app
CMD [ "node", "bin/www" ]
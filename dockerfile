FROM node:8-alpine AS build

# Create the app directory
WORKDIR /app

# Copy package json
COPY package*.json ./

FROM build as publish
RUN npm build

FROM node:8-alpine AS runtime
WORKDIR /app

COPY --from=publish /app/package*.json ./

# Set the node environment
ENV NODE_ENV=production

# Expose the default port
EXPOSE 3000

# set the user
USER node

CMD [ "node" , "dist/index.js" ]
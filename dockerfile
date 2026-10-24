# # Build Frontend

# FROM node:20-alpine as client-builder

# COPY ./client/client/app .

# WORKDIR /app    

# RUN npm install

# RUN npm run build
# CMD ["node", "server.js"]

# # Build Backend
# FROM node:20-alpine 
# COPY ./server /app
# WORKDIR /app
# RUN npm install
# COPY --from=frontend-builder /app/dist /app/public
# CMD ["node", "server.js"]
# Build Frontend
# Build Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app
COPY ./client/client .
RUN npm install
RUN npm run build

# Build Backend
FROM node:20-alpine
WORKDIR /app
COPY ./server .
RUN npm install
COPY --from=client-builder /app/dist /app/public
CMD ["node", "server.js"]
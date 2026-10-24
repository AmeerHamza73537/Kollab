Run "npm run build" in frontend
Copy the content of th dist folder and paste it into the backend in th public folder, not the dist folder
use app.use(express.static("public"))
creat a file named "dockerfile" , put these commands in it:
FROM node:20-alpine

COPY ./server .

RUN npm install

CMD ["node", "server.js"]

then run "docker build . -t server" in th outermost folder to create the image
Your image will b build and then run "docker run server"
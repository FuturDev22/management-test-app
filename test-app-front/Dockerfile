FROM node:14 as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod
FROM nginx:alpine
COPY --from=build /app/dist/test-app-front /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]

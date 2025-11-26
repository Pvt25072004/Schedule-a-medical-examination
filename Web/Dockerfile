# Stage 1: Build React
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Khi build cần truyền biến môi trường API (nếu không dùng proxy Nginx)
RUN npm run build

# Stage 2: Serve bằng Nginx
FROM nginx:alpine
# Copy file build từ stage 1 vào thư mục nginx
COPY --from=build /app/build /usr/share/nginx/html
# Copy file config nginx (sẽ tạo ở bước dưới)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
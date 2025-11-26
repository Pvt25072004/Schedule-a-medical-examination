FROM node:18-alpine as build

WORKDIR /app

# Copy package.json trước để tận dụng cache
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ code (Lúc này nhờ .dockerignore nên nó sẽ KHÔNG copy node_modules từ ngoài vào)
COPY . .

# --- FIX LỖI Ở ĐÂY ---
# Đôi khi esbuild trên Alpine bị lỗi permission, ta rebuild lại cho chắc
RUN npm rebuild esbuild

# Cấp quyền thực thi cho các file binary trong node_modules (phòng hờ)
RUN chmod +x node_modules/.bin/vite

# Chạy build
RUN npm run build

# --- GIAI ĐOẠN RUN ---
FROM nginx:alpine

# Copy kết quả build sang Nginx
# Lưu ý: check kỹ xem project bạn build ra 'dist' hay 'build'.
# Với Vite mặc định là 'dist'.
COPY --from=build /app/dist/ /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
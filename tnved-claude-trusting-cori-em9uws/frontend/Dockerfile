FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# URL of the EXIM Search hub, used by the "back to hub" header link. Defaults
# to "/" (a single-domain, path-based reverse proxy); set it to the hub's own
# origin (e.g. https://exim.example.com) for a subdomain-per-app deployment.
ARG VITE_HUB_URL=/
ENV VITE_HUB_URL=${VITE_HUB_URL}
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

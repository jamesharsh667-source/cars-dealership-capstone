# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
# Relative path so the browser always calls the API on the same origin
# as the frontend (nginx proxies it through, see nginx-templates/).
ARG REACT_APP_API_BASE=/djangoapp
ENV REACT_APP_API_BASE=$REACT_APP_API_BASE
RUN npm run build

# --- serve stage ---
FROM nginx:1.27-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx-templates/default.conf.template /etc/nginx/templates/default.conf.template
# nginx's official entrypoint auto-runs envsubst on *.template files in
# /etc/nginx/templates/ at container start, using this env var.
ENV DJANGO_UPSTREAM=django_app:8000
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

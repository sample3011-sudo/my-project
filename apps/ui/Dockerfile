FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Copy workspace manifests
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/ui/package.json apps/ui/
COPY packages/shared/package.json packages/shared/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source files (not node_modules - covered by .dockerignore)
COPY apps/ui/src apps/ui/src/
COPY apps/ui/index.html apps/ui/
COPY apps/ui/vite.config.ts apps/ui/
COPY apps/ui/tsconfig.json apps/ui/
COPY packages/shared/src packages/shared/src/
COPY packages/shared/tsconfig.json packages/shared/
COPY tsconfig.base.json ./

# Accept API URL as build arg (baked into the static bundle)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build shared then UI
RUN pnpm --filter @repo/shared build
RUN pnpm --filter ui build

# ---- Serve with Nginx ----
FROM nginx:alpine

COPY --from=builder /app/apps/ui/dist /usr/share/nginx/html

# SPA fallback config for React Router
RUN printf 'server {\n\
    listen 8080;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

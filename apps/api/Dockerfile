FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Copy workspace config and package manifests
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/

# Install all dependencies
RUN pnpm install 

# Copy source files (not node_modules - covered by .dockerignore)
COPY apps/api/src apps/api/src/
COPY apps/api/tsconfig.json apps/api/
COPY apps/api/prisma apps/api/prisma/
COPY packages/shared/src packages/shared/src/
COPY packages/shared/tsconfig.json packages/shared/
COPY tsconfig.base.json ./

# Generate Prisma client using the project-installed version (not npx latest)
RUN cd apps/api && pnpm exec prisma generate
RUN pnpm --filter @repo/shared build
RUN pnpm --filter api build

# ---- Production runner ----
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/pnpm-workspace.yaml /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/package.json apps/api/
COPY --from=builder /app/packages/shared/package.json packages/shared/

# Install production dependencies only
RUN pnpm install --prod 

# Copy compiled output + prisma schema
COPY --from=builder /app/packages/shared/dist packages/shared/dist/
COPY --from=builder /app/apps/api/dist apps/api/dist/
COPY --from=builder /app/apps/api/prisma apps/api/prisma/

# Copy the generated Prisma client from builder (avoids re-running generate with wrong version)
COPY --from=builder /app/node_modules/.pnpm /app/node_modules/.pnpm

WORKDIR /app/apps/api
ENV PORT=8080
EXPOSE 8080
CMD ["sh", "-c", "if [ -f dist/src/server.js ]; then node dist/src/server.js; else node dist/server.js; fi"]

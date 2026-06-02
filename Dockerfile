# --- Stage 1: Install dependencies ---
FROM oven/sh/bun:1.1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# --- Stage 2: Build the application ---
FROM oven/sh/bun:1.1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Biến môi trường báo hiệu build cho môi trường node/production thay vì cloudflare edge
ENV PORT=3000
RUN bun run build

# --- Stage 3: Production Runner ---
FROM oven/sh/bun:1.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy các thư mục output sau khi build của TanStack Start (.output hoặc dist tùy config)
# Đối với TanStack Start tiêu chuẩn chạy Node, output mặc định nằm trong thư mục .output
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Khởi chạy server production của Nitro backend
CMD ["bun", ".output/server/index.mjs"]
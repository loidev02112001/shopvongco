FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --include=optional \
  && npm install --no-save workerd@1.20260526.1 @cloudflare/workerd-linux-64@1.20260526.1 \
  && test -x node_modules/@cloudflare/workerd-linux-64/bin/workerd

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_GOOGLE_CLIENT_ID

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build \
  && rm -rf dist/server/.wrangler

FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV WRANGLER_SEND_METRICS=false

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh \
  && test -x node_modules/@cloudflare/workerd-linux-64/bin/workerd \
  && ./node_modules/@cloudflare/workerd-linux-64/bin/workerd --version

EXPOSE 80

CMD ["./docker-entrypoint.sh"]

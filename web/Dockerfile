FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN npm install -g corepack@latest
COPY . /app
WORKDIR /app

FROM base AS install
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch --frozen-lockfile
RUN pnpm install --frozen-lockfile

FROM install AS build
COPY . .

ARG BACKEND_URL
ENV VITE_BACKEND_URL=${BACKEND_URL}

RUN pnpm build

FROM nginx:latest
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
COPY --from=build /app/dist /usr/share/nginx/html

ARG NODE_VERSION=21.6.1
ARG PNPM_VERSION=8.15.1

# Use node image for base image for all stages.
FROM --platform=linux/amd64 node:${NODE_VERSION}-alpine as base
# FROM node:${NODE_VERSION}-alpine as base

ARG VERCEL_TOKEN

# Install Git - needed for CI/CD in order to not keep making new images.
RUN apk update && apk add --no-cache git

# Set working directory for all build stages.
WORKDIR /usr/src/app

# Install pnpm.
RUN npm install -g pnpm@${PNPM_VERSION}

# Set the environment variable for the Vercel token (because CI/CD will crash the server unless we use Remote Cache)
ENV VERCEL_TOKEN=${VERCEL_TOKEN}

# Copy all local files (because secrets + bigger assets aren't in the git repo)
COPY . .

# Install dependencies.
RUN pnpm i

# Build all the apps.
RUN pnpm dlx turbo run build --token=${VERCEL_TOKEN} --team=dreadhalors-projects --concurrency=2

# # Go to the portfolio backend directory.
WORKDIR /usr/src/app/apps/portfolio/backend

# # Expose the port.
EXPOSE 3000

# # Start the portfolio backend.
ENTRYPOINT ["pnpm", "start"]
# Use a lightweight static server
FROM node:18-alpine

WORKDIR /app

# Only install serve
RUN npm install -g serve@14.2.4

# Copy pre-built files (build folder should be committed)
COPY build ./build

# Expose port
EXPOSE 3000

# Start the static server
CMD ["serve", "-s", "build", "-l", "3000"]

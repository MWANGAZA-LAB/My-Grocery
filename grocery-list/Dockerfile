# Use a lightweight static server
FROM node:18-alpine

WORKDIR /app

# Only install serve
RUN npm install -g serve@14.2.4

# Copy pre-built files (build folder should be committed)
COPY build ./build

# Create a startup script to handle Railway's PORT variable
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'PORT=${PORT:-3000}' >> /app/start.sh && \
    echo 'serve -s build -l $PORT -H 0.0.0.0' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expose port
EXPOSE 3000

# Start the static server
CMD ["/app/start.sh"]

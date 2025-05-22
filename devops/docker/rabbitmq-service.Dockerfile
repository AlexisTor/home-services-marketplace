# File: home-services-marketplace/backend/rabbitmq/Dockerfile
FROM rabbitmq:3.11-management
ARG RABBITMQ_SERVICE_PORT=5672
ARG RABBITMQ_MANAGEMENT_PORT=15672
ARG RABBITMQ_PROMETHEUS_PORT=15692

# Enable needed plugins
RUN rabbitmq-plugins enable --offline rabbitmq_management rabbitmq_prometheus

# Copy custom configuration if needed
COPY /backend/rabbitmq/rabbitmq.conf /etc/rabbitmq/
COPY /backend/rabbitmq/definitions.json /etc/rabbitmq/

# Expose ports:
# - 5672: AMQP protocol
# - 15672: Management UI
# - 15692: Prometheus metrics
EXPOSE ${RABBITMQ_SERVICE_PORT} ${RABBITMQ_MANAGEMENT_PORT} ${RABBITMQ_PROMETHEUS_PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=30s --retries=3 CMD rabbitmq-diagnostics -q ping

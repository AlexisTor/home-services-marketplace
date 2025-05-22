#!/bin/bash
# File: home-services-marketplace/scripts/generate-env-files.sh

# Function to generate a random string
generate_random_string() {
  openssl rand -base64 32 | tr -dc 'a-zA-Z0-9' | fold -w ${1:-32} | head -n 1
}

# Create .env file for development
create_dev_env() {
  echo "Creating development .env file..."
  cp .env.example .env
  
  # Replace placeholders with generated values
  sed -i "" "s/your_jwt_secret_key/$(generate_random_string 32)/g" .env
  sed -i "" "s/dbpassword/$(generate_random_string 16)/g" .env
  sed -i "" "s/rabbitmq:rabbitmq/$(generate_random_string 12):$(generate_random_string 12)/g" .env
  
  echo "Development .env file created successfully!"
}

# Create .env file for production
create_prod_env() {
  echo "Creating production .env file..."
  cp .env.example .env.production
  
  # Replace placeholders with generated values
  sed -i "" "s/development/production/g" .env.production
  sed -i "" "s/your_jwt_secret_key/$(generate_random_string 64)/g" .env.production
  sed -i "" "s/dbpassword/$(generate_random_string 32)/g" .env.production
  sed -i "" "s/rabbitmq:rabbitmq/$(generate_random_string 16):$(generate_random_string 16)/g" .env.production
  
  echo "Production .env file created successfully!"
}

# Create Kubernetes secrets
create_k8s_secrets() {
  echo "Creating Kubernetes secret files..."
  
  # Database secrets
  cat > k8s/database-secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: database-credentials
  namespace: home-services
type: Opaque
data:
  db-user: $(echo -n "dbuser" | base64)
  db-password: $(echo -n "$(generate_random_string 32)" | base64)
EOF

  # JWT secrets
  cat > k8s/jwt-secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: jwt-secret
  namespace: home-services
type: Opaque
data:
  jwt-secret: $(echo -n "$(generate_random_string 64)" | base64)
EOF

  # RabbitMQ secrets
  cat > k8s/rabbitmq-secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: rabbitmq-credentials
  namespace: home-services
type: Opaque
data:
  rabbitmq-user: $(echo -n "rabbitmq" | base64)
  rabbitmq-password: $(echo -n "$(generate_random_string 32)" | base64)
EOF

  # SMTP secrets
  cat > k8s/smtp-secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: smtp-credentials
  namespace: home-services
type: Opaque
data:
  smtp-user: $(echo -n "your-email@example.com" | base64)
  smtp-password: $(echo -n "your-password" | base64)
EOF

  # AWS secrets
  cat > k8s/aws-secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: aws-credentials
  namespace: home-services
type: Opaque
data:
  aws-access-key-id: $(echo -n "your_aws_access_key" | base64)
  aws-secret-access-key: $(echo -n "your_aws_secret_key" | base64)
EOF

  # Stripe secrets
  cat > k8s/stripe-secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: stripe-credentials
  namespace: home-services
type: Opaque
data:
  stripe-secret-key: $(echo -n "sk_test_your_stripe_secret_key" | base64)
  stripe-webhook-secret: $(echo -n "whsec_your_stripe_webhook_secret" | base64)
EOF

  # Google OAuth secrets
  cat > k8s/google-oauth-secret.yaml << EOF
apiVersion: v1
kind: Secret
metadata:
  name: google-oauth-credentials
  namespace: home-services
type: Opaque
data:
  google-client-id: $(echo -n "your_google_client_id" | base64)
  google-client-secret: $(echo -n "your_google_client_secret" | base64)
EOF

  echo "Kubernetes secret files created successfully!"
}

# Main execution
case "$1" in
  "dev")
    create_dev_env
    ;;
  "prod")
    create_prod_env
    ;;
  "k8s")
    create_k8s_secrets
    ;;
  *)
    echo "Usage: $0 [dev|prod|k8s]"
    echo "  dev  - Create development .env file"
    echo "  prod - Create production .env file"
    echo "  k8s  - Create Kubernetes secret files"
    exit 1
    ;;
esac

exit 0

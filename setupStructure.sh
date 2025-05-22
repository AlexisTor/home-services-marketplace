#!/bin/bash

# Create root project directory
mkdir -p home-services-marketplace
cd home-services-marketplace

# Create backend microservices directories
mkdir -p backend/user-service/src/{controllers,models,routes,services,utils,config}
mkdir -p backend/professional-service/src/{controllers,models,routes,services,utils,config}
mkdir -p backend/job-service/src/{controllers,models,routes,services,utils,config}
mkdir -p backend/payment-service/src/{controllers,models,routes,services,utils,config}
mkdir -p backend/notification-service/src/{controllers,models,routes,services,utils,config}
mkdir -p backend/api-gateway/src/{routes,middleware,config}

# Create frontend directories
mkdir -p frontend/web/src/{components,pages,services,utils,assets,i18n,store}
mkdir -p frontend/mobile/src/{components,screens,services,utils,assets,i18n,store}

# Create DevOps directories
mkdir -p devops/kubernetes/{deployments,services,ingress,config}
mkdir -p devops/docker

# Create database migration directories
mkdir -p backend/migrations

# Create documentation directory
mkdir -p docs

# Create necessary files
touch README.md
touch .gitignore

echo "Project structure created successfully!"

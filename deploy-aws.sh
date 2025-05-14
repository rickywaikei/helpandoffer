#!/bin/bash

# AWS Deployment Script for Help and Offer Platform
# This script builds and pushes the Docker image to AWS ECR and updates the ECS service

# Configuration
AWS_REGION="us-east-1"  # Change to your AWS region
ECR_REPOSITORY="helpandoffer"
ECS_CLUSTER="helpandoffer-cluster"
ECS_SERVICE="helpandoffer-service"
ECS_TASK_FAMILY="helpandoffer-task"

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"

# Login to ECR
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPOSITORY_URI}

# Build the Docker image
echo "Building Docker image..."
docker build -t ${ECR_REPOSITORY_URI}:latest .

# Push the image to ECR
echo "Pushing image to Amazon ECR..."
docker push ${ECR_REPOSITORY_URI}:latest

# Update the ECS service
echo "Updating ECS service..."
aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE} --force-new-deployment

echo "Deployment completed successfully!"

# Deploying Help and Offer Platform with Docker

This guide provides instructions for deploying the Help and Offer Platform using Docker and Docker Compose with MongoDB Atlas, which can be used for deployment on AWS or any other cloud provider that supports Docker.

## Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine
- MongoDB Atlas account with a configured cluster
- AWS account (if deploying to AWS)
- Basic knowledge of Docker and AWS

## Local Deployment

### 1. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.docker .env
```

Edit the `.env` file and update the following variables:

- `MONGO_URI`: Your MongoDB Atlas connection string
- `SESSION_SECRET`: A strong random string for session encryption
- `ADMIN_USER_ID`: Your admin user ID

### 2. Build and Start the Containers

```bash
docker-compose up -d
```

This command will:
- Build the application image
- Start the MongoDB container
- Start the application container
- Connect the containers to a shared network

### 3. Access the Application

Once the containers are running, you can access the application at:

```
http://localhost:3000
```

### 4. Stop the Containers

To stop the containers, run:

```bash
docker-compose down
```

## AWS Deployment

### 1. Set Up AWS ECS (Elastic Container Service)

1. Create an ECS cluster
2. Create a task definition using the Dockerfile in this repository
3. Configure environment variables in the task definition
4. Create a service to run the task

### 2. Configure MongoDB Atlas

This deployment uses MongoDB Atlas as the database service.

1. Create a MongoDB Atlas account if you don't have one: https://www.mongodb.com/cloud/atlas/register
2. Create a new cluster or use an existing one
3. Configure database access by creating a database user with appropriate permissions
4. Configure network access by adding your application's IP address or allowing access from anywhere (for testing only)
5. Get your connection string from the Atlas dashboard
6. Update the `MONGO_URI` environment variable in your deployment configuration

### 3. Set Up AWS ECR (Elastic Container Registry)

1. Create a repository in ECR
2. Build and push your Docker image to ECR:

```bash
# Login to ECR
aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com

# Build the image
docker build -t your-account-id.dkr.ecr.your-region.amazonaws.com/helpandoffer:latest .

# Push the image
docker push your-account-id.dkr.ecr.your-region.amazonaws.com/helpandoffer:latest
```

### 4. Deploy to ECS

1. Update your ECS task definition to use the ECR image
2. Update your ECS service to use the new task definition

## Environment Variables

The following environment variables are used by the application:

- `MONGO_URI`: MongoDB connection string
- `SESSION_SECRET`: Secret for session encryption
- `ADMIN_USER_ID`: Admin user ID for system messages
- `PORT`: Port on which the application runs (default: 3000)
- `NODE_ENV`: Environment (development, production)

## Volumes

The following volumes are used by the Docker container:

- `./uploads`: Directory for uploaded files
- `./config.json`: Configuration file

## Networks

The containers are connected to a shared network called `app-network`.

## Known Issues and Troubleshooting

### Deprecated Packages

The application has been updated to replace the deprecated `csurf` package with `csrf-csrf`. If you encounter any CSRF-related issues, please check that the implementation is correct.

You may see warnings about other deprecated packages during the build process. These are dependencies of dependencies and don't affect the functionality of the application. They will be addressed in future updates.

### Container Logs

To view the logs of the container, run:

```bash
# Application logs
docker logs helpandoffer-app
```

### Container Shell

To access the shell of the container, run:

```bash
# Application shell
docker exec -it helpandoffer-app sh
```

### MongoDB Atlas Logs

To view MongoDB Atlas logs:

1. Log in to your MongoDB Atlas account
2. Navigate to your cluster
3. Click on "Monitoring" to view logs and metrics

## Security Considerations

- Use strong credentials for your MongoDB Atlas account and database users
- Restrict network access in MongoDB Atlas to only allow connections from your application servers
- Use a strong session secret
- Consider using AWS Secrets Manager for sensitive information
- Enable HTTPS for production deployments
- Implement proper network security groups and access controls in AWS
- Enable MongoDB Atlas security features like IP allowlist, VPC peering, and encryption at rest

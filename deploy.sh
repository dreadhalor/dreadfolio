#!/bin/bash

# Build the Docker image
pnpm build
docker-compose -f docker-compose.yml build

# Save the Docker image to a tar file
docker save dreadfolio-portfolio:latest > portfolio.tar

# Transfer the tar file to the EC2 instance over SSH
scp -i portfolio-key-pair.pem portfolio.tar ec2-user@ec2-54-164-173-195.compute-1.amazonaws.com:~/

# SSH into the EC2 instance
ssh -i portfolio-key-pair.pem ec2-user@ec2-54-164-173-195.compute-1.amazonaws.com <<'EOF'
  # Stop the currently running container
  docker stop $(docker ps -q)

  # Load the transferred Docker image from the tar file
  docker load < portfolio.tar

  # Run the new container
  docker run -d -p 80:3000 --rm dreadfolio-portfolio:latest

  # Clean up the tar file
  rm portfolio.tar
EOF
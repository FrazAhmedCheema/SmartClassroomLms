#!/bin/bash

# Setup script for EC2 SSH access for MERN deployments

EC2_HOST="51.21.168.222"
EC2_USER="ec2-user"  # Change to "ubuntu" if using Ubuntu AMI

echo "Setting up EC2 environment for MERN deployments..."

# Test SSH connection
ssh -o ConnectTimeout=10 ${EC2_USER}@${EC2_HOST} "echo 'SSH connection successful'"

if [ $? -ne 0 ]; then
    echo "❌ SSH connection failed. Please ensure:"
    echo "1. Your SSH key is added to ssh-agent: ssh-add ~/.ssh/your-key.pem"
    echo "2. EC2 security group allows SSH (port 22) from your IP"
    echo "3. EC2 instance is running"
    exit 1
fi

# Create necessary directories on EC2
ssh ${EC2_USER}@${EC2_HOST} "
    mkdir -p /home/${EC2_USER}/mern-apps
    mkdir -p /home/${EC2_USER}/mern-logs
    
    # Install Node.js if not present
    if ! command -v node &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    fi
    
    # Install yarn if not present
    if ! command -v yarn &> /dev/null; then
        sudo npm install -g yarn
    fi
    
    echo 'EC2 environment setup completed successfully'
"

echo "✅ EC2 setup completed!"
echo "📋 Make sure your EC2 security group allows inbound traffic on ports 3000-3099 and 5000-5099"

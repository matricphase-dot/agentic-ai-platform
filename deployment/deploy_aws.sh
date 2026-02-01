# D:\AGENTIC_AI\deployment\deploy_aws.sh
#!/bin/bash

echo "🚀 Deploying Agentic AI to AWS..."

# Configuration
APP_NAME="agentic-ai"
REGION="us-east-1"
INSTANCE_TYPE="t3.medium"
KEY_NAME="agentic-ai-key"

# Create key pair
echo "Creating key pair..."
aws ec2 create-key-pair --key-name $KEY_NAME --query 'KeyMaterial' --output text > $KEY_NAME.pem
chmod 400 $KEY_NAME.pem

# Create security group
echo "Creating security group..."
SG_ID=$(aws ec2 create-security-group \
    --group-name $APP_NAME-sg \
    --description "Security group for Agentic AI" \
    --query 'GroupId' \
    --output text)

# Add security group rules
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 22 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 8080 \
    --cidr 0.0.0.0/0

# Launch EC2 instance
echo "Launching EC2 instance..."
INSTANCE_ID=$(aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \
    --count 1 \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-group-ids $SG_ID \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$APP_NAME}]" \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "Instance ID: $INSTANCE_ID"

# Get public IP
sleep 30
PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids $INSTANCE_ID \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)

echo "Public IP: $PUBLIC_IP"

# Create deployment script
cat > deploy.sh << EOF
#!/bin/bash

# Update system
sudo apt-get update
sudo apt-get upgrade -y

# Install dependencies
sudo apt-get install -y python3-pip python3-venv nginx postgresql redis-server

# Create application directory
sudo mkdir -p /opt/$APP_NAME
sudo chown ubuntu:ubuntu /opt/$APP_NAME

# Clone repository
cd /opt/$APP_NAME
git clone https://github.com/agentic-ai/platform.git .

# Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create database
sudo -u postgres psql -c "CREATE DATABASE agentic_ai;"
sudo -u postgres psql -c "CREATE USER agentic_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE agentic_ai TO agentic_user;"

# Configure nginx
sudo tee /etc/nginx/sites-available/$APP_NAME << NGINX
server {
    listen 80;
    server_name $PUBLIC_IP;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
NGINX

sudo ln -s /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Create systemd service
sudo tee /etc/systemd/system/$APP_NAME.service << SERVICE
[Unit]
Description=Agentic AI Platform
After=network.target postgresql.service redis-server.service

[Service]
User=ubuntu
WorkingDirectory=/opt/$APP_NAME
Environment="PATH=/opt/$APP_NAME/venv/bin"
Environment="DATABASE_URL=postgresql://agentic_user:secure_password@localhost/agentic_ai"
Environment="REDIS_URL=redis://localhost:6379/0"
Environment="SECRET_KEY=$(openssl rand -hex 32)"
ExecStart=/opt/$APP_NAME/venv/bin/uvicorn agentic_ai.main:app --host 0.0.0.0 --port 8080 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable $APP_NAME.service
sudo systemctl start $APP_NAME.service

echo "✅ Deployment complete!"
echo "🌐 Access at: http://$PUBLIC_IP"
EOF

# Copy deployment script to instance
scp -i $KEY_NAME.pem -o StrictHostKeyChecking=no deploy.sh ubuntu@$PUBLIC_IP:/home/ubuntu/

# Execute deployment script
ssh -i $KEY_NAME.pem -o StrictHostKeyChecking=no ubuntu@$PUBLIC_IP "chmod +x /home/ubuntu/deploy.sh && sudo /home/ubuntu/deploy.sh"

echo "✅ AWS deployment complete!"
echo "🌐 Access your platform at: http://$PUBLIC_IP"
echo "🔑 SSH key saved as: $KEY_NAME.pem"
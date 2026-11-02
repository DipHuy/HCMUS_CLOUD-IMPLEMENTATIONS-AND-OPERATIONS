#!/bin/bash
dnf update -y
dnf install -y git nginx 

# Install npm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

# install pm2
npm install -g pm2

# Clone repo
git clone https://github.com/DipHuy/HCMUS_CLOUD-IMPLEMENTATIONS-AND-OPERATIONS.git -b feature/create-terraform-aws /home/ec2-user/app

#  Run setup script
chmod +x /home/ec2-user/app/src/scripts/setup.sh

bash /home/ec2-user/app/src/scripts/setup.sh

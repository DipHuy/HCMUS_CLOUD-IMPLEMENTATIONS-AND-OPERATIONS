#!/bin/bash
dnf update -y
dnf install -y git nginx 

# Install npm
sudo dnf install libatomic -y
curl -sL https://rpm.nodesource.com/setup_26.x | bash -
dnf install -y nodejs

# install pm2
npm install -g pm2

# Clone repo
PROJECT_ROOT="/home/ec2-user/app"
git clone https://github.com/DipHuy/HCMUS_CLOUD-IMPLEMENTATIONS-AND-OPERATIONS.git -b feature/create-terraform-aws $PROJECT_ROOT

# Setup ENV files
cd $PROJECT_ROOT

cat <<EOF > .env
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT}
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
VITE_API_URL=${VITE_API_URL}
EOF

# Setup backend
cd $PROJECT_ROOT/src/backend
cat <<EOF > .env
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
BACKEND_PORT=${BACKEND_PORT}
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
VITE_API_URL=${VITE_API_URL}
EOF



npm install
npx prisma generate

npx prisma db push 

pm2 delete backend || true
pm2 start src/index.js --name backend
pm2 save

# Setup frontend
cd $PROJECT_ROOT/src/frontend

cat <<EOF > .env
VITE_API_URL=${VITE_API_URL}
FRONTEND_PORT=${FRONTEND_PORT}
EOF

npm install
npm run build

## Setup nginx
# Add perm for nginx access dist folder
chmod 755 /home/ec2-user
chmod -R 755 $PROJECT_ROOT/src/frontend/dist

sudo sed -i \
  -e 's|/usr/share/nginx/html|/home/ec2-user/app/src/frontend/dist|g' \
  -e 's|http://backend:3000|http://localhost:3000|g' \
  $PROJECT_ROOT/src/frontend/nginx.conf

cp $PROJECT_ROOT/src/frontend/nginx.conf /etc/nginx/conf.d/ecommerce.conf


systemctl enable nginx
systemctl restart nginx


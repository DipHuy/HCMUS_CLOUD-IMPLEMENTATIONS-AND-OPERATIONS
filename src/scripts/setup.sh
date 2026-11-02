#!/bin/bash
set -e

PROJECT_ROOT="/home/ec2-user/app"
cd $PROJECT_ROOT

# setup ENV files
cat <<EOF > .env
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
BACKEND_PORT=3000
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
VITE_API_URL=${VITE_API_URL}
EOF

# Setup backend
cd $PROJECT_ROOT/src/backend

npm install
npx prisma generate

pm2 start src/index.js

# Setup frontend
npm install
npm run build

## Setup nginx

sudo sed -i \
  -e 's|/usr/share/nginx/html|/home/ec2-user/app/src/frontend/dist|g' \
  -e 's|http://backend:3000/|http://localhost:3000/|g' \
  $PROJECT_ROOT/src/frontend/nginx.conf

cp $PROJECT_ROOT/src/frontend/nginx.conf /etc/nginx/conf.d/ecommerce.conf

rm -f /etc/nginx/nginx.conf

systemctl enable nginx
systemctl restart nginx
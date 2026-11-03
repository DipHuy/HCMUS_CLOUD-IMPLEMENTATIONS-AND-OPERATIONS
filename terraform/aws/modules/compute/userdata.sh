#!/bin/bash
dnf update -y
dnf install -y git nginx nc

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
S3_BUCKET_NAME=${S3_BUCKET_NAME}
CLOUDFRONT_DOMAIN=${CLOUDFRONT_DOMAIN}
AWS_REGION=${AWS_REGION}
EOF





npm install

# Connect database
DB_HOST=$(echo "${DATABASE_URL}" | sed -e 's|.*@||' -e 's|:.*||')

MAX_RETRIES=5
TIMEOUT=10
COUNT=0
while ! nc -z $DB_HOST 5432; do
  echo "Database is not ready yet... (Attempt $COUNT/$MAX_RETRIES)"
  sleep $TIMEOUT
  COUNT=$((COUNT + 1))
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo "Timeout: Database took too long to start."
  fi
done


npx prisma generate
npx prisma db seed

npx prisma db push --accept-data-loss

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


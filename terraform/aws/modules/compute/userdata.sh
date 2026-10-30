#!/bin/bash
dnf update -y
dnf install -y git nodejs postgresql17
git clone https://github.com/your-repo/prj01.git /home/ec2-user/prj01


DB_HOST=${RDSProxyEndpoint}
CACHE_HOST=${CacheEndpoint}
ALB_DNS=${ALB_DNS}

cat <<EOF > /home/ec2-user/prj01/src/backend/.env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=${db_password}
POSTGRES_DB=ecommerce_db

DATABASE_WRITER_URL="postgresql://postgres:${db_password}@${rds_proxy_endpoint}:5432/ecommerce_db?schema=public"
DATABASE_READER_URL="postgresql://postgres:${db_password}@${rds_proxy_reader_endpoint}:5432/ecommerce_db?schema=public"

JWT_SECRET=${jwt_secret}
ADMIN_USERNAME=${admin_user}
ADMIN_PASSWORD=${admin_pass}
BACKEND_PORT=3000
CLOUD_PROVIDER=AWS
EOF

# Tạo file .env cho Frontend
cat <<EOF > /home/ec2-user/prj01/src/frontend/.env
VITE_API_URL=http://${alb_dns}:3000
EOF


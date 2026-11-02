# Create a DB Subnet Group
resource "aws_db_subnet_group" "this" {
  name       = "${lower(var.project_name)}-db-subnet-group"
  subnet_ids = var.private_subnet_ids
  tags       = { Name = "${lower(var.project_name)}-DB-Subnet-Group" }
}

# Secrets Manager for Database
resource "aws_secretsmanager_secret" "db_secret" {
  name        = "${var.project_name}-db-credentials-"
  description = "Database credentials for Aurora"
  recovery_window_in_days = 0 # delete immediately when destroy
  
}

resource "aws_secretsmanager_secret_version" "db_secret_val" {
  secret_id     = aws_secretsmanager_secret.db_secret.id
  secret_string = jsonencode({
    username = var.db_username
    password = "YourSecurePassword123!"
    engine   = "postgres"
    host     = aws_rds_cluster.aurora.endpoint
    port     = 5432
    dbInstanceIdentifier = aws_rds_cluster.aurora.cluster_identifier
  })
}

# Aurora Cluster 
resource "aws_rds_cluster" "aurora" {
  cluster_identifier      = "${lower(var.project_name)}-cluster"
  engine                  = "aurora-postgresql"
  engine_version          = "18.4"
  database_name           = var.db_name
  master_username         = var.db_username
  master_password         = var.db_password 
  db_subnet_group_name    = aws_db_subnet_group.this.name
  vpc_security_group_ids  = [var.db_sg_id]
  
  storage_encrypted       = true
  apply_immediately       = true
  skip_final_snapshot     = true 

  tags = { Name = "${var.project_name}-Aurora-Cluster" }
}

# Create 2 instances (1 Writer, 1 Reader)
resource "aws_rds_cluster_instance" "instances" {
  count              = 2
  identifier         = "${lower(var.project_name)}-instance-${count.index}"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.t3.medium"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version
  db_subnet_group_name = aws_db_subnet_group.this.name
  publicly_accessible  = false
}

# RDS PROXY 

## IAM Role for RDS Proxy access Secret from Secrets Manager
resource "aws_iam_role" "proxy_role" {
  name = "${var.project_name}-rds-proxy-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "rds.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "proxy_policy" {
  name = "secret_access"
  role = aws_iam_role.proxy_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action   = "secretsmanager:GetSecretValue"
      Effect   = "Allow"
      Resource = aws_secretsmanager_secret.db_secret.arn
    }]
  })
}

## RDS Proxy
resource "aws_db_proxy" "proxy" {
  name                   = "${lower(var.project_name)}-db-proxy"
  debug_logging          = false
  engine_family          = "POSTGRESQL"
  idle_client_timeout    = 1800
  require_tls            = true
  role_arn               = aws_iam_role.proxy_role.arn
  vpc_security_group_ids = [var.proxy_sg_id]
  vpc_subnet_ids         = var.private_subnet_ids

  auth {
    auth_scheme = "SECRETS"
    description = "Database auth via Secrets Manager"
    iam_auth    = "DISABLED"
    secret_arn  = aws_secretsmanager_secret.db_secret.arn
  }

  tags = { Name = "${lower(var.project_name)}-RDS-Proxy" }
}

## Connect Proxy with Aurora Cluster
resource "aws_db_proxy_default_target_group" "this" {
  db_proxy_name = aws_db_proxy.proxy.name

  connection_pool_config {
    max_connections_percent      = 90
    connection_borrow_timeout    = 120
  }
}

resource "aws_db_proxy_target" "this" {
  db_proxy_name         = aws_db_proxy.proxy.name
  target_group_name     = aws_db_proxy_default_target_group.this.name
  db_cluster_identifier = aws_rds_cluster.aurora.id
}
resource "aws_db_subnet_group" "this" {
  name       = "project01-db-subnet-group"
  subnet_ids = var.private_subnet_ids
}

resource "aws_secretsmanager_secret" "db_secret" {
  name = "Project01-DB-Secret-Terraform"
}

resource "aws_rds_cluster" "aurora" {
  cluster_identifier      = "project01-aurora-cluster"
  engine                  = "aurora-postgresql"
  engine_version          = "15.5"
  database_name           = "coffee"
  master_username         = "prj01"
  master_password         = "From1to10" # Nên dùng random_password resource
  db_subnet_group_name    = aws_db_subnet_group.this.name
  vpc_security_group_ids  = [var.db_sg_id]
  skip_final_snapshot     = true
}

resource "aws_rds_cluster_instance" "instances" {
  count              = 2
  identifier         = "project01-db-instance-${count.index}"
  cluster_identifier = aws_rds_cluster.aurora.id
  instance_class     = "db.t3.medium"
  engine             = aws_rds_cluster.aurora.engine
  engine_version     = aws_rds_cluster.aurora.engine_version
}

# RDS Proxy
resource "aws_db_proxy" "proxy" {
  name                   = "Project01-Aurora-Proxy"
  engine_family          = "POSTGRESQL"
  role_arn               = var.proxy_role_arn
  vpc_subnet_ids         = var.private_subnet_ids
  vpc_security_group_ids = [var.proxy_sg_id]
  auth {
    auth_scheme = "SECRETS"
    secret_arn  = aws_secretsmanager_secret.db_secret.arn
  }
}

resource "aws_db_proxy_default_target_group" "proxy_tg" {
  db_proxy_name = aws_db_proxy.proxy.name
  connection_pool_config {
    max_connections_percent = 100
  }
}

resource "aws_db_proxy_target" "proxy_target" {
  db_proxy_name         = aws_db_proxy.proxy.name
  target_group_name     = aws_db_proxy_default_target_group.proxy_tg.name
  db_cluster_identifier = aws_rds_cluster.aurora.id
}
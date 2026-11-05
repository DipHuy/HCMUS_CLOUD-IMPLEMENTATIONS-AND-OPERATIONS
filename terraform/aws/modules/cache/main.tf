resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.project_name}-cache-subnet-group"
  subnet_ids = var.private_subnet_ids
}

resource "aws_elasticache_replication_group" "valkey" {
  replication_group_id       = "${var.project_name}-cache"
  description                = "Cache for Ecommerce Platform"

  engine                     = "valkey"
  engine_version             = "8.0"
  node_type                  = "cache.t3.micro"
  port                       = 6379

  parameter_group_name       = "default.valkey8"
  subnet_group_name          = aws_elasticache_subnet_group.this.name
  security_group_ids         = [var.cache_sg_id]

  # High Availability (Multi-AZ)
  automatic_failover_enabled = true
  multi_az_enabled           = true
  num_cache_clusters         = 2 # 1 Primary, 1 Replica

  apply_immediately = true
}
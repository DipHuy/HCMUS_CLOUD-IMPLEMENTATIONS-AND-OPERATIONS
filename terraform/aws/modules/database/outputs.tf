output "db_writer_endpoint" {
  value = aws_rds_cluster.aurora.endpoint
}

output "db_reader_endpoint" {
  value = aws_rds_cluster.aurora.reader_endpoint
}

output "proxy_endpoint" {
  value = aws_db_proxy.proxy.endpoint
}

output "db_secret_arn" {
  value = aws_secretsmanager_secret.db_secret.arn
}
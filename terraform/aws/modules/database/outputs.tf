output "db_writer_endpoint" {
  value = aws_rds_cluster.aurora.endpoint
}

output "db_reader_endpoint" {
  value = aws_rds_cluster.aurora.reader_endpoint
}

output "db_proxy_endpoint" {
  value = aws_db_proxy.proxy.endpoint
}

output "db_name" {
  value = aws_rds_cluster.aurora.database_name
}

output "db_username" {
  value = aws_rds_cluster.aurora.master_username
}

output "db_password" {
  value = aws_secretsmanager_secret_version.db_secret_val.secret_string
}

output "db_secret_arn" {
  value = aws_secretsmanager_secret.db_secret.arn
}
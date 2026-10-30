output "proxy_endpoint" {
  description = "The connection endpoint for the RDS Proxy"
  value       = aws_db_proxy.proxy.endpoint
}

output "db_secret_arn" {
  value = aws_secretsmanager_secret.db_secret.arn
}
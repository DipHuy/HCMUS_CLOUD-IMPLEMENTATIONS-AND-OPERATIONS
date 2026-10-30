# 1. Web URL
output "website_url" {
  description = "Access website: "
  value       = "http://${module.compute.alb_dns_name}:8080"
}

# 2. RDS Proxy Endpoint 
output "rds_proxy_endpoint" {
  description = "RDS Proxy endpoint"
  value       = module.database.proxy_endpoint
}

# 3. Endpoint Cache (ElastiCache Valkey)
output "cache_endpoint" {
  description = "ElastiCache Valkey"
  value       = module.cache.primary_endpoint
}

# 4. VPC Info
output "vpc_id" {
  value = module.vpc.vpc_id
}
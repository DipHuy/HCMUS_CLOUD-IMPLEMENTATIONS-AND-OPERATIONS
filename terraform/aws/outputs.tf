output "website_url" {
  description = "URL E-commerce"
  value       = "http://${module.compute.alb_dns_name}"
}

output "alb_dns_only" {
  description = "ALB DNS Name"
  value = module.compute.alb_dns_name
}
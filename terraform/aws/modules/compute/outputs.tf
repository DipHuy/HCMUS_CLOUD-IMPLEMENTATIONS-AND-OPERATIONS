output "alb_dns_name" {
  description = "Access web at"
  value       = aws_lb.alb.dns_name
}
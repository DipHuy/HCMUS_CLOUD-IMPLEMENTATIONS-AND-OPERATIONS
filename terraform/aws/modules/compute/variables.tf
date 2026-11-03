variable "project_name"       { type = string }
variable "vpc_id"             { type = string }
variable "public_subnet_ids"  { type = list(string) }
variable "app_sg_id"          { type = string }
variable "alb_sg_id"          { type = string }
variable "db_proxy_endpoint"  { type = string }
variable "jwt_secret"         { default = "22127475" }
variable "backend_port"        { default = 3000 }
variable "frontend_port"       { default = 80 }
variable "db_name"             { type = string }
variable "db_username"     { type = string }
variable "db_password"     { type = string }
variable "s3_bucket_id"        { type = string }
variable "cloudfront_domain" { type = string }
variable "aws_region"          { type = string }

variable "key_name" {
  type        = string
  default     = "project01-ec2-keypair"
}
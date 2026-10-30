variable "aws_region" {
  type      = string
  default   = "ap-southeast-1"
}

variable "project_name" {
  type      = string
  default   = "hcmus-cloud-implementations-and-operations-aws"
}

variable "vpc_cidr" {
  type      = string
  default   = "10.0.0.0/16"
}

variable "availability_zones" {
  type      = list(string)
  default   = ["ap-southeast-1a", "ap-southeast-1b"]
}

variable "db_username" {
  description   = "Username for Database"
  type          = string
}

variable "db_password" {
  description   = "Password for Database (Sensitive)"
  type          = string
  sensitive     = true
}

variable "github_branch" {
  type      = string
  default   = "main"
}
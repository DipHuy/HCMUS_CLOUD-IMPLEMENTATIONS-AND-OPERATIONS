variable "project_name"        { type = string }
variable "vpc_id"              { type = string }
variable "private_subnet_ids"  { type = list(string) }
variable "db_sg_id"            { type = string }
variable "proxy_sg_id"         { type = string }
variable "db_name"             { default = "ecommerce" }
variable "master_username"     { default = "dbadmin" }
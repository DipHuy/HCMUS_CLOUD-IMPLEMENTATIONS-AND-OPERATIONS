module "vpc" {
  source       = "./modules/vpc"
  project_name = "Project01"
  vpc_cidr     = "10.0.0.0/16"
  availability_zones =  ["ap-southeast-1a", "ap-southeast-1b"]
}

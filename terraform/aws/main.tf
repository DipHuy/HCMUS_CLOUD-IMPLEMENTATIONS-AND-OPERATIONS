module "vpc" {
  source       = "./modules/vpc"
  project_name = "Project01"
  vpc_cidr     = "10.0.0.0/16"
  availability_zones =  ["ap-southeast-1a", "ap-southeast-1b"]
}

module "database" {
  source              = "./modules/database"
  project_name        = "Project01"
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  db_sg_id            = module.vpc.db_sg_id
  proxy_sg_id         = module.vpc.proxy_sg_id
  db_name             = "ecommerce"
  master_username     = "dbadmin"
}
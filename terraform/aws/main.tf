module "vpc" {
  source       = "./modules/vpc"
  project_name = "Project01"
  vpc_cidr     = "10.0.0.0/16"
  azs          = ["us-east-1a", "us-east-1b"]
}

module "database" {
  source             = "./modules/database"
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  db_sg_id           = module.vpc.db_sg_id
  proxy_sg_id        = module.vpc.proxy_sg_id
  proxy_role_arn     = "arn:aws:iam::..." # ARN của role tạo trong IAM module
}

module "cache" {
  source             = "./modules/cache"
  private_subnet_ids = module.vpc.private_subnet_ids
  cache_sg_id        = module.vpc.cache_sg_id
}

module "compute" {
  source             = "./modules/compute"
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  alb_sg_id          = module.vpc.alb_sg_id
  app_sg_id          = module.vpc.app_sg_id
  db_proxy_endpoint  = module.database.proxy_endpoint
  cache_endpoint     = module.cache.endpoint
}
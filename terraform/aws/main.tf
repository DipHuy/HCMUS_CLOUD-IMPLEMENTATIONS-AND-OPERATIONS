module "vpc" {
  source       = "./modules/vpc"
  project_name = var.project_name
  vpc_cidr     = "10.0.0.0/16"
  availability_zones =  ["ap-southeast-1a", "ap-southeast-1b"]
}

module "database" {
  source              = "./modules/database"
  project_name        = var.project_name
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  db_sg_id            = module.vpc.db_sg_id
  proxy_sg_id         = module.vpc.proxy_sg_id
  db_name             = "ecommerce"
  db_username         = "dbadmin"
}

module "storage" {
  source       = "./modules/storage"
  project_name = "Project01"
}

# IAM Role EC2
resource "aws_iam_role" "app_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy allow EC2  Upload to S3
resource "aws_iam_policy" "s3_upload_policy" {
  name        = "${var.project_name}-s3-upload-policy"
  description = "Allow EC2 to upload images to S3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["s3:PutObject", "s3:PutObjectAcl"]
        Effect   = "Allow"
        Resource = "${module.storage.s3_bucket_arn}/*"
      }
    ]
  })
}

# Attach Policy into Role
resource "aws_iam_role_policy_attachment" "s3_attach" {
  role       = aws_iam_role.app_role.name
  policy_arn = aws_iam_policy.s3_upload_policy.arn
}

# Instance Profile
resource "aws_iam_instance_profile" "app_instance_profile" {
  name = "${var.project_name}-instance-profile"
  role = aws_iam_role.app_role.name
}



module "compute" {
  source            = "./modules/compute"
  depends_on        = [module.database, module.storage]
  project_name      = var.project_name
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  app_sg_id         = module.vpc.app_sg_id
  alb_sg_id         = module.vpc.alb_sg_id
  db_proxy_endpoint = module.database.db_proxy_endpoint
  db_name           = module.database.db_name
  db_username       = module.database.db_username
  db_password       = module.database.db_password
  jwt_secret        = var.JWT_SECRET
  s3_bucket_id      = module.storage.s3_bucket_id
  cloudfront_domain = module.storage.cloudfront_domain
  aws_region        = var.aws_region

}
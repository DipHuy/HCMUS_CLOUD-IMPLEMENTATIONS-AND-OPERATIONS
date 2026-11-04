terraform {
  required_version = "~>1.17.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }

  }

  cloud {
    organization = "HCMUS-project"
    workspaces {
      name = "aws-dev"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
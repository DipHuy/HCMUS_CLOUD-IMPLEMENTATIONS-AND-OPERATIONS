terraform {
  required_version = "~>1.17.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }

    time = {
      source  = "hashicorp/time"
      version = "0.14.2"
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
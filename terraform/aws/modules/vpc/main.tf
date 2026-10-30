resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "${var.project_name}-VPC" }
}

# Subnets (2 Public, 2 Private)
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true
  tags = { Name = "${var.project_name}-Public-${var.azs[count.index]}" }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 2)
  availability_zone = var.azs[count.index]
  tags = { Name = "${var.project_name}-Private-${var.azs[count.index]}" }
}

# Internet Gateway & Route Table
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.this.id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Security Groups (Giữ nguyên logic của bạn)
resource "aws_security_group" "alb_sg" {
  name        = "ALB-SG"
  vpc_id      = aws_vpc.this.id
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "app_sg" {
  name   = "App-Tier-SG"
  vpc_id = aws_vpc.this.id
  # SSH, App Ports (3001-3003, 8080)
  ingress { from_port = 22; to_port = 22; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 8080; to_port = 8080; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  ingress { from_port = 3001; to_port = 3003; protocol = "tcp"; cidr_blocks = ["0.0.0.0/0"] }
  egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["0.0.0.0/0"] }
}

resource "aws_security_group" "db_sg" {
  name = "Data-Tier-SG"
  vpc_id = aws_vpc.this.id
}

resource "aws_security_group" "proxy_sg" {
  name = "Proxy-Tier-SG"
  vpc_id = aws_vpc.this.id
}

# Ingress Rules kết nối các tầng (Rule: App -> Proxy -> DB)
resource "aws_security_group_rule" "app_to_proxy" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.app_sg.id
  security_group_id        = aws_security_group.proxy_sg.id
}

resource "aws_security_group_rule" "proxy_to_db" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.proxy_sg.id
  security_group_id        = aws_security_group.db_sg.id
}
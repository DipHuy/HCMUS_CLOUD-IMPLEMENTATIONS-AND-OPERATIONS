# 1. ALB Security Group: Allows HTTP traffic from the internet
resource "aws_security_group" "alb_sg" {
  name        = "${var.project_name}-ALB-SG"
  description = "Allow inbound traffic on port 80 for ALB"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. App Tier Security Group: Allows traffic from ALB
resource "aws_security_group" "app_sg" {
  name        = "${var.project_name}-App-Tier-SG"
  description = "Allow port 80 (Frontend) and 3000 (Backend) from ALB"
  vpc_id      = aws_vpc.this.id

  # SSH for management
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  # Frontend Port
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  # Backend Port 
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. Proxy Tier Security Group
resource "aws_security_group" "proxy_sg" {
  name        = "${var.project_name}-Proxy-Tier-SG"
  description = "Allow PostgreSQL traffic from App Tier"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 4. Data Tier Security Group (Aurora DB)
resource "aws_security_group" "db_sg" {
  name        = "${var.project_name}-Data-Tier-SG"
  description = "Allow PostgreSQL traffic from RDS Proxy"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.proxy_sg.id]
  }
}
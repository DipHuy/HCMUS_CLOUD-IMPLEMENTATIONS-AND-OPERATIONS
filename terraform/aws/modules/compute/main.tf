# TARGET GROUPS

# Target Group Frontend (Port 80)
resource "aws_lb_target_group" "fe_tg" {
  name     = "${var.project_name}-fe-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  health_check {
    path = "/"
    matcher = "200"
  }
}

# Target Group Backend (Port 3000)
resource "aws_lb_target_group" "be_tg" {
  name     = "${var.project_name}-be-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  health_check {
    path = "/products" # Đường dẫn test API
    matcher = "200-399"
  }
}

# Application Load Balancer
resource "aws_lb" "alb" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_sg_id]
  subnets            = var.public_subnet_ids
}

# Listener & Routing Rules
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.fe_tg.arn
  }
}

# Forward /api/* to Backend
resource "aws_lb_listener_rule" "api_routing" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.be_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}

# Launch Template for EC2 Instances
resource "aws_launch_template" "app" {
  name_prefix   = "${var.project_name}-template-"
  image_id      = "ami-01127915c7b29e7ca" 
  instance_type = "t3.micro"

  key_name = var.key_name
  
  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [var.app_sg_id]
  }

  iam_instance_profile {
    name = var.iam_instance_profile_name
  }

  # Script auto run app
  user_data = base64encode(templatefile("${path.module}/userdata.sh", {
    DATABASE_URL      = "postgresql://${var.db_username}:${var.db_password}@${var.db_proxy_endpoint}:5432/${var.db_name}?schema=public",
    BACKEND_PORT      = var.backend_port,
    FRONTEND_PORT     = var.frontend_port,
    JWT_SECRET        = var.jwt_secret,
    VITE_API_URL      = "http://${aws_lb.alb.dns_name}/api" 
    ADMIN_USERNAME    = "admin"
    ADMIN_PASSWORD    = "admin123"
    AWS_REGION        = var.aws_region
    S3_BUCKET_NAME    = var.s3_bucket_id
    CLOUDFRONT_DOMAIN = var.cloudfront_domain
    CLOUD_PROVIDER    = "AWS"
    CACHE_ENDPOINT    = var.cache_endpoint
  }))

  tag_specifications {
    resource_type = "instance"
    tags = { Name = "${var.project_name}-App-Server" }
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "asg" {
  name                = "${var.project_name}-asg"
  min_size            = 2
  max_size            = 4
  desired_capacity    = 2
  vpc_zone_identifier = var.public_subnet_ids
  
  target_group_arns = [
    aws_lb_target_group.fe_tg.arn,
    aws_lb_target_group.be_tg.arn
  ]

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "${var.project_name}-ASG-Instance"
    propagate_at_launch = true
  }
}

# Scaling Policy CPU utilization
resource "aws_autoscaling_policy" "cpu_scaling" {
  name                   = "${var.project_name}-cpu-scaling"
  autoscaling_group_name = aws_autoscaling_group.asg.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
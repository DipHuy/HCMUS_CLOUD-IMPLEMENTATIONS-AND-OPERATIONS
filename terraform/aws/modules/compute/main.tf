resource "aws_lb" "alb" {
  name               = "Project01-ALB"
  load_balancer_type = "application"
  security_groups    = [var.alb_sg_id]
  subnets            = var.public_subnet_ids
}

resource "aws_lb_target_group" "tg" {
  name     = "Project01-TG"
  port     = 8080
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  health_check { path = "/" }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.alb.arn
  port              = 8080
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg.arn
  }
}

resource "aws_launch_template" "app" {
  name_prefix   = "app-template-"
  image_id      = "ami-02457590d33d576c3" # Amazon Linux 2023
  instance_type = "t2.micro"
  key_name      = "project01-ec2-keypair"

  vpc_security_group_ids = [var.app_sg_id]

  # Dùng templatefile để truyền biến vào script bash
  user_data = base64encode(templatefile("${path.module}/userdata.sh", {
    RDSProxyEndpoint = var.db_proxy_endpoint,
    CacheEndpoint    = var.cache_endpoint,
    ALB_DNS          = aws_lb.alb.dns_name
  }))
}

resource "aws_autoscaling_group" "asg" {
  min_size            = 2
  max_size            = 4
  desired_capacity    = 2
  vpc_zone_identifier = var.public_subnet_ids
  target_group_arns   = [aws_lb_target_group.tg.arn]

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }
}
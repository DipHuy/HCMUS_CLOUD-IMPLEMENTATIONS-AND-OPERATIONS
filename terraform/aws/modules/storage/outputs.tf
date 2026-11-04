output "s3_bucket_id" {
  value       = aws_s3_bucket.assets.id
}

output "s3_bucket_arn" {
  description = "S3 Bucket ARN (use for IAM Policy)"
  value       = aws_s3_bucket.assets.arn
}

output "cloudfront_domain" {
  value       = aws_cloudfront_distribution.cdn.domain_name
}
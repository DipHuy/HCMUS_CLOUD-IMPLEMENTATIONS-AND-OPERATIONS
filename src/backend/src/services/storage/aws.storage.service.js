const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");

class AWSS3Service {
  constructor() {
    this.s3Client = new S3Client({ region: process.env.AWS_REGION });
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.cdnDomain = process.env.CLOUDFRONT_DOMAIN;
  }

  async uploadFile(file) {
    const fileExtension = file.originalname.split(".").pop();
    const fileName = `${crypto.randomBytes(16).toString("hex")}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: `products/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Client.send(command);

    return `https://${this.cdnDomain}/products/${fileName}`;
  }
}

module.exports = AWSS3Service;

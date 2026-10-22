const AWSS3Service = require("./aws.storage.service");
const AzureBlobService = require("./azure.storage.service");

const storageProvider =
  process.env.CLOUD_PROVIDER === "AZURE"
    ? new AzureBlobService()
    : new AWSS3Service();

module.exports = storageProvider;

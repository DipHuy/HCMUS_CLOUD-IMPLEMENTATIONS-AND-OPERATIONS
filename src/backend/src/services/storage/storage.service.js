const AWSS3Service = require("./aws.storage.service");
const storageProvider = new AWSS3Service();
// const AzureBlobService = require("./azure.storage.service");

// const storageProvider =
//   process.env.CLOUD_PROVIDER === "AWS"
//     ? new AWSS3Service()
//     : new AzureBlobService();

module.exports = storageProvider;

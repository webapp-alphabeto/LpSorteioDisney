// utils/storage-azure.js
const { BlobServiceClient } = require('@azure/storage-blob');

const conn = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_BLOB_CONTAINER;
const publicBase = process.env.AZURE_BLOB_PUBLIC_BASE;

if (!conn) throw new Error('AZURE_STORAGE_CONNECTION_STRING ausente');
if (!containerName) throw new Error('AZURE_BLOB_CONTAINER ausente');
if (!publicBase) throw new Error('AZURE_BLOB_PUBLIC_BASE ausente');

const blobServiceClient = BlobServiceClient.fromConnectionString(conn);
const containerClient = blobServiceClient.getContainerClient(containerName);

async function uploadNotaFiscalAzure(buffer, originalFileName, numeroNota, contentType='application/octet-stream') {
  const numeroNotaLimpo = String(numeroNota || '').replace(/[^a-zA-Z0-9]/g, '_');
  const ext = (originalFileName?.split('.').pop() || 'bin').toLowerCase();
  const blobName = `${numeroNotaLimpo}_${Date.now()}.${ext}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });

  return `${publicBase}/${containerName}/${blobName}`; // container com acesso "Blob"
}

module.exports = { uploadNotaFiscalAzure };
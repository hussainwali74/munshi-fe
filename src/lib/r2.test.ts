import { uploadImageToR2 } from './r2';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Mock S3 Client
jest.mock('@aws-sdk/client-s3', () => {
    const mS3Client = {
        send: jest.fn(),
    };
    return {
        S3Client: jest.fn(() => mS3Client),
        PutObjectCommand: jest.fn(),
    };
});

describe('uploadImageToR2', () => {
    const mockS3Client = new S3Client({});

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.R2_BUCKET_NAME = 'test-bucket';
        process.env.R2_PUBLIC_URL = 'https://pub-test.r2.dev';
    });

    it('should upload file to R2 and return public URL', async () => {
        const mockFile = new File(['test content'], 'test-image.png', { type: 'image/png' });
        Object.defineProperty(mockFile, 'arrayBuffer', {
            value: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
        });

        (mockS3Client.send as jest.Mock).mockResolvedValue({});

        const url = await uploadImageToR2(mockFile);

        expect(url).toContain('https://pub-test.r2.dev/products/');
        expect(url).toContain('test-image.png');

        expect(PutObjectCommand).toHaveBeenCalledWith(expect.objectContaining({
            Bucket: 'test-bucket',
            ContentType: 'image/png',
        }));
    });

    it('should handle upload errors', async () => {
        const mockFile = new File(['test content'], 'test-image.png', { type: 'image/png' });
        Object.defineProperty(mockFile, 'arrayBuffer', {
            value: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
        });

        (mockS3Client.send as jest.Mock).mockRejectedValue(new Error('Upload failed'));

        await expect(uploadImageToR2(mockFile)).rejects.toThrow('Upload failed');
    });
});

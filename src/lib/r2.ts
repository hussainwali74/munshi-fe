
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

export async function uploadImageToR2(file: File, folder: string = 'products'): Promise<string> {
    const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

    console.log('📦 R2 Upload Config:', {
        bucketName: R2_BUCKET_NAME,
        publicUrl: R2_PUBLIC_URL,
        accountId: R2_ACCOUNT_ID ? 'Set' : 'Missing',
        accessKeyId: R2_ACCESS_KEY_ID ? 'Set' : 'Missing',
        secretAccessKey: R2_SECRET_ACCESS_KEY ? 'Set' : 'Missing'
    })

    console.log('📄 File details:', {
        name: file.name,
        size: file.size,
        type: file.type
    })

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s/g, '-')}`;

    console.log('🎯 Uploading to R2:', {
        fileName,
        bufferSize: buffer.length
    })

    await S3.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
    }));

    const publicUrl = R2_PUBLIC_URL.startsWith('http') ? R2_PUBLIC_URL : `https://${R2_PUBLIC_URL}`;
    const finalUrl = `${publicUrl}/${fileName}`;

    console.log('🔗 Generated URL:', finalUrl)

    return finalUrl;
}

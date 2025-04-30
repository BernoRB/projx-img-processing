const AWS = require('aws-sdk');
const sharp = require('sharp');
const s3 = new AWS.S3();
const sqs = new AWS.SQS();

exports.handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Process SQS messages
    for (const record of event.Records) {
        try {
            const message = JSON.parse(record.body);
            console.log('Processing message:', message);
            
            const { imageId, s3Key, operations } = message;
            
            if (!imageId || !s3Key || !operations) {
                console.error('Missing required parameters');
                continue;
            }
            
            // Get original image from S3
            const originalBucket = process.env.S3_BUCKET_ORIGINAL;
            const processedBucket = process.env.S3_BUCKET_PROCESSED;
            
            console.log(`Fetching image ${s3Key} from bucket ${originalBucket}`);
            const s3Object = await s3.getObject({
                Bucket: originalBucket,
                Key: s3Key
            }).promise();
            
            // Process the image
            let imageBuffer = s3Object.Body;
            let sharpInstance = sharp(imageBuffer);
            const processedUrls = [];
            
            // Apply operations
            for (const operation of operations) {
                console.log(`Applying operation: ${operation.type}`, operation.params);
                
                switch (operation.type) {
                    case 'resize':
                        sharpInstance = sharpInstance.resize({
                            width: operation.params.width,
                            height: operation.params.height,
                            fit: operation.params.fit || 'cover'
                        });
                        break;
                        
                    case 'optimize':
                        // Use format-specific options
                        if (operation.params.format === 'jpeg' || operation.params.format === 'jpg') {
                            sharpInstance = sharpInstance.jpeg({ 
                                quality: operation.params.quality || 80 
                            });
                        } else if (operation.params.format === 'png') {
                            sharpInstance = sharpInstance.png({ 
                                compressionLevel: Math.floor((operation.params.quality || 80) / 10) 
                            });
                        } else if (operation.params.format === 'webp') {
                            sharpInstance = sharpInstance.webp({ 
                                quality: operation.params.quality || 80 
                            });
                        } else {
                            // Default to jpeg if no format specified
                            sharpInstance = sharpInstance.jpeg({ 
                                quality: operation.params.quality || 80 
                            });
                        }
                        break;
                        
                    case 'convert':
                        if (operation.params.format) {
                            sharpInstance = sharpInstance.toFormat(operation.params.format);
                        }
                        break;
                }
            }
            
            // Get processed image buffer
            const processedImageBuffer = await sharpInstance.toBuffer();
            
            // Save to S3
            const processedKey = `${imageId}/processed_${Date.now()}.jpg`;
            
            await s3.putObject({
                Bucket: processedBucket,
                Key: processedKey,
                Body: processedImageBuffer,
                ContentType: 'image/jpeg'
            }).promise();
            
            // Generate URL
            const processedUrl = `https://${processedBucket}.s3.amazonaws.com/${processedKey}`;
            processedUrls.push(processedUrl);
            
            // Send completion message
            await sqs.sendMessage({
                QueueUrl: process.env.SQS_COMPLETION_QUEUE_URL,
                MessageBody: JSON.stringify({
                    imageId,
                    processedUrls
                })
            }).promise();
            
            console.log(`Successfully processed image ${imageId}. URL: ${processedUrl}`);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    }
    
    return { status: 'ok' };
};
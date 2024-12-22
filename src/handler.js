import { fetchLatestEmails } from './email/index';
import { storeEmails } from './dynamo/index';

export const handler = async (event) => {
    try {
        const attachments = await obtainAttachmentsFromEmailAddress();
        await storeAttachments(attachments);
        
        const response = {
            statusCode: 200,
            body: JSON.stringify('Emails processed and stored successfully!'),
        };
        return response;
    } catch (error) {
        console.error('Error processing emails:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Failed to process emails.'),
        };
    }
};
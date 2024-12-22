import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const documentClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'Emails';

export const createEmailRecords = async (emailRecord) => {
    const emailData = {
        ...emailRecord,
        id: uuidv4(),
        treatedAttachments: 0,
        timestamp: new Date().getTime()
    };
    const params = {
        TableName: tableName,
        Item: emailData,
    };
    await documentClient.put(params).promise();
};

export const getLatestEmail = async (emailId) => {
    const params = {
        TableName: tableName,
        Key: {
            id: emailId,
        },
    };
    const result = await documentClient.get(params).promise();
    return result.Item;
};

export const updateEmailRecord = async (emailId, updatedData) => {
    const params = {
        TableName: tableName,
        Key: {
            id: emailId,
        },
        UpdateExpression: 'set #uuid = :uuid, #timestamp = :timestamp, #subject = :subject, #treatedAttachments = :treatedAttachments, #totalAttachmentsNumber = :totalAttachmentsNumber',
        ExpressionAttributeNames: {
            '#uuid': 'uuid',
            '#timestamp': 'timestamp',
            '#subject': 'subject',
            '#treatedAttachments': 'treatedAttachments',
            '#totalAttachmentsNumber': 'totalAttachmentsNumber',
        },
        ExpressionAttributeValues: {
            ':uuid': updatedData.uuid(),
            ':timestamp': new Date().toISOString(),
            ':subject': updatedData.subject,
            ':treatedAttachments': updatedData.treatedAttachments,
            ':totalAttachmentsNumber': updatedData.totalAttachmentsNumber,
        },
    };
    await documentClient.update(params).promise();
};
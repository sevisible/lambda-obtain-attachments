import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import util from 'util';
import dotenv from 'dotenv';
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

dotenv.config(); // Cargar las variables de entorno

const config = {
    imap: {
        user: 'lalagunadeltiempo@sevisible.es',
        password: 'Test1234.',
        host: 'imap.hostinger.com',
        port: 993,
        tls: true,
        authTimeout: 3000,
    }
};

export const handler = async (event) => {
    let connection;
    try {
        connection = await imaps.connect(config);
        console.log('Connection established.');

        const mailboxes = await connection.getBoxes();
        console.debug('Available folders:', util.inspect(mailboxes, { depth: null, colors: true }));

        const mailboxToOpen = 'INBOX';
        await connection.openBox(mailboxToOpen);
        console.log(`Opened folder '${mailboxToOpen}'.`);

        const searchCriteria = ['ALL'];
        const fetchOptions = {
            bodies: ['HEADER', ''],
            struct: true
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        console.log(`Found ${messages.length} messages.`);

        const emails = [];
        const result = [];

        for (const item of messages) {
            const body = item.parts.find(part => part.which === '');
            if (!body) {
                console.log('No se encontró BODY[] en el mensaje.');
                continue;
            }

            const mail = await simpleParser(body.body);
            console.log('Resultado mail BEGIN');
            console.log(`Subject: ${mail.subject}`);
            console.log(`From: ${mail.from.text}`);
            console.log('Resultado mail END');

            if (mail.attachments && mail.attachments.length > 0) {
                console.log(`Mensaje con adjuntos encontrado: ${mail.subject}`);
                emails.push(mail);
                for (const attachment of mail.attachments) {
                    console.log(`Adjunto: ${attachment.filename}`);

                    const resultingItem = {
                        subject: mail.subject,
                        from: mail.from.text,
                        date: new Date(mail.date).getTime(),
                        body: mail.text,
                        filename: attachment.filename,
                        content: attachment.content
                    };
                    console.log('resultingItem:', resultingItem);
                    result.push(resultingItem);

                    const bucketName = 'sevisible-la-laguna-del-tiempo';
                    const data = attachment.content;
                    console.log('Starting method for S3 Uploading...');
                    await uploadToS3(bucketName, resultingItem, data);
                    console.log('Finished method for S3 Uploading....');
                }
            }
        }

        if (emails.length > 0) {
            const seen = new WeakSet();
            const jsonString = JSON.stringify(emails, (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) {
                        return;
                    }
                    seen.add(value);
                }
                return value;
            }, 2);
            //console.log(jsonString);
        } else {
            console.log('No se encontraron correos con adjuntos.');
        }

        await connection.end();
        console.log('Conexión IMAP cerrada.');
        
    } catch (error) {
        console.error("Error en getEmailsWithAttachments:", error);
    }
};

const uploadToS3 = async (bucketName, resultingItem, attachment) => {
    const params = {
        Bucket: bucketName,
        Key: `${resultingItem.date}/${resultingItem.filename}`,
        Body: attachment
    };
    console.log('Starting S3 upload with params:', params);

    try {
        const data = await s3.upload(params).promise();
        console.log('S3 upload complete');
        console.log(`File uploaded successfully at ${data.Location}`);
        console.log('S3 upload response:', data);
    } catch (err) {
        console.error(`Error uploading file: ${err.message}`);
    }
};
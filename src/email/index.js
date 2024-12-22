import imaps from 'imap-simple'
import { simpleParser } from 'mailparser'

const config = {
    imap: {
        user: 'lalagunadeltiempo@sevisible.es',
        password: 'Test1234.',
        host: 'imap.hostinger.com',
        port: 993,
        tls: true,
        authTimeout: 3000
    }
}

export const getEmailsWithAttachments = async () => {
    try {
        console.log('config:', config)
        const connection = await imaps.connect(config)

        console.log('connection:', connection)
        const boxes = await connection.getBoxes()
        console.log('boxes:', boxes)
        await connection.openBox('INBOX')

        const searchCriteria = ['ALL']
        const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true }

        const messages = await connection.search(searchCriteria, fetchOptions)
        console.log('messages:', messages)
        console.log('message 0:', messages[0])
        const emails = await Promise.all(messages.map(async (message) => {
            const parts = imaps.getParts(message.attributes.struct)
            console.log('parts:', parts)
            const email = await simpleParser(message.parts[1].body)
            console.log('email:', email)
            const attachments = parts.filter(part => part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT').map(part => {
                return connection.getPartData(message, part)
                    .then(partData => {
                        return {
                            filename: part.disposition.params.filename,
                            data: partData
                        }
                    })
            })
            console.log('attachments size:', attachments.length)
            return {
                subject: email.subject,
                from: email.from.text,
                date: email.date,
                body: email.text,
                attachments: await Promise.all(attachments)
            }
        }))

        await connection.end()
        console.log('Connection ended')
        return emails
    } catch (error) {
        console.error('Error fetching emails:', error)
        throw new Error('Failed to fetch emails.')
    }
}

getEmailsWithAttachments()
import imaps from 'imap-simple'
import { simpleParser } from 'mailparser'
import fs from 'fs'
import path from 'path'
import util from 'util'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Definir __filename y __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config() // Cargar las variables de entorno

// Configuración de conexión usando variables de entorno
const config = {
    imap: {
        user: 'lalagunadeltiempo@sevisible.es',
        password: 'Test1234.',
        host: 'imap.hostinger.com',
        port: 993,
        tls: true,
        authTimeout: 3000,
        //debug: console.debug // Habilita los logs de depuración
    }
}

async function getEmailsWithAttachments() {
    let connection
    try {
        // Conectar al servidor IMAP
        connection = await imaps.connect(config)
        console.log('Connection established.')

        // Listar todas las carpetas disponibles (usando util.inspect para evitar errores)
        const mailboxes = await connection.getBoxes()
        console.debug('Available folders:', util.inspect(mailboxes, { depth: null, colors: true }))

        // Determinar la carpeta a abrir (INBOX por defecto)
        const mailboxToOpen = 'INBOX'
        await connection.openBox(mailboxToOpen)
        console.log(`Opened folder '${mailboxToOpen}'.`)

        // Definir criterios de búsqueda y opciones de fetch
        const searchCriteria = ['ALL']
        const fetchOptions = {
            bodies: ['HEADER', ''], // Usar una cadena vacía para mapear a BODY[]
            struct: true
        }

        // Buscar mensajes según los criterios
        const messages = await connection.search(searchCriteria, fetchOptions)
        console.log(`Found ${messages.length} messages.`)

        const emails = []
        const result = []

        for (const item of messages) {
            // Encontrar la parte 'BODY[]' que contiene el mensaje completo
            const body = item.parts.find(part => part.which === '')
            if (!body) {
                console.log('No se encontró BODY[] en el mensaje.')
                continue
            }

            // Parsear el mensaje completo sin añadir cabeceras adicionales
            const mail = await simpleParser(body.body)
            console.log('Resultado mail BEGIN')
            console.log(`Subject: ${mail.subject}`)
            console.log(`From: ${mail.from.text}`)
            console.log('Resultado mail END')

            // Verificar si hay adjuntos
            if (mail.attachments && mail.attachments.length > 0) {
                console.log(`Mensaje con adjuntos encontrado: ${mail.subject}`)
                emails.push(mail)
                mail.attachments.forEach((attachment, index) => {
                    
                    console.log(`Adjunto ${index + 1}: ${attachment.filename}`)

                    // Guardar adjunto en el sistema de archivos
                    const attachmentDir = path.join(__dirname, 'attachments')
                    if (!fs.existsSync(attachmentDir)) {
                        fs.mkdirSync(attachmentDir)
                    }
                    const filePath = path.join(attachmentDir, attachment.filename)
                    fs.writeFileSync(filePath, attachment.content)
                    console.log(`Adjunto guardado en: ${filePath}`)

                    const dummycontent = {
                        "type": "Buffer",
                        "data": [
                            60,
                            109,
                            10
                        ]
                    }
                    const resultingItem = {
                        subject: mail.subject,
                        from: mail.from.text,
                        date: mail.date,
                        body: mail.text,
                        filename: attachment.filename,
                        //content: attachment.content
                        content: dummycontent
                    }
                    result.push(resultingItem)
                })
            }
        }

        // Convertir los correos con adjuntos a JSON (usando getCircularReplacer si es necesario)
        if (emails.length > 0) {
            const seen = new WeakSet()
            const jsonString = JSON.stringify(emails, (key, value) => {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) {
                        return
                    }
                    seen.add(value)
                }
                return value
            }, 2)
            //console.log(jsonString)
        } else {
            console.log('No se encontraron correos con adjuntos.')
        }

        // Cerrar la conexión IMAP
        await connection.end()
        console.log('Conexión IMAP cerrada.')
        return attachments
    } catch (error) {
        console.error("Error en getEmailsWithAttachments:", error)
    }
}

// Ejecutar la función
getEmailsWithAttachments()

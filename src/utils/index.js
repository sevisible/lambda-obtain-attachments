export const formatEmailData = (email) => {
    return {
        id: email.id,
        subject: email.subject,
        sender: email.sender,
        receivedAt: email.receivedAt,
        body: email.body,
    };
};

export const handleError = (error) => {
    console.error('An error occurred:', error);
    return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
    };
};
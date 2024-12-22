# EMAIL EXTRACTOR PROJECT

## Overview
This project is designed to extract the latest emails from a specified email address and store the information in a DynamoDB table. It utilizes AWS Lambda for serverless execution and the Serverless Framework for deployment.

## Project Structure
```
email-extractor-project
├── src
│   ├── handler.js          # Entry point for the Lambda function
│   ├── dynamo
│   │   └── index.js        # Functions for interacting with DynamoDB
│   ├── email
│   │   └── index.js        # Functions for connecting to the email service
│   └── utils
│       └── index.js        # Utility functions for various tasks
├── package.json             # npm configuration file
├── serverless.yml           # Serverless Framework configuration
└── README.md                # Project documentation
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   cd email-extractor-project
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure AWS credentials:
   Ensure that your AWS credentials are set up in your environment. You can do this by configuring the AWS CLI or setting environment variables.

4. Deploy the project:
   ```
   serverless deploy
   ```

## Usage Guidelines
- The Lambda function is triggered every hour to fetch the latest emails.
- The latest email information is stored in the DynamoDB table for retrieval and processing.

## Email Extraction Process
1. The Lambda function connects to the specified email service.
2. It fetches the latest emails.
3. The email data is processed and stored in DynamoDB.
4. The latest email record is updated in the database.

## License
This project is licensed under the MIT License.
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_dynamodb_code_examples.html
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const TODOS_TABLE = process.env.TODOS_TABLE;
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.getTodo = async (event, context) => {
  console.log('event', event);
  console.log('context', context);

  const { id } = event.pathParameters;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'missing ID in path parameters',
      }),
    };
  }

  try {
    const data = await docClient.send(
      new GetCommand({
        TableName: TODOS_TABLE,
        Key: { id },
      })
    );

    const reponse = data.Item
      ? {
          statusCode: 200,
          body: JSON.stringify(data.Item),
        }
      : {
          statusCode: 404,
          body: JSON.stringify({ message: 'Todo not dound' }),
        };

    return reponse;
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
};

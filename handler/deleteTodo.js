// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_dynamodb_code_examples.html
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  DeleteCommand,
} = require('@aws-sdk/lib-dynamodb');

const TODOS_TABLE = process.env.TODOS_TABLE;
const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

exports.deleteTodo = async (event, context) => {
  console.log('event', event);
  console.log('context', context);

  const { id } = event.pathParameters;

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'ID not found',
      }),
    };
  }

  try {
    const data = await dynamoDbClient.send(
      new DeleteCommand({
        TableName: TODOS_TABLE,
        Key: { id },
        ReturnValues: 'ALL_OLD',
      })
    );

    const reponse = data.Attributes
      ? {
          statusCode: 200,
          body: JSON.stringify({ message: 'Todo deleted' }),
        }
      : {
          statusCode: 404,
          body: JSON.stringify({ message: 'Todo not found' }),
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

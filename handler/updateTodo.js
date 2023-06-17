// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_dynamodb_code_examples.html
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const TODOS_TABLE = process.env.TODOS_TABLE;
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.updateTodo = async (event, context) => {
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

  if (!event.body) {
    // failed without a body
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'missing body',
      }),
    };
  }

  const { todo, checked } = JSON.parse(event.body);

  if (typeof checked !== 'boolean' || typeof todo !== 'string') {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'the values of checked or todo are not valid',
      }),
    };
  }

  // const timestamp = new Date().toISOString();

  // Define the formatting options
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Berlin',
  };

  // Format the current date and time with the defined options
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const timestamp = formatter.format(new Date());

  try {
    const data = await docClient.send(
      new UpdateCommand({
        TableName: TODOS_TABLE,
        Key: { id },
        UpdateExpression:
          'SET updatedAt = :updatedAt, checked = :checked, todo = :todo',
        ExpressionAttributeValues: {
          ':updatedAt': timestamp,
          ':checked': checked,
          ':todo': todo,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    console.log(data);

    const reponse = data.Attributes
      ? {
          statusCode: 200,
          body: JSON.stringify(data.Attributes),
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

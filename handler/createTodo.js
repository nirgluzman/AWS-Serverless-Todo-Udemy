// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_dynamodb_code_examples.html
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const TODOS_TABLE = process.env.TODOS_TABLE;
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const uuid = require('uuid');

exports.createTodo = async (event, context) => {
  console.log('event', event);
  console.log('context', context);

  const data = JSON.parse(event.body);

  if (!data || !data.todo) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'missing body or todo',
      }),
    };
  }

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

  const newTodo = {
    id: uuid.v4(),
    createdAt: timestamp,
    updatedAt: timestamp,
    todo: data.todo,
    checked: false,
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: TODOS_TABLE,
        Item: newTodo,
      })
    );

    return {
      statusCode: 201,
      body: JSON.stringify(newTodo),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
};

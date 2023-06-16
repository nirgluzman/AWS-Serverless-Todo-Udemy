const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const TODOS_TABLE = process.env.TODOS_TABLE;
const client = new DynamoDBClient();
const dynamoDbClient = DynamoDBDocumentClient.from(client);

const uuid = require('uuid');

exports.createTodo = async (event, context) => {
  const data = JSON.parse(event.body);

  if (!data || !data.todo) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing todo',
      }),
    };
  }

  const timestamp = new Date().getTime();
  const newTodo = {
    id: uuid.v4(),
    createdAt: timestamp,
    updatedAt: timestamp,
    todo: data.todo,
    checked: false,
  };

  try {
    await dynamoDbClient.send(
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

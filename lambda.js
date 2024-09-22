import AWS from 'aws-sdk';

AWS.config.update({
  region: 'us-east-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const dynamodbTableName = 'Product';
const productsPath = '/products';

export const handler = async function(event) {  // Menggunakan export di ES module
  console.log('Request event: ', event);
  let response;
  
  switch(true) {
    case event.httpMethod === 'GET' && event.path === productsPath:
      response = await getProducts();
      break;
    default:
      response = buildResponse(404, '404 Not Found');
  }
  
  return response;
}

async function getProducts() {
  const params = {
    TableName: dynamodbTableName
  };
  
  const allProducts = await scanDynamoRecords(params, []);
  return buildResponse(200, allProducts);
}

async function scanDynamoRecords(scanParams, itemArray) {
  try {
    const dynamoData = await dynamodb.scan(scanParams).promise();
    itemArray = itemArray.concat(dynamoData.Items);
    
    if (dynamoData.LastEvaluatedKey) {
      scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
      return await scanDynamoRecords(scanParams, itemArray);
    }
    
    return itemArray;
  } catch (error) {
    console.error('Error during DynamoDB scan: ', error);
  }
}

function buildResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}
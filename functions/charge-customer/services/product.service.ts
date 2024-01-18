import { BatchWriteItemCommand, DynamoDBClient, WriteRequest } from '@aws-sdk/client-dynamodb';
import { dataToItem } from 'dynamo-converters';
import { DesiredProductInfo } from '../types/DesiredProductInfo';

export class ProductService {
    private ddbClient: DynamoDBClient;
    private tableName: string;

    constructor(ddbClient: DynamoDBClient, tableName: string) {
        this.ddbClient = ddbClient;
        this.tableName = tableName;
    }

    public async changeProductsCount(products: DesiredProductInfo[]): Promise<void> {
        const writeRequests: WriteRequest[] = products.map((desiredProductInfo) => {
            const { desiredCount, ...product } = desiredProductInfo;
            product.count = desiredProductInfo.count - desiredCount;

            const rawProduct = dataToItem(product);

            return {
                PutRequest: {
                    Item: rawProduct,
                },
            };
        });

        const batchWriteCommand = new BatchWriteItemCommand({
            RequestItems: {
                [this.tableName]: writeRequests,
            },
        });

        const batchWriteResp = await this.ddbClient.send(batchWriteCommand);
        if (batchWriteResp.$metadata.httpStatusCode !== 200) {
            throw new Error('Failed to change products count');
        }
    }
}

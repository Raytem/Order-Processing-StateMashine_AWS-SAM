import { AttributeValue, BatchGetItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Product } from '../types/Product';
import { itemToData } from 'dynamo-converters';

export class ProductService {
    private ddbClient: DynamoDBClient;
    private tableName: string;

    constructor(ddbClient: DynamoDBClient, tableName: string) {
        this.ddbClient = ddbClient;
        this.tableName = tableName;
    }

    private getMappedKeys(keyName: string, keyType: 'S', values: string[]): Record<string, AttributeValue>[] {
        return values.map((val) => ({
            [keyName]: {
                [keyType]: val,
            },
        }));
    }

    public async batchGetProducts(productIds: string[]): Promise<Product[]> {
        const batchGetItemCommand = new BatchGetItemCommand({
            RequestItems: {
                [this.tableName]: {
                    Keys: this.getMappedKeys('id', 'S', productIds),
                },
            },
        });

        const response = await this.ddbClient.send(batchGetItemCommand);

        if (!response.Responses) {
            throw new Error('No products found');
        }
        const rawProducts = response.Responses[this.tableName];

        const products: Product[] = rawProducts.map((rawProduct) => itemToData(rawProduct) as unknown as Product);

        return products;
    }
}

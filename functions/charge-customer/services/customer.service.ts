import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { Customer } from "../types/Customer";
import { itemToData } from "dynamo-converters";

export class CustomerService {
    private ddbClient: DynamoDBClient;
    private tableName: string;

    constructor(ddbClient: DynamoDBClient, tableName: string) {
        this.ddbClient = ddbClient;
        this.tableName = tableName;
    }

    public async getCustomer(customerId: string): Promise<Customer> {
        const getItemCommand = new GetItemCommand({
            TableName: this.tableName,
            Key: {
                id: { S: customerId.toString() },
            },
            ConsistentRead: true,
        });

        const getCustomerResponse = await this.ddbClient.send(getItemCommand);
        const rawCustomer = getCustomerResponse.Item;
        if (!rawCustomer) {
            throw new Error(`Customer with id=${customerId} not found`);
        }
        const customer = itemToData(rawCustomer) as unknown as Customer;
        
        return customer;
    }

    public async updateCustomerBalance(customerId: string, balance: number): Promise<Customer> {
        const updateItemCommand = new UpdateItemCommand({
            TableName: this.tableName,
            Key: {
                id: { S: customerId.toString() },
            },
            AttributeUpdates: {
                balance: {
                    Value: { N: balance.toString() },
                    Action: 'PUT',
                },
            },
            ReturnValues: 'ALL_NEW',
        });

        const updateResponse = await this.ddbClient.send(updateItemCommand);
        if (!updateResponse.Attributes) {
            throw new Error('Customer not updated');
        }
        const customer = itemToData(updateResponse.Attributes) as unknown as Customer;

        return customer;
    }
}
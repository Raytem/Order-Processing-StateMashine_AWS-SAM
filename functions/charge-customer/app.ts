import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ChargeCustomerResponse } from './types/ChargeCustomerResponse';
import { CheckProductsResponse } from './types/CheckProductsResponse';
import { CustomerService } from './services/customer.service';
import { CustomerInfo } from './types/CustomerInfo';
import { ProductService } from './services/product.service';

const ddb = new DynamoDBClient({});
const customersTableName = process.env.CUSTOMERS_TABLE || '';
const productsTableName = process.env.PRODUCTS_TABLE || '';

// const customersTableName = 'OrderProcessing-stack-CustomersTable-5RXW7H3JZG1G';
// const productsTableName = 'OrderProcessing-stack-ProductsTable-14C9NHSUQ4PBI';

const customerService = new CustomerService(ddb, customersTableName);
const productService = new ProductService(ddb, productsTableName);

export const lambdaHandler = async (checkProductsResponse: CheckProductsResponse): Promise<ChargeCustomerResponse> => {
    const customer = await customerService.getCustomer(checkProductsResponse.customerId);

    const newBalance = customer.balance - checkProductsResponse.totalPrice;
    if (newBalance < 0) {
        throw new Error('Customer balance is not enough');
    }

    const updatedCustomer = await customerService.updateCustomerBalance(checkProductsResponse.customerId, newBalance);

    await productService.changeProductsCount(checkProductsResponse.orderProducts);

    const customerInfo: CustomerInfo = {
        fullName: updatedCustomer.fullName,
        email: updatedCustomer.email,
    };

    return {
        customerInfo,
        orderInfo: checkProductsResponse,
    };
};

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Order, ProductInfo } from './types/Order';
import { ProductService } from './services/product.service';
import { MissingProductInfo } from './types/MissingProductInfo';
import { CheckProductsResponse } from './types/CheckProductsResponse';
import { Product } from './types/Product';
import { DesiredProductInfo } from './types/DesiredProductInfo';

const ddb = new DynamoDBClient({});
const productsTableName = process.env.PRODUCTS_TABLE || '';
const productService = new ProductService(ddb, productsTableName);

export const lambdaHandler = async (order: Order): Promise<CheckProductsResponse> => {
    if (!productsTableName) {
        throw Error('Cannot find Resource(DynamoDB table) whit provided name');
    }

    if (!order.productsInfo) {
        throw Error('There is no productsInfo fount in body');
    }

    const productIds = order.productsInfo.map((productInfo) => productInfo.id);
    const products = await productService.batchGetProducts(productIds);

    const unfoundedProducts: ProductInfo[] = [];
    const missingProducts: MissingProductInfo[] = [];

    order.productsInfo.forEach((productInfo) => {
        const product = products.find((product) => product.id === productInfo.id);
        if (!product) {
            unfoundedProducts.push(productInfo);
        } else {
            if (productInfo.count > product.count) {
                missingProducts.push({
                    productId: productInfo.id,
                    missingCnt: productInfo.count - product.count,
                });
            }
        }
    });

    if (unfoundedProducts.length) {
        const unfoundedProductsString = JSON.stringify(unfoundedProducts, null, 4);
        throw Error(`There are unfounded products: \n${unfoundedProductsString}`);
    }

    if (missingProducts.length) {
        const missingProductsString = JSON.stringify(missingProducts, null, 4);
        throw Error(`There are missing products: \n${missingProductsString}`);
    }

    const orderProducts: DesiredProductInfo[] = [];
    const totalPrice = products.reduce((sum, product) => {
        let curProductPrice = 0;
        order.productsInfo.forEach((productInfo) => {
            if (productInfo.id === product.id) {
                curProductPrice = product.price * productInfo.count;

                orderProducts.push({ ...product, desiredCount: productInfo.count });
            }
        });

        return sum + curProductPrice;
    }, 0);

    const response: CheckProductsResponse = {
        customerId: order.customerId,
        orderId: order.id,
        totalPrice,
        orderProducts,
    };

    return response;
};

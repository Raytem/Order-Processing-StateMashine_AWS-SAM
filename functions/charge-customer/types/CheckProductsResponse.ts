import { DesiredProductInfo } from './DesiredProductInfo';
import { Product } from './Product';

export interface CheckProductsResponse {
    customerId: string;
    orderId: string;
    totalPrice: number;
    orderProducts: DesiredProductInfo[];
};
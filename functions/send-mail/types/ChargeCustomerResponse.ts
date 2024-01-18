import { CheckProductsResponse } from './CheckProductsResponse';
import { CustomerInfo } from './CustomerInfo';

export interface ChargeCustomerResponse {
    customerInfo: CustomerInfo;
    orderInfo: CheckProductsResponse;
}
export interface ProductInfo {
  id: string;
  count: number;
}

export interface Order {
  id: string;
  customerId: string;
  orderStatus: string;
  productsInfo: Array<ProductInfo>;
}
import Joi from 'joi';
import { Order } from '../types/Order';

export class ValidationService {
    async validate(object: Order): Promise<Order> {
        const schema = Joi.object({
            id: Joi.string().required(),
            customerId: Joi.string().required(),
            orderStatus: Joi.string().required(),
            productsInfo: Joi.array()
                .items(
                    Joi.object({
                        id: Joi.string().required(),
                        count: Joi.number().required(),
                    }),
                )
                .required(),
        });

        try {
            const value = schema.validateAsync(object, { abortEarly: false });
            return value;
        } catch (error) {
            throw error;
        }
    }
}

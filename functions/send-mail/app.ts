import { ChargeCustomerResponse } from '../charge-customer/types/ChargeCustomerResponse';
import { MailService } from './services/mail.service';

const mailService = new MailService();

export const lambdaHandler = async (
    chargeCustomerResponse: ChargeCustomerResponse,
): Promise<ChargeCustomerResponse> => {
    await mailService.sendMail(chargeCustomerResponse.customerInfo, chargeCustomerResponse.orderInfo);

    return chargeCustomerResponse;
};

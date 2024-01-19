import { ValidationService } from './services/validation.service';
import { Order } from './types/Order';
import { v4 as uuidv4 } from 'uuid';
import { PartialOrder } from './types/PartialOrder';
import { SQSEvent } from 'aws-lambda';
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';

const validationService = new ValidationService();
const sfnClient = new SFNClient({});

export const lambdaHandler = async (sqsEvent: SQSEvent): Promise<Order> => {
    const partialOrderJson = sqsEvent.Records[0].body;

    const partialOrder: PartialOrder = JSON.parse(partialOrderJson);

    const orderId = uuidv4();
    const orderStatus = 'PROCESSING';

    const order = { id: orderId, orderStatus, ...partialOrder };
    await validationService.validate(order);

    await sfnClient.send(
        new StartExecutionCommand({
            input: JSON.stringify(order),
            stateMachineArn: process.env.ORDER_STATE_MACHINE,
        }),
    );

    return order;
};

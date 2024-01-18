import { CheckProductsResponse } from '../types/CheckProductsResponse';
import nodemailer, { Transporter } from 'nodemailer';
import { CustomerInfo } from '../types/CustomerInfo';

export class MailService {
    transporter: Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            logger: true,
            debug: true,
            secureConnection: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    async sendMail(customerInfo: CustomerInfo, orderInfo: CheckProductsResponse) {
        const productTableRows = orderInfo.orderProducts.map((product) => {
            return `
            <tr>
                <th>${product.name}</th>
                <th>$${product.price}</th>
                <th>${product.desiredCount}</th>
            </tr>
            `;
        });

        const htmlStringRows = productTableRows.reduce((result, row) => result + row, '');

        const html = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    table {
                        font-family: arial, sans-serif;
                        border-collapse: collapse;
                        width: 100%;
                    }
                    
                    td,
                    th {
                        border: 1px solid #dddddd;
                        text-align: left;
                        padding: 8px;
                    }
        
                    tr:nth-child(even) {
                        background-color: #dddddd;
                    }
                </style>
            </head>
        
        
            <body>
                <div>
                    <h1>Hello, ${customerInfo.fullName}</h1>
                    <h2>Order ${orderInfo.orderId} was successfully paid and transferred to the delivery service</h2>
                    <br>
                    <h2>Total price: $${orderInfo.totalPrice}</h2>
                    <br>
                    <h2>Order Products: </h2>
            
                </div>
                <table>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Count</th>
                    </tr>
                    ${htmlStringRows}
                </table>
            </body>
        </html>
        `;

        const response = await new Promise<void>((resolve, reject) => {
            this.transporter.sendMail(
                {
                    from: process.env.SMTP_USER,
                    to: customerInfo.email,
                    subject: 'Order payment info',
                    html,
                },
                function (error, info) {
                    if (error) {
                        return reject(error);
                    }
                    console.log('--Email sent--');
                    resolve();
                },
            );
        });
    }
}

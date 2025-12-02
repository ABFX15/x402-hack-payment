import {
    encodeURL,
    createQR,
    findReference,
    validateTransfer,
    TransactionRequestURLFields,
    TransferRequestURLFields
} from '@solana/pay';
import { Keypair, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';

export function createTransactionRequestLink(
    apiEndpoint: string,
    orderId: string,
    amount: number,
    tokenMint: string,
): URL {
    const params: TransactionRequestURLFields = {
        link: new URL(
            `${apiEndpoint}/pay?` +
            `orderId=${orderId}` +
            `&amount=${amount}` +
            `mint=${tokenMint}`
        ),
        label: 'Your Payment App',
        message: `Pay for order ${orderId}`,
    };
    return encodeURL(params);
}

export function createPaymentQR(
    paymentUrl: URL,
    size: number = 256
): Promise<string> {
    const qr = createQR(paymentUrl, size);
    return Promise.resolve(qr.getRawData('svg') as unknown as string);
}

export function generatePaymentReference(): { reference: PublicKey; secretKey: Uint8Array } {
    const keypair = Keypair.generate();
    return {
        reference: keypair.publicKey,
        secretKey: keypair.secretKey,
    };
}
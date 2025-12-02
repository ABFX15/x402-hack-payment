import axios from "axios";
import base58 from "bs58";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
    createAssociatedTokenAccountInstruction,
    createTransferInstruction,
    getAssociatedTokenAddress
} from "@solana/spl-token";

export type TokenFee = {
    mint: string;
    account: string;
    decimals: number;
    fee: number;
};

export type OctaneConfig = {
    feePayer: string;
    rpcUrl: string;
    maxSignatures: number;
    lamportsPerSignature: number;
    corsOrigin: boolean;
    endpoints: {
        transfer: { tokens: TokenFee[] },
        createAssociatedAccount: { token: TokenFee[] },
        whirlpoolSwap: { token: TokenFee[] }
    };
};

const OCTANE_ENDPOINT = 'http://localhost:3001/api';

export async function loadOctaneConfig(): Promise<OctaneConfig> {
    return (await axios.get(OCTANE_ENDPOINT)).data as OctaneConfig;
}

export async function createAssociatedTokenAccount(transaction: Transaction): Promise<string> {
    const response = (await axios.post(OCTANE_ENDPOINT + '/createAssociatedTokenAccount', {
        transaction: base58.encode(transaction.serialize({ requireAllSignatures: false })),
    })).data;
    return response.signature as string;
}

async function transferTokenWithFee(transaction: Transaction): Promise<string> {
    const response = (await axios.post(OCTANE_ENDPOINT + '/transfer', {
        transaction: base58.encode(transaction.serialize({ requireAllSignatures: false })),
    })).data;
    return response.signature as string;
}

export async function buildTransaction(
    connection: Connection,
    feePayer: PublicKey,
    fee: TokenFee,
    mint: PublicKey,
    sender: PublicKey,
    recipient: PublicKey,
    transferAmountInDecimals: number,
): Promise<Transaction> {
    const feeIx = createTransferInstruction(
        await getAssociatedTokenAddress(mint, sender),
        new PublicKey(fee.account),
        sender,
        fee.fee
    );
    const transferIx = createTransferInstruction(
        await getAssociatedTokenAddress(mint, sender),
        await getAssociatedTokenAddress(mint, recipient),
        sender,
        transferAmountInDecimals
    );
    return (new Transaction({
        recentBlockhash: (await connection.getLatestBlockhashAndContext()).value.blockhash,
        feePayer: feePayer,
    })).add(feeIx, transferIx);
}

export async function buildTransactionToCreateAccount(
    connection: Connection,
    feePayer: PublicKey,
    fee: TokenFee,
    mint: PublicKey,
    sender: PublicKey,
    recipient: PublicKey
): Promise<Transaction> {
    const feeInstruction = createTransferInstruction(
        await getAssociatedTokenAddress(mint, sender),
        new PublicKey(fee.account),
        sender,
        fee.fee
    );
    const accountInstruction = createAssociatedTokenAccountInstruction(
        feePayer,
        await getAssociatedTokenAddress(mint, recipient),
        recipient,
        mint
    );
    return (new Transaction({
        recentBlockhash: (await connection.getRecentBlockhashAndContext()).value.blockhash,
        feePayer: feePayer,
    }).add(feeInstruction, accountInstruction));
}

export async function buildTransactionWithAccountCheck(
    connection: Connection,
    feePayer: PublicKey,
    fee: TokenFee,
    mint: PublicKey,
    sender: PublicKey,
    recipient: PublicKey,
    transferAmountInDecimals: number,
): Promise<Transaction> {
    const recipientAta = await getAssociatedTokenAddress(mint, recipient);
    const accountInfo = await connection.getAccountInfo(recipientAta);

    const tx = new Transaction({
        recentBlockhash: (await connection.getLatestBlockhashAndContext()).value.blockhash,
        feePayer: feePayer,
    });

    // Fee instruction first (Octane requirement)
    tx.add(createTransferInstruction(
        await getAssociatedTokenAddress(mint, sender),
        new PublicKey(fee.account),
        sender,
        fee.fee
    ));

    // Create ATA if it doesn't exist
    if (!accountInfo) {
        tx.add(createAssociatedTokenAccountInstruction(
            feePayer,
            recipientAta,
            recipient,
            mint
        ));
    }

    // Transfer
    tx.add(createTransferInstruction(
        await getAssociatedTokenAddress(mint, sender),
        recipientAta,
        sender,
        transferAmountInDecimals
    ));

    return tx;
}
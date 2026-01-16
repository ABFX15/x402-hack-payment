import { VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

const txBase64 = 'AosZacjrB6LMWs++iLAHxHq1MwDGhkdBgknBUmfdT1Vo/woK0kEoKQekktx/p7mmdq2fket+XjwB481QwKa/ogUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgEECHPOllsY5+w5qZSw3sag/pwchTiG4QQ6jNjaqXmPJ1enjrUPT4QtNmsioEdo4/06wII0nlxzlVpUN9knbgP+VkwRS3c3bxVwj8Qil/VCvRXFLBK3dFk8fz8LHSoIt4xLHnthFTgw3dBHLJFv+XVTXn/NLUoz+n1yWtBiE5Nx2HLYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqTtELLORIVfxOpM9ATQoLQMrX/';

try {
    const txBytes = Buffer.from(txBase64, 'base64');
    const vtx = VersionedTransaction.deserialize(txBytes);

    console.log('Fee Payer:', vtx.message.staticAccountKeys[0].toBase58());
    console.log('Signatures:', vtx.signatures.length);

    vtx.signatures.forEach((sig, i) => {
        const isZero = sig.every(b => b === 0);
        console.log(`  Sig ${i}:`, isZero ? '(empty/unsigned)' : bs58.encode(sig));
    });

    console.log('\nAll accounts:');
    vtx.message.staticAccountKeys.forEach((key, i) => {
        console.log(`  ${i}: ${key.toBase58()}`);
    });
} catch (e) {
    console.log('Error:', e);
}

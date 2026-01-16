const { VersionedTransaction } = require('@solana/web3.js');
const bs58 = require('bs58');

// Full transaction from Kora transferTransaction
const txBase64 = 'Avs7ZLqf0DaIxqggeZLI7V1DYdv+wYwMbHSrmas98f0/WJCln3dOrfwYC1uQOJ8SzMiT005gaz0c3pV2Tsw1bwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAgEECHPOllsY5+w5qZSw3sag/pwchTiG4QQ6jNjaqXmPJ1enjrUPT4QtNmsioEdo4/06wII0nlxzlVpUN9knbgP+VkwRS3c3bxVwj8Qil/VCvRXFLBK3dFk8fz8LHSoIt4xLHnthFTgw3dBHLJFv+XVTXn/NLUoz+n1yWtBiE5Nx2HLYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqTtELLORIVfxOpM9ATQoLQMrX/7NAaLb8bd5BgjfAC6njJclj04kifG7PRApFI4NgwtaE5na/xCEBI572Nvp+FkV7Hih0DWnt2/dId44LW/Qvfaiau7ihVzkeE3NiLYS5wIHBgACAQYEBQEABQQDBgIBCgxQwwAAAAAAAAY=';

const txBytes = Buffer.from(txBase64, 'base64');
const vtx = VersionedTransaction.deserialize(txBytes);

console.log('Fee Payer:', vtx.message.staticAccountKeys[0].toBase58());
console.log('Signatures:', vtx.signatures.length);

vtx.signatures.forEach((sig, i) => {
    const isZero = sig.every(b => b === 0);
    console.log('  Sig ' + i + ':', isZero ? '(empty)' : bs58.encode(sig));
});

console.log('\nAll accounts:');
vtx.message.staticAccountKeys.forEach((key, i) => {
    console.log('  ' + i + ': ' + key.toBase58());
});

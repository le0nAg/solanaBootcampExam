import { 
    Keypair, 
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey
} from "@solana/web3.js";

import { 
    createMint,
    mintTo,
    getOrCreateAssociatedTokenAccount,
    transfer
} from "@solana/spl-token";

const srcKeypair = Keypair.generate();
console.log(`The source wallet: ${srcKeypair.publicKey.toBase58()} was generated`);
const dstKeypair = Keypair.generate();
console.log(`The destination wallet: ${dstKeypair.publicKey.toBase58()} was generated`);

const connection = new Connection("https://api.devnet.solana.com", "finalized");

// Function to request an airdrop with retries
async function requestAirdropWithRetry(publicKey: PublicKey, amount: number, retries = 5) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const airdropSignature = await connection.requestAirdrop(publicKey, amount);
            console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${airdropSignature}?cluster=devnet`);
            return;
        } catch (error) {
            if (attempt === retries) {
                throw new Error('Airdrop failed after maximum retries');
            }
        }
    }
}

(async () => {
    try {
        // Request airdrop
        await requestAirdropWithRetry(srcKeypair.publicKey, 1 * LAMPORTS_PER_SOL);

        // Mint creation
        const mintPk = await createMint(
            connection,
            srcKeypair,
            srcKeypair.publicKey,
            null,
            6
        );
        console.log("Mint public key:", mintPk.toBase58());

        // Minting tokens
        const srcTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            srcKeypair,
            mintPk,
            srcKeypair.publicKey
        );

        const srcAta = srcTokenAccount.address;
        console.log("Source Associated Token Account: ", srcAta.toBase58());

        const mintAmount = 10e6;

        await mintTo(
            connection,
            srcKeypair,
            mintPk,
            srcAta,
            srcKeypair.publicKey,
            mintAmount
        );

        console.log("Minted", mintAmount, "to", srcAta.toBase58());

        // Transfer tokens
        const dstTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection, 
            srcKeypair,
            mintPk,
            dstKeypair.publicKey
        );

        const dstAta = dstTokenAccount.address;
        console.log("Destination Associated Token Account: ", dstAta.toBase58());

        const transferAmount = 10e5;

        await transfer(
            connection,
            srcKeypair,
            srcAta,  // Source account
            dstAta,
            srcKeypair.publicKey,
            transferAmount
        );

        console.log("Transferred", transferAmount, "from", srcAta.toBase58(), "to", dstAta.toBase58());
    } catch (error) {
        console.error(error);
    }
})();

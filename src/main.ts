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
console.log(`The source wallet: ${srcKeypair.publicKey.toBase58()} was generated`)
const dstKeypair = Keypair.generate();
console.log(`The destionation wallet: ${srcKeypair.publicKey.toBase58()} was generated`)

const connection = new Connection("https://api.devnet.solana.com", "finalized");

 
const fromAta = srcKeypair.publicKey;


//airdrop req
(async () => {
    try {
        
        const airdropSignature = await connection.requestAirdrop(
            srcKeypair.publicKey,      
            1 * LAMPORTS_PER_SOL 
        );

        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${airdropSignature}?cluster=devnet`);
    } catch (error) {
        console.error(error);
    }
})();

//mint creation
let mintPk:PublicKey = new PublicKey(( async () => {
    const mint = await createMint(
        connection,
        srcKeypair,
        srcKeypair.publicKey,
        null,
        6,
    );
    return mint.toBase58;
})());


//minting
(async () => {

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        srcKeypair,
        mintPk,
        srcKeypair.publicKey,
    );

    const ata = tokenAccount.address;
    console.log("Associated Token Account: ", ata.toBase58());

    const amount = 10e6;

    await mintTo(
        connection,
        srcKeypair,
        mintPk,
        ata,
        srcKeypair.publicKey,
        amount
    );

    console.log("Minted", amount, "to", ata.toBase58());

})();

//transfer function
(async () => {

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection, 
        srcKeypair,
        mintPk,
        dstKeypair.publicKey,
    );

    const toAta = tokenAccount.address;
    console.log("Associated Token Account: ", toAta.toBase58());

    const amountToAta = tokenAccount.amount;
    console.log("Amount in ATA: ", amountToAta.toString());

    const amount = 10e5;

    await transfer(
        connection,
        srcKeypair,
        fromAta,
        toAta,
        srcKeypair,
        amount
    );

    console.log("Transferred", amount, "from", fromAta.toBase58(), "to", toAta.toBase58());
})()
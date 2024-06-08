"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const srcKeypair = web3_js_1.Keypair.generate();
console.log(`The source wallet: ${srcKeypair.publicKey.toBase58()} was generated`);
const dstKeypair = web3_js_1.Keypair.generate();
console.log(`The destionation wallet: ${srcKeypair.publicKey.toBase58()} was generated`);
const connection = new web3_js_1.Connection("https://api.devnet.solana.com", "finalized");
const fromAta = srcKeypair.publicKey;
//airdrop req
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const airdropSignature = yield connection.requestAirdrop(srcKeypair.publicKey, 1 * web3_js_1.LAMPORTS_PER_SOL);
        console.log(`Success! Check out your TX here: https://explorer.solana.com/tx/${airdropSignature}?cluster=devnet`);
    }
    catch (error) {
        console.error(error);
    }
}))();
//mint creation
let mintPk = new web3_js_1.PublicKey((() => __awaiter(void 0, void 0, void 0, function* () {
    const mint = yield (0, spl_token_1.createMint)(connection, srcKeypair, srcKeypair.publicKey, null, 6);
    return mint.toBase58;
}))());
//minting
(() => __awaiter(void 0, void 0, void 0, function* () {
    const tokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, srcKeypair, mintPk, srcKeypair.publicKey);
    const ata = tokenAccount.address;
    console.log("Associated Token Account: ", ata.toBase58());
    const amount = 10e6;
    yield (0, spl_token_1.mintTo)(connection, srcKeypair, mintPk, ata, srcKeypair.publicKey, amount);
    console.log("Minted", amount, "to", ata.toBase58());
}))();
//transfer function
(() => __awaiter(void 0, void 0, void 0, function* () {
    const tokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, srcKeypair, mintPk, dstKeypair.publicKey);
    const toAta = tokenAccount.address;
    console.log("Associated Token Account: ", toAta.toBase58());
    const amountToAta = tokenAccount.amount;
    console.log("Amount in ATA: ", amountToAta.toString());
    const amount = 10e5;
    yield (0, spl_token_1.transfer)(connection, srcKeypair, fromAta, toAta, srcKeypair, amount);
    console.log("Transferred", amount, "from", fromAta.toBase58(), "to", toAta.toBase58());
}))();

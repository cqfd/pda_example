const web3 = require("@solana/web3.js");
const { connect } = require("http2");

const connection = new web3.Connection("http://localhost:8899");
const programId = new web3.PublicKey("DeXZJAcffW8tV1Ubf5VDWAe5uwNbfvQVn5rY2xgMjhYY");

const me = web3.Keypair.fromSecretKey(
    Buffer.from(
        JSON.parse(require("fs").readFileSync("/Users/alan/.config/solana/id.json", { encoding: "utf-8", }) )
    )
);


const initializeData = Buffer.from([0]);
const incrementData = (byHowMuch, atIdx) => Buffer.from([byHowMuch, atIdx]);

async function main() {
    const [theAccount, bump] = await web3.PublicKey.findProgramAddress(
        [Buffer.from("david")],
        programId
    );
    // const theAccount = web3.Keypair.generate();
    // seeds => address
    console.log("theAccountToInitialize", theAccount.toBase58());

    const tx = new web3.Transaction();

    tx.add(new web3.TransactionInstruction({
        keys: [
            { pubkey: me.publicKey, isSigner: true, isWritable: true },
            { pubkey: theAccount, isSigner: false, isWritable: true },
            { pubkey: web3.SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        programId: programId,
        data: initializeData
    }));

    tx.add(new web3.TransactionInstruction({
        keys: [
            { pubkey: theAccount, isSigner: false, isWritable: true },
        ],
        programId: programId,
        data: incrementData(123, 3)
    }));

    tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

    // tx.sign(me);

    const sig = await connection.sendTransaction(tx, [me]);
    console.log(sig);

    console.log("Gonna wait for confirmation...");
    await connection.confirmTransaction(sig);
    console.log("Got confirmation!");

    console.log("Going to check on ", theAccount);
    let theAccountInfo = await connection.getAccountInfo(theAccount, "processed");
    console.log("theAccountInfo.data =", theAccountInfo.data);
}

const sleep = ms => new Promise(awaken => setTimeout(awaken, ms));

main();
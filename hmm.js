const web3 = require("@solana/web3.js");
const connection = new web3.Connection("http://localhost:8899");

const theAccount = new web3.PublicKey("Y61EZmtA8iiwXdCpqSUexVP6G8S8TvuGAoc6kWvrpxM");

async function main() {
    console.log(await connection.getAccountInfo(theAccount));
}

main()

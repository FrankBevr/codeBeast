import { CodePromise } from "@polkadot/api-contract";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { readFileSync } from "fs";

async function codia() {
  //set up Connection
  const wsProvider = new WsProvider();
  const api = await ApiPromise.create({ provider: wsProvider });
  const keyring = new Keyring({ type: "sr25519" });

  //load metadata(alias abi)
  const metadata = readFileSync("./conny.json", "utf-8");
  //load wasm blob(alias wasm binary)
  const wasm = readFileSync("./conny.wasm");

  //instantiate new Code
  const code = new CodePromise(api, metadata, wasm);
  //define GasLimit (no precalution)
  const gasLimit = 100000n * 1000000n;
  //initliase storageDepositLimit(only on --dev mode)
  const storageDepositLimit = null;

  //upload contract
  const tx = code.tx.new({ gasLimit, storageDepositLimit }, false);

  //create Account for Alice (same as  --suri //Alice)
  const alicePair = keyring.addFromUri("//Alice", { name: "Alice" });
  //Initialise variable for address
  let address;

  //Use subscribe to deploy code to address
  const unsub = await tx.signAndSend(alicePair, ({ contract, status }) => {
    if (status.isInBlock || status.isFinalized) {
      address = contract.address.toString();
      //Log Address
      console.log(address);
      unsub();
    }
  });
}
codia();

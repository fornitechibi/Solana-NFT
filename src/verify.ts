import {
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";

// creating connection to devnet
const connection = new Connection(clusterApiUrl("devnet"));

// getting user keypair
const user = await getKeypairFromFile();

// airdropping sol to user
await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.5 * LAMPORTS_PER_SOL
);

console.log("Loaded User: ", user.publicKey.toBase58());

// creating umi instance
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

// setting up umi instance for user
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionAddress = publicKey(
  "4eiqVXbrf9AJ1Ewnv1ACDvybUrV3cQgTBX1PTkTk82hV"
);

const nftAddress = publicKey("FTXUN2eHh1bnWq72AEFfjb9vnMX1jTumzjyUwMLmTdHv");

const transaction = await verifyCollectionV1(umi, {
  metadata: findMetadataPda(umi, {
    mint: nftAddress,
  }),
  collectionMint: collectionAddress,
  authority: umi.identity,
});

await transaction.sendAndConfirm(umi);

console.log(
  "Collection verified ✅!! Address is ",
  getExplorerLink("address", nftAddress, "devnet")
);

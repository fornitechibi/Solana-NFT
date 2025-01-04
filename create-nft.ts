import {
  createNft,
  fetchDigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";
import {
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";

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

console.log("Creating NFT...");

const mint = generateSigner(umi);

const transaction = await createNft(umi, {
  mint,
  name: "Purpledragon NFT",
  symbol: "PUR",
  uri: "https://raw.githubusercontent.com/fornitechibi/Solana-NFT/main/assets/metadata.json",
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionAddress,
    verified: false,
  },
});

await transaction.sendAndConfirm(umi);

const createdNFT = await fetchDigitalAsset(umi, mint.publicKey);

console.log(
  "NFT created to the collection 🖼️!, Address is ",
  getExplorerLink("address", createdNFT.mint.publicKey, "devnet")
);

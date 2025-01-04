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
  Umi,
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

// creating collection saying only user can mint as signer
const collectionmint = generateSigner(umi);

// creating an NFT collection
const transaction = await createNft(umi, {
  mint: collectionmint,
  name: "Bludragon NFT",
  symbol: "BLU",
  uri: "https://raw.githubusercontent.com/fornitechibi/Solana-NFT/main/assets/metadata.json",
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
});
await transaction.sendAndConfirm(umi);

const createCollectionNft = await fetchDigitalAsset(
  umi,
  collectionmint.publicKey
);

console.log(
  `Created Collection Nft 📦! Address is ${getExplorerLink(
    "address",
    createCollectionNft.mint.publicKey,
    "devnet"
  )}`
);

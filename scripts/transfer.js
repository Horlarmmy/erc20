const hre = require("hardhat");
const { encryptDataField } = require("@swisstronik/utils");
const ethers = hre.ethers; // Import ethers from Hardhat

const sendShieldedTransaction = async (signer, destination, data, value) => {
  const rpclink = hre.network.config.url;
  const [encryptedData] = await encryptDataField(rpclink, data);
  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  });
};

async function main() {
  const contractAddress = "0x45F07BC14b889a1d4F57E7823eba712AAa6F3e98"; // Replace with your token contract address
  const recipient = "0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1"; // Recipient address
  const [signer] = await hre.ethers.getSigners();

  // Load the contract
  const contractFactory = await hre.ethers.getContractFactory("MyToken");
  const contract = contractFactory.attach(contractAddress);
  
  // Encode transfer function data
  const functionName = "transfer";
  const amountToTransfer = 1000000000000000000n // Use ethers.utils.parseUnits
  const transferData = contract.interface.encodeFunctionData(functionName, [recipient, amountToTransfer]);

  // Send the shielded transfer transaction
  const transferTx = await sendShieldedTransaction(signer, contractAddress, transferData, 0);
  await transferTx.wait();

  console.log(`Transferred 1 token to: ${recipient}`);
  console.log("Transaction Receipt: ", transferTx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

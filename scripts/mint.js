const hre = require("hardhat");
const { encryptDataField, decryptNodeResponse } = require("@swisstronik/utils");

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
  const [signer] = await hre.ethers.getSigners();

  // Load the contract
  const contractFactory = await hre.ethers.getContractFactory("MyToken");
  const contract = contractFactory.attach(contractAddress);

  // Encode mint function data
  const functionName = "mint";
  const amountToMint = hre.ethers.utils.parseUnits("100", await contract.decimals());
  const mintData = contract.interface.encodeFunctionData(functionName, [signer.address, amountToMint]);

  // Send the shielded mint transaction
  const mintTx = await sendShieldedTransaction(signer, contractAddress, mintData, 0);
  await mintTx.wait();

  console.log(`Minted 100 tokens to: ${signer.address}`);
  console.log("Transaction Receipt: ", mintTx);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

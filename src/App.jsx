import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const [balance, setBalance] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [chainname, setChainName] = useState("");

  useEffect(() => {
    onClickConnect();

    // Force page refreshes on network changes
    {
      // The "any" network will allow spontaneous network changes
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      provider.on("network", (newNetwork, oldNetwork) => {
        // When a Provider makes its initial connection, it emits a "network"
        // event with a null oldNetwork along with the newNetwork. So, if the
        // oldNetwork exists, it represents a changing network
        if (oldNetwork) {
          window.location.reload();
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!currentAccount || !ethers.utils.isAddress(currentAccount)) return;
    //client side code
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    provider.getBalance(currentAccount).then((result) => {
      setBalance(ethers.utils.formatEther(result));
    });
    provider.getNetwork().then((result) => {
      setChainId(result.chainId);
      setChainName(result.name);
    });
  }, [currentAccount]);

  const onClickConnect = () => {
    //client side code
    if (!window.ethereum) {
      alert("Please install metamask!!");
      return;
    }

    //we can do it using ethers.js
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // MetaMask requires requesting permission to connect users accounts
    provider
      .send("eth_requestAccounts", [])
      .then((accounts) => {
        if (accounts.length > 0) setCurrentAccount(accounts[0]);
      })
      .catch((e) => console.log(e));
  };

  const onClickDisconnect = () => {
    setBalance("");
    setCurrentAccount("");
  };

  const switchNetwork = async () => {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: '0x5',
          rpcUrls: ["https://goerli.infura.io/v3/137155fe1d3e4350b7202fec359e093b"],
          chainName: "Goerli test network",
          nativeCurrency: {
            name: "Goerli ETH",
            symbol: "GorETH",
            decimals: 18,
          },
          blockExplorerUrls: ["https://goerli.etherscan.io"],
        },
      ],
    });
  };

  return (
    <>
      <div className="relative flex items-center justify-center w-screen h-screen bg-gradient-to-r from-purple-500 to-pink-500">
        {currentAccount ? (
          <div className="absolute flex space-x-2 right-5 top-5">
            <button
              onClick={switchNetwork}
              type="button"
              className={
                chainname === "goerli"
                  ? "bg-blue-500 text-white px-4 py-2 rounded shadow-md text-xl hover:bg-blue-600"
                  : "bg-yellow-500 text-white px-4 py-2 rounded shadow-md text-xl hover:bg-yellow-600"
              }
            >
              {chainname === "goerli" ? "Goerli" : "Switch Network"}
            </button>
            <button
              type="button"
              className="px-4 py-2 text-xl text-white bg-gray-500 rounded shadow-md hover:bg-gray-600"
            >
              {currentAccount.substring(0, 4) +
                "..." +
                currentAccount.substring(currentAccount.length - 4)}
            </button>
            <button
              type="button"
              className="px-4 py-2 text-xl text-white bg-purple-500 rounded shadow-md hover:bg-purple-600"
            >
              {balance.substring(0, 4) + " ETH"}
            </button>
            <button
              onClick={onClickDisconnect}
              type="button"
              className="px-4 py-2 text-xl text-white bg-red-500 rounded shadow-md hover:bg-red-600"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={onClickConnect}
            type="button"
            className="absolute px-4 py-2 text-xl text-white bg-red-500 rounded shadow-md hover:bg-red-600 right-5 top-5"
          >
            Connect to Metamask
          </button>
        )}
        <div className="flex flex-col items-center w-full space-y-8 h-1/2">
          <h1 className="text-6xl font-bold">Staking</h1>
          <div className="flex flex-col items-center justify-between w-1/2 py-10 space-y-4 bg-white h-60 rounded-2xl bg-opacity-30 backdrop-blur-md">
            <div className="flex flex-col items-center space-y-2">
              <h5 className="text-xl font-semibold">Miles Stone: 0</h5>
              <h5 className="text-xl font-semibold">Current Progress: 0</h5>
            </div>
            <div className="flex flex-col w-full px-10 space-y-4">
              <div className="w-full h-5 bg-gray-700 rounded-full">
                <div className="w-1/2 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
              </div>
              <button
                type="button"
                className="px-4 py-2 text-xl text-white bg-green-500 rounded shadow-md hover:bg-green-600"
              >
                Stake
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

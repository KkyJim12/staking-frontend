import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import { abi } from "./assets/abi/Stake.json";

function App() {
  const [balance, setBalance] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [chainId, setChainId] = useState("");
  const [chainname, setChainName] = useState("");
  const [amount, setAmount] = useState("");
  const [middlePool, setMiddlePool] = useState(0);
  const [myDeposit, setMyDeposit] = useState(0);
  const [provider, setProvider] = useState("");
  const [wsProvider, setWsProvider] = useState("");

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const socketProvider = import.meta.env.VITE_WS_URL;

  useEffect(() => {
    onClickConnect();

    // Force page refreshes on network changes
    {
      // The "any" network will allow spontaneous network changes
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );

      const wsProvider = new ethers.providers.WebSocketProvider(socketProvider);

      setProvider(provider);
      setWsProvider(wsProvider);

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

  useEffect(() => {
    if (provider && currentAccount && chainId === 5) {
      getData();
    }
  }, [provider, currentAccount, chainId]);

  useEffect(() => {
    if (provider && wsProvider && currentAccount && chainId === 5) {
      const stakingContract = new ethers.Contract(
        contractAddress,
        abi,
        wsProvider
      );

      stakingContract.on("Deposit", (depositAddress, amount) => {
        const newValue =
          parseFloat(middlePool) +
          parseFloat(ethers.utils.formatEther(amount.toString()));
        setMiddlePool(newValue);

        if (currentAccount === depositAddress) {
          const newMyDepositValue =
            parseFloat(myDeposit) +
            parseFloat(ethers.utils.formatEther(amount.toString()));
          setMyDeposit(newMyDepositValue);
        }
      });

      stakingContract.on("Withdraw", (withdrawAddress, amount) => {
        const newValue =
          parseFloat(middlePool) -
          parseFloat(ethers.utils.formatEther(amount.toString()));
        setMiddlePool(newValue);

        if (currentAccount === withdrawAddress) {
          const newMyDepositValue =
            parseFloat(myDeposit) +
            parseFloat(ethers.utils.formatEther(amount.toString()));
          setMyDeposit(newMyDepositValue);
        }
      });
    }
  }, [provider, wsProvider, chainId, currentAccount]);

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

  const deposit = () => {
    if (chainId !== 5 || !amount) {
      return;
    }
    const stakingContract = new ethers.Contract(
      contractAddress,
      abi,
      provider.getSigner()
    );

    stakingContract.deposit({ value: ethers.utils.parseEther(amount) });
  };

  const getData = async () => {
    if (chainId !== 5) {
      return;
    }

    const stakingContract = new ethers.Contract(contractAddress, abi, provider);

    const pool = await stakingContract.middlePool();
    const myDepositAmount = await stakingContract._stakingBalance(
      currentAccount
    );

    setMiddlePool(ethers.utils.formatEther(pool.toString()));
    setMyDeposit(ethers.utils.formatEther(myDepositAmount.toString()));
  };

  const withdraw = () => {
    if (chainId !== 5 || !amount) {
      return;
    }

    const stakingContract = new ethers.Contract(
      contractAddress,
      abi,
      provider.getSigner()
    );

    stakingContract.withdraw(ethers.utils.parseEther(amount));
  };

  const switchNetwork = async () => {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x5",
          rpcUrls: [
            "https://goerli.infura.io/v3/137155fe1d3e4350b7202fec359e093b",
          ],
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
        <div className="flex flex-col items-center w-1/2 space-y-8 h-1/2">
          <h1 className="text-6xl font-bold">Staking </h1>
          <div className="flex flex-col items-center justify-between w-1/2 py-10 space-y-4 bg-white h-80 rounded-2xl bg-opacity-30 backdrop-blur-md">
            <div className="flex flex-col items-center space-y-2">
              {chainId !== 5 ? (
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <h5 className="text-xl font-semibold">Middle Pool:</h5>{" "}
                    <div className="w-10 rounded bg-gradient-to-r from-purple-300 to-pink-300 animate-pulse"></div>
                  </div>
                  <div className="flex space-x-2">
                    <h5 className="text-xl font-semibold">Your Staking:</h5>{" "}
                    <div className="w-10 rounded bg-gradient-to-r from-purple-300 to-pink-300 animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <h5 className="text-xl font-semibold">
                    Middle Pool: {middlePool}
                  </h5>
                  <h5 className="text-xl font-semibold">
                    Your Deposit: {myDeposit}
                  </h5>
                </div>
              )}
            </div>
            <div className="flex flex-col w-full px-10 space-y-4">
              <input
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 mx-auto rounded focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="Amount"
                type="number"
                value={amount}
              />
              <button
                onClick={withdraw}
                type="button"
                className={
                  !provider || chainId !== 5
                    ? "px-4 py-2 text-xl text-white bg-yellow-500 rounded shadow-md hover:bg-yellow-600 cursor-not-allowed"
                    : "px-4 py-2 text-xl text-white bg-yellow-500 rounded shadow-md hover:bg-yellow-600"
                }
              >
                Withdraw
              </button>
              <button
                onClick={deposit}
                type="button"
                className={
                  !provider || chainId !== 5
                    ? "px-4 py-2 text-xl text-white bg-green-500 rounded shadow-md hover:bg-green-600 cursor-not-allowed"
                    : "px-4 py-2 text-xl text-white bg-green-500 rounded shadow-md hover:bg-green-600"
                }
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

import { useState } from "react";
import "./App.css";

function App() {
  return (
    <>
      <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-r from-purple-500 to-pink-500 relative">
        <button
          type="button"
          className="bg-red-500 text-white px-4 py-2 rounded shadow-md text-xl hover:bg-red-600 absolute right-5 top-5"
        >
          Connect to Metamask
        </button>
        <div className="flex flex-col space-y-8 w-full h-1/2 items-center">
          <h1 className="text-6xl font-bold">Staking</h1>
          <div className="h-60 w-1/2 rounded-2xl bg-white bg-opacity-30 backdrop-blur-md flex flex-col space-y-4 items-center justify-between py-10">
            <div className="flex flex-col space-y-2 items-center">
              <h5 className="text-xl font-semibold">Miles Stone: 0</h5>
              <h5 className="text-xl font-semibold">Current Progress: 0</h5>
            </div>
            <div className="flex flex-col space-y-4 w-full px-10">
              <div className="rounded-full h-5 w-full bg-gray-700">
                <div className="rounded-full h-5 w-1/2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              </div>
              <button
                type="button"
                className="bg-green-500 text-white px-4 py-2 rounded shadow-md text-xl hover:bg-green-600"
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

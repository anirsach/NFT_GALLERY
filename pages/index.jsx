import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import { NFTCard } from "./components/nftCard"
import axios from 'axios';

const api_key = process.env.NEXT_PUBLIC_API_KEY

const Home = () => {
  const [wallet, setWalletAddress] = useState("");
  const [collection, setCollectionAddress] = useState("");
  const [NFTs, setNFTs] = useState([]);
  const [fetchForCollection, setFetchForCollection] = useState(false);
  const [Index, setIndex] = useState([]);

  const fetchNFTs = async () => {
    let nfts;
    setIndex(["END"]);
    const baseUrl = `https://eth-mainnet.alchemyapi.io/v2/${api_key}/getNFTs`;
    var requestOptions = {
      method: "GET"
    };
    if (!collection.length) {
      const fetchURL = `${baseUrl}?owner=${wallet}`;
      nfts = await fetch(fetchURL, requestOptions).then(data => data.json())
    } else {
      console.log("fetching nfts for collection owned by address")
      const fetchURL = `${baseUrl}?owner=${wallet}&contractAddresses%5B%5D=${collection}`;
      nfts = await fetch(fetchURL, requestOptions).then(data => data.json())
    }
    if (nfts) {
      setNFTs(nfts.ownedNfts)
    }
  }

  const fetchNFTsForCollection = async (tokenId) => {
    let nfts;
    var requestOptions = {
      method: "GET"
    };
    if (collection.length) {
      const baseUrl = `https://eth-mainnet.alchemyapi.io/v2/${api_key}/getNFTsForCollection`;
      const fetchURL = `${baseUrl}?contractAddress=${collection}&startToken=${tokenId}&withMetadata=${"true"}`;
      nfts = await fetch(fetchURL, requestOptions).then(data => data.json())
    }
    if (nfts) {
      setNFTs(nfts.nfts)
    }
  }


  const callGetNFTsForCollectionOnce = async (startToken = "") => {
    const baseURL = `https://eth-mainnet.alchemyapi.io/v2/${api_key}/getNFTsForCollection`;
    const fetchURL = `${baseURL}/?contractAddress=${collection}&startToken=${startToken}`;
    const response = await axios.get(fetchURL);
    return response.data;
  }

  const getIndex = async () => {
    let startToken = "";
    setIndex(["Loading all pages...."]);
    let hasNextPage = true;
    let totalNftsFound = [""];
    while (hasNextPage) {
      const { nextToken } = await callGetNFTsForCollectionOnce(startToken);
      if (!nextToken) {
        // When nextToken is not present, then there are no more NFTs to fetch.
        hasNextPage = false;
      }
      startToken = nextToken;
      if (nextToken) {
        totalNftsFound.push(nextToken);
      }
    }
    setIndex(totalNftsFound);
  }


  return (
    <div className="flex flex-col items-center justify-center py-8 gap-y-3">
      <div className="flex flex-col w-full justify-center items-center gap-y-2">
        <input disabled={fetchForCollection} className="w-2/5 bg-slate-100 py-2 px-2 rounded-lg text-gray-800 focus:outline-blue-300 disabled:bg-slate-50 disabled:text-gray-50" onChange={(e) => { setWalletAddress(e.target.value) }} value={wallet} type={"text"} placeholder="Add your wallet address"></input>
        <input className="w-2/5 bg-slate-100 py-2 px-2 rounded-lg text-gray-800 focus:outline-blue-300 disabled:bg-slate-50 disabled:text-gray-50" onChange={(e) => { setCollectionAddress(e.target.value) }} value={collection} type={"text"} placeholder="Add the collection address"></input>
        <label className="text-gray-600 "><input onChange={(e) => { setFetchForCollection(e.target.checked) }} type={"checkbox"} className="mr-2"></input>Fetch for collection</label>
        <button className={"disabled:bg-slate-500 text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5"} onClick={
          () => {
            if (fetchForCollection) {
              fetchNFTsForCollection("")
              getIndex()
            } else fetchNFTs()
          }
        }>Let's go! </button>
      </div>


      <div className='flex flex-wrap gap-y-12 mt-4 w-5/6 gap-x-2 justify-center'>
        {
          NFTs.length && NFTs.map(nft => {
            return (
              <NFTCard nft={nft}></NFTCard>
            )
          })
        }
      </div>


      <div className='bg-slate-200 flex-row space-x-4 lg:space-x-12 bg-blue'>
        {
          Index.length && Index.map((nextToken, i) => {
            if (nextToken != "Loading all pages...." && nextToken != "END") {
              return (
                <button onClick={() => { fetchNFTsForCollection(nextToken) }} className="ml-12 text-cyan-700 hover:bg-cyan-300">{i + 1}</button>
              )
            } else {
              return (
                <div className="text-cyan-700">{nextToken}</div>
              )
            }
          })
        }
      </div>

    </div>
  )
}

export default Home

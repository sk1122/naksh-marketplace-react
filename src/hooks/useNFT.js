import { useAppContext } from "../context/wallet";
import nakshAbi from "../interface/nakshAbi.json";
import nftAbi from "../interface/nftAbi.json";
import nft1155Abi from "../interface/nft1155Abi.json"
import nakshAbi1155 from "../interface/nakshAbi1155.json";
import { ethers, BigNumber } from "ethers";
import toast from "react-hot-toast";
import {
  A_SOLD_NFT,
  COLLECTION_SOLD_NFTS,
  GET_NFT_ON_SALE,
  GET_SINGLE_NFT,
  MY_NFTS,
  NFT_DATA_QUERY,
  MY_MINTED_NFTS,
  NFT_DATA_OWNER_QUERY
} from "./useGraphApi";

export const useNFTs = () => {
  const {
    evmProvider,
    evmWalletData,
    nakshContract,
    NAKSH_ADDRESS,
    NAKSH_ADDRESS_1155,
  } = useAppContext();

  const getNFTOwners = async (nftAddress, tokenId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(
          "https://api.thegraph.com/subgraphs/name/sk1122/naksh",
          {
            method: "POST",
            body: JSON.stringify({
              query: NFT_DATA_OWNER_QUERY,
              variables: {
                nftAddress,
                tokenId
              },
            }),
          }
        );
        const nft = (await res.json()).data.nftdatas;
        // console.log(nft)

        resolve(nft ? nft : []);
      } catch (e) {
        // console.log(e, "error")
        reject(e);
      }
    });
  }

  const getManyNFTs = async (ids) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(
          "https://api.thegraph.com/subgraphs/name/sk1122/naksh",
          {
            method: "POST",
            body: JSON.stringify({
              query: NFT_DATA_QUERY,
              variables: {
                id: ids,
              },
            }),
          }
        );
        const nft = (await res.json()).data.nftdatas;
        // console.log(nft)

        resolve(nft ? nft : []);
      } catch (e) {
        // console.log(e, "error")
        reject(e);
      }
    });
  };

  const getNFT = async (address, tokenId) => {
    return new Promise(async (resolve, reject) => {
      // console.log(address, tokenId, "tokenId")
      try {
        const res = await fetch(
          "https://api.thegraph.com/subgraphs/name/sk1122/naksh",
          {
            method: "POST",
            body: JSON.stringify({
              query: GET_SINGLE_NFT,
              variables: {
                tokenId: tokenId,
                nftAddress: address,
              },
            }),
          }
        );
        const nft = (await res.json()).data.nftdatas[0];
        // console.log(nft)

        resolve(nft ? nft : []);
      } catch (e) {
        // console.log(e, "error")
        reject(e);
      }
    });
  };

  const getNFTsOnSale = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(
          "https://api.thegraph.com/subgraphs/name/sk1122/naksh",
          {
            method: "POST",
            body: JSON.stringify({
              query: GET_NFT_ON_SALE,
            }),
          }
        );
        const nft = (await res.json()).data.saleDatas;
        // console.log(nft)

        resolve(nft);
      } catch (e) {
        // console.log(e, "error")
        reject(e);
      }
    });
  };

  const buyNFTonSale = async (nft, nftAddress, tokenId, value) => {
    return new Promise(async (resolve, reject) => {
      const toastId = toast.loading(`Buying ${nft.title}`);
      const contract = new ethers.Contract(
        NAKSH_ADDRESS,
        nakshAbi,
        evmWalletData.signer
      );

      try {
        const tx = await contract.buyTokenOnSale(tokenId, nftAddress, {
          value: BigNumber.from(value.toString()),
          gasPrice: evmProvider.getGasPrice(),
          gasLimit: 1000000,
        });

        await tx.wait();

        toast.success(`Successfully bought ${nft.title}`, {
          id: toastId,
        });
        resolve(tx);
      } catch (e) {
        toast.error(`Can't buy ${nft.title}`, {
          id: toastId,
        });
        reject(e);
      }
    });
  };

  const buyNFTonSale1155 = async (nft, nftAddress, tokenId, value, owner, quantity) => {
    return new Promise(async (resolve, reject) => {
      const toastId = toast.loading(`Buying ${nft.title}`);
      const contract = new ethers.Contract(
        NAKSH_ADDRESS_1155,
        nakshAbi1155,
        evmWalletData.signer
      );

      try {
        console.log(tokenId, nftAddress, owner, quantity, "nftAddresss")
        const tx = await contract.buyTokenOnSale(tokenId, nftAddress, owner, quantity, {
          value: BigNumber.from((Number(value) * Number(quantity)).toString()),
          gasPrice: evmProvider.getGasPrice(),
          gasLimit: 1000000,
        });

        await tx.wait();

        toast.success(`Successfully bought ${nft.title}`, {
          id: toastId,
        });
        resolve(tx);
      } catch (e) {
        toast.error(`Can't buy ${nft.title}`, {
          id: toastId,
        });
        reject(e);
      }
    });
  };

  const buyNFT = async (nft, value, price) => {
    return new Promise(async (resolve, reject) => {
      const toastId = toast.loading(`Bidding on ${nft.title}`);
      // console.log(value.toString(), price.toString(), "price")
      if (
        Number(ethers.utils.formatEther(value)) <
        Number(ethers.utils.formatEther(price))
      ) {
        toast.error(`Bid lower than initial price of ${price} MATIC`, {
          id: toastId,
        });
        return;
      }

      try {
        if (nakshContract) {
          const contract = new ethers.Contract(
            NAKSH_ADDRESS,
            nakshAbi,
            evmWalletData.signer
          );

          // if (!nft.isOnSale) throw "NFT is not on sale";
          // console.log(nft.address, nft.tokenId, "Dsa")
          const data = await contract.bid(nft.address, nft.tokenId, {
            value: BigNumber.from(value),
            gasPrice: evmProvider.getGasPrice(),
            gasLimit: 1000000,
          });

          await data.wait();

          toast.success(`Successfully Bidded on ${nft.title}`, {
            id: toastId,
          });

          resolve("Your Bid was successfully!");
        }
      } catch (e) {
        toast.error(`Can't bid on ${nft.title}`, {
          id: toastId,
        });
        reject(e);
      }
    });
  };

  const listNFT = async (nft, typeOfListing, config) => {
    const toastId = toast.loading("Listing your NFT");
    try {
      const contract = new ethers.Contract(
        NAKSH_ADDRESS,
        nakshAbi,
        evmWalletData.signer
      );

      if (nft !== undefined && config !== undefined) {
        await approveNFT(nft.nftAddress, nft.tokenId, NAKSH_ADDRESS);
        if (typeOfListing === 0) {
          const tx = await contract.setSale(
            nft.nftAddress,
            nft.tokenId,
            BigNumber.from(config.price),
            {
              gasPrice: evmProvider.getGasPrice(),
              gasLimit: 10000000,
            }
          );
          await tx.wait();
          toast.success("Successfully listed your NFT", {
            id: toastId,
          });
        } else {
          const tx1 = await contract.startAuction(
            nft.nftAddress,
            nft.tokenId,
            config.price,
            BigNumber.from(config.auctionTime),
            {
              gasPrice: evmProvider.getGasPrice(),
              gasLimit: 10000000,
            }
          );
          await tx1.wait();

          toast.success("Successfully listed your NFT", {
            id: toastId,
          });
        }
      } else {
        toast.error("Problem with selected nft", {
          id: toastId,
        });
      }
    } catch (e) {
      // console.log(e);
      toast.error("Problem with selected nft", {
        id: toastId,
      });
    }
  };

  const listNFT1155 = async (nft, typeOfListing, quantity, config) => {
    const toastId = toast.loading("Listing your NFT");
    try {
      const contract = new ethers.Contract(
        NAKSH_ADDRESS_1155,
        nakshAbi1155,
        evmWalletData.signer
      );

      if (nft !== undefined && config !== undefined) {
        await approveNFT(nft.nftAddress, nft.tokenId, NAKSH_ADDRESS_1155, false);
        if (typeOfListing === 0) {
          console.log(nft, quantity, config.price, "priceee")
          const tx = await contract.setSale(
            nft.nftAddress,
            nft.tokenId,
            quantity,
            BigNumber.from(config.price),
            {
              gasPrice: evmProvider.getGasPrice(),
              gasLimit: 10000000,
            }
          );
          await tx.wait();
          toast.success("Successfully listed your NFT", {
            id: toastId,
          });
        } else {
          toast.error("Wrong config, auction not supported on ERC1155", {
            id: toastId
          })
        }
      } else {
        toast.error("Problem with selected nft", {
          id: toastId,
        });
      }
    } catch (e) {
      // console.log(e);
      toast.error("Problem with selected nft", {
        id: toastId,
      });
    }
  }

  const cancelSale = async (address, tokenId) => {
    return new Promise(async (resolve, reject) => {
      const toastId = toast.loading("Cancelling listing...");
      try {
        const contract = new ethers.Contract(
          NAKSH_ADDRESS,
          nakshAbi,
          evmWalletData.signer
        );

        const tx = await contract.cancelSale(address, tokenId, {
          gasPrice: evmProvider.getGasPrice(),
          gasLimit: 10000000,
        });

        await tx.wait();
        toast.success("Canceled Listing", {
          id: toastId,
        });

        resolve(tx);
      } catch (e) {
        toast.error("Can't cancel listing", {
          id: toastId,
        });
      }
    });
  };

  const cancelSale1155 = async (address, tokenId, quantity) => {
    return new Promise(async (resolve, reject) => {
      const toastId = toast.loading("Cancelling listing...");
      try {
        const contract = new ethers.Contract(
          NAKSH_ADDRESS_1155,
          nakshAbi1155,
          evmWalletData.signer
        );

        const tx = await contract.cancelSale(address, tokenId, quantity, {
          gasPrice: evmProvider.getGasPrice(),
          gasLimit: 10000000,
        })

        await tx.wait()
        toast.success("Canceled Listing", {
          id: toastId
        })

        resolve(tx)
      } catch (e) {
        console.log(e, "error")
        toast.error("Can't cancel listing", {
          id: toastId
        })
      }
    })
  }

  const getBids = async (nftAddress, tokenId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const history = await nakshContract.getBidHistory(nftAddress, tokenId);

        resolve(history);
      } catch (e) {
        // console.log(e);
        reject(e);
      }
    });
  };

  const endAuction = async (nftAddress, tokenId) => {
    return new Promise(async (resolve, reject) => {
      const toastId = toast.loading("Ending Auction...");
      try {
        const contract = new ethers.Contract(
          NAKSH_ADDRESS,
          nakshAbi,
          evmWalletData.signer
        );
        const auction = await contract.endAuction(nftAddress, tokenId, {
          gasPrice: evmProvider.getGasPrice(),
          gasLimit: 10000000,
        });
        await auction.wait()
        toast.success("Successfully ended auction", {
          id: toastId,
        });
        resolve(auction);
      } catch (e) {
        toast.error("Can't end auction", {
          id: toastId,
        });
        // console.log(e);
        reject(e);
      }
    });
  };

  const uploadMedia = async (image) => {
    const API_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEVlNEIwZEViOUEyQThkNTc3Rjk0QjYwZjc1MDI3RjVBQ2M3NDgxQjkiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MTU5OTIxMzMyMiwibmFtZSI6Ik5ha3NoIn0.BKNzaBcu5TxfYXzV6R9Rd97-uF3ejKRvYT2-zBRrzO4";
    // console.log(API_KEY)

    const res = await fetch("https://api.nft.storage/upload", {
      body: image,
      headers: {
        "Content-Type": "image/*",
        Authorization: `Bearer ${API_KEY}`,
      },
      method: "POST",
    });

    const data = await res.json();
    console.log(data, "data")

    if (!data || !data.value || !data.value.cid) {
      return "";
    }

    return data.value.cid;
  };

  const mintNft = async (
    nftAddress,
    tokenUri,
    title,
    description,
    artistName,
    artistImg,
    videoUri,
    isVideo = false
  ) => {
    return new Promise(async (resolve, reject) => {
      try {
        const contract = new ethers.Contract(
          nftAddress,
          nftAbi,
          evmWalletData.signer
        );

        const nft = await contract.mintByArtistOrAdmin(
          evmWalletData.address,
          tokenUri,
          videoUri,
          title,
          description,
          artistName,
          artistImg,
          isVideo,
          {
            gasPrice: evmProvider.getGasPrice(),
            gasLimit: 10000000,
          }
        );

        await nft.wait();

        // console.log(nft)

        const receipt = await evmProvider.getTransactionReceipt(nft.hash);

        // console.log(receipt, "receipt")

        for (let i = 0; i < receipt.logs.length; i++) {
          const log = receipt.logs[i];
          if (
            log.topics.includes(
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
            )
          ) {
            // console.log(log.topics[3], log.topics, "token id")
            resolve({
              hash: nft.hash,
              tokenId: log.topics[3],
            });
            return;
          }
        }

        resolve({
          hash: nft.hash,
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  const bulkMint = async (
    nftAddress,
    tokenUri,
    title,
    description,
    artistName,
    artistImg,
    times,
    videoUri,
    isVideo = false
  ) => {
    return new Promise(async (resolve, reject) => {
      try {        
        const contract = new ethers.Contract(
          nftAddress,
          nft1155Abi,
          evmWalletData.signer
        );

        const nft = await contract.mintByArtistOrAdmin(
          evmWalletData.address,
          tokenUri,
          videoUri,
          times,
          title,
          description,
          artistName,
          artistImg,
          isVideo,
          {
            gasPrice: evmProvider.getGasPrice(),
            gasLimit: 10000000,
          }
        );

        await nft.wait();

        // console.log(nft)

        const receipt = await evmProvider.getTransactionReceipt(nft.hash);

        console.log(receipt, "receipt")

        for (let i = 0; i < receipt.logs.length; i++) {
          const log = receipt.logs[i];
          if (
            log.topics.includes(
              "0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62"
            )
          ) {
            console.log(log.data, ethers.utils.stripZeros(log.data).toString(), "token id")
            resolve({
              hash: nft.hash,
              tokenId: ethers.utils.stripZeros(log.data).toString().split(",")[0],
            });
            return;
          }
        }

        resolve({
          hash: nft.hash,
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  const approveNFT = async (address, tokenId, to, erc721 = true) => {
    return new Promise(async (resolve, reject) => {
      const toastId = toast.loading(
        "Approving NFT " + tokenId + " from " + address
      );
      try {
        if(erc721) {
          const contract = new ethers.Contract(
            address,
            nftAbi,
            evmWalletData.signer
          );
  
          const approved = await contract.approve(to, Number(tokenId), {
            gasPrice: evmProvider.getGasPrice(),
            gasLimit: 10000000,
          });
  
          await approved.wait();
  
          toast.success("Successfully approved NFT", {
            id: toastId,
          });
          resolve(approved);
        } else {
          const contract = new ethers.Contract(
            address,
            nft1155Abi,
            evmWalletData.signer
          );

          const approved = await contract.setApprovalForAll(to, true, {
            gasPrice: evmProvider.getGasPrice(),
            gasLimit: 10000000,
          });

          await approved.wait();

          toast.success("Successfully approved NFT", {
            id: toastId,
          });
          resolve(approved);
        }
      } catch (e) {
        toast.error("Can't approve NFT", {
          id: toastId,
        });
        reject(e);
      }
    });
  };

  const getMintedNFTs = async (address) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(
          "https://api.thegraph.com/subgraphs/name/sk1122/naksh",
          {
            method: "POST",
            body: JSON.stringify({
              query: MY_MINTED_NFTS,
              variables: {
                address: address,
              },
            }),
          }
        );
        const nft = (await res.json()).data.nftdatas;
        // console.log(nft)

        resolve(nft);
      } catch (e) {
        // console.log(e, "error")
        reject(e);
      }
    });
  };

  const getOwnedNFTs = async (address) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(
          "https://api.thegraph.com/subgraphs/name/sk1122/naksh",
          {
            method: "POST",
            body: JSON.stringify({
              query: MY_NFTS,
              variables: {
                address: address,
              },
            }),
          }
        );
        const nft = (await res.json()).data.nftdatas;
        // console.log(nft)

        resolve(nft);
      } catch (e) {
        // console.log(e, "error")
        reject(e);
      }
    });
  };

  const getSoldNFTs = async (address) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(
          "https://api.thegraph.com/subgraphs/name/sk1122/naksh",
          {
            method: "POST",
            body: JSON.stringify({
              query: COLLECTION_SOLD_NFTS,
              variables: {
                address: address,
              },
            }),
          }
        );
        const nft = (await res.json()).data.soldNFTs;

        resolve(nft);
      } catch (e) {
        // console.log(e, "error")
        reject(e);
      }
    });
  };

  const getSoldNFT = async (address, tokenId) => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await fetch(
          "https://api.thegraph.com/subgraphs/name/sk1122/naksh",
          {
            method: "POST",
            body: JSON.stringify({
              query: A_SOLD_NFT,
              variables: {
                nftId: `${address}-${tokenId}`,
              },
            }),
          }
        );
        const nft = (await res.json()).data.nftdatas;
        // console.log(nft)

        resolve(nft);
      } catch (e) {
        // console.log(e, "error")
        reject(e);
      }
    });
  };

  return {
    getManyNFTs,
    getNFT,
    getNFTsOnSale,
    buyNFT,
    buyNFTonSale,
    listNFT,
    getBids,
    mintNft,
    uploadMedia,
    getMintedNFTs,
    endAuction,
    getSoldNFT,
    getSoldNFTs,
    getOwnedNFTs,
    bulkMint,
    listNFT1155,
    buyNFTonSale1155,
    getNFTOwners,
    cancelSale,
    cancelSale1155
  };
};

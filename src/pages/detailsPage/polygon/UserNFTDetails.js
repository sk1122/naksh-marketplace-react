import React, { Component, Fragment, useEffect, useRef, useState } from "react";
import { Col, Row, Container } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FiBookmark,
  FiExternalLink,
  FiMoreVertical,
  FiX,
} from "react-icons/fi";
import { BsFillBookmarkFill } from "react-icons/bs";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useParams, useLocation } from "react-router-dom";
import uuid from "react-uuid";
import polygon from "../../../assets/svgs/white-polygon-logo.svg"
import { ethers } from "ethers";

import NftCard from "../../../components/explore/NftCard";
import { GradientBtn } from "../../../components/uiComponents/Buttons";
import Spinner from "../../../components/uiComponents/Spinner";
import nearIcon from "../../../assets/svgs/near-icon.svg";
import party from "../../../assets/svgs/party.svg";
import profileSvg from "../../../assets/svgs/profile-icon-big.svg";
import globalStyles from "../../../globalStyles";
import classes from "../details.module.css";
import { helpers } from "../../../constants";
import { _getNftArtists } from "../../../services/axios/api";
import Modal from "../../../components/uiComponents/Modal";
import { useNFTs } from "../../../hooks";
import { useAppContext } from "../../../context/wallet";
import BuyNFTModal from "../../../components/uiComponents/buyNFTModal";
import { BigNumber } from "ethers/lib/ethers";
import SaleNFTModal from "../../../components/uiComponents/saleNFTModal";
import { useTrendingNFTs } from "../../../hooks/useTrendingNFTs";
import { useFiat } from "../../../hooks/useFiat";
import axios from "axios";
import { useSavedNFTs } from "../../../hooks/useSavedNFTs";
import useCollection from "../../../hooks/useCollection";

const disclaimer = `Trading in Digital assets entails certain risks. You acknowledge and
agree that you shall access and use the Services at your own risk.
The risk of loss in transacting Digital Asset can be substantial.
You should, therefore, carefully consider whether such transacting
is suitable for you in light of your circumstances and  nancial
resources. This risk disclosure statement cannot and does not
disclose all risks and other aspects involved in holding, trading,
or engaging in Digital assets. Digital Asset values can  uctuate
substantially and unexpectedly with little or no warning, which may
result in a substantial loss of an investment. It is your
responsibility to con rm and decide which trades to make. Trade only
with risk capital; that is, trade with money that, if lost, will not
adversely impact your lifestyle and your ability to meet your
 nancial obligations. In no event should the content of this
correspondence be construed as an express or implied promise or
guarantee. Refer to User Agreement for more disclosures`;

export default function UserPolygonNftDetails(props) {
  const { getNFT, getManyNFTs, getNFTsOnSale, buyNFT, endAuction, cancelSale1155 } = useNFTs();
  const { nakshContract, evmWalletData } = useAppContext();
  const { updateTrendingNFT } = useTrendingNFTs();

  const { setFiat, setAmount, fiat } = useFiat();
  const { saveNFT, removeNFT } = useSavedNFTs();

  const convertAmountToMatic = async (price) => {
    try {
      //   console.log(price);
      const fromURL = `https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=inr`;

      const res = await axios({
        url: fromURL,
      });

      const data = res.data;

      if (data && data["matic-network"] && data["matic-network"].inr) {
        return data["matic-network"].inr * price;
      }


      throw new Error("Can't find price at the moment");
    } catch (e) {
      alert(e.message);
    }
  };

  const params = useParams();
  const history = useHistory();
  const { getCollection } = useCollection()

  useEffect(() => updateTrendingNFT(`${params.user}-${params.address}`, params.id), []);

  const [loading, setLoading] = useState(true);
  const [nft, setNft] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [moreNfts, setMoreNfts] = useState([]);
  const [isOverviewActive, setIsOverviewActive] = useState(1);
  const [show, setShow] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [price, setPrice] = useState(0);
  const [saleData, setSaleData] = useState();
  const [artist, setArtist] = useState();
  const [savedNft, setSavedNft] = useState(false);
  const [user, setUser] = useState();
  const [collection, setCollection] = useState()
  const [video, setVideo] = useState(true)
  const ref = useRef()

  const [auctionData, setAuctionData] = useState({});
  const [tosModal, setTOSModal] = useState(false)
  const [viewMore, setViewMore] = useState(false)
  const [bids, setBids] = useState([]);

  const [purchasable, setPurchasable] = useState({
    owner: false,
    auctionEnded: false,
  });

  useEffect(() => {
    if (nft) {
      try {
        _getNftArtists({
          artist: ethers.utils.getAddress(nft.creator),
          owner: ethers.utils.getAddress(nft.owner),
        }).then(({ data: { artist, owner } }) => {
          console.log(artist.image, "dasdsafwrw");
          setArtist(artist);
          setOwnerData(owner);
        });
      } catch (e) {console.log(e, "dasdsafwrw");}
    }
  }, [nft]);

  useEffect(() => {
    if (evmWalletData) {
      _getNftArtists({
        artist: ethers.utils.getAddress(evmWalletData.address),
        owner: ethers.utils.getAddress(evmWalletData.address),
      }).then(({ data: { artist, owner } }) => {
        setUser(artist);
        const nfts = artist?.savedNft;

        if (nfts.length > 0) {
          const found = nfts.find(
            (nft) =>
              (nft.address.toLowerCase() === params.address.toLowerCase() ||
                `${params.user}-${params.address}`.toLowerCase() ===
                  nft.address.toLowerCase()) &&
              nft.token === params.id
          );

          if (found) setSavedNft(true);
        }
      });
    }
  }, [evmWalletData]);

  useEffect(() => {
    if (
      saleData &&
      saleData.auction &&
      saleData.auction.bids &&
      saleData.auction.bids.length > 0
    ) {
      const bids = saleData.auction.bids.sort(
        (bid1, bid2) => bid2.timestamp - bid1.timestamp
      );
      setBids(bids);
    }
  }, [saleData]);

  // useEffect(() => {
  // 	if (nft && nft.tokenId) {
  // 		getBids(nft.tokenId)
  // 			.then((res) => setBids(res))
  // 			.catch((e) => console.error(e));
  // 	}
  // }, [nft]);

  useEffect(() => {
    if (evmWalletData && nft && nft.owner) {
      if (saleData) {
        console.log(nft.owner, evmWalletData.address, saleData.saleType, saleData.salePrice, 'yoyoyo')
        setPurchasable({
          owner:
            nft.owner.toLowerCase() === evmWalletData.address.toLowerCase(),
          auctionEnded:
            saleData.saleType == "0"
              ? Number(saleData.salePrice) <= 0
              : saleData.auction.endTime <= new Date().getTime() / 1000,
        });
      } else {
        setPurchasable({
          owner:
            nft.owner.toLowerCase() === evmWalletData.address.toLowerCase(),
          auctionEnded: true,
        });
      }
    }
    // console.log(saleData, "salleeeeeeeeeeee");
  }, [evmWalletData, nft, saleData]);

  // useEffect(() => {
  // 	(async () => {
  // 		if (auctionContract && nft) {
  // 			console.log(nft, "nft");
  // 			const auctionDatax = await auctionContract.auctionData(
  // 				params.address,
  // 				BigNumber.from(params.id)
  // 			);

  // 			if(auctionDatax.owner !== ethers.constants.AddressZero) setAuctionData(auctionDatax);
  // 		}
  // 	})();
  // }, [nakshContract, nft]);

  useEffect(() => {
    if (nakshContract && evmWalletData && evmWalletData.signer) {
      setLoading(true);
      fetchNft();
    }
  }, [nakshContract, evmWalletData]);

  // useEffect(() => {
  // 	if (nakshContract) {
  // 		setLoading(true);
  // 		fetchNft();
  // 	}
  // }, [location.pathname]);

  // const handleOnSubmit = async () => {
  //     const response = await fetch(nft.metadata.media);
  //     // here image is url/location of image
  //     const blob = await response.blob();
  //     const file = new File([blob], 'share.jpg', {type: blob.type});
  //     console.log(file);
  //     if(navigator.share) {
  //       await navigator.share({
  //         title: this.state.nft.metadata?.title,
  //         text: "Take a look at my beautiful nft",
  //         url: window.location.href,
  //         files: [file]
  //       })
  //         .then(() => console.log('Successful share'))
  //         .catch((error) => console.log('Error in sharing', error));
  //     }else {
  //       console.log(`system does not support sharing files.`);
  //     }
  // }

  const fetchNft = async () => {
    try {
      setLoading(true);
      const nfts = await getNFTsOnSale();

      const nftss = await getManyNFTs([
        `${params.user.toLowerCase()}-${params.address.toLowerCase()}-${params.id.toLowerCase()}`,
        `${ethers.utils.getAddress(
          params.user.toLowerCase()
        )}-${ethers.utils.getAddress(
          params.address.toLowerCase()
        )}-${params.id.toLowerCase()}`,
        `${ethers.utils.getAddress(
          params.user.toLowerCase()
        )}-${params.address.toLowerCase()}-${params.id.toLowerCase()}`,
        `${params.user.toLowerCase()}-${ethers.utils.getAddress(params.address.toLowerCase())}-${params.id.toLowerCase()}`,
      ]);
      if (nftss.length <= 0) {
        throw new Error("NFT not found");
      }

      const nft = nftss[0]

      const moreNfts = nfts.filter(
        (item) =>
          item.nft.tokenId.toString() !== params.id ||
          item.nft.nftAddress.toLowerCase() !== params.address.toLowerCase()
      );

      const foundNft = nfts.find(
        (item) =>
          item.nft.owner.toLowerCase() === params.user.toLowerCase() &&
          item.nft.tokenId.toString() === params.id &&
          item.nft.nftAddress.toLowerCase() === params.address.toLowerCase()
      );
      setPrice(foundNft ? Number(foundNft.salePrice) : 0);
      
      setSaleData(foundNft);

      getCollection(nft.nftAddress)
        .then(collection => {
          if(collection) setCollection(collection)
          else setCollection({ erc721: true, name: "Marketplace" });
        })

      setNft(nft);
      setMoreNfts(moreNfts);
      setLoading(false);
    } catch (e) {
        console.log(e, "Er");
      alert("something went wrong, please refresh the page!");
      setLoading(false);
    }
  };

  const handleBuyNft = async () => {
    if (evmWalletData) {
      await buyNFT(nft);
    }
  };

  const updateSavedNFT = async () => {
    savedNft
      ? await removeNFT(user?._id, {
          blockchain: 1,
          token: params.id,
          address: `${params.user}-${params.address}`,
        })
      : await saveNFT(user?._id, {
          blockchain: 1,
          token: params.id,
          address: `${params.user}-${params.address}`,
        });

    window.location.reload();
  };

  const cancelSale = async () => {
    await cancelSale1155(params.address, params.id, Number(saleData.quantity));
    window.location.reload();
  }

  const buyMatic = async () => {
    // console.log("Das");
    if (saleData && saleData.salePrice) {
      const amount = await convertAmountToMatic(
        Number(ethers.utils.formatEther(saleData.salePrice))
      );
      setAmount(amount);
      setFiat(true);
    } else {
      //   console.log(true);
      setFiat(true);
    }
  };

  const overview = () => {
    return (
      <>
        <div
          style={{
            fontWeight: 200,
            lineHeight: "25px",
            letterSpacing: "0.3px",
            marginTop: 20,
            opacity: 0.95,
          }}
        >
          {nft?.description}
        </div>
        {/* line seperator */}
        <div
          style={{
            height: 1,
            width: "100%",
            backgroundColor: "#fff",
            opacity: 0.16,
            marginTop: 7,
          }}
        />
        <div style={{ marginTop: 14, ...globalStyles.flexRow }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.66 }}>Quantity</div>
            <div
              style={{
                fontFamily: 200,
                fontSize: 16,
                opacity: 0.95,
                marginTop: 5,
                letterSpacing: "0.5px",
              }}
            >
              {saleData && <span>{saleData.quantity} on sale and </span>}
              <span>{nft?.quantity} available</span>
            </div>
          </div>
          <div style={{ marginLeft: 30 }}>
            <div style={{ fontSize: 14, opacity: 0.66 }}>Collection</div>
            <div
              style={{
                fontFamily: 200,
                fontSize: 16,
                opacity: 0.95,
                marginTop: 5,
                letterSpacing: "0.5px",
              }}
            >
              {collection?.name}
            </div>
          </div>
        </div>
        {/* <div style={{marginTop:18, fontWeight:400}}>
                <div style={{fontSize:14, opacity:0.66}}>Proof of authenticity</div>
                <div style={{marginTop:5}}>
                    <span style={{marginRight:10, borderBottom:"1px solid #fff", paddingBottom:1}}>kaer10202kaskdhfcnzaleleraoao</span>
                    <span><FiExternalLink size={22} color='#fff'/></span>
                </div>
            </div> */}
        {/* line seperator */}
        <div
          style={{
            height: 1,
            width: "100%",
            backgroundColor: "#fff",
            opacity: 0.16,
            marginTop: 15,
          }}
        />
        <div style={{ marginTop: 14, ...globalStyles.flexRow }}>
          <div>
            <div
              style={{
                fontSize: 14,
                opacity: 0.66,
                marginBottom: 6,
              }}
            >
              Artist
            </div>
            <div
              onClick={() => history.push(`/ourartists/${artist?._id}`)}
              style={{
                ...globalStyles.flexRow,
                cursor: "pointer",
              }}
            >
              <img
                style={{
                  height: 30,
                  width: 30,
                  borderRadius: 30,
                  objectFit: "cover",
                }}
                src={
                  artist
                    ? artist.image
                    : nft?.artistImg
                    ? nft?.artistImg
                    : profileSvg
                }
                alt="artist"
              />
              <div style={{ fontSize: 16, marginLeft: 10 }}>
                {artist ? artist.name : nft?.artistName.substring(0, 15)}
              </div>
            </div>
          </div>
          <div style={{ marginLeft: 30 }}>
            <div
              style={{
                fontSize: 14,
                opacity: 0.66,
                marginBottom: 6,
              }}
            >
              Owner(s)
            </div>
            <div
              onClick={() => history.push(`/ourartists/${ownerData?._id}`)}
              style={globalStyles.flexRow}
            >
              <img
                style={{
                  height: 30,
                  width: 30,
                  borderRadius: 30,
                  objectFit: "cover",
                }}
                src={ownerData?.image ?? profileSvg}
                alt="artist"
              />
              <div
                style={{
                  fontSize: 16,
                  marginLeft: 10,
                  wordBreak: "break-word",
                }}
              >
                {nft?.owner_id}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const otherDetails = () => {
    return (
      <>
        {/* {nft?.metadata?.extra?.materialMediumUsed &&
            <div style={{marginTop:20}}>
                <div style={{fontSize:14, opacity:0.66}}>Material Medium Used</div>
                <div style={{fontFamily:200, fontSize:16, opacity:0.95, marginTop:5, letterSpacing:"0.5px"}}>
                    {nft?.metadata?.extra?.materialMediumUsed}
                </div>
            </div>}
            <div style={{height:1, width:"100%", backgroundColor:"#fff", opacity:0.16, marginTop:7}}/>
            {nft?.metadata?.extra?.custom?.map(item => {
                return <>
                    <div style={{marginTop:13}}>
                        <div style={{fontSize:14, opacity:0.66}}>{item.name}</div>
                        {item.type === 1 ?
                        <div onClick={() => helpers.openInNewTab(item.fileUrl)} style={{fontFamily:200, fontSize:16, opacity:0.95, marginTop:5, cursor:"pointer", letterSpacing:"0.5px", display:"flex"}}>
                            <div style={{marginRight:10, borderBottom:"1px solid #fff", paddingBottom:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{item.fileUrl}</div>
                            <div><FiExternalLink size={22} color='#fff'/></div>
                        </div> :
                        <div style={{fontFamily:200, fontSize:16, opacity:0.95, marginTop:5, letterSpacing:"0.5px"}}>
                            {item?.text || item?.date}
                        </div>}
                    </div>
                    <div style={{height:1, width:"100%", backgroundColor:"#fff", opacity:0.16, marginTop:7}}/>
                </>
            })} */}
      </>
    );
  };

  const showHistory = () => {
    return (
      <>
        <div className="space-y-4 w-full pt-5 bg-transparent flex flex-col justify-center items-start">
          {bids &&
            bids.length > 0 &&
            bids.map((bid) => (
              <div className="w-full border-b pb-2 flex flex-row justify-around items-center">
                <div className="w-full md:w-1/2 space-y-2 flex flex-col justify-center items-start">
                  <h1 className="text-lg">
                    Bid placed by{" "}
                    <span className="font-bold">
                      {bid.bidder.substring(0, 8)}...
                    </span>{" "}
                  </h1>
                  <p className="text-sm text-gray-400">
                    {new Date(bid.timestamp * 1000).toString()}
                  </p>
                </div>
                <div className="w-1/2 md:space-y-2 flex flex-col justify-center items-end">
                  <h1 className="text-lg font-bold">
                    {ethers.utils.formatEther(bid.amount)} MATIC
                  </h1>
                </div>
                <div className="w-1/2 flex flex-col justify-center items-end">
                  {saleData &&
                    saleData.auction &&
                    saleData.auction.highestBidder &&
                    bid.bidder.toLowerCase() ==
                      saleData.auction.highestBidder.toLowerCase() && (
                      <div>
                        <GradientBtn
                          style={{
                            marginTop: 30,
                            marginRight: 20,
                            cursor: purchasable ? "pointer" : "no-drop",
                            opacity: purchasable ? 1 : 0.6,
                          }}
                          content={<div>Highest Bidder</div>}
                        />
                      </div>
                    )}
                  {saleData &&
                    saleData.auction &&
                    saleData.auction.highestBidder &&
                    bid.bidder.toLowerCase() !==
                      saleData.auction.highestBidder.toLowerCase() && (
                      <div>
                        <GradientBtn
                          style={{
                            marginTop: 30,
                            marginRight: 20,
                            cursor: purchasable ? "pointer" : "no-drop",
                            opacity: purchasable ? 1 : 0.6,
                          }}
                          content={<div>Refunded</div>}
                        />
                      </div>
                    )}
                </div>
              </div>
            ))}
          {bids.length === 0 && (
            <h1 className="text-xl font-bold">No Bids Found</h1>
          )}
        </div>
      </>
    );
  };

  const renderNfts = () => {
    return moreNfts.slice(0, 4).map((nft) => {
      var number;
      var id;
      try {
        number = ethers.utils.formatEther(nft.salePrice.toString());
        id = nft.nft.tokenId.toString();
      } catch (e) {
        // console.log(e);
      }
      return (
        <Col
          key={uuid()}
          style={{ marginBottom: 25 }}
          lg={3}
          md={4}
          sm={6}
          xs={12}
        >
          <NftCard
            onClick={() => {
              const link = nft?.nft.erc721
                ? `/polygon/nftdetails/${
                    nft.nft.nftAddress
                  }/${nft.nft.tokenId.toString()}`
                : `/polygon/${nft.nft.owner}/${
                    nft.nft.nftAddress
                  }/${nft.nft.tokenId.toString()}`;
              const a = document.createElement("a");
              a.setAttribute(
                "href",
                link
              );
              a.click();
            }}
            image={
              nft.nft.tokenUri.startsWith("ipfs")
                ? `https://${nft.nft.tokenUri.substring(
                    7
                  )}.ipfs.nftstorage.link`
                : nft.tokenUri
            }
            title={nft.nft.title}
            nearFee={number}
            artistName={nft?.nft.artistName?.substring(0, 8) + "..."}
            artistImage={
              nft.nft.artistImg ?? profileSvg
            }
            near={false}
          />
        </Col>
      );
    });
  };

  if (loading) return <Spinner />;

  return (
    <div className={classes.container}>
      <div className={classes.detailsGradientOverlay} />
      <div className={classes.detailsGradientOverlayPink} />
      {nft && (
        <Row
          className={isModalOpen || isSaleModalOpen ? "filter blur-2xl " : ""}
        >
          <Col lg={7} md={7}>
            <div style={{ textAlign: "center" }}>
              {nft?.isVideo ? (
                <div id="tv_container">
                  <video
                    ref={ref}
                    className={classes.nftImage}
                    controls
                    autoPlay
                    muted
                  >
                    <source
                      src={
                        nft.tokenUri.startsWith("ipfs")
                          ? `https://${nft.videoUri.substring(
                              7
                            )}.ipfs.nftstorage.link`
                          : nft.videoUri
                      }
                    />
                    nft
                  </video>
                </div>
              ) : (
                <img
                  className={classes.nftImage}
                  src={
                    nft.tokenUri.startsWith("ipfs")
                      ? `https://${nft.tokenUri.substring(
                          7
                        )}.ipfs.nftstorage.link`
                      : nft.tokenUri
                  }
                  alt="nft"
                />
              )}
            </div>
          </Col>
          <Col className={classes.descriptionCol} lg={5} md={5}>
            <div style={globalStyles.flexRowSpace}>
              <div
                style={{
                  marginRight: 10,
                }}
                className="space-y-2"
              >
                <h1
                  style={{
                    fontFamily: "Athelas-Bold",
                    fontSize: 36,
                    textTransform: "capitalize",
                    lineHeight: "40px",
                  }}
                >
                  {nft?.title}
                </h1>
                {saleData && saleData.salePrice && (
                  <div className="font-inter flex items-center">
                    <span className="text-gray-400">Price:</span>{" "}
                    <span className="ml-2 font-bold">
                      {ethers.utils.formatEther(saleData?.salePrice)}
                    </span>
                    <img src={polygon} className="ml-2 w-5 h-5" />
                  </div>
                )}
              </div>
              <div style={{ display: "flex" }}>
                <span
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 100,
                    padding: 6,
                    opacity: 0.6,
                    cursor: "pointer",
                  }}
                  onClick={() => updateSavedNFT()}
                >
                  {savedNft ? (
                    <BsFillBookmarkFill size={22} color="#130F26" />
                  ) : (
                    <FiBookmark size={22} color="#130F26" />
                  )}
                </span>
                <span
                  style={{
                    backgroundColor: "#fff",
                    marginLeft: 15,
                    borderRadius: 100,
                    padding: 6,
                    opacity: 0.6,
                    cursor: "no-drop",
                  }}
                >
                  <FiMoreVertical size={22} color="#130F26" />
                </span>
              </div>
            </div>
            {/* <WhatsappShareButton
                        title={nft?.metadata?.title}
                        separator={"/%0A"}
                        style={{height:50, width:50, background:"#fff", color:'red'}} 
                        url={window.location.href}
                    >
                        whatsapp
                    </WhatsappShareButton> */}
            {purchasable.owner && purchasable.auctionEnded && nft?.price && (
              <div style={{ marginTop: 5 }}>
                <span style={{ fontSize: 15, opacity: 0.6 }}>Price:</span>
                <span style={{ marginLeft: 5, fontSize: 17 }}>
                  {nft?.price} ETH
                </span>
              </div>
            )}
            <div>
              <div style={{ ...globalStyles.flexRow, marginTop: 20 }}>
                <div
                  onClick={() => setIsOverviewActive(1)}
                  style={{
                    fontWeight: isOverviewActive !== 1 ? "400" : "bold",
                    opacity: isOverviewActive !== 1 ? 0.7 : 1,
                    fontSize: 12,
                    cursor: "pointer",
                    letterSpacing: 1.5,
                  }}
                >
                  OVERVIEW
                </div>
                <div
                  onClick={() => setIsOverviewActive(2)}
                  style={{
                    fontWeight: isOverviewActive !== 2 ? "400" : "bold",
                    opacity: isOverviewActive !== 2 ? 0.7 : 1,
                    fontSize: 12,
                    marginLeft: 30,
                    cursor: "pointer",
                    letterSpacing: 1.5,
                  }}
                >
                  OTHER DETAILS
                </div>
                <div
                  onClick={() => setIsOverviewActive(3)}
                  style={{
                    fontWeight: isOverviewActive !== 3 ? "400" : "bold",
                    opacity: isOverviewActive !== 3 ? 0.7 : 1,
                    fontSize: 12,
                    marginLeft: 30,
                    cursor: "pointer",
                    letterSpacing: 1.5,
                  }}
                >
                  HISTORY
                </div>
              </div>
              <motion.div
                animate={{
                  x:
                    isOverviewActive === 1
                      ? 33
                      : isOverviewActive === 2
                      ? 150
                      : 270,
                }}
                transition={{ duration: 0.5 }}
                style={{
                  height: 3,
                  background: "#fff",
                  width: 8,
                  borderRadius: 100,
                  marginTop: 2,
                }}
              />
            </div>
            {isOverviewActive === 1
              ? overview()
              : isOverviewActive === 2
              ? otherDetails()
              : showHistory()}
            {purchasable.owner && (
              <div className={classes.ownedBtnResponsive}>
                <img style={{ height: 30 }} src={party} alt="party" />
                &nbsp;&nbsp; This nft is now yours!
              </div>
            )}
            {purchasable.owner &&
              !purchasable.auctionEnded &&
              saleData &&
              saleData.auction && (
                <div>
                  <GradientBtn
                    style={{
                      marginTop: 30,
                      cursor: purchasable ? "pointer" : "no-drop",
                      opacity: purchasable ? 1 : 0.6,
                    }}
                    onClick={() => endAuction(params.address, params.id)}
                    content={<div>END AUCTION</div>}
                  />
                </div>
              )}
            {purchasable.owner &&
              purchasable.auctionEnded &&
              saleData &&
              saleData.auction && (
                <div>
                  <GradientBtn
                    style={{
                      marginTop: 30,
                      cursor: purchasable ? "pointer" : "no-drop",
                      opacity: purchasable ? 1 : 0.6,
                    }}
                    onClick={() => endAuction(params.address, params.id)}
                    content={<div>END AUCTION</div>}
                  />
                </div>
              )}
            {!purchasable.owner &&
              purchasable.auctionEnded &&
              saleData &&
              saleData.auction &&
              saleData.auction.highestBidder &&
              saleData.auction.highestBidder.toLowerCase() ===
                evmWalletData.address.toLowerCase() && (
                <div>
                  <GradientBtn
                    style={{
                      marginTop: 30,
                      cursor: purchasable ? "pointer" : "no-drop",
                      opacity: purchasable ? 1 : 0.6,
                    }}
                    onClick={() => endAuction(params.address, params.id)}
                    content={<div>CLAIM NFT</div>}
                  />
                </div>
              )}
            {!purchasable.owner &&
              !purchasable.auctionEnded &&
              saleData &&
              saleData.isOnSale &&
              ((saleData.auction && saleData.auction.highestBidder
                ? saleData.auction.highestBidder.toLowerCase() !==
                  evmWalletData.address.toLowerCase()
                : saleData.saleType == "1") ||
                saleData.saleType === "0") && (
                <div>
                  <GradientBtn
                    style={{
                      marginTop: 30,
                      cursor: purchasable ? "pointer" : "no-drop",
                      opacity: purchasable ? 1 : 0.6,
                    }}
                    onClick={() =>
                      purchasable && nft?.salePrice
                        ? setIsModalOpen(true)
                        : null
                    }
                    content={
                      <div
                        onClick={() =>
                          !purchasable.owner && price > 0
                            ? setIsModalOpen(true)
                            : setIsModalOpen(false)
                        }
                      >
                        PURCHASE FOR{" "}
                        {saleData.auction && saleData.auction.highestBid
                          ? ethers.utils.formatEther(
                              saleData.auction.highestBid
                            )
                          : ethers.utils.formatEther(price.toString())}{" "}
                        MATIC
                      </div>
                    }
                  />
                </div>
              )}
            {!purchasable.owner &&
              !purchasable.auctionEnded &&
              saleData &&
              saleData.auction &&
              saleData.auction.highestBidder &&
              saleData.auction.highestBidder.toLowerCase() ==
                evmWalletData.address.toLowerCase() && (
                <div>
                  <GradientBtn
                    style={{
                      marginTop: 30,
                      cursor: purchasable ? "pointer" : "no-drop",
                      opacity: purchasable ? 1 : 0.6,
                    }}
                    content={<div>HIGHEST BIDDER</div>}
                  />
                </div>
              )}
            {saleData && !saleData.isOnSale && (
              <div>
                <GradientBtn
                  style={{
                    marginTop: 30,
                    cursor: purchasable ? "pointer" : "no-drop",
                    opacity: purchasable ? 1 : 0.6,
                  }}
                  content={<div>UNAVAILABLE</div>}
                />
              </div>
            )}
            {purchasable.owner && purchasable.auctionEnded && price <= 0 && (
              <GradientBtn
                style={{
                  marginTop: 30,
                  cursor: purchasable ? "pointer" : "no-drop",
                  opacity: purchasable ? 1 : 0.6,
                }}
                onClick={() => setIsSaleModalOpen(true)}
                content={<div>WANT TO LIST THIS NFT?</div>}
              />
            )}
            {purchasable.owner &&
              saleData &&
              (saleData.saleType === "0" || saleData.saleType === 0) && (
                <div>
                  <GradientBtn
                    style={{
                      marginTop: 30,
                      cursor: purchasable ? "pointer" : "no-drop",
                      opacity: purchasable ? 1 : 0.6,
                    }}
                    onClick={() => {
                      cancelSale();
                    }}
                    content={<div>CANCEL LISTING</div>}
                  />
                </div>
              )}
            <div>
              <GradientBtn
                style={{
                  marginTop: 30,
                  cursor: purchasable ? "pointer" : "no-drop",
                  opacity: purchasable ? 1 : 0.6,
                }}
                onClick={() => setTOSModal(true)}
                content={<div>PURCHASE WITH INR</div>}
              />
            </div>
          </Col>
        </Row>
      )}
      <div
        className={
          (isModalOpen || isSaleModalOpen ? "filter blur-2xl " : "") +
          classes.bottomContent
        }
      >
        <div className={classes.heading}>More NFTs like this</div>
        <Row>{renderNfts()}</Row>
      </div>
      <Modal show={show} onHide={() => setShow(false)} />
      {isModalOpen && (
        <BuyNFTModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          saleData={saleData}
          nft={nft}
          price={price}
          erc721={false}
        />
      )}
      {isSaleModalOpen && (
        <SaleNFTModal
          isOpen={isSaleModalOpen}
          setIsOpen={setIsSaleModalOpen}
          nft={nft}
          erc721={collection?.erc721}
        />
      )}
      {tosModal && (
        <div className="bg-[#12192B] mt-20 md:mt-0 space-y-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 md:w-1/2 lg:w-1/3 h-11/12 rounded-xl p-3 flex flex-col justify-center items-center">
          <h1
            className="text-3xl font-bold p-4 text-center"
            style={{
              fontFamily: "Athelas-Bold",
            }}
          >
            Terms & Conditions
          </h1>
          <p className="text-center w-11/12">
            {viewMore ? disclaimer : disclaimer.substring(0, 200)}
          </p>
          {viewMore ? (
            <span
              className="text-red-500 font-bold cursor-pointer"
              onClick={() => setViewMore(false)}
            >
              View Less
            </span>
          ) : (
            <span
              className="text-red-500 font-bold cursor-pointer"
              onClick={() => setViewMore(true)}
            >
              View More
            </span>
          )}
          <div className="p-4 rounded-xl space-y-3 md:space-y-0 md:space-x-4 w-full h-fit flex flex-col md:flex-row justify-center items-center">
            <div
              onClick={() => setTOSModal(false)}
              className="tracking-widest font-semibold cursor-pointer w-full md:w-1/2 h-full p-3 text-center text-lg border-2 border-white rounded-xl"
            >
              CANCEL
            </div>
            <div
              onClick={() => {
                setTOSModal(false);
                buyMatic();
              }}
              className="tracking-widest font-semibold cursor-pointer w-full md:w-1/2 h-full p-3 text-center text-lg bg-white text-black text-bold rounded-xl"
            >
              ACCEPT
            </div>
          </div>
        </div>
      )}
      <div
        id="widget"
        className={
          (fiat ? "" : "hidden ") +
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
        }
      >
        {fiat && (
          <div
            onClick={() => setFiat(false)}
            style={{
              cursor: "pointer",
              zIndex: "10000",
            }}
          >
            <FiX className="text-2xl text-white" />
          </div>
        )}
      </div>
    </div>
  );
}

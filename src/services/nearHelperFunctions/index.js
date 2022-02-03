import configs from '../../configs';
import { _getAllArtists, _getOneArtist } from '../axios/api';


export default function NearHelperFunctions(wallet) {

  this.getAllListedNfts = async (allNfts) => {
    
    const res = await wallet.account()
    .viewFunction(
      configs.nakshMarketWallet, 
      'get_sales_by_nft_contract_id', 
      { 
        nft_contract_id: configs.nakshContractWallet,
        from_index: "0", 
        limit: 1000 
      }
    )

    const { data: { artists } } = await _getAllArtists({sortBy: 'createdAt', sort: -1});
    const filteredNfts = [];

    allNfts.map(nftItem => {
      
      nftItem.metadata['extra'] = JSON.parse(nftItem.metadata.extra);
      const listedItem = res.find(t => t.token_id === nftItem.token_id);
      const artist = artists.find(a => a._id === nftItem?.metadata?.extra?.artistId);
      
      if(artist) {
        nftItem['artist'] = artist;
      }

      if(listedItem) {
        nftItem["listed"] = true;
        nftItem["price"] = `${listedItem.sale_conditions}`;
        filteredNfts.push(nftItem);
      }

    });

    return filteredNfts;
  }

  this.getAllNfts = async () => {

    const res = await wallet.account()
    .viewFunction(
      configs.nakshContractWallet, 
      'nft_tokens', 
      { 
        from_index: "0", 
        limit: 1000 
      }
    );

    const nftsWithPrice = await this.getAllListedNfts(res); // to get nft price

    return nftsWithPrice;

  };

  this.getNftDetails = async () => {

    const res = await wallet.account()
    .viewFunction(
      configs.nakshContractWallet, 
      'nft_tokens', 
      { 
        from_index: "0", 
        limit: 1000 
      }
    );

    const { data: { artists } } = await _getAllArtists({sortBy: 'createdAt', sort: -1});

    res.map(nftItem => {
      
      nftItem.metadata['extra'] = JSON.parse(nftItem?.metadata?.extra);
      const artist = artists.find(a => a._id === nftItem?.metadata?.extra?.artistId);
      
      if(artist) {
        nftItem['artist'] = artist;
      }

    });

    return res;

  }

  this.getOwnedNfts = async () => {
    
    const res = await wallet.account()
    .viewFunction(
      configs.nakshContractWallet, 
      'nft_tokens_for_owner', 
      { 
        account_id: wallet.getAccountId(), 
        from_index: "0", 
        limit: 1000 
      }
    );

    const { data: { artists } } = await _getAllArtists({sortBy: 'createdAt', sort: -1});
    const item = artists.find(item => item.wallet === wallet.getAccountId());
    res.map(nft => nft['artist'] = item);   

    return res;
  }

}
  
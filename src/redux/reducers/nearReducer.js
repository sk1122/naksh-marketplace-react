import * as actionTypes from '../actions/actionTypes';

const initialState = {
    isWalletSignedIn: false,
    walletInfo: null
}

const nearReducer = (state = initialState, action) => {
    switch (action.type){
        case actionTypes.IS_WALLET_SIGNED_IN:
            return {
                ...state,
                isWalletSignedIn: action.payload
            }
        case actionTypes.GET_WALLET_INFO:
            return {
                ...state,
                walletInfo: action.payload
            }
        default: return state;
    }
}

export default nearReducer;
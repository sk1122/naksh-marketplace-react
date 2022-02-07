import * as actionTypes from '../actions/actionTypes';

const initialState = {
    headerSearchLoading: false,
    searchLoading: false,
    searchResults: [],
    searchKeyword: ""
}

const dataReducer = (state = initialState, action) => {
    switch (action.type){
        case actionTypes.SEARCH_RESULTS:
            return {
                ...state,
                searchResults: action.payload.artists,
                searchKeyword: action.payload.searchKeyword
            }
        case actionTypes.HEADER_SEARCH_LOADING:
            return {
                ...state,
                headerSearchLoading: action.payload
            }
        case actionTypes.SEARCH_LOADING:
            return {
                ...state,
                searchLoading: action.payload
            }
        default: return state;
    }
}

export default dataReducer;
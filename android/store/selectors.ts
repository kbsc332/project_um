import { createSelector } from 'reselect'
import { IState } from './state'

export const getState = (state: IState) => state

export const getUser = createSelector(
	[getState],
	(state) => {
        if ( state )
            return state.user;
        return {   
            userID: 0,
            accountID: '',
            phoneNumber: '',
            bitcoinDepositAddress: '',
            companyBitcoinDepositAddress:'',
            depositedBitcoin: '',
            session:''
        };
	},
);

export const getMiningData = createSelector(
	[getState],
	(state) => {
        if ( state )
            return state.miningData;
        return {   
            volume: 0,
            speed: 0,
            amountVolumeByUpdateTIme : 0,
            recommanderSpeed: 0,
            updateTime: 0,
            speedUp: 0,
            speedUpExpirationTime: 0,            
        };
	},
);

export const getRecommandData = createSelector(
	[getState],
	(state) => {
        if ( state )
            return state.recommandData;
        return {   
            recommanderUserID: 0
        };
	},
);

export const getIsLoggedIn  = createSelector(
	[getState],
	(state) => {
        if ( state )
		    return state.isLoggedIn ;
        return false;
	},
);
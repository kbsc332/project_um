import { AsyncStorage } from "react-native";

export interface IAccount {
    session:string,
    userID: number,
    accountID: string,
    phoneNumber: string,
    bitcoinDepositAddress: string,
    companyBitcoinDepositAddress: string,
    depositedBitcoin: string,
}

export interface IMiningData {
    volume: number,
    updateTime : number,
    speed: number,
    recommanderSpeed: number,
    amountVolumeByUpdateTIme : number,
    speedUp: number,
    speedUpExpirationTime: number,
}

export interface IRecommandData {
    recommanderUserID: number
}

export interface IState {
    user: IAccount,
    miningData: IMiningData,
    recommandData: IRecommandData,
    isLoggedIn : boolean,
    isLocalStorage: boolean,
}

const storageUser = () => {
    const session : any = AsyncStorage.getItem('session');
    if (session && session.length > 0) {
        const user = JSON.parse(String(AsyncStorage.getItem('user')));
        return {
            user: {
                userID: user.user.userID,
                accountID: user.user.accountID,
                phoneNumber: user.user.phoneNumber,
                bitcoinDepositAddress: user.user.bitcoinDepositAddress,
                companyBitcoinDepositAddress : user.user.companyBitcoinDepositAddress,
                depositedBitcoin: user.user.depositedBitcoin,
                session: session
            },
            miningData:{
                volume : user.miningData.volume,
                speed : user.miningData.speed,
                amountVolumeByUpdateTIme : user.miningData.amountVolumeByUpdateTIme,
                recommanderSpeed: user.miningData.recommanderSpeed,
                updateTime: user.miningData.updateTime,
                speedUp : user.miningData.speedUp,
                speedUpExpirationTime : user.miningData.speedUpExpirationTime
            },
            recommandData:{
                recommanderUserID : user.recommandData.recommanderUserID
            },
            isLoggedIn: true,
            isLocalStorage: false
        };
    }
    return {
        user: {
            userID: 0,
            accountID: '',
            phoneNumber: '',
            bitcoinDepositAddress: '',
            companyBitcoinDepositAddress: '',
            depositedBitcoin: '',
            session: ''
        },
        miningData:{
            volume: 0,
            speed: 0,
            recommanderSpeed: 0,
            amountVolumeByUpdateTIme : 0,
            updateTime:0,
            speedUp:0,
            speedUpExpirationTime:0
        },
        recommandData:{
            recommanderUserID : 0
        },
        isLoggedIn: false,
        isLocalStorage: false
    };
}

export const InitialState: IState = {
    user: storageUser().user,
    miningData: storageUser().miningData,
    recommandData: storageUser().recommandData,
    isLoggedIn : storageUser().isLoggedIn,
    isLocalStorage: true
}
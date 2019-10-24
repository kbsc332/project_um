
import * as State from './store/state';
import dataManager from './dataManager';

export class Manager
{
    static _instance : Manager = null;
    private constructor()
    {

    }

    static GetInstance(): Manager {
        if ( this._instance == null )
            this._instance = new Manager();
        return this._instance;
    };

    user : State.IAccount = {
        userID: 0,
        accountID: '',
        phoneNumber: '',
        bitcoinDepositAddress: '',
        companyBitcoinDepositAddress: '',
        depositedBitcoin: '',
        session: ''
        // userID: 1,
        // accountID: 'glsseact',
        // phoneNumber: '1234',
        // bitcoinDepositAddress: '1234',
        // companyBitcoinDepositAddress: '1234',
        // depositedBitcoin: '323534',
        // session: ''
    };

    miningData: State.IMiningData = {
        volume: 0,
        speed: 0,
        recommanderSpeed: 0,
        amountVolumeByUpdateTIme : 0,
        updateTime:0,
        speedUp:0,
        speedUpExpirationTime:0
        // volume: 100000,
        // speed: 100000,
        // recommanderSpeed: 0,
        // amountVolumeByUpdateTIme : 0,
        // updateTime:0,
        // speedUp:0,
        // speedUpExpirationTime:0
    };

    recommandData:{
        recommanderUserID : 0
    };

    isLoggedIn: boolean = false;
    isLocalStorage: boolean = false;

    LoginUser(user: any) {
        this.user = {
            userID: user.account.userID,
            accountID: user.account.accountID,
            phoneNumber: user.account.phoneNumber,
            bitcoinDepositAddress: user.account.bitcoinDepositAddress,
            companyBitcoinDepositAddress: user.account.companyBitcoinDepositAddress,
            depositedBitcoin: user.account.depositedBitcoin,
            session: user.session
        };
        this.miningData = {
            volume: user.miningData.volume,
            speed: user.miningData.speed,
            recommanderSpeed: user.miningData.recommanderSpeed,
            amountVolumeByUpdateTIme : user.miningData.amountVolumeByUpdateTIme,
            updateTime: user.miningData.updateTime,
            speedUp: user.miningData.speedUp,
            speedUpExpirationTime: user.miningData.speedUpExpirationTime
        }

        this.isLoggedIn = true;
    }

    LogoutUser() {
        this.user= {
            userID: 0,
            accountID: '',
            phoneNumber: '',
            bitcoinDepositAddress: '',
            companyBitcoinDepositAddress: '',
            depositedBitcoin: '',
            session: ''
        };
    
        this.miningData = {
            volume: 0,
            speed: 0,
            recommanderSpeed: 0,
            amountVolumeByUpdateTIme : 0,
            updateTime:0,
            speedUp:0,
            speedUpExpirationTime:0
        };

        this.isLoggedIn = false;

        if ( this.logoutEvent )
            this.logoutEvent();
    }

    UpdateUserData(user:any){
        this.user = {
            userID: user.userID,
            accountID: user.accountID,
            phoneNumber: user.phoneNumber,
            bitcoinDepositAddress: user.bitcoinDepositAddress,
            companyBitcoinDepositAddress: user.companyBitcoinDepositAddress,
            depositedBitcoin: user.depositedBitcoin,
            session: this.user.session
        };
    }

    UpdateMiningData(miningData:any){
        this.miningData = {
            volume: miningData.volume,
            speed: miningData.speed,
            recommanderSpeed: miningData.recommanderSpeed,
            amountVolumeByUpdateTIme : miningData.amountVolumeByUpdateTIme,
            updateTime:miningData.updateTime,
            speedUp:miningData.speedUp,
            speedUpExpirationTime:miningData.speedUpExpirationTime
        };
    }

    getCurrentMiningVolumeAndSpeed = () =>{
        var user = this.user;
        var miningData = this.miningData;
        // 이제 패키지 구입이라는게 없다. 
        // 현재 채굴된 금액 + 입금 금액이 패키지 구간을 넘어서면.. 
        // 해당 패키지 구간의 스피드가 내 스피드임. 거기에 추천 계층 스피드를 더해야함
    
        // 현재 채굴량을 계산해보자   
        const now = Date.now();
    
        // 갱신 이후로 경과한 시간.(UTC)
        var miningTime = (now - miningData.updateTime) / (3600 * 24 * 1000); 
    
        //  LA 기준 자정.
        var updateTime = miningData.updateTime;
        const updateTimeLANow = miningData.updateTime - (3600*7*1000); //LA는 UTC-7 이다.
        const updateTimeLA = new Date(updateTimeLANow);
        const updateNextTimeLA = new Date(updateTimeLA);
        updateNextTimeLA.setUTCDate( updateTimeLA.getUTCDate() + 1);
        updateNextTimeLA.setUTCHours(0, 0, 0, 0);
        
        // 업데이트 당시의 속도. 일단 기본 채굴량
        var startMiningSpeed = miningData.speed;
        
        //  업데이트 당시의 총 보유 비트코인
        var startTotalVolume = Number(user.depositedBitcoin) + miningData.volume;
    
        // 업데이트 당시에 내가 속한 패키지 구간
        var currentMiningPackage = dataManager.getPackageDataByBitcoinRange(startTotalVolume);
    
        // 업데이트 당시에 추천 유저로 부터 제공받는 패키지 채굴량 증가
        var startRecommanderPackageSpeed = miningData.recommanderSpeed;
    
        var nextMiningPackage : any = null;
        if ( currentMiningPackage  )
        {
            nextMiningPackage = dataManager.getPackageData(currentMiningPackage.index+1);
        }
        else
        {
            nextMiningPackage = dataManager.getPackageData(1);
        }
        
        startMiningSpeed = startMiningSpeed / 100000000;
    
        // 다음 패키지 구간까지 남은 채굴량 
        var needNextPakcageVolume = nextMiningPackage ? nextMiningPackage.price - startTotalVolume : 9999999999;
        var remainMiningTimePerDay = updateNextTimeLA.getTime() - updateTimeLA.getTime();
        remainMiningTimePerDay = Math.min(now - updateTime, remainMiningTimePerDay);
    
        var alreadyMiningVolumePerDay = miningData.amountVolumeByUpdateTIme;
        var miningVolume = 0;
        while( updateTime < now )
        {
            // 하루에 최대 채굴할 수 있는 량
            var avaliableMaxMiningVolumePerDay = currentMiningPackage ? currentMiningPackage.price * 0.5 : dataManager.getDefaultMiningValue();
            
            avaliableMaxMiningVolumePerDay = Math.max( 0, Math.min(avaliableMaxMiningVolumePerDay, 50000000) - alreadyMiningVolumePerDay );
    
            // 남은 시간동안 채굴할 수 있는 예상 량 
            var avaliableMiningVolume = Math.min( avaliableMaxMiningVolumePerDay, remainMiningTimePerDay * startMiningSpeed);
            
            if ( avaliableMiningVolume >= needNextPakcageVolume )
            {
                // 중간에 패키지 구간이 변경된다.
                // 패키지 구간변경까지 걸리는 시간.
                const time = needNextPakcageVolume/ startMiningSpeed;
                remainMiningTimePerDay -= time;
    
                miningVolume += needNextPakcageVolume;
                alreadyMiningVolumePerDay += needNextPakcageVolume;
    
                // 패키지 변경
                currentMiningPackage = nextMiningPackage;
                nextMiningPackage = dataManager.getPackageData(currentMiningPackage.index+1);
    
                startMiningSpeed = dataManager.getDefaultMiningValue() + currentMiningPackage.volume + startRecommanderPackageSpeed;
                startMiningSpeed = startMiningSpeed / 100000000;
                
                needNextPakcageVolume = nextMiningPackage ? nextMiningPackage.price - startTotalVolume : 9999999999;
    
                // 아직 하루 계산이 다 안끝남, 그냥 continue;
                updateTime += time;
                continue;
            }
            else
            {
                // 업데이트 가망성이 없다.
                miningVolume += avaliableMiningVolume;
            }
    
            updateTime += remainMiningTimePerDay;
    
            remainMiningTimePerDay = Math.min( 3600*24*1000, now-updateTime);// 이제부터는 하루 24시간 가능
            alreadyMiningVolumePerDay = 0;
        }
        return {
            volume : miningData.volume + miningVolume,
            speed : startMiningSpeed * 100000000
        }
    }

    logoutEvent = null;
    setLogoutEvent(callback) {
        this.logoutEvent = callback;
    }
}
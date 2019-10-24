import data from './umData.json';

class DataManager
{
    packageData : {[index:number]:any}= {};
    constructor()
    {
        if ( data.packageData  )
        {
            const list : any[] = data.packageData;
            for ( var i = 0 ; i < list.length; ++i )
            {
                this.packageData[list[i].index] = list[i];
            }
        }
    }

    // 이벤트 관련...

    // 룰렛 이벤트에 필요한 비트코인 
    getRouletteNeedBitcoin() {
        return data.event.roulette.needBitcoin;
    }

    // 룰렛 보상 개수
    getRouletteEventSize() {
        return data.event.roulette.reward.length;
    }

    getRouletteEvent(index:any) {
        if ( data.event.roulette.reward.length <= index )
            return null;

        return data.event.roulette.reward[index];
    }    
    
    // 다이스 이벤트에 필요한 비트코인
    getDiceNeedBitcoin() : number {
        return data.event.dice.needBitcoin;
    }

    getDiceWinProbability() : number {
        return data.event.dice.probability;
    }
    
    getDiceRewardBitcoin() {
        return data.event.dice.rewardBitcoin;
    }

    getDefaultMiningValue() {
        return data.defaultMiningValue;
    }

    getPackageData(index:number){
        if (index > data.packageData.length )
            return null;
        return this.packageData[index];
    }

    // 패키지 구간에서의 채굴 속도.
    getPackageDataByBitcoinRange(bitcoin:number)
    {
        var result : any = null;
        for (var i = 0; i < data.packageData.length ;++i)
        {
            if ( bitcoin > data.packageData[i].price )
            {
                result = data.packageData[i];
            }
            else 
                break;
        }

        return result;
    }

    getReviewData(index:number) {
        if ( index >= data.review.length)
            return undefined;

        return data.review[index];
    }

    getPoints() { 
        return data.point;
    }

    getPoint(index:number){
        if ( index >= data.point.length)
            return undefined;

        return data.point[index];
    }

    getBitcoinConfirmBlockHeight() 
    {
        return data.bitcoinConfirmBlockHeight | 6;
    }

    getRecommanderHierarchyMiningRate(index: number ) : number
    {
        if ( data.hierarchyMining.length <= index )
            return 0;

        return data.hierarchyMining[index].rate;
    }
    
    // user와 miningData를 이용해서 현재 채굴량을 계산한다.
    getCurrentMiningVolumeAndSpeed = (user : any, miningData : any) =>{
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
        var startTotalVolume = user.depositedBitcoin + miningData.volume;
    
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
        var avaliableMiningVolume = 0;
        while( updateTime < now )
        {
            // 하루에 최대 채굴할 수 있는 량
            var avaliableMaxMiningVolumePerDay = currentMiningPackage ? currentMiningPackage.price * 0.5 : dataManager.getDefaultMiningValue();
            
            avaliableMaxMiningVolumePerDay = Math.max( 0, Math.min(avaliableMaxMiningVolumePerDay, 50000000) - alreadyMiningVolumePerDay );
    
            // 남은 시간동안 채굴할 수 있는 예상 량 
            avaliableMiningVolume = Math.min( avaliableMaxMiningVolumePerDay, remainMiningTimePerDay * startMiningSpeed);
            
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
            speed : startMiningSpeed * 100000000,
            avaliableMiningVolume : avaliableMiningVolume
        }
    }
}

const dataManager = new DataManager;

export default dataManager;
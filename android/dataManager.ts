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
}

const dataManager = new DataManager;

export default dataManager;
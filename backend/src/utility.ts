import { exec, ExecException } from 'child_process'
import { tedis } from './redis/connector';
import { Account, HistoryLog, Package, MiningData, RecommandTree } from './mariaDB/tableSchema';
import { sequelize, or } from './mariaDB/connector';
import { Transaction, QueryTypes } from 'sequelize';
import { logger } from '@shared';
import dataManager from './dataManager/dataManager';
export const Exec = async (query): Promise<{ error: ExecException | null, stdout: string, stderr: string }> => {
    return new Promise( (resolve) => {
        exec(query, (error, stdout, stderr) => {
            resolve(
                {
                    error: error,
                    stdout: stdout,
                    stderr: stderr
                }
            );
        });
    });
}

const userCacheTime = 60 * 60;
export const GetUser = async( userID ) => {
    // 레디스에서 확인
    const key = 'user_'+userID;
    let user = await tedis.get(key);
    if ( !user )
    {
        user = await Account.findOne({where:{userID:userID},logging:false});
        if ( !user )
            return null;

        // 1시간 정도 캐싱해둘까?
        tedis.setex(key, userCacheTime, JSON.stringify(user) );
    }
    else
    {
        user = JSON.parse(String(user));
    }
    return user;
}

export const RemoveUserCahce = async (userID:number) =>
{
    await tedis.del('user_' + userID);
}
export const UpdateUserCache = async( userID : number, user? : any) =>
{
    const key = 'user_' + userID;
    if ( !user )
    {
        // 그냥 레디스에서 지운다.
        await RemoveUserCahce(userID);
    }
    else
    {
        await tedis.setex(key, userCacheTime, JSON.stringify(user) );
    }
}

export const CheckNewBitcoinDepositEvent = async ( userID ) => {
    try
    {
        const user: any = await GetUser(userID);
        if (user == null)
            return false;
        const networkHistory = await GetBitcoinAddressHistoryInNetwork(user.companyBitcoinDepositAddress);

        var transaction = await sequelize.transaction({ autocommit: false, logging:false});
        // db에 저장된 히스토리와 비교해야한다.
        const logs = await HistoryLog.findAll({
            where: {
                userID: userID, type: or(0,1)
            }, lock: Transaction.LOCK.UPDATE, transaction: transaction, logging: false
        });

        // 입금 처리를 먼저 한다.
        var updated = false;
        var depositedBitcoin = 0;
        for (var i = 0; i < logs.length; ++i) {
            const log = logs[i];
            if (log.type == 0 && log.blockHeight + dataManager.getBitcoinConfirmBlockHeight() <= networkHistory.height) {
                // 컨펌 됬다.
                await log.update({ type: 1 }, { transaction: transaction });
                logger.info(`Bitcoin 입금! ${user.accountID}(${userID}), ${log.value} BTC, ${log.transaction}`);
                global.console.log('depositedBitcoin' + depositedBitcoin);
                global.console.log('value' + log.value);
                depositedBitcoin += log.value;
                updated = true;
            }
        }
        if ( updated )
        {
            const account = await Account.findOne({ where: { userID: userID }, lock: Transaction.LOCK.UPDATE, transaction: transaction, logging : false});
            await RemoveUserCahce(userID);
            await account.update({ depositedBitcoin: account.depositedBitcoin + depositedBitcoin }, { transaction: transaction });
        }
        await transaction.commit();
        
        // 신규 입금 내역은 반영하고, 기존 입금내역에서 컨펌 대기들은 비트코인 입금 처리를 한다.
        var dbTransactions = new Set();
        for (var i = 0; i < logs.length; ++i) {
            dbTransactions.add(logs[i].transaction);
        }

        // 새로운 트랜잭션 생성, 새로운 historyLog를 추가한다.
        transaction = await sequelize.transaction({ autocommit: false, logging:false});
        for (var i = 0; i < networkHistory.history.length; ++i) {
            const history = networkHistory.history[i];
            if (dbTransactions.has(history.tx) == false) {
                // 없다. 생성해야 한다.
                global.console.log(history);
                const newHistory = await HistoryLog.create({
                    userID: userID,
                    transaction: history.tx,
                    value: history.value,
                    blockHeight: history.height,
                    updateTime: history.time,
                    type: 0
                },
                    { transaction: transaction, logging: false}
                );
            }
        }

        await transaction.commit();
    }
    catch (error) {
        logger.error(error.message, error);
    }
}

// BitcoinNetwork에서 해당 주소의 history를 가져온다.
export const GetBitcoinAddressHistoryInNetwork = async (address): Promise<{ history: [any], height: number }> => {
    const query = `${process.env.USE_DOCKER_WALLET ? "docker exec wallet ./wallet/wallet/wallet" : process.env.WALLET_PATH } getHistory ${address}`
                
    const result: any = await Exec(query);
    var datas: any = [];
    if (result.error != null) {
        return {
            history: datas,
            height: 0
        };
    }
    else {
        const data = result.stdout.split(',');

        for (var i = 0; i < data.length - 1; i += 4) {
            datas.push({
                time: data[i],
                tx: data[i + 1],
                value: data[i + 2],
                height: Number(data[i + 3])
            });
        }

        return {
            history: datas,
            height: Number(data[data.length - 1])
        };
    }
}

// 추천유저의 투자 금액에 의한 채굴속도, 디비에 갱신된 기준. 현재 시간의 차이를 계산하지 않는다.
const GetRecommanderSpeed = async (userID, byUpdateTime: boolean = true) =>{
    var result = 0;
    // 직계 추천 유저의 총 보유 비트코인이... 최소 패키지 구간보다 큰 유저 수만큼 7계층까지 계산한다.    
    const directRecommanders = await RecommandTree.findAll({ attributes: ['userID'], where: { recommanderUserID: userID } });
    if (directRecommanders.length > 0) {
        let idList: number[] = [];
        // 직계 추천  유저 리스트. 
        for (var i = 0; i < directRecommanders.length; ++i) {
            idList.push(Number(directRecommanders[i].userID));
        }
        
        // 최소 패키지
        const minPackage = dataManager.getPackageData(1);
        if ( minPackage == null )
        {
            logger.error('패키지 데이터가 없음');
            return 0;
        }

        // 직계 추천 유저 중에서, 최소 패키지 구간보다 큰 친구가 몇명인고?        
        var rawQuery = `select account.userID, account.depositedBitcoin, miningData.volume from Accounts account join MiningData miningData where account.userID = miningData.userID and account.userID in ( ${idList.join(',')} )`;
        const directRecommanderDatas = await sequelize.query(rawQuery,  { model: RecommandTree, mapToModel: true, raw: true, logging:false });
        var greaterThanMinimumRecommanderCount = 0;
        for ( var i = 0; i < directRecommanderDatas.length; ++i )
        {
            const data = directRecommanderDatas[i];
            if ( data.depositedBitcoin + data.volume >= minPackage.price)
            {
                greaterThanMinimumRecommanderCount++;
            }

            result += (data.depositedBitcoin * dataManager.getRecommanderHierarchyMiningRate(0));
        }
        
        global.console.log(`greaterThanMinimumRecommanderCount : ${greaterThanMinimumRecommanderCount}`);
        // 2명 이상 부터, 2대 추천 유저들의 속도를 받을 수 있다.
        for ( var hierarchy = 1 ; hierarchy < greaterThanMinimumRecommanderCount; ++hierarchy )
        {
            global.console.log(`hierarchy : ${hierarchy}`);
            // 그 다음 직계 유저들을 계산한다.
            rawQuery = 'select userID from RecommandTrees where recommanderUserID in (' + idList.join(',') + ')';
            const nextRecommanderUserList = await sequelize.query(rawQuery, { model: RecommandTree, mapToModel: true, raw: true, logging:false });
            if (nextRecommanderUserList.length > 0) {
                idList = [];
                
                for (var i = 0; i < nextRecommanderUserList.length; ++i) {
                    idList.push(Number(nextRecommanderUserList[i].userID));
                }

                var rawQuery = `select account.userID, account.depositedBitcoin, miningData.volume from Accounts account join MiningData miningData where account.userID = miningData.userID and account.userID in ( ${idList.join(',')} )`;
                const nextRecommanderDatas = await sequelize.query(rawQuery, { model: RecommandTree, mapToModel: true, raw: true, logging: false });
                for ( var i = 0; i < nextRecommanderDatas.length; ++i )
                {
                    const data = nextRecommanderDatas[i];        
                    const userPackage = dataManager.getPackageDataByBitcoinRange(data.depositedBitcoin + data.volume);
                    if ( userPackage )
                    {
                        result += (userPackage.price * dataManager.getRecommanderHierarchyMiningRate(hierarchy));
                    }
                }
            }
            else 
            {
                // 더이상 없어.
                break;
            }
        }
    }
    return result;
}

// 현재 시각을 기준으로, 채굴량 및 채굴 스피드, 그리고 남은 채굴량을 계산한다.
// 최대한 redis를 활용하여 계층 유저들간의 계산이 중복되지 않도록 한다.
export const GetMiningVolumeAndSpped = async(userID) => {
    const user : any = await GetUser(userID);
    if ( !user )
        return {
            volume : 0,
            speed : 0,
            updateTime : Date.now(),
            recommanderSpeed : 0,
            miningVolumePerDay : 0,
        };

    // 이제 패키지 구입이라는게 없다. 
    // 현재 채굴된 금액 + 입금 금액이 패키지 구간을 넘어서면.. 
    // 해당 패키지 구간의 스피드가 내 스피드임. 거기에 추천 계층 스피드를 더해야함

    // 현재 채굴량을 계산해보자
    const miningData = await MiningData.findOne({ where: { userID: userID } });

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
    var startMiningSpeed = dataManager.getDefaultMiningValue();
    
    //  업데이트 당시의 총 보유 비트코인
    var startTotalVolume = user.depositedBitcoin + miningData.volume;

    // 업데이트 당시에 내가 속한 패키지 구간
    var currentMiningPackage = dataManager.getPackageDataByBitcoinRange(startTotalVolume);

    // 업데이트 당시에 추천 유저로 부터 제공받는 패키지 채굴량 증가
    var startRecommanderPackageSpeed = await GetRecommanderSpeed(userID);

    var nextMiningPackage : any = null;
    if ( currentMiningPackage  )
    {
        startMiningSpeed += currentMiningPackage.volume;
        nextMiningPackage = dataManager.getPackageData(currentMiningPackage.index+1);
    }
    else
    {
        nextMiningPackage = dataManager.getPackageData(1);
    }
    
    startMiningSpeed += startRecommanderPackageSpeed;
    startMiningSpeed = startMiningSpeed / 100000000;

    // 다음 패키지 구간까지 남은 채굴량 
    var needNextPakcageVolume = nextMiningPackage ? nextMiningPackage.price - startTotalVolume : 9999999999;
    var remainMiningTimePerDay = updateNextTimeLA.getTime() - updateTimeLA.getTime();
    remainMiningTimePerDay = Math.min(now - updateTime, remainMiningTimePerDay);

    var alreadyMiningVolumePerDay = miningData.amountVolumeByUpdateTIme;
    var miningVolume = 0;

    var miningVolumePerDay = 0;
    // 계산 시간이 하루를 안지났을 떄, 하루 채굴량 계산을 하기 위함.
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

        if (now - updateTime < updateNextTimeLA.getTime() - updateTimeLA.getTime()) {
            miningVolumePerDay = miningData.amountVolumeByUpdateTIme + miningVolume;
        }
        else 
        {
            miningVolumePerDay = avaliableMiningVolume;
        }
    }

    return {
        volume : miningData.volume + miningVolume,
        speed : startMiningSpeed * 100000000,
        recommanderSpeed : startRecommanderPackageSpeed,
        miningVolumePerDay : miningVolumePerDay,
        updateTime : now
    }
}
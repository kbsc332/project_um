import { sequelize, or } from '../mariaDB/connector';
import { Transaction, QueryTypes, Op } from 'sequelize';
import { exec } from 'child_process'
import { tedis } from '../redis/connector';
import { Account, MiningData, RecommandTree, Package, Issue, HistoryLog } from '../mariaDB/tableSchema';
import { logger } from '@shared';
import { sha256 } from 'js-sha256';
import request from 'request-promise';
import { readdirSync } from 'fs';
import dataManager from '../dataManager/dataManager';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import * as utils from '../utility';

const authenticated = next => async (root, args, context, info) => {
    if (!context.accountID || !context.session) {
        throw new Error('invalidAuth');
    }

    var session = await tedis.get(context.accountID);

    if (session != context.session)
        throw new Error('invalidAuth');

    return next(root, args, context, info);
};
/*
accountDuplicateCheck : 중복 계정 검사
자세한 내용은 도큐먼트를 참고.
*/
const accountDuplicateCheck = async (account) => {
    try {
        const result = await Account.findOne({ where: { accountID: account } });
        console.log(result);
        if (result == null) {
            // 중복 되지 않음.
            return false;
        }
        return true;
    }
    catch (err) {
        logger.error(err.message, err);
        throw err;
    }
};

/*
recommandURL : userID를 추천하는 url을 생성한다.
자세한 내용은 도큐먼트를 참고.
*/
const recommandURL = async (userID) => {
    // 간단하게, base64 인코딩 하고, hex로 변환 시킨다.    
    return new Buffer(userID.toString()).toString('base64');
}

/*
signup : 회원 가입.
자세한 내용은 도큐먼트를 참고.
*/
const signup = async (account, password, email, phoneNumber, bitcoinDepositAddress, recommanderUserID) => {
    try {
        if (phoneNumber != null) {
            // 핸드폰 번호는 -를 없앤다.
            phoneNumber = phoneNumber.split('-').join('');
        }

        // 프로덕션에서는 인증 여부를 검사해야 한다.
        if (process.env.NODE_ENV === 'production') {
            if (phoneNumber == null && email == null) {
                throw new Error('invalidVerifyOperation');
            }

            if (phoneNumber) {
                const isVerify = await tedis.get('complateVerifyPhone_' + phoneNumber);
                if (!isVerify) {
                    throw new Error('invalidVerify');
                }
            }
        }

        // 핸드폰, 폰 넘버 중복 체크.
        var duplicateAccount = await Account.findOne({
            where:
                or(
                    { email: email },
                    { phoneNumber: phoneNumber }
                )

        });

        if (duplicateAccount) {
            if (duplicateAccount.email == email)
                throw new Error('duplicateEmail');
            else
                throw new Error('duplicatePhoneNumber');
        }

        // 추천 userID가 유요한지 확인하여야 한다.
        if (recommanderUserID != null) {
            if (await Account.findOne({ where: { userID: recommanderUserID } }) == null)
                throw new Error('invalidRecommanderUserID');
        }
        else {
            recommanderUserID = -1;
        }

        // transaction을 열어야 한다.
        // parameter 유효성 검사.
        const transaction = await sequelize.transaction();
        try {
            const crypPassword = sha256(password);
            // 새로운 account를 만든다. 
            // 관련 디비들을 모두 생성해내고
            // 추천 아이디가 있드면, 영향을 받는 모든 유저들의 mingingData를 재계산 해줘야한다.
            const newAccount = await Account.create({
                accountID: account,
                password: crypPassword,
                email: email,
                phoneNumber: phoneNumber,
                depositedBitcoin: 0,
                bitcoinDepositAddress: bitcoinDepositAddress,
                recommanderUserID: recommanderUserID
            }, { transaction: transaction });

            const newMiningData = await MiningData.create(
                {
                    userID: newAccount.userID,
                    volume: 0,
                    updateTime: Date.now()
                },
                { transaction: transaction }
            );

            const newRecommand = await RecommandTree.create({
                userID: newAccount.userID,
                recommanderUserID: newAccount.recommanderUserID,
                originalRecommanderUserID: newAccount.recommanderUserID
            }, { transaction: transaction });

            const newHistory = await HistoryLog.create({
                userID: newAccount.userID,
                updateTime: Date.now(),
                transaction: "",
                value: 0,
                type: 4
            }, { transaction: transaction });

            await transaction.commit();

            // 입금 주소 생성, userID를 모르므로.. 이때 해야함.
            try {
                const query = `${process.env.USE_DOCKER_WALLET ? "docker exec wallet ./wallet/wallet/wallet" : process.env.WALLET_PATH} getUserAddress ${newAccount.userID} ${process.env.WALLET_MASTER_ADDRESS}`
                const execResult = await exec(query, (error, stdout, stderr) => {
                    if (error != null) {
                        // 일단 실패.. 왜인지는 모름.
                        logger.info(stdout);
                    }
                    else {
                        //성공한것일 테니깐...
                        //db
                        newAccount.update({ companyBitcoinDepositAddress: stdout });
                    }
                });
            }
            catch
            {
                //에러가 나도 무시, 나중에 생성받으면 됨.
            }
            return {
                account: newAccount,
                miningData: newMiningData,
                recommandData: newRecommand
            };
        }
        catch (err) {
            transaction.rollback();
            logger.error(err.message, err);
            throw err;
        }
    }
    catch (err) {
        logger.error(err.message, err);
        throw err;
    }
};

const logout = async (accountID) => {
    tedis.del(accountID)
}

const getSixRandomNumber = function () {
    return Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
}

/*
login : 계정 여부를 확인하여 세션을 생성하여, redis에 저장한다.
자세한 내용은 도큐먼트를 참고.
*/
const login = async (account, password) => {
    try {
        const crypPassword = sha256(password);
        const accountResult = await Account.findOne({ attributes: ['userID', 'accountID', 'phoneNumber', 'bitcoinDepositAddress', 'depositedBitcoin', 'companyBitcoinDepositAddress'], where: { accountID: account, password: crypPassword } });
        if (accountResult == null)
            throw new Error('invalidAccount');

        const miningDataResult = await MiningData.findOne({ where: { userID: accountResult.userID } });
        const recommandResult = await RecommandTree.findOne({ where: { userID: accountResult.userID } });
        const sessionKey = 'sessionKey_' + accountResult.userID;
        const key = sha256(sessionKey + Date.now() + getSixRandomNumber());
        const mySpeed = await utils.GetMiningVolumeAndSpped(accountResult.userID);
        await tedis.setex(account, 60 * 60, key);

        return {
            account: accountResult,
            miningData: {
                volume: miningDataResult.volume,
                updateTime: miningDataResult.updateTime,
                speed: mySpeed.speed,
                amountVolumeByUpdateTIme: miningDataResult.amountVolumeByUpdateTIme,
                recommanderSpeed: mySpeed.recommanderSpeed,
                speedUp: miningDataResult.speedUp,
                speedUpExpirationTime: miningDataResult.speedUpExpirationTime,
            },
            recommandData: recommandResult,
            session: key
        };
    }
    catch (err) {
        logger.error(err.message, err);
        throw err;
    }
}

/*
requestChangePassword : 비밀번호를 변경한다.
자세한 내용은 도큐먼트를 참고.
*/
const requestChangePassword = async (userID, password) => {
    try {
        let account = await Account.findOne({ where: { userID: userID } });
        if (account == null)
            throw new Error('invalidAccount');

        const crypPassword = sha256(password);
        account = await account.update({ password: crypPassword });
        return true;
    }
    catch (err) {
        logger.error(err.message);
        throw err;
    }
}

/*
checkSession : redis에 저장된 session의 유효성을 검사한다.
자세한 내용은 도큐먼트를 참고.
*/
const checkSession = async (account, session) => {
    try {
        const key = await tedis.get(account);
        if (key && String(key).length > 0 && key == session) {
            return true;
        }
        else {
            return false;
        }
    }
    catch (err) {
        logger.error(err.message, err);
        throw err;
    }
}

/*
requestVerifyWithPhone : 입력받은 번호로, 인증번호를 생성하여 보낸다. 인증번호의 유효시간은 3분?
자세한 내용은 도큐먼트를 참고.
*/
const requestVerifyWithPhone = async (phoneNumber) => {
    try {

        if (phoneNumber.length == 0)
            throw new Error('invalidPhoneNumber');

        // 핸드폰 번호에서 -를 지워야함.
        phoneNumber = phoneNumber.split('-').join('');

        // 6자리 랜덤 인증 번호..
        var verifyNumber = getSixRandomNumber();

        // 문자를 전송하기 이전에, 레디스에 먼저 인증 코드를 넣어둔다.
        // 문자 보내고, 레디스에 입력 실패 할 수 도 있으니..
        // 3분의 시간.. 여분의 5초.
        await tedis.setex('verifyPhone_' + phoneNumber, 60 * 3 + 5, verifyNumber.toString());

        //**
        //* 이곳에 문자 전송 요청 API 코드 및 예외처리 코드를 추가 한다.
        //* 성공 시 반환형은 true로 반환할 것.
        //*/
        try {
            // NAVER SENS API.
            const url = `${process.env.SENS_PREPIX_URL}${process.env.SENS_SERVICE_ID}/messages`;
            const body = {
                type: 'SMS',
                from: process.env.SENS_FROM_NUMBER,
                to: [phoneNumber],
                content: `[Universe Mining] Verfication code: ${verifyNumber}`
            };

            const header = {
                'Content-Type': 'application/json',
                'x-ncp-auth-key': process.env.SENS_ACCESSKEY_ID,
                'x-ncp-service-secret': process.env.SENS_SECRET_KEY
            };

            const result = await request(url, {
                method: 'POST',
                json: true,
                headers: header,
                body: body
            });

            return true;
        }
        catch (err) {
            switch (err.statusCode) {
                case 202:
                    {
                        logger.error('SENS 요청 완료인데, 에러로 떨어짐. ');
                        break;
                    }
                case 400:
                    {
                        logger.error('SENS Bad Request');
                        break;
                    }
                case 401: // auth 에러
                    {
                        logger.error('SNES Auth error!');
                        break;
                    }
                case 403:
                    {
                        break;
                    }
                case 404:
                    {
                        break;
                    }
                case 429:
                    {
                        logger.error('SENS 너무 많은 요청을 함');
                        break;
                    }
                case 500:
                    {
                        break;
                    }
            }
            return false;
        }
        //**
        //* 이곳에 문자 전송 요청 API 코드 및 예외처리 끝.
        //*/
    }
    catch (err) {
        logger.error(err.message, err);
        return false;
    }
}

/*
verifyWithPhone : 해당 핸드폰 번호와 전달 받은 인증 번호로 인증을 시도한다..
자세한 내용은 도큐먼트를 참고.
*/
const verifyWithPhone = async (phoneNumber, verifyNumber) => {
    try {
        // 인증 번호는 6자리 이다.
        if (verifyNumber.length != 6) {
            return 'invalidVerifyNumber';
        }

        // 핸드폰 번호에서 -를 지워야함.
        phoneNumber = phoneNumber.split('-').join('');
        const number = await tedis.get('verifyPhone_' + phoneNumber);

        if (number == null) {
            // 해당 번호로 인증 요청을 한 적이 없다.
            return 'notRequested';
        }

        if (number != verifyNumber) {
            // 인증번호가 다르다.
            return 'notMatched';
        }
        await tedis.del('verifyPhone_' + phoneNumber);

        await tedis.setex('complateVerifyPhone_' + phoneNumber, 180, "true");
        return 'success';
    }
    catch (err) {
        logger.error(err.message, err);
        return 'failed';
    }
}

/*
requestDepositBitcoin : 비드코인 입금 요청.. 5일 이내, 유효시간을 둔다.
입금 요청액은 신경쓰지 않는다.. 바로바로 충전 시키고, 패키지 구매에서 보유 비트코인량을 체크한다.
자세한 내용은 도큐먼트를 참고.
*/
const requestDepositBitcoin = async (userID) => {
    try {
        // 5일 동안.. 입금 기록을 검사한다.
        const account = await Account.findOne({ where: { userID: userID } });
        const result = await tedis.zadd('deposit_request', { [userID]: Date.now() + 3600 * 24 * 5 * 1000 });

        return result
    }
    catch (err) {
        logger.error(err.message, err);
        throw new Error(err.message);
    }
};

/*
requestBuyPackage : 패키지 구매 요청..
자세한 내용은 도큐먼트를 참고.
*/
const requestBuyPackage = async (userID, packageID) => {
    try {
        const packageData = dataManager.getPackageData(packageID);
        if (!packageData)
            throw new Error('invalidPackage');

        const transaction = await sequelize.transaction();
        let account = await Account.findOne({ where: { userID: userID }, lock: Transaction.LOCK.UPDATE, transaction: transaction });
        if (account == null) {
            transaction.rollback();
            throw new Error('invalidAccount');
        }


        const packageTransactionID = Date.now().toString() + getSixRandomNumber();
        const packagePrice = packageData.price * 100000000;
        if (account.depositedBitcoin < packagePrice) {
            transaction.rollback();
            throw new Error('notEnoughPoint');
        }

        try {
            // 일단 패키지를 생성한다.
            const newPackageData = await Package.create(
                {
                    userID: userID,
                    speed: packageData.volume * 100000000,
                    packageTransactionID: packageTransactionID
                },
                { transaction: transaction }
            );

            // 채굴량 갱신 필요
            // 마이닝 데이터 잠금.
            let miningData = await MiningData.findOne({ where: { userID: userID }, lock: Transaction.LOCK.UPDATE, transaction: transaction });
            let mySpeed = await utils.GetMiningVolumeAndSpped(userID);

            const now = Date.now();
            let eventVolume = 0;
            if (miningData.speedUpExpirationTime != 0) {
                // 지금 시간이, 이벤트 시간보다 클 경우 이벤트 시간까지만 따로 계산 해줘야함.
                var eventTime = ((now - miningData.speedUpExpirationTime > 0 ? miningData.speedUpExpirationTime : now) - miningData.updateTime) / (3600 * 24 * 1000);
                eventVolume = eventTime * miningData.speedUp;
                console.log('event volume');
                console.log(eventVolume);
                console.log(eventTime);
                console.log(miningData.speedUp);
            }
            const time = (now - miningData.updateTime) / (3600 * 24 * 1000);
            const volume = (mySpeed.speed * time) + eventVolume;
            console.log(volume);

            miningData = await miningData.update({ updateTime: now, volume: volume + miningData.volume }, { transaction: transaction });
            account = await account.update({ depositedBitcoin: account.depositedBitcoin - packagePrice }, { transaction: transaction });

            logger.info('새로운 패키지 구매 : ' + packageTransactionID);
            await transaction.commit();

            return {
                account: account,
                miningData: {
                    volume: miningData.volume,
                    updateTime: miningData.updateTime,
                    speed: mySpeed.speed,
                    recommanderSpeed: mySpeed.recommanderSpeed,
                    amountVolumeByUpdateTIme: miningData.amountVolumeByUpdateTIme,
                    speedUp: miningData.speedUp,
                    speedUpExpirationTime: miningData.speedUpExpirationTime,
                },
                transactionID: newPackageData.packageTransactionID
            }
        }
        catch (err) {
            transaction.rollback();
            throw err;
        }
    }
    catch (err) {
        logger.error(err.message, err);
        throw err;
    }
};

// 직계 추천 유저 리스트를 가져온다.
// TODO, redis를 이용한 캐싱 필요.
const recommanders = async (userID) => {
    try {
        // 직계 유저 가지고 옵시다. 이 부분은 레디스에 캐싱 가능.
        const directRecommanders = await RecommandTree.findAll({ attributes: ['userID'], where: { recommanderUserID: userID } });
        var result: any = [];

        // 직계 추천 유저의 총 보유 비트코인이... 최소 패키지 구간보다 큰 유저 수만큼 7계층까지 계산한다.    
        if (directRecommanders.length > 0) {
            let idList: number[] = [];
            // 직계 추천  유저 리스트. 
            for (var i = 0; i < directRecommanders.length; ++i) {
                idList.push(Number(directRecommanders[i].userID));
            }

            // 최소 패키지
            const minPackage = dataManager.getPackageData(1);
            if (minPackage == null) {
                logger.error('패키지 데이터가 없음');
                return result;
            }

            // 직계 추천 유저 중에서, 최소 패키지 구간보다 큰 친구가 몇명인고?        
            // 해당 부분은 레디스 캐싱 불가.
            var rawQuery = `select account.userID, account.accountID, account.depositedBitcoin from Accounts account where account.userID in ( ${idList.join(',')} )`;
            const directRecommanderDatas = await sequelize.query(rawQuery, { model: Account, mapToModel: true, raw: true, logging: false });

            for (var i = 0; i < directRecommanderDatas.length; ++i) {
                // 해당 부분도 캐싱 가능.
                var hasRecommanders = await RecommandTree.findAll({ attributes: ['userID'], where: { recommanderUserID: directRecommanderDatas[i].userID } });
                result.push({
                    userID: directRecommanderDatas[i].userID,
                    accountID: directRecommanderDatas[i].accountID,
                    depositedBitcoin: directRecommanderDatas[i].depositedBitcoin,
                    hasRecommanders: hasRecommanders.length > 0
                })
            }
        }

        return result;
    }
    catch (err) {
        logger.error(err.message, err);
        throw err;
    }
}

/*
requestWithdrawalBitcoin : 출금 요청
관리자가 출금을 요청하기 전까지 예약해둬야한다.
자세한 내용은 도큐먼트를 참고.
*/
const requestWithdrawalBitcoin = async (userID, amount) => {
    try {
        await utils.RemoveUserCahce(userID);
        const transaction = await sequelize.transaction({ autocommit: false });
        try {
            let account = await Account.findOne({ where: { userID: userID }, lock: Transaction.LOCK.UPDATE, transaction: transaction });
            var miningData = await MiningData.findOne({ where: { userID: userID }, transaction: transaction });
            var miningVolume = await utils.GetMiningVolumeAndSpped(userID);

            if (account.depositedBitcoin + miningData.volume < amount) {
                throw new Error('notEnoughBitcoin');
            }

            // 수수료 계산 
            var fee = 0;
            if (amount < account.depositedBitcoin * 2)
                fee = amount * 0.3;

            logger.info(`출금 신청 : ${account.accountID}(${userID}) -> ${amount}, 요청 전 비트코인 : ${account.depositedBitcoin} 수수료 : ${fee}`);

            var leftBitcoin = account.depositedBitcoin;
            if (amount > account.depositedBitcoin) {
                miningData.volume -= (amount - account.depositedBitcoin);
                leftBitcoin = 0;
            }
            else {
                leftBitcoin = account.depositedBitcoin - amount;
            }

            account = await account.update(
                {
                    depositedBitcoin: leftBitcoin,
                    reserveWithdrawalBitcoin: account.reserveWithdrawalBitcoin + amount
                }, { transaction: transaction });

            miningData = await miningData.update({
                volume: miningVolume.volume,
                updateTime: miningVolume.updateTime,
                amountVolumeByUpdateTIme: miningVolume.miningVolumePerDay
            }, { transaction: transaction });

            const newHistory = await HistoryLog.create({
                userID: userID,
                transaction: '',
                value: amount - fee,
                fee: fee,
                updateTime: miningData.updateTime / 1000,
                type: 3
            }, { transaction: transaction });
            await transaction.commit();
            await utils.RemoveUserCahce(userID);
            console.log(account);
            logger.info(`출금 신청 완료 : ${account.accountID}(${userID}) -> ${amount}, 요청 후 비트코인 : ${account.depositedBitcoin} 수수료 : ${fee}`);
            miningVolume = await utils.GetMiningVolumeAndSpped(userID);

            console.log('현재');
            console.log(miningVolume);
            return {
                account: account,
                miningData: {
                    volume: miningData.volume,
                    updateTime: miningData.updateTime,
                    speed: miningVolume.speed,
                    recommanderSpeed: miningVolume.recommanderSpeed,
                    amountVolumeByUpdateTIme: miningData.amountVolumeByUpdateTIme,
                    speedUp: miningData.speedUp,
                    speedUpExpirationTime: miningData.speedUpExpirationTime,
                },
            };
        }
        catch (err) {
            transaction.rollback();
            throw err;
        }
    }
    catch (err) {
        logger.error(err.message, err);
        throw err;
    }

}

/*
requestBuyPackage : 패키지 구매 요청..
자세한 내용은 도큐먼트를 참고.
*/
const requestIssue = async (email, text) => {
    try {
        const newIssue = await Issue.create({
            email: email,
            text: text,
            date: Date.now()
        });

        return newIssue.issueID;
    }
    catch (err) {
        logger.error(err.message, err);
        throw new Error(err.message);
    }
}

const getIssueList = async (date) => {
    try {
        var targetDate = new Date(date).getTime();
        const newIssue = await Issue.findAll({ where: { date: { [Op.gt]: targetDate } } });

        return newIssue;
    }
    catch (err) {
        logger.error(err.message, err);
        throw new Error(err.message);
    }
}

const requestIssueComplete = async (issueID) => {
    try {
        const issue = await Issue.findOne({ where: { issueID: issueID } });
        if (!issue)
            return false;
        await issue.update({processComplete:true});
        return true;
    }
    catch (err) {
        logger.error(err.message, err);
        throw new Error(err.message);
    }
}

/*
findVerifyWithPhone : 핸드폰 번호를 통한 계정 찾기.
자세한 내용은 도큐먼트를 참고.
*/
const findVerifyWithPhone = async (phoneNumber, verifyNumber) => {
    try {
        var result: string = await verifyWithPhone(phoneNumber, verifyNumber);
        if (result == 'success') {
            const account = await Account.findOne({ where: { phoneNumber: phoneNumber } });
            if (account == null) {
                return null;
            }

            return account.accountID;
        }

        throw new Error(result);
    }
    catch (err) {
        console.log(err.message);
        throw err;
    }
}

/*
findPasswordWithEmail : 계정과 이메일로 비밀번호 찾기, 이메일 전송 기능 필요.
자세한 내용은 도큐먼트를 참고.
*/
const findPasswordWithEmail = async (accountID, email) => {

    try {
        let account = await Account.findOne({ where: { accountID: accountID, email: email } });
        if (account == null)
            return false;

        var tempPassword = getSixRandomNumber();
        const crypPassword = sha256(tempPassword.toString());
        account = await account.update({ password: crypPassword });

        var transporter = nodemailer.createTransport(smtpTransport({
            service: process.env.SMTP_SERVICE,
            host: process.env.SMTP_HOST,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        }));

        var mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: '[Universe Mining] New password!',
            text: `Your temporary password is '${tempPassword}'`
        };

        var result = await new Promise((resolve) => {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    logger.error(error);
                    resolve(false);
                }
                else {
                    console.log("send email")
                    resolve(true);
                }
            });
        });
        return result;
    }
    catch (err) {
        logger.error(err.message);
        throw err;
    }

}

/*
requestRoulette : 룰렛을 돌리자.
자세한 내용은 도큐먼트를 참고.
*/
const requestRoulette = async (userID) => {
    try {
        const account = await Account.findOne({ where: { userID: userID } });
        if (account == null) {
            throw new Error('invalidAccount');
        }

        // 업데이트 될 것이므로 . for update 락을 검.
        const transaction = await sequelize.transaction({ autocommit: false });
        let miningData = await MiningData.findOne({ where: { userID: account.userID }, lock: Transaction.LOCK.UPDATE, transaction: transaction });

        // 아직 레디스에 속도가 저장되어 있지 않다. 쌩으로 계산.
        var mySpeed = await utils.GetMiningVolumeAndSpped(account.userID);
        const now = mySpeed.updateTime;

        let eventVolume = 0;
        if (miningData.speedUpExpirationTime != 0) {
            transaction.rollback();

            throw new Error('alreadyEventUp');
        }

        let volume = mySpeed.volume + eventVolume;
        global.console.log(volume);
        if (volume < dataManager.getRouletteNeedBitcoin()) {
            transaction.rollback();

            throw new Error('notEnoughBitcoin');
        }

        // 룰렛 리워드 만큼의 랜덤..
        var minIndex = 1;
        var maxIndex = dataManager.getRouletteEventSize();
        var index = Math.floor(Math.random() * (maxIndex - minIndex)) + minIndex;
        volume -= dataManager.getRouletteNeedBitcoin();

        const rouletteData = dataManager.getRouletteEvent(index);
        if (rouletteData == null) {
            transaction.rollback();
            throw new Error('serverError');
        }

        miningData = await miningData.update({
            speed: mySpeed.speed,
            speedUp: rouletteData.speed,
            updateTime: now,
            volume: volume,
            speedUpExpirationTime: rouletteData.speed == 0 ? 0 : now + (3600 * 1000),
        }, { transaction: transaction });

        await transaction.commit();

        return {
            result: index,
            miningData: {
                volume: miningData.volume,
                updateTime: miningData.updateTime,
                speed: mySpeed.speed,
                speedUp: miningData.speedUp,
                speedUpExpirationTime: miningData.speedUpExpirationTime,
            }
        };
    }
    catch (err) {
        console.log(err.message);
        throw err;
    }
}

/*
requestDice : 룰렛을 돌리자.
자세한 내용은 도큐먼트를 참고.
*/
const requestDice = async (userID, even) => {
    try {
        const account = await Account.findOne({ where: { userID: userID } });
        if (account == null) {
            throw new Error('invalidAccount');
        }

        // 업데이트 될 것이므로 . for update 락을 검.
        const transaction = await sequelize.transaction({ autocommit: false });
        let miningData = await MiningData.findOne({ where: { userID: account.userID }, lock: Transaction.LOCK.UPDATE, transaction: transaction });

        // 아직 레디스에 속도가 저장되어 있지 않다. 쌩으로 계산.
        var mySpeed = await utils.GetMiningVolumeAndSpped(account.userID);
        const now = mySpeed.updateTime;

        let eventVolume = 0;
        if (miningData.speedUpExpirationTime != 0) {
            // 지금 시간이, 이벤트 시간보다 클 경우 이벤트 시간까지만 따로 계산 해줘야함.
            var eventTime = ((now - miningData.speedUpExpirationTime > 0 ? miningData.speedUpExpirationTime : now) - miningData.updateTime) / (3600 * 24 * 1000);
            eventVolume = eventTime * miningData.speedUp;
        }

        let volume = mySpeed.volume + eventVolume;

        if (volume < dataManager.getDiceNeedBitcoin()) {
            transaction.rollback();

            throw new Error('notEnoughBitcoin');
        }

        // 룰렛 리워드 만큼의 랜덤..
        var rate = Math.random();
        var win = dataManager.getDiceWinProbability() >= rate;

        volume -= dataManager.getDiceNeedBitcoin();

        if (win)
            volume += dataManager.getDiceRewardBitcoin();
        else
            even = !even;
        var minIndex = 1;

        var dice1 = Math.floor(Math.random() * (6 - 1)) + 1;
        var dice2 = Math.floor(Math.random() * (6 - 1)) + 1;
        if (even) {
            // 홀수 + 홀수 = 짝수
            // 짝수 + 짝수 = 짝수
            if (dice1 % 2 == 0) {
                // dice2도 짝수여야해
                if (dice2 % 2 == 1) {
                    dice2 += 1;
                }
            }
            else {
                //dice2는 홀수 여야해
                if (dice2 % 2 == 0) {
                    dice2 = dice2 == 6 ? 1 : dice2 + 1;
                }
            }
        }
        else {
            // 홀수 + 짝수 = 홀수
            // 짝수 + 홀수 = 홀수
            if (dice1 % 2 == 0) {
                // dice2는 홀수 여야해
                if (dice2 % 2 == 0) {
                    dice2 = dice2 == 6 ? 1 : dice2 + 1;
                }
            }
            else {
                //dice2는 짝수 여야해
                if (dice2 % 2 == 1) {
                    dice2 += 1;
                }
            }
        }

        logger.info('다이스 user : ' + userID + ', win : ' + win + ', volume : ' + volume);

        miningData = await miningData.update({
            speed: mySpeed.speed,
            updateTime: now,
            volume: volume,
        }, { transaction: transaction });

        await transaction.commit();

        return {
            result: win,
            dice1: dice1,
            dice2: dice2,
            miningData: {
                volume: miningData.volume,
                updateTime: miningData.updateTime,
                speed: mySpeed.speed,
                speedUp: miningData.speedUp,
                speedUpExpirationTime: miningData.speedUpExpirationTime,
            }
        };
    }
    catch (err) {
        console.log(err.message);
        throw err;
    }
}

/*
requestDepositHistory : 해당 유저의 비트코인 입금 기록을 가져온다. 비트코인 체인에 접속해야하므로.. 시간이 좀 걸린다.
자세한 내용은 도큐먼트를 참고.
*/
const requestDepositHistory = async (userID) => {
    try {
        const account = await Account.findOne({ attributes: ['companyBitcoinDepositAddress'], where: { userID: userID } });
        if (account == null)
            return null;

        var historyList = new Set();
        var results: any = []
        const historyData = await HistoryLog.findAll({ where: { userID: userID } });
        for (var i = 0; i < historyData.length; ++i) {
            historyList.add(historyData[i].transaction);
            results.push({
                time: historyData[i].updateTime,
                tx: historyData[i].transaction,
                value: historyData[i].value,
                type: historyData[i].type,
                fee: historyData[i].fee
            });
        }

        // 히스토리 로그에 없는 것이랑 비교하여 추가.

        const data = await utils.GetBitcoinAddressHistoryInNetwork(account.companyBitcoinDepositAddress);

        const transaction = await sequelize.transaction({ autocommit: false });
        for (var i = 0; i < data.history.length; ++i) {
            const d = data.history[i];
            if (historyList.has(d.tx) == false) {
                // 일단 입금 대기 타입으로 생성.
                const newHistory = await HistoryLog.create({ userID: userID, transaction: d.tx, value: d.value, blockHeight: d.height, updateTime: d.time, type: 0 }, { transaction: transaction });
                results.push({
                    time: newHistory.updateTime,
                    tx: newHistory.transaction,
                    value: newHistory.value,
                    fee: 0,
                    type: newHistory.type
                });

                await requestDepositBitcoin(userID);
            }
        }
        await transaction.commit();
        results.sort((a, b) => {
            return b.time - a.time;
        });

        return results;
    }
    catch (error) {
        console.log(error);
        logger.error(error);
    }
};

const requestWithdrawalHistory = async () => {
    try {
        const log = await HistoryLog.findAll({
            where: { type: 3 }
        })

        var result: any = []
        for (var i = 0; i < log.length; ++i) {
            var account: any = await utils.GetUser(log[i].userID);
            result.push({
                userID: log[i].userID,
                accountID: account.accountID,
                transaction: log[i].transaction,
                bitcoinDepositAddress: account.bitcoinDepositAddress,
                updateTime: log[i].updateTime,
                value: log[i].value,
                fee: log[i].fee,
                type: log[i].type,
            });
        }
        return result;
    }
    catch (error) {

    }
}

const requestHistory = async () => {
    try {
        const log = await HistoryLog.findAll({ limit: 100, order: [['index', 'DESC']] });

        var result: any = []
        for (var i = 0; i < log.length; ++i) {
            var account: any = await utils.GetUser(log[i].userID);
            result.push({
                index: log[i].index,
                userID: log[i].userID,
                accountID: account.accountID,
                transaction: log[i].transaction,
                updateTime: log[i].updateTime,
                value: log[i].value,
                type: log[i].type,
                blockHeight: log[i].blockHeight
            });
        }
        return result;
    }
    catch (error) {

    }
}

// startTime과 endTime은 hh:mm:ss 로 이루어 져 있어야 한다.
const setEventOpenTime = async (startTime, endTime) => {
    try {
        // 음.. 별다른 데이터 체크는 하지 않는다. admin에서만 보낼 것이므로. 

        var data = {
            startTime: startTime,
            endTime: endTime,
        }

        await tedis.set("event_open_time", JSON.stringify(data));
        return data;
    }
    catch
    {
        return {
            startTime: '00:00:00',
            endTime: '23:59:59'
        }
    }
}

const getEventOpenTime = async () => {
    try {
        var jsonData: any = await tedis.get("event_open_time");
        if (jsonData == null) {
            return {
                startTime: '00:00:00',
                endTime: '23:59:59'
            }
        }

        var jsonData = JSON.parse(jsonData);
        return jsonData;
    }
    catch
    {
        return {
            startTime: '00:00:00',
            endTime: '23:59:59'
        }
    }
}

export const resolvers = {
    Query: {
        login: (_, { account, password }) => login(account, password),
        checkSession: (_, { account, session }) => checkSession(account, session),
        recommandURL: (_, { userID }) => recommandURL(userID),
        accountDuplicateCheck: (_, { account }) => accountDuplicateCheck(account),

        // 채굴 속도를 구한다.
        miningSpeed: (_, { userID }) => utils.GetMiningVolumeAndSpped(userID),

        // 해당 유저를 추천한 유저 리스트를 가져온다
        recommanders: (_, { userID }) => recommanders(userID),

        // 핸드폰 인증을 통한 계정 찾기.. 
        findVerifyWithPhone: (_, { phoneNumber, verifyNumber }) => findVerifyWithPhone(phoneNumber, verifyNumber),

        // 비밀번호 찾기..
        findPasswordWithEmail: (_, { account, email }, context) => findPasswordWithEmail(account, email),

        requestDepositHistory: (_, { userID }) => requestDepositHistory(userID),

        requestWithdrawalHistory: (_, { }) => requestWithdrawalHistory(),
        requestHistory: (_, { }) => requestHistory(),
        getIssueList: (_, { date }) => getIssueList(date),

        getEventOpenTime: (_, { }) => getEventOpenTime(),
    },
    Mutation: {
        signup: (_, { account, password, email, phoneNumber, bitcoinDepositAddress, recommanderUserID }) => signup(account, password, email, phoneNumber, bitcoinDepositAddress, recommanderUserID),

        requestChangePassword: authenticated((_, { userID, password }, context) => requestChangePassword(userID, password)),
        // 핸드폰 인증 
        requestVerifyWithPhone: (_, { phoneNumber }) => requestVerifyWithPhone(phoneNumber),
        verifyWithPhone: (_, { phoneNumber, verifyNumber }) => verifyWithPhone(phoneNumber, verifyNumber),

        // 비트코인 입금 요청
        requestDepositBitcoin: (_, { userID }) => requestDepositBitcoin(userID),

        // 패키지 구매 요청
        requestBuyPackage: (_, { userID, packageID }) => requestBuyPackage(userID, packageID),

        // 비트코인 출금 요청
        requestWithdrawalBitcoin: authenticated((_, { userID, amount }) => requestWithdrawalBitcoin(userID, amount)),

        // 고객센터로 등록되는 문의
        requestIssue: (_, { email, text }) => requestIssue(email, text),

        // 특정 문의 완료 여부를 셋팅
        requestIssueComplete: (_, { issueID }) => requestIssueComplete(issueID),

        // 룰렛 이벤트 요청
        requestRoulette: authenticated((_, { userID }) => requestRoulette(userID)),

        // 다이스 이벤트 요청
        requestDice: authenticated((_, { userID, even }) => requestDice(userID, even)),

        setEventOpenTime: (_, { startTime, endTime }) => setEventOpenTime(startTime, endTime),
    }
};
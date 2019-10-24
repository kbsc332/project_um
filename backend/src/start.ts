import app from '@server';
import { logger } from '@shared';
import { sequelize } from './mariaDB/connector';
import { tedis, tedisOn } from './redis/connector';
import {
    setIntervalAsync,
    clearIntervalAsync 
  } from 'set-interval-async/dynamic';

import * as Utils from './utility';

// Start the server
const serverStart = () => {
    const port = Number(process.env.PORT || 4000);
    app.listen(port, () => {
        logger.info('UM server started on port: ' + port);
    });

    // 주기적인 이벤트 로직 처리 추가
    // 주기적으로 입금 요청이 된 유저들의 계좌를 추적하여 입금 확인을 처리한다.
    // 5분마다 한번씩..할까?
    const depositEventCheckTimeInterval = 1000 * 60 * 5;
    logger.info('UM Bitcoin Deposit Check Loop Start for ' + depositEventCheckTimeInterval / 1000 + ' sec');
    setIntervalAsync(async ()=>{
        const now = Date.now();
        // 현재 시간까지의 요청 삭제.
        tedis.zremrangebyscore('deposit_request', '0', now.toString());
        
        const users = await tedis.zrange('deposit_request', 0, -1);
        if ( users && users.length > 0 )
        {
            logger.info('Check Bitcoin deposit event user : ' + users.length);
            for ( var i = 0; i < users.length; ++i )
                await Utils.CheckNewBitcoinDepositEvent(Number(users[i]));
        }
        else
        {
            logger.info('Check Bitcoin deposit event user : 0');
        }
    }, depositEventCheckTimeInterval);
}

tedisOn(() => {
    logger.info('MariaDB 접속 시도..')
    sequelize.sync().then(function () {
        logger.info('MariaDB 접속 성공');
        logger.info('MariaDB Host : ' + sequelize.options.host);
        logger.info('MariaDB Port : ' + sequelize.options.port);
        
        serverStart();
    }).catch(err => {
        logger.error(err);
        logger.info('MariaDB 접속 에러, MariaDB 설정 확인 필요.');
        process.exit();
    });
});
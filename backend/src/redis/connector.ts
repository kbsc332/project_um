import { Tedis } from 'tedis';
import { logger } from '@shared';

logger.info('Redis 접속 시도..');
export const tedis = new Tedis({
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : undefined,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD || undefined
});

const onCallback = () => {
    logger.info('Redis 접속 성공');
    logger.info('Redis Host : ' + process.env.REDIS_HOST);
    logger.info('Redis Post : ' + process.env.REDIS_PORT);
};
tedis.on('connect', onCallback);
tedis.on('error', (error) => {
    logger.error(error);
    logger.info('Redis 접속 에러, Redis 설정 확인 필요.');
    process.exit();
})

export const tedisOn= ( callback ) => {
    tedis.on('connect', () => {
        onCallback();
        callback();
    })
};
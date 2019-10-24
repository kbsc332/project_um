import { Sequelize } from 'sequelize-typescript';
import { Account, Package, RecommandTree, MiningData, Issue, HistoryLog } from './tableSchema';

export const sequelize = new Sequelize('um',
        process.env.MARIADB_USERNAME || 'root',
        process.env.MARIADB_PASSWORD || 'password',
        {
            host : process.env.MARIADB_HOST || 'localhost',
            port : process.env.MARIADB_PORT ? Number(process.env.MARIADB_PORT) : 3306,
            dialect: 'mariadb',
            define:{
                charset:'utf8'
            },
            logging: process.env.NODE_ENV === 'production' ? false : true,
            benchmark : process.env.MARIADB_BENCHMARK ? Boolean(process.env.MARIADB_BENCHMARK) : false
        }
    );

sequelize.addModels([Account, Package, RecommandTree, MiningData, Issue, HistoryLog]);

export const or : any = Sequelize.or;
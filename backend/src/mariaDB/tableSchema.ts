import { Table, Column, AllowNull,ForeignKey, AutoIncrement,Unique, Comment, PrimaryKey, Model, DataType, HasMany, Default } from 'sequelize-typescript';

@Table
export class Account extends Model<Account> {
    @Unique
    @AutoIncrement
    @PrimaryKey
    @Column({
        type: DataType.INTEGER
    })
    userID!: number;

    @AllowNull(false)
    @Unique
    @PrimaryKey
    @Column
    accountID!: string;
    
    @AllowNull(false)
    @Comment('sha256으로 암호화 된 패스워드')
    @Column
    password!: string;

    @AllowNull(false)
    @Column
    email!: string;

    @AllowNull(true)
    @Unique
    @PrimaryKey
    @Column
    phoneNumber!: string;

    @Default(0)
    @Column({
        type: DataType.BIGINT
    })
    depositedBitcoin!: number;

    @Default(0)
    @Column({
        type: DataType.BIGINT
    })
    reserveWithdrawalBitcoin!: number;

    @AllowNull(false)
    @Column
    bitcoinDepositAddress!: string;

    @AllowNull(true)
    @Comment('유저의 입금 전용 비트코인 주소')
    @Column
    companyBitcoinDepositAddress!: string;

    @AllowNull(true)
    @Column
    recommanderUserID!: number;

    @Default(0)
    @Comment( '출금 요청 회수')
    @Column({
        type: DataType.INTEGER
    })
    withdrawalCount!: number;

    @Default(false)
    @Comment('이메일 이용한 인증 완료 여부.')
    @Column
    emailAuthenticated!: boolean;
}

// 패키즈는 이제 구매 형태가 아니므로 쓰이지 않는다.
// 추후, 시스템 변경을 위하여 남겨 둠.
@Table
export class Package extends Model<Package> {
    @Unique
    @AutoIncrement
    @PrimaryKey
    @Column({
        type: DataType.INTEGER
    })
    packageID!: number;

    @PrimaryKey
    @ForeignKey(() => Account )
    @Column
    userID!: number;

    @Default(1)
    @Column
    level!: number;

    @Column
    packageTransactionID!: string;

    @Column
    speed!: number;

    @Column
    price!: number;
}

@Table
export class HistoryLog extends Model<HistoryLog> {
    @Unique
    @AutoIncrement
    @PrimaryKey
    @Column({
        type: DataType.INTEGER
    })
    index!: number;

    @PrimaryKey
    @AllowNull(false)
    @Column
    userID!: number;

    @AllowNull(false)
    @Column
    transaction! : string;

    @Column
    blockHeight!: number;
    
    @AllowNull(false)
    @Column
    value!: number;

    @Default(0)
    @Column
    fee!: number;

    @Comment('0: 입금, 1: 지급완료, 2: 소비, 3: 출금, 4: 회원 가입')
    @AllowNull(false)
    @Column
    type!: number;

    @Column({
        type: DataType.BIGINT
    })
    updateTime!: number;
}

@Table
export class RecommandTree extends Model<RecommandTree> {
    @ForeignKey(() => Account )
    @Unique
    @PrimaryKey
    @Column
    userID!: string;

    @AllowNull(false)
    @PrimaryKey
    @Column
    recommanderUserID!: number;

    @Column
    originalRecommanderUserID!: number;
}

@Table
export class MiningData extends Model<MiningData> {
    @ForeignKey(() => Account )
    @Unique
    @PrimaryKey
    @Column
    userID!: number;

    @Column({
        type: DataType.DOUBLE
    })
    volume!: number;

    @Column({
        type: DataType.BIGINT
    })
    updateTime!: number;

    @Comment('업데이트 시간 기준, 그날 채굴한 양')
    @Default(0)
    @Column
    amountVolumeByUpdateTIme!: number;

    @Default(0)
    @Column({
        type: DataType.BIGINT
    })
    speedUp!: number;

    @Default(0)
    @Column({
        type: DataType.BIGINT
    })
    speedUpExpirationTime!: number;

}

@Table
export class Issue extends Model<Issue> {
    @Unique
    @AutoIncrement
    @PrimaryKey
    @Column({
        type: DataType.INTEGER
    })
    issueID!: number;

    @Column
    email!: string;

    @Column
    text!: string;

    @PrimaryKey
    @Column({
        type: DataType.BIGINT
    })
    date!: number;

    @Default(false)
    @Column
    processComplete!: boolean;
}


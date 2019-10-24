export const schema = `
scalar GraphQLLong

type AccountBrief
{
  userID: Int!
  accountID: String!
  phoneNumber: String!
  bitcoinDepositAddress: String!
  depositedBitcoin: GraphQLLong
  companyBitcoinDepositAddress: String
}

type MiningData
{
  volume: Float
  speed: GraphQLLong
  recommanderSpeed : GraphQLLong
  speedUp: Int
  amountVolumeByUpdateTIme : GraphQLLong
  speedUpExpirationTime : GraphQLLong
  updateTime: GraphQLLong
}

type RecommandData
{
  recommanderUserID : Int
  originalRecommanderUserID : Int
}

type PackageData
{
  packageID: Int
  userID: Int
  level: Int
  packageTransactionID: String
  speed: Int
}

type AccountAll
{
  account: AccountBrief
  miningData: MiningData
  recommandData: RecommandData
}

type Login
{
  account: AccountBrief
  miningData: MiningData
  recommandData: RecommandData
  session: String
}

type PackageBuyResult
{
  account: AccountBrief
  miningData: MiningData
  transactionID: String
}

type Issue
{
  issueID: Int
  email: String
  text: String
  date: GraphQLLong
  processComplete: Boolean
}

type RouletteEventResult
{
  result: Int
  miningData: MiningData
}

type DiceEventResult
{
  result: Boolean
  dice1: Int
  dice2: Int
  miningData: MiningData
}

type RecommanderSpeedData
{
  userID : Int
  accountID : String
  depositedBitcoin: Int
  hasRecommanders : Boolean
}

type DepositHistory
{
  tx : String
  time : GraphQLLong
  value : Int
  type : Int
  fee : Int
}

type MiningSpeed
{
  speed: GraphQLLong
  volume: GraphQLLong
}

type History
{
  index : Int
  userID : Int
  accountID : String
  transaction : String
  bitcoinDepositAddress: String
  blockHeight: Int
  updateTime : GraphQLLong
  value : Int
  fee : Int
  type : Int
}

type Withdrawal
{
  account: AccountBrief
  miningData: MiningData
}

type EventTimeData
{
  startTime: String
  endTime: String
}

type Query {
  login(account: String!, password:String!): Login
  checkSession(account:String!, session:String!): Boolean
  recommandURL(userID: Int) : String
  accountDuplicateCheck(account: String!): Boolean
  miningSpeed(userID: Int): MiningSpeed

  findVerifyWithPhone(phoneNumber: String!, verifyNumber: String!): String
  findPasswordWithEmail(account: String!, email: String): Boolean
  recommanders(userID: Int): [RecommanderSpeedData]
  requestDepositHistory(userID: Int): [DepositHistory]
  requestWithdrawalHistory : [History]
  requestHistory : [History]
  getIssueList(date: GraphQLLong): [Issue]
  getEventOpenTime : EventTimeData
}

type Mutation{
  signup(account: String!, password:String!, email:String, phoneNumber: String, bitcoinDepositAddress:String!, recommanderUserID: Int ): AccountAll
  requestChangePassword( userID: Int!, password:String!) : Boolean
  requestVerifyWithPhone(phoneNumber: String!): Boolean
  verifyWithPhone(phoneNumber: String!, verifyNumber: String!): String

  requestDepositBitcoin(userID: Int!) : Int
  requestBuyPackage( userID: Int!, packageID : Int! ) : PackageBuyResult
  requestWithdrawalBitcoin( userID: Int!, amount:Int! ) : Withdrawal

  requestIssue(email:String!, text:String) : Int
  requestIssueComplete(issueID: Int! ) : Boolean
  requestRoulette(userID: Int!): RouletteEventResult
  requestDice(userID: Int!, even: Boolean ): DiceEventResult

  setEventOpenTime(startTime:String!, endTime:String!): EventTimeData
}`
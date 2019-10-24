import gql from 'graphql-tag';

// account, password 정보가 맞으면 해당 계정의 정보를 불러옴
export const LoginQuery = gql`
  query login($account: String!, $password: String!) {
    login(account: $account, password: $password){
      account {
          userID
          accountID
          phoneNumber
          bitcoinDepositAddress
          depositedBitcoin
          companyBitcoinDepositAddress
      }
      miningData
      {
          volume
          updateTime
          speed
          amountVolumeByUpdateTIme
          recommanderSpeed
          speedUp
          speedUpExpirationTime
      }
      recommandData
      {
        recommanderUserID
        originalRecommanderUserID
      }
      session
    } 
  }
`;

export const CheckSessionQuery = gql`
  query checkSession($account: String!, $session: String!) {
    checkSession(account:$account, session:$session)
  }
`;

export const DuplicateCheckQuery = gql`
  query accountDuplicateCheck($account: String!) {
    accountDuplicateCheck(account: $account)
  }
`;

export const SignUpMutation = gql`
    mutation signup(
    $account: String!
    $password: String!
    $email: String
    $phoneNumber: String
    $bitcoinDepositAddress: String!
    $recommanderUserID: Int
    )
    {
        signup( account:$account, password:$password, 
        email:$email, phoneNumber:$phoneNumber, 
        bitcoinDepositAddress:$bitcoinDepositAddress, recommanderUserID:$recommanderUserID )
        {
            account {
                userID
                bitcoinDepositAddress
                depositedBitcoin
                companyBitcoinDepositAddress
            }
            miningData
            {
                volume
                updateTime
                amountVolumeByUpdateTIme
                speedUp
            recommanderSpeed
                speedUpExpirationTime
            }
            recommandData
            {
                recommanderUserID
                originalRecommanderUserID
            }
        }
    }    
`;

export const RequestIssueMutation = gql`
  mutation requestIssue(
  $email: String!
  $text: String!
  )
  {
    requestIssue( email:$email, text:$text )
  }    
`;

export const RequestBuyPackageMutation = gql`
  mutation requestBuyPackage(
  $userID: Int!
  $packageID: Int!
  )
  {
    requestBuyPackage( userID:$userID, packageID:$packageID)
    {
      account 
      {
                userID
                bitcoinDepositAddress
                depositedBitcoin
                companyBitcoinDepositAddress
            }
            miningData
            {
                volume
                updateTime
                speed
                amountVolumeByUpdateTIme
                recommanderSpeed
                speedUp
                speedUpExpirationTime
            }
      transactionID
    }
  }
`;

export const RequestVerifyWithPhoneMutation = gql`
  mutation requestVerifyWithPhone($phoneNumber: String!){
    requestVerifyWithPhone( phoneNumber:$phoneNumber)
  }
`;

export const VerifyWithPhoneMutation = gql`
mutation verifyWithPhone($phoneNumber: String!, $verifyNumber: String!){
  verifyWithPhone(phoneNumber:$phoneNumber, verifyNumber:$verifyNumber)
}
`;

export const FindVerifyWithPhoneQuery = gql`
query findVerifyWithPhone($phoneNumber: String!, $verifyNumber: String!){
  findVerifyWithPhone(phoneNumber:$phoneNumber, verifyNumber:$verifyNumber)
}
`;

export const FindPasswordWithEmailQuery = gql`
query findPasswordWithEmail($account: String!, $email: String!){
  findPasswordWithEmail(account:$account, email:$email)
}
`;

export const RequestRouletteMutation = gql`
mutation requestRoulette($userID: Int! ) {
  requestRoulette(userID:$userID){
    result
    miningData
    {
        volume
        updateTime
        speed
        recommanderSpeed
        amountVolumeByUpdateTIme
        speedUp
        speedUpExpirationTime
    }
  }
}
`;

export const RequestDiceMutation = gql`
mutation requestDice($userID: Int!, $even: Boolean! ) {
  requestDice(userID:$userID, even:$even){
    result
    dice1
    dice2
    miningData
    {
        volume
        updateTime
        speed
        amountVolumeByUpdateTIme
        recommanderSpeed
        speedUp
        speedUpExpirationTime
    }
  }
}
`;

export const RecommandersQuery = gql`
query recommanders($userID: Int!){
  recommanders(userID:$userID)
  {
    userID
    accountID
    depositedBitcoin
    hasRecommanders
  }
}
`;
export const RequestDepositHistoryQuery = gql`
query requestDepositHistory($userID: Int!){
  requestDepositHistory(userID:$userID)
  {
    tx
    time
    value
    type
  }
}
`;

export const RequestWithdrawalBitcoinMutation = gql`
mutation requestWithdrawalBitcoin($userID: Int!, $amount:Int!){
  requestWithdrawalBitcoin(userID:$userID, amount:$amount)
  {
    account 
      {
                userID
                bitcoinDepositAddress
                depositedBitcoin
                companyBitcoinDepositAddress
            }
            miningData
            {
                volume
                updateTime
                speed
                amountVolumeByUpdateTIme
                recommanderSpeed
                speedUp
                speedUpExpirationTime
            }
  }
}
`;

export const RequestChangePasswordMutation = gql`
mutation requestChangePassword($userID: Int!, $password:String!){
  requestChangePassword(userID:$userID, password:$password)
}
`;
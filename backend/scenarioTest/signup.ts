import { request } from "graphql-request";
import { SSL_OP_EPHEMERAL_RSA } from "constants";

function delay(ms: number) {
  return new Promise( resolve => setTimeout(resolve, ms) );
}

const singup = async (account, password, recommanderUserID ) => {
  const query = `mutation {
  signup(account: "${account}", password: "${password}", bitcoinDepositAddress:"1234", recommanderUserID: ${recommanderUserID}, phoneNumber: "${account}", email:"${account}")
  {
    account{
      userID
      accountID
      bitcoinDepositAddress
    }
    miningData{
      volume
      updateTime
    }
    recommandData
    {
      recommanderUserID
      originalRecommanderUserID
    }
  }
}
  `;

  var data = await request("http://127.0.0.1:4000/api", query);
  console.log(data.signup.account.userID);
  return data.signup.account.userID;
};

const buyPackage = async (userID) => {
  var index = Math.floor(Math.random() * (3 - 1)) + 1
  index = 3;
  const query = `mutation {
    requestBuyPackage(userID: ${Number(userID)}, packageID: ${Number(index)})
    {
      account{
        userID
      }
    }
  }
    `;
  
    var data = await request("http://127.0.0.1:4000/api", query);
}

const signup_test = async () => {
  var id = 10;
  var rID = 3;
  for ( var k = 0; k < 10; ++k )
  {
    var uid = await singup("test_"+(id++), "1234", 1);
    for ( var a in [1,2 ] )
    {
      var uuid = await singup("test_"+(id++), "1234", uid);
      for ( var b in [1, 2] )
      {
        var uuyid = await singup("test_" + (id++), "1234", uuid);

        for (var zc in [1, 2]) {
          var uuyyid = await singup("test_" + (id++), "1234", uuyid);
          for (var zd in [1, 2]) {
            var uuyyiyd = await singup("test_" + (id++), "1234", uuyyid);
          }
          for (var ze in [1, 2]) {
            var uuyyiyd = await singup("test_" + (id++), "1234", uuyyiyd);
          }
        }
      }
    }
  }
}
signup_test();
#include <bitcoin/bitcoin.hpp>
#include <bitcoin/client.hpp>

#include <iostream>
#include <string>
#include <set>
#include <map>

using namespace bc;

bool isTestNet = false;

std::string GetServerIP()
{
	if ( isTestNet )
	{
		return "tcp://testnet1.libbitcoin.net:19091";
	}
	else
	{
		return "tcp://mainnet.libbitcoin.net:9091";
	}
}

inline void Print( const char* text, ... )
{
	const int BUFFERSIZE = 1024 * 100;
	char buffer[BUFFERSIZE] = { 0 };
	
	va_list ap;
	va_start( ap, text );
	vsnprintf( buffer, BUFFERSIZE, text, ap );
	buffer[BUFFERSIZE - 1] = 0;
	va_end( ap );
	
	printf( "%s \n", buffer );
}


data_chunk CreateSeedWithPseudo()
{
	data_chunk seedChunk( 16 );
	pseudo_random_fill( seedChunk );

	auto hex = encode_base16( seedChunk );
	Print("Create Pseudo Seed ");
	Print( hex.c_str() );

	return seedChunk;
}

std::vector<std::string> CreateWalletKeyword( const data_chunk& seed )
{
	wallet::word_list writtenWord = wallet::create_mnemonic( seed );

	if( wallet::validate_mnemonic( writtenWord ) )
	{

		Print( "Create mnmonic word!" );
		for( size_t i = 0; i < writtenWord.size(); ++i )
		{
			printf("%s ", writtenWord[i].c_str() );
		}
		printf( "\n\n" );

		return writtenWord;
	}

	Print( "Cannot create to mnmonic word" );
	return std::vector<std::string>();
}

wallet::hd_private CreateMasterPrivateKey( const data_chunk& seed, uint64_t netType = wallet::hd_private::testnet )
{
	wallet::hd_private privateKey( seed, netType );

	wallet::hd_key keys = privateKey.to_hd_key();

	std::string encodedPrivateKey = encode_base16( keys );

	Print( "Master Private Key : %s", privateKey.encoded().c_str() );
	Print( "Master Private Key hex : %s", encodedPrivateKey.c_str() );

	return privateKey;
}

wallet::hd_public  CreateMasterPublicKey( const wallet::hd_private& privateKey )
{
	wallet::hd_public publicKey = privateKey.to_public();

	Print( "Master Public Key : %s", publicKey.encoded().c_str() );
	wallet::payment_address address = wallet::ec_public( publicKey.point() ).to_payment_address(0x6f);
	Print( "Master Payment Address : %s", address.encoded().c_str() );

	return publicKey;
}

wallet::payment_address CreateChildKeyAndAddress( const wallet::hd_private& masterPrivateKey, int index = 1)
{
	wallet::hd_private childPrivateKey = masterPrivateKey.derive_private( index );
	wallet::hd_public childPublicKey = masterPrivateKey.derive_public( index );
	//Print( "Child Private Key : %s", childPrivateKey.encoded().c_str() );
	//Print( "Child Public Key : %s", childPublicKey.encoded().c_str() );
	//Print( "Child Public Key : %s", masterPrivateKey.to_public().derive_public( index ).encoded().c_str() );

	wallet::payment_address address;
	if ( isTestNet )
		address = wallet::ec_public( childPublicKey.point() ).to_payment_address( 0x6f );
	else
		address = wallet::ec_public( childPublicKey.point() ).to_payment_address();

	//Print( "Child Payment Address : %s", address.encoded().c_str() );

	return address;
}


int main(int argc, const char* argv[])
{
	if( argc == 1 )
	{
		printf("help");
		return EXIT_FAILURE;
	}

	std::string command;
	std::string param;
	std::string masterPrivateKey;
	for( int i = 1; i < argc; ++i )
	{
		std::string value = argv[i];
		if( value == "createMasterAddress" )
		{
			if( command.empty() == false )
			{
				Print( "invalidCommand" );
				return EXIT_FAILURE;
			}

			command = value;
		}
		else if( value == "getUserAddress" )
		{
			if( command.empty() == false )
			{
				Print( "invalidCommand" );
				return EXIT_FAILURE;
			}

			command = value;

			if( i + 2 >= argc )
			{
				Print( "invalidParam" );
				return EXIT_FAILURE;
			}

			param = argv[i + 1];
			masterPrivateKey = argv[i + 2];
			i+=2;
			continue;
		}
		else if( value == "getHistory" )
		{
			if( command.empty() == false )
			{
				Print( "invalidCommand" );
				return EXIT_FAILURE;
			}
			command = value;

			if (i + 1 >= argc)
			{
				Print( "invalidParam" );
				return EXIT_FAILURE;
			}
			
			param = argv[i + 1];
			i++;
			continue;
		}
		else if( value == "testnet" )
		{
			isTestNet = true;
		}
	}
	int returnCode = EXIT_SUCCESS;
	if ( command == "createMasterAddress" )
	{
		auto seed = CreateSeedWithPseudo();
		CreateWalletKeyword(seed);
		auto privateKey = CreateMasterPrivateKey(seed, isTestNet ? wallet::hd_private::testnet : wallet::hd_private::mainnet );
		CreateMasterPublicKey(privateKey);
	}
	else if( command == "getUserAddress" )
	{
		wallet::hd_private privateKey( masterPrivateKey, isTestNet ? wallet::hd_private::testnet : wallet::hd_private::mainnet );

		int userIndex = atoi( param.c_str() );

		auto address = CreateChildKeyAndAddress( privateKey, userIndex );
		printf( "%s", address.encoded().c_str() );
	}
	else if ( command == "getHistory" )
	{
		bc::client::obelisk_client client(8, 3);
		wallet::payment_address masterAddress(param);
		std::vector<chain::history> blocks;
		if (client.connect(config::endpoint(GetServerIP())))
		{
			client.blockchain_fetch_history3(
				[&returnCode](const code &ec) 
				{ 
					returnCode = EXIT_FAILURE;
				}, 
				[&blocks](const chain::history::list &list) 
				{
					for (const auto &row : list)
					{
						if ( row.spend.hash() == null_hash )
						{
							blocks.push_back(row);
						}
					}
				}, masterAddress
			);
			client.wait();

			for( const auto& block : blocks )
			{
				client.blockchain_fetch_block_header( [&block](const code& ec) {
					//std::cout << "0" << "," << block.output.hash() << "," << block.value << ",";
				}, [&block]( const chain::header& header){
					std::cout << header.timestamp();
					std::cout << ",";
					std::cout << libbitcoin::config::hash256(block.output.hash());
					std::cout << ",";
					std::cout << block.value;
					std::cout << ",";
					std::cout << block.output_height;
					std::cout << ",";
				}, block.output_height);
				client.wait();
			}
			client.blockchain_fetch_last_height([](const code &ec) {  },
												[](size_t blockHeight) {
													std::cout << blockHeight;
												});
			client.wait();
		}
		else
		{
			printf("timeout");
			returnCode = EXIT_FAILURE;
		}
	}

	return returnCode;
}
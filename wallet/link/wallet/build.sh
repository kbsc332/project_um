g++ -std=c++11 -o wallet main.cpp $(pkg-config --cflags libbitcoin --libs libbitcoin libbitcoin-client libbitcoin-protocol)
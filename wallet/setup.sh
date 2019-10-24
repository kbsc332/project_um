apt-get install git gcc make libpcre3-dev build-essential autoconf automake libtool g++ wget pkg-config libboost-all-dev -y

wget https://github.com/zeromq/libzmq/releases/download/v4.3.2/zeromq-4.3.2.tar.gz
tar --extract --file zeromq-4.3.2.tar.gz && cd zeromq-4.3.2 && ./autogen.sh && ./configure && make && make install && ldconfig

git clone https://github.com/libbitcoin/secp256k1.git && cd secp256k1 && ./autogen.sh && ./configure --enable-module-recovery && make && make install

git clone https://github.com/libbitcoin/libbitcoin.git \
&& cd libbitcoin \
&& git checkout -b version3 origin/version3 \
&& ./autogen.sh && ./configure --with-pkgconfigdir=/usr/local/lib/pkgconfig && make && make install && ldconfig

git clone https://github.com/libbitcoin/libbitcoin-protocol.git \
&& cd libbitcoin-protocol \
&& git checkout -b version3 origin/version3 \
&& ./autogen.sh && ./configure --with-pkgconfigdir=/usr/local/lib/pkgconfig && make && make install && ldconfig

git clone https://github.com/libbitcoin/libbitcoin-client.git \
&& cd libbitcoin-client \
&& git checkout -b version3 origin/version3 \
&& ./autogen.sh && ./configure --with-pkgconfigdir=/usr/local/lib/pkgconfig && make && make install && ldconfig
from ubuntu:18.04

RUN apt-get update --fix-missing

RUN apt-get install git gcc make libpcre3-dev build-essential autoconf automake libtool g++ wget pkg-config libboost-all-dev -y
RUN apt-get install gdb gdbserver openssh-server -y
RUN apt-get install zip rsync -y

RUN wget https://github.com/zeromq/libzmq/releases/download/v4.3.2/zeromq-4.3.2.tar.gz
RUN tar --extract --file zeromq-4.3.2.tar.gz && cd zeromq-4.3.2 && ./autogen.sh && ./configure && make && make install && ldconfig

RUN git clone https://github.com/libbitcoin/secp256k1.git && cd secp256k1 && ./autogen.sh && ./configure --enable-module-recovery && make && make install 

RUN git clone https://github.com/libbitcoin/libbitcoin.git \
&& cd libbitcoin \
&& git checkout -b version3 origin/version3 \
&& ./autogen.sh && ./configure --with-pkgconfigdir=/usr/local/lib/pkgconfig && make && make install && ldconfig

RUN git clone https://github.com/libbitcoin/libbitcoin-protocol.git \
&& cd libbitcoin-protocol \
&& git checkout -b version3 origin/version3 \
&& ./autogen.sh && ./configure --with-pkgconfigdir=/usr/local/lib/pkgconfig && make && make install && ldconfig

RUN git clone https://github.com/libbitcoin/libbitcoin-client.git \
&& cd libbitcoin-client \
&& git checkout -b version3 origin/version3 \
&& ./autogen.sh && ./configure --with-pkgconfigdir=/usr/local/lib/pkgconfig && make && make install && ldconfig

RUN mkdir /var/run/sshd \
&& sed  -i "/^[^#]*Port/ s/.*/#&/"  /etc/ssh/sshd_config \
&& sed  -i "/^[^#]*UsePAM/ s/.*/#&/"  /etc/ssh/sshd_config \
&& sed  -i "/^[^#]*PermitRootLogin/ s/.*/#&/"  /etc/ssh/sshd_config \
&& echo "PermitRootLogin yes" >> /etc/ssh/sshd_config \
&& echo "UsePAM no" >> /etc/ssh/sshd_config \
&& echo "Port 2000" >> /etc/ssh/sshd_config \
&& echo 'root:12345678' | chpasswd

RUN touch /start.sh \
 && chmod 777 /start.sh \
 && echo "/usr/sbin/sshd -D &" >> /start.sh
 RUN /usr/sbin/sshd -D & 
 RUN bash
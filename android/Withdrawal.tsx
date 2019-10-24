import React, { useState, useEffect } from 'react';
import { Text, View, Image,  TouchableOpacity, CheckBox, Dimensions, TextInput, Keyboard, AppState, StatusBar, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Manager } from './Manager';
import { PackageCard } from './PackageCard';
import { RequestDepositHistoryQuery, RequestWithdrawalBitcoinMutation } from './apollo/query';
import { Client } from './apollo/client';

const scaleFactor = Dimensions.get('window').width / 360;

export class Withdrawal extends React.Component {
    constructor(props) {
        super(props);

        // 폰트로딩이 완료되면 true로 변경
        this.state = {
            btc: '',
            over: false,
            bitcoinAddress: Manager.GetInstance().user.bitcoinDepositAddress,
            checked: false,
            requested : false,
        };

        this.RequestWithdrawalBitcoin = this.RequestWithdrawalBitcoin.bind(this);
    }
    componentDidMount(){
    }

    RequestWithdrawalBitcoin = async() =>{
        if ( this.state.requested ) 
            return;
        this.state.requested = true;

        const result: any = await Client.mutate({
            mutation: RequestWithdrawalBitcoinMutation,
            variables: { userID: Manager.GetInstance().user.userID, amount: Math.floor(Number(this.state.btc) * 100000000) }
        });

        Manager.GetInstance().UpdateUserData(result.data.requestWithdrawalBitcoin.account);
        Manager.GetInstance().UpdateMiningData(result.data.requestWithdrawalBitcoin.miningData);

        this.state.requested = false;
        this.props.OnClose();
    };
    render() {
        var user = Manager.GetInstance().user;
        var miningData = Manager.GetInstance().miningData;
        var currentVolume = Manager.GetInstance().getCurrentMiningVolumeAndSpeed()
        var volume = Number(user.depositedBitcoin) + currentVolume.volume
        return (
            <View style={{ height: '100%', backgroundColor: '#F5F5F5' }}>
                <StatusBar hidden={true}></StatusBar>
                {/* Header */}
                <View style={{
                    height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
                    backgroundColor: '#fff',
                    elevation: 8,
                }}>
                    <View style={{ position: 'absolute', left: 12, top: 16 }}>
                        <TouchableOpacity onPress={() => {
                            this.props.OnClose();
                        }}>
                            <Image source={require('./assets/back.png')} />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={{ fontSize: 15, color: '#222222' }}>출금</Text>
                    </View>
                </View>
                <View style={{ height:'100%'}}>
                <ScrollView style={{ }}>
                        <View style={{ height: '100%', }}>

                            <View style={{
                                margin: 20, backgroundColor: '#fff', marginTop: 40,
                                borderRadius: 8
                            }}>
                                <View style={{ margin: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 14, color: '#262626', fontFamily: 'NotoSans',includeFontPadding:false, }}>출금 수량</Text>
                                        <Text style={{ fontSize: 12, color: '#01467F', fontFamily: 'NotoSans',includeFontPadding:false, position: 'absolute', right: 0 }}>보유 BTC : {volume / 100000000} BTC</Text>
                                    </View>
                                    <TextInput style={{ borderColor: this.state.over? '#ED634A' :'#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40}}
                                        value={this.state.btc}
                                        placeholder={'출금할 비트코인 수량 입력'}
                                        placeholderTextColor={'#BCBCBC'}
                                        onChangeText={(text) => {
                                            const value = text;
                                            const reg = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
                                            if ((!isNaN(value) && reg.test(value)) || value === '') {
                                                this.setState({btc:text, over: Number(text) > volume/100000000});
                                            }
                                        }} />
                                    <Text style={{color: this.state.over? '#ED634A' : '#fff'}}>출금 가능 BTC를 초과했습니다</Text>
                                    {/*  */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 14, color: '#262626', fontFamily: 'NotoSans',includeFontPadding:false, }}>출금 주소</Text>
                                    </View>
                                    <TextInput style={{ borderColor:'#BCBCBC', borderWidth: 1, borderRadius: 4, height: 40}}
                                        value={this.state.bitcoinAddress}
                                        placeholder={'출금할 비트코인 주소 입력'}
                                        placeholderTextColor={'#BCBCBC'}
                                        onChangeText={(text) => {
                                            this.setState({bitcoinAddress : text});
                                        }} />

                                    <View style={{backgroundColor:'#F5F5F5', borderRadius:8, marginTop:20 }}>
                                        <View style={{margin:15}}>
                                            <Text style={{fontSize:12, color:'#ED634A', fontFamily:'NotoSans',includeFontPadding:false,}}>BTC 출금 주의사항</Text>
                                            <Text style={{fontSize:12, color:'#262626', fontFamily:'NotoSans',includeFontPadding:false,}}>*비트코인(BTC) 지갑 주소를 반드시 확인하고 전달해주세요.</Text>
                                            <Text style={{fontSize:12, color:'#262626', fontFamily:'NotoSans',includeFontPadding:false,}}>*출금신청 후 입금받는 지갑에서 입금내역을 확인하기까지 보통 30분~1시간 정도의 시간이 소요되며, 상황에 따라 지연이 발생할 수 있습니다.</Text>
                                            <Text style={{fontSize:12, color:'#262626', fontFamily:'NotoSans',includeFontPadding:false,}}>*암호화폐의 특성상 출금 신청이 완료되면 취소할 수 없습니다.</Text>
                                        </View>
                                    </View>
                                    <View style={{flexDirection:'row', alignItems:'center'}}>
                                    <CheckBox
                                        value={this.state.checked}
                                        onValueChange={(value) => {
                                             this.setState({checked: value});
                                            }}
                                    /><Text style={{color:'#262626', fontSize:12}}>위 주의사항을 확인하였습니다</Text>
                                    </View>
                                        
                                    <View style={{ marginTop: 50, flex: 1, alignItems: 'center', marginBottom: 30 }}>
                                        <TouchableWithoutFeedback onPress={()=>{
                                            if ( this.state.checked == false || this.state.over || this.state.requested)
                                                return;

                                                this.RequestWithdrawalBitcoin();
                                        }}>
                                            <View style={{
                                                width: 100, height: 34, backgroundColor: this.state.checked && this.state.over == false ? '#01467F' : '#676F76', borderRadius: 25,
                                                elevation: 8,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Text style={{ color: '#FFF' }} onPress={() => {
                                                }}>출금</Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                </View>
                            </View>
                        </View>
                </ScrollView>
                </View>
            </View>
        );
    }
}
import React, { useState, useEffect } from 'react';
import { Text, View, Image,  TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, ImageBackground, Dimensions, TextInput, Keyboard, AppState, StatusBar, ScrollView } from 'react-native';
import { Manager } from './Manager';

const scaleFactor = Dimensions.get('window').width / 360;
export const Account = (props) =>
{
    var user = Manager.GetInstance().user;
    var miningData = Manager.GetInstance().miningData;
    var currentVolume = Manager.GetInstance().getCurrentMiningVolumeAndSpeed();
    return (
        <View style={{ height: '100%' }}>
            <StatusBar hidden={true}></StatusBar>
            {/* Header */}
            <View style={{
                height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', 
                backgroundColor:'#fff', 
                elevation: 8,
            }}>
                <View style={{ position: 'absolute', left: 12, top: 16, }}>
                    <TouchableOpacity onPress={() => {
                        props.OnClose();
                    }}>
                        <Image source={require('./assets/back.png')} />
                    </TouchableOpacity>
                </View>
                <View>
                    <Text style={{fontSize:15, color:'#222222'}}>회원 정보</Text>
                </View>
            </View>
            <ScrollView>
                <View style={{ marginTop:20, marginLeft:20, marginRight:20}}>
                    {/* 아이디 */}
                    <View style={{flexDirection:'row', height:50, alignItems:'center'}}>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                                아이디
                                </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                                {user.accountID}
                            </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#01467F', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                                
                            </Text>
                        </View>
                    </View>
                    <View style={{borderWidth:0.5, borderColor:'#DBDBDB'}}/>

                    {/* 비밀번호 */}
                    <View style={{flexDirection:'row', height:50, alignItems:'center'}}>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                            비밀번호
                                </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans' ,includeFontPadding:false,}}>
                                **********
                            </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#01467F', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false,textAlign:'right'  }}>
                                수정
                            </Text>
                        </View>
                    </View>
                    <View style={{borderWidth:0.5, borderColor:'#DBDBDB'}}/>

                    {/* 핸드폰 번호 */}
                    <View style={{flexDirection:'row', height:50, alignItems:'center'}}>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans' ,includeFontPadding:false,}}>
                                핸드폰 번호
                                </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans' ,includeFontPadding:false,}}>
                                {user.phoneNumber}
                            </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#01467F', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false,textAlign:'right'  }}>
                            </Text>
                        </View>
                    </View>
                    <View style={{borderWidth:0.5, borderColor:'#DBDBDB'}}/>

                    {/* 비트코인 주소 */}
                    <View style={{flexDirection:'row', height:50, alignItems:'center'}}>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans' ,includeFontPadding:false,}}>
                                비트코인 주소
                                </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                                {user.bitcoinDepositAddress}
                            </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#01467F', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false,textAlign:'right'  }}>
                                수정
                            </Text>
                        </View>
                    </View>
                    <View style={{borderWidth:0.5, borderColor:'#DBDBDB'}}/>

                    {/* 보유 포인트 */}
                    <View style={{flexDirection:'row', height:50, alignItems:'center'}}>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                                보유 포인트
                                </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                                {user.depositedBitcoin/100000000} UM
                            </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <TouchableOpacity onPress={()=>{ props.ChangeMenu('pointDetail'); props.OnClose();}}>
                                <Text style={{ color: '#01467F', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, textAlign:'right' }}>
                                    자세히 보기
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{borderWidth:0.5, borderColor:'#DBDBDB'}}/>

                    {/* 채산성(일) */}
                    <View style={{flexDirection:'row', height:50, alignItems:'center'}}>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                                채산성(일)
                                </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans' ,includeFontPadding:false,}}>
                                {currentVolume.speed/100000000} BTC/일
                            </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <TouchableOpacity onPress={()=>{ props.ChangeMenu('mining'); props.OnClose();}}>
                            <Text style={{ color: '#01467F', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, textAlign:'right'  }}>
                                자세히 보기
                            </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{borderWidth:0.5, borderColor:'#DBDBDB'}}/>

                    {/* 채굴된 비트코인 */}
                    <View style={{flexDirection:'row', height:50, alignItems:'center'}}>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                                채굴된 비트코인
                                </Text>
                        </View>
                        <View style={{ width: '33%' }}>
                            <Text style={{ color: '#262626', fontSize: 12, fontFamily: 'NotoSans' ,includeFontPadding:false,}}>
                                {currentVolume.volume/100000000} BTC
                            </Text>
                        </View>
                        <View style={{ width: '33%'}}>
                            <TouchableOpacity onPress={() => { props.ChangeMenu('withdrawal'); props.OnClose(); }}>
                                <Text style={{ color: '#01467F', fontSize: 12, fontFamily: 'NotoSans', includeFontPadding: false, textAlign:'right' }}>
                                    출금 신청
                            </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
import React, { useState, useEffect } from 'react';
import { Text, View, Image,  TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, ImageBackground, Dimensions, TextInput, Keyboard, AppState, StatusBar, ScrollView } from 'react-native';
import { Manager } from './Manager';
import { PackageCard } from './PackageCard';
import { RequestDepositHistoryQuery } from './apollo/query';
import { Client } from './apollo/client';
import dataManager from './dataManager';
import SimpleModal from './SimpleModal';

const scaleFactor = Dimensions.get('window').width / 360;

export class PointCharge extends React.Component {
    constructor(props) {
        super(props);

        // 폰트로딩이 완료되면 true로 변경
        this.state = {
            loaded: false,
            history: [],
            OnClose: props.OnClose,

            showModal: false,
            popupTitle: '',
            popupText: '',
            bottomText:'',
        };
        this.OnRequestBuyPoint = this.OnRequestBuyPoint.bind(this);
        this.ShowModal = this.ShowModal.bind(this);
        this.OnCloseModal = this.OnCloseModal.bind(this);
    }

    ShowModal = (title: string, text: string, bottomText: string = '') => {
        this.setState({
            showModal: true,
            popupTitle: title,
            popupText: text,
            bottomText : bottomText,
        })
    }

    OnCloseModal = () => {
        this.setState({ showModal: false });
    }
    
    OnRequestBuyPoint = async(pointIndex:number)=>{
        const point = dataManager.getPoint(pointIndex);
        if ( !point  )
            return;
            
        this.ShowModal(`${point.um/100000000} UM을  구매 하시 겠습니까?`, `귀하의 입금 전용 주소는 ${Manager.GetInstance().user.companyBitcoinDepositAddress} 입니다.\n${point.btc / 100000000} 이상의 비트코인을 입금하여 주시기 바랍니다.`, '확인');
    }

    render() {
        var user = Manager.GetInstance().user;
        var miningData = Manager.GetInstance().miningData;
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
                            this.state.OnClose();
                        }}>
                            <Image source={require('./assets/back.png')} />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={{ fontSize: 15, color: '#222222' }}>포인트 충전</Text>
                    </View>
                </View>
                <View style={{ height: '100%' }}>
                    <ScrollView style={{}}>
                        <View style={{ height: '100%', marginTop:35 }}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={{ color: '#262626', fontSize: 20 }}>포인트 충전</Text>
                                <Text style={{ color: '#262626', marginBottom: 20 * scaleFactor }}>포인트를 구매하여 패키지를 업그레이드할 수 있습니다.</Text>
                            </View>
                        <View style={{
                            margin: 20, backgroundColor: '#fff', marginTop: 40,
                            borderRadius: 8
                        }}>
                            <View style={{ flex: 1, alignItems: 'center', marginTop: 30 }}>
                                <View style={{ backgroundColor: '#F29B16', width: 234, height: 124, borderRadius: 10 }}>
                                    <View>
                                        <Text style={{ color: '#fff', fontSize: 14, marginLeft: 15, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                                            현재 보유 포인트
                                  </Text>
                                    </View>
                                    <View style={{ borderWidth: 1, borderColor: '#fff', marginRight: 37 }} />
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image source={require('./assets/point_detail_icon.png')} style={{ marginLeft: 11, marginTop: 15 }} />
                                        <Text style={{ color: '#fff', position: 'absolute', right: 0, marginRight: 10, fontSize: 20, fontFamily: 'NotoSans',includeFontPadding:false, }}>{Number(user.depositedBitcoin) / 100000000} UM</Text>
                                    </View>
                                </View>
                            </View>
                        <View style={{ margin:20, marginTop: 26, marginBottom:0 }}>
                                    {dataManager.getPoints().map((item: any, index) => {
                                        return (
                                        <View key={index}>
                                            <View style={{ borderWidth:0.5, borderColor: '#8B838350', marginBottom: 10 }}/>
                                            <View style={{ flexDirection:'row',paddingBottom: 10 }}>
                                                <View  style={{marginLeft:14}}>
                                                    <Image source={require('./assets/pointCharge_icon.png')} />
                                                </View>
                                                <View style={{paddingLeft: 5, flexDirection:'row' }}>
                                                    <Text >{item.um / 100000000}</Text> 
                                                    <Text >UM</Text>
                                                </View>
                                                <View style={{position:'absolute', right:14}}>
                                                        <TouchableOpacity onPress={() => {
                                                            this.OnRequestBuyPoint(index);
                                                        }}>
                                                            <View style={{ width:86, height:30, backgroundColor:'#FBB03B', borderRadius:80, justifyContent:'center', alignItems:'center'}} >
                                                                <View >
                                                                    <Text style={{color:'#fff'}}>{item.btc / 100000000} BTC</Text>
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                            </View>
                                        </View>
                                        );
                                    })}
                        </View>
                        </View>

                    </View>
                </ScrollView>
                </View>

                <SimpleModal showModal={this.state.showModal} popupTitle={this.state.popupTitle} popupText={this.state.popupText} bottomText={this.state.bottomText} close={() => {
                    this.setState({
                        showModal: false
                    });
                }} />
            </View>
        );
    }
}
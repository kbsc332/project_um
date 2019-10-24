import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, ImageBackground, Dimensions, TextInput, Keyboard, AppState, StatusBar, ScrollView } from 'react-native';
import { Manager } from './Manager';
import { PackageCard } from './PackageCard';
import { RequestDepositHistoryQuery } from './apollo/query';
import { Client } from './apollo/client';

const scaleFactor = Dimensions.get('window').width / 360;

const DetailCard = (props) => {
    var history = props.history;

    const time = (time : Date)=>{
        return `${time.getUTCFullYear()}-${('0'+time.getUTCMonth()).slice(-2)}-${('0'+time.getUTCDay()).slice(-2)} ${('0'+time.getUTCHours()).slice(-2)}:${('0'+time.getUTCMinutes()).slice(-2)}:${('0'+time.getUTCSeconds()).slice(-2)}`
    }

    return (
        <View style={{ height: 30, marginBottom: 4, backgroundColor: '#606060', flexDirection: 'row', paddingLeft: 10, paddingRight: 10, justifyContent: 'center' }}>
            <View style={{ width: '20%', justifyContent:'center' }}>
                <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                    {history.type == 2 ? "사용" : history.type == 3 ? "출금" : "충전"}
                </Text>
            </View>
            <View style={{ width: '25%', justifyContent:'center' }}>
                <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'NotoSans' ,includeFontPadding:false,}}>{history.value/100000000} UM</Text>
            </View>
            <View style={{ marginLeft:'auto', marginRight:0,justifyContent:'center' }}>
                {history.type == 0 ? (
                    <Text style={{ color: '#FBB03B', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                        처리중
            </Text>
                ) : history.type == 1 ? (
                    <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                        {time(new Date(history.time * 1000))}
                    </Text>
                ) : history.type == 2 ? (<View />) : (
                    <Text style={{ color: '#FBB03B', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>
                        처리중
                </Text>
                )
                }
            </View>
        </View>
    );
}

const LoadingDetailCard = (props) => {
    return (
        <View style={{ height: 30, marginBottom: 4, backgroundColor: '#606060', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>로딩...</Text>
        </View>
    );
}

const EmptyDetailCard = (props) => {
    return (
        <View style={{ height: 30, marginBottom: 4, backgroundColor: '#606060', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 12, fontFamily: 'NotoSans',includeFontPadding:false, }}>기록 없음</Text>
        </View>
    );
}
export class PointDetail extends React.Component {
    constructor(props) {
        super(props);

        // 폰트로딩이 완료되면 true로 변경
        this.state = {
            requested : false,
            loaded: false,
            history: [],
            OnClose: props.OnClose
        };
    }

    RequestHistory = async () => {
        try {
            this.state.requested = true;
            const result = await Client.query({
                query: RequestDepositHistoryQuery,
                variables: { userID: Manager.GetInstance().user.userID }
            });

            if ( this.state.requested == false )
                return;
            var history: any = result.data.requestDepositHistory;
            if (history == null)
                history = [];
            this.setState({ history: history, loaded: true });
        }
        catch (error) {

        }
    }

    componentDidMount() {
        this.RequestHistory();
    }

    componentWillUnmount()
    {
        this.state.requested = false;
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
                        <Text style={{ fontSize: 15, color: '#222222' }}>포인트 내역</Text>
                    </View>
                </View>
                <View style={{ height: '100%' }}>
                    <ScrollView style={{}}>
                        <View style={{ height: '100%', }}>

                            <View style={{
                                margin: 20, backgroundColor: '#fff', marginTop: 40,
                                borderRadius: 8
                            }}>
                                <View style={{ flex: 1, alignItems: 'center', marginTop: 30 }}>
                                    <View style={{ backgroundColor: '#F29B16', width: 234, height: 124, borderRadius: 10 }}>
                                        <View>
                                            <Text style={{ color: '#fff', fontSize: 14, marginLeft: 15, fontFamily: 'NotoSans' ,includeFontPadding:false,}}>
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
                                <View style={{ margin: 20, marginTop: 26, marginBottom: 0 }}>
                                    {this.state.loaded == false ? (
                                        <LoadingDetailCard />
                                    ) : (
                                            this.state.history.length == 0 ? (<EmptyDetailCard />) : (
                                                this.state.history.map((log, index) => {
                                                    return (
                                                        <DetailCard key={index} history={log} />
                                                    );
                                                })
                                            )
                                        )}

                                </View>
                                <View style={{ marginTop: 50, flex: 1, alignItems: 'center', marginBottom: 30 }}>
                                    <TouchableOpacity onPress={() => { this.props.OnClose(); this.props.ChangeMenu('pointCharge')}}>
                                        <View style={{
                                            width: 100, height: 34, backgroundColor: '#01467F', borderRadius: 25,
                                            elevation: 8,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Text style={{ color: '#FFF' }}>포인트 충전</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>
                    </ScrollView>
                </View>
            </View>
        );
    }
}
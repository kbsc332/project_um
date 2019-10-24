
import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, ImageBackground, Dimensions, TextInput, Keyboard, AppState, StatusBar, ScrollView } from 'react-native';
import { Menu } from './Menu';
import { Manager } from './Manager';
import dataManager from './dataManager';
import {PackageCard} from './PackageCard';
import {Package} from './Package';
import { Account } from './Account';
import { PointDetail } from './PointDetail';
import { Withdrawal } from './Withdrawal';
import { PointCharge } from './PointCharge';
import { ServiceCenter } from './ServiceCenter';
import { Event } from './Event';
import { Mining } from './Mining';

const scaleFactor = Dimensions.get('window').width / 360;

const CurrentVolume = (props: any) => {
    const volume = Manager.GetInstance().getCurrentMiningVolumeAndSpeed().volume;
    const [counter, setCounter] = useState(volume);
    const time = Math.max(((24 * 3600) / Manager.GetInstance().miningData.speed) * 1000, 100);
    console.log(volume);

    return (
        <View style={{ flexDirection: 'row' }}>
            {Number(counter / 100000000).toFixed(10).split('').map((char, index) => {
                if (char == '.')
                    return (
                        <View key={index} style={{ flexDirection: 'row' }}>
                            <View >
                                <Text style={{ fontSize: 28, fontFamily: 'Digital-7', color: '#33FF52' }}>{char}</Text>
                            </View>
                            <Text>{' '}</Text>
                        </View>
                    );
                return (
                    <View key={index} style={{ flexDirection: 'row' }}>
                        <View style={{ backgroundColor: '#222' }}>
                            <Text style={{ fontSize: 28, fontFamily: 'Digital-7', color: '#BCBCBC' }}>
                                8
                            </Text>
                            <Text style={{ fontSize: 28, fontFamily: 'Digital-7', color: '#33FF52', position:'absolute', right:0 }}>
                                {char}
                            </Text>
                        </View>
                        <Text >{' '}</Text>
                    </View>
                );
            })}
        </View>
    );
};
export default class Main extends React.Component {
    constructor(props) {
        super(props);
 
        // 폰트로딩이 완료되면 true로 변경
        this.state = { 
            showMenu: false, 
            showPackage: false, 
            showAccount: false,
            showPointDetail: false,
            showWithdrawal : false,
            showPointCharge: false,
            showServiceCenter: false,
            showEvent: false,
            showMining: false,
        };

        this.ChangeMenu = this.ChangeMenu.bind(this);
    }

    ChangeMenu(menu) {
        if (menu == 'package') {
            this.setState({ showPackage: true });
        }
        else if (menu == 'account') {
            this.setState({ showAccount: true });
        }
        else if (menu == 'pointDetail') {
            this.setState({ showPointDetail: true });
        }
        else if (menu == 'withdrawal') {
            this.setState({ showWithdrawal: true });
        }
        else if (menu == 'pointCharge') {
            this.setState({ showPointCharge: true });
        }
        else if (menu == 'serviceCenter') {
            this.setState({ showServiceCenter: true });
        }
        else if (menu == 'event') {
            this.setState({ showEvent: true });
        }
        else if (menu == 'mining') {
            this.setState({ showMining: true });
        }
    }

    render() {
        if (this.state.showPackage) {
            return (
                <Package OnClose={() => {
                    this.setState({showPackage:false})
                }} />
            )
        }
        else if ( this.state.showAccount )
        {
            return (
                <Account OnClose={() => {
                    this.setState({showAccount:false})
                }} ChangeMenu={this.ChangeMenu}/>
            )
        }
        else if ( this.state.showPointDetail )
        {
            return (
                <PointDetail OnClose= {()=>{
                    this.setState({showPointDetail:false});
                }} ChangeMenu={this.ChangeMenu}/>
            )
        }
        else if ( this.state.showWithdrawal )
        {
            return (
                <Withdrawal OnClose= {()=>{
                    this.setState({showWithdrawal:false});
                }}/>
            )
        }
        else if ( this.state.showPointCharge )
        {
            return (
                <PointCharge OnClose= {()=>{
                    this.setState({showPointCharge:false});
                }}/>
            )
        }
        else if ( this.state.showServiceCenter )
        {
            return (
                <ServiceCenter OnClose= {()=>{
                    this.setState({showServiceCenter:false});
                }}/>
            )
        }
        else if ( this.state.showEvent )
        {
            return (
                <Event OnClose= {()=>{
                    this.setState({showEvent:false});
                }}/>
            )
        }
        else if ( this.state.showMining )
        {
            return (
                <Mining OnClose= {()=>{
                    this.setState({showMining:false});
                }} ChangeMenu={this.ChangeMenu}/>
            )
        }

        return (
            <View style={{ height: '100%' }}>
                <StatusBar hidden={true}></StatusBar>
                {/* Header */}
                <View style={{ height: 50, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                    <View style={{ position: 'absolute', left: 12, top: 16 }}>
                        <TouchableOpacity onPress={() => {
                            this.setState({showMenu:true});
                        }}>
                            <Image source={require('./assets/menu.png')} />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Image source={require('./assets/headerIcon-mobile.png')} />
                    </View>
                </View>
                <ScrollView>
                    <Image source={require('./assets/main_bg.png')} style={{ width: '100%', position: 'absolute', top: 0 }} />
                    <View style={{ marginTop: 51, alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, color: '#fff' }}>유니버스 마이닝에서 색다른 느낌을 경험하세요!</Text>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: 310 * scaleFactor, height: 280, marginTop: 20, backgroundColor: '#4285BA', borderRadius: 10 }}>
                            <View style={{ marginLeft: 26, marginTop: 26, marginRight: 26 }}>
                                <Text style={{ fontSize: 12, color: '#fff' }}>
                                    채굴된 비트코인
                            </Text>
                                <View style={{ marginTop: 5, flexDirection: 'row', alignItems: 'flex-end' }}>
                                    <CurrentVolume />
                                    <Text style={{ fontFamily: 'Futura', fontSize: 8, color: '#22FF3C' }}>BTC</Text>
                                </View>
                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                    <Image source={require('./assets/information.png')} style={{marginRight:12}}/>
                                    <Text style={{  fontSize:10, color:'#fff', fontFamily:'NotoSans', includeFontPadding:false}}>
                                        일일 최대 채굴량에 도달하여 더 이상 채굴할 수 없습니다.
                                    </Text>
                                </View>
                                <View style={{ marginTop: 10 }}>

                                    <TouchableOpacity onPress={() => {
                                        this.ChangeMenu('withdrawal');
                                    }}>
                                        <View style={{
                                            width: 100, height: 34, backgroundColor: '#005FAD', borderRadius: 25,
                                            shadowColor: "#000",
                                            shadowOffset: {
                                                width: 0,
                                                height: 0,
                                            },
                                            elevation: 8,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Text style={{ color: '#fff' }} onPress={() => {
                                            }}>출금</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ marginTop: 25, marginBottom: 21, borderWidth: 0.5, borderColor: '#FFFFFF' }}></View>
                                <View style={{ flexDirection: 'row' }}>
                                    <View>
                                        <View>
                                            <Text style={{ color: '#fff', fontSize: 12 }}>채산성</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                            <Text style={{ color: '#fff', fontFamily: 'Futura', fontSize: 18 }}>{Manager.GetInstance().miningData.speed / 100000000}</Text><Text style={{ color: '#fff', fontFamily: 'Futura', fontSize: 8 }}>{}BTC/일</Text>
                                        </View>
                                        <TouchableOpacity onPress={()=>{
                                            this.ChangeMenu('package')
                                        }}>
                                        <View style={{ marginTop: 10 }}>
                                            <View style={{
                                                width: 100, height: 34, backgroundColor: '#FBB03B', borderRadius: 25,
                                                shadowColor: "#FBB03B",
                                                shadowOffset: {
                                                    width: 0,
                                                    height: 0,
                                                },
                                                elevation: 8,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Text style={{ color: '#fff' }} >업그레이드</Text>
                                            </View>
                                        </View>
                                        </TouchableOpacity>
                                        <View>
                                        </View>
                                    </View>
                                    <View style={{ marginLeft: 20 }}>

                                        <View >
                                            <Text style={{ color: '#fff', fontSize: 12 }}>보유 포인트</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                                            <Text style={{ color: '#fff', fontFamily: 'Futura', fontSize: 18 }}>{Manager.GetInstance().user.depositedBitcoin / 100000000}</Text><Text style={{ color: '#fff', fontFamily: 'Futura', fontSize: 8 }}>{}UM</Text>
                                        </View>

                                        <TouchableOpacity onPress={()=>{
                                        this.ChangeMenu('pointCharge');
                                        }}>
                                        <View style={{ marginTop: 10 }}>
                                            <View style={{
                                                width: 100, height: 34, backgroundColor: '#EFEFEF', borderRadius: 25,
                                                shadowColor: "#EFEFEF",
                                                shadowOffset: {
                                                    width: 0,
                                                    height: 0,
                                                },
                                                elevation: 8,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Text style={{ color: '#262626' }} >포인트 충전</Text>
                                            </View>
                                        </View>
                                        </TouchableOpacity>
                                        <View>
                                        </View>
                                    </View>
                                </View>
                            </View>

                        </View>
                    </View>
                    {/*  */}
                    <View style={{ marginTop: 55, justifyContent: 'center', alignItems: 'center', marginLeft: 25, marginRight: 25 }}>
                        <Text style={{ color: '#262626', fontSize: 20, textAlign: 'center' }}>
                            {'채굴 속도를 업그레이드해서\n더욱 채계화된 마이닝을 해보세요.'}
                    </Text>
                        <Text style={{ color: '#262626', fontSize: 10, marginTop: 5, textAlign: 'center' }}>
                            클라우드 채굴은 암호화된 화폐 채굴 및 획득을 시도해 보려는 초보 채굴자뿐만 아니라 귀찮은 상황이나 호스트 채굴 또는 자택 기반의 채굴에서 위험성을 원하지 않는 노련한 채굴자에게 매우 적합합니다.
                    </Text>
                    </View>
                    <ScrollView style={{ marginTop: 30, paddingLeft: 30, paddingRight: 30 }}
                        horizontal>
                        <View style={{ flexDirection: 'row' }}>
                            <PackageCard index={1} style={{ marginRight: 30 }} ChangeMenu={this.ChangeMenu}/>
                            <PackageCard index={2} style={{ marginRight: 30 }} ChangeMenu={this.ChangeMenu}/>
                            <PackageCard index={3} style={{ marginRight: 30 }} ChangeMenu={this.ChangeMenu}/>
                            <PackageCard index={4} style={{ marginRight: 30 }} ChangeMenu={this.ChangeMenu}/>
                            <PackageCard index={5} style={{ marginRight: 30 }} ChangeMenu={this.ChangeMenu}/>
                            <PackageCard index={6} style={{ marginRight: 30 }} ChangeMenu={this.ChangeMenu}/>
                        </View>
                    </ScrollView>
                </ScrollView>
                {/* Modal */}
                {/* Menu */}
                {this.state.showMenu ? (<Menu OnMenuClose={() => {
                    this.setState({ showMenu: false});
                }} ChangeMenu={this.ChangeMenu} />) : (<View />)}
            </View>
        );
    }
};
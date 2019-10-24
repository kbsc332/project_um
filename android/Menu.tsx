

import React, { useState, useEffect } from 'react';
import { Text, View, Image, TouchableOpacity, TouchableHighlight, TouchableWithoutFeedback, ImageBackground, Dimensions, TextInput, Keyboard, AppState } from 'react-native';
import { Manager } from './Manager';

const scaleFactor = Dimensions.get('window').width / 360;
export const Menu = (props) => {
    var user = Manager.GetInstance().user;
    var miningData = Manager.GetInstance().miningData;
    return (
        
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); props.OnMenuClose(); }} style={{ zIndex: 1 }} >
            <View style={{ backgroundColor: 'rgba(0,0,0,0.7)', position: 'absolute', width: '100%', height: '100%' }}>
                <TouchableWithoutFeedback onPress={() => { }}>
                    <View style={{ width: 275, backgroundColor: '#fff' }}>
                        <View style={{ height: 60, backgroundColor: '#01467F', alignItems: 'center', flexDirection: 'row' }}>
                            <Text style={{ color: '#fff', fontSize: 16, marginLeft: 24 }}>
                                {user.accountID}
                            </Text>
                            <TouchableOpacity style={{ position: 'absolute', right: 27, top: 16 }} onPress={()=>{ props.ChangeMenu('account')}}>
                                <Image source={require('./assets/setting.png')} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 100, backgroundColor: '#F5F5F5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ paddingRight: 8, width:'32%' }}>
                                <Text style={{ fontSize: 12, color: '#262626' }}>
                                    채굴된 비트코인
                            </Text>
                                <Text style={{ color: '#FBB03B', fontSize: 12}} numberOfLines={2} >
                                    {(miningData.volume/100000000).toFixed(8)} BTC
                            </Text>
                            </View>
                            <View style={{ borderWidth: 0.5, borderColor: '#DBDBDB' }}></View>
                            <View style={{ paddingLeft: 8, paddingRight: 8, width:'32%' }}>
                                <Text style={{ fontSize: 12, color: '#262626' }}>
                                    채산성(일)
                            </Text>
                                <Text style={{ color: '#FBB03B', fontSize: 12 }}>
                                    {(miningData.volume/100000000).toFixed(8)} BTC/일
                            </Text>
                            </View>
                            <View style={{ borderWidth: 0.5, borderColor: '#DBDBDB' }}></View>
                            <View style={{ paddingLeft: 8, width:'32%'}}>
                                <Text style={{ fontSize: 12, color: '#262626' }}>
                                    보유포인트
                            </Text>
                                <Text style={{ color: '#FBB03B', fontSize: 12 }}>
                                    {(miningData.volume/100000000).toFixed(8)} UM
                            </Text></View>
                        </View>
                        <View style={{ height: 48 }}>
                            <Text style={{ marginLeft: 24, marginTop: 25, fontSize: 12, color: '#606060' }}>Menu</Text>
                        </View>
                        <View style={{ borderWidth: 0.5, borderColor: '#DBDBDB' }}></View>
                        <View style={{ height: '100%' }}>
                            <TouchableOpacity onPress={()=>{ props.ChangeMenu('package')}}>
                            <View style={{ flexDirection: 'row', marginTop: 21, marginLeft: 28 }}>
                                <Image source={require('./assets/header-menu-package.png')} />
                                <Text style={{ marginLeft: 12, fontSize: 14, color: '#01467F' }}>패키지 정보</Text>
                            </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>{ props.ChangeMenu('pointCharge')}}>
                            <View style={{ flexDirection: 'row', marginTop: 21, marginLeft: 28 }}>
                                <Image source={require('./assets/header-menu-point.png')} />
                                <Text style={{ marginLeft: 12, fontSize: 14, color: '#01467F' }}>포인트 충전</Text>
                            </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={()=>{ props.ChangeMenu('withdrawal')}}>
                            <View style={{ flexDirection: 'row', marginTop: 21, marginLeft: 28 }}>
                                <Image source={require('./assets/header-menu-withdrawal.png')} />
                                <Text style={{ marginLeft: 12, fontSize: 14, color: '#01467F' }}>출금신청</Text>
                            </View>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={()=>{ props.ChangeMenu('event')}}>
                            <View style={{ flexDirection: 'row', marginTop: 21, marginLeft: 28 }}>
                                <Image source={require('./assets/header-menu-event.png')} />
                                <Text style={{ marginLeft: 12, fontSize: 14, color: '#01467F' }}>이벤트</Text>
                            </View>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {
                                props.ChangeMenu('serviceCenter')
                            }}>
                            <View style={{ flexDirection: 'row', marginTop: 21, marginLeft: 28 }}>
                                <Image source={require('./assets/header-menu-customer.png')} />
                                <Text style={{ marginLeft: 12, fontSize: 14, color: '#01467F' }}>고객지원</Text>
                            </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                Manager.GetInstance().LogoutUser();
                            }}>
                                <View style={{ flexDirection: 'row', marginTop: 21, marginLeft: 28 }}>
                                    <Image source={require('./assets/header-menu-logout.png')} />
                                    <Text style={{ marginLeft: 12, fontSize: 14, color: '#01467F' }}>로그아웃</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                    </View>
                </TouchableWithoutFeedback>
            </View>
        </TouchableWithoutFeedback>
    );
}
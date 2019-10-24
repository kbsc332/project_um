import React, { useState, useEffect } from 'react';
import { Text, View, Image,  TouchableOpacity, CheckBox, Dimensions, TextInput, Keyboard, AppState, StatusBar, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { Manager } from './Manager';
import { PackageCard } from './PackageCard';
import { RequestDepositHistoryQuery, RequestWithdrawalBitcoinMutation, RecommandersQuery } from './apollo/query';
import { Client } from './apollo/client';
import dataManager from './dataManager';

const scaleFactor = Dimensions.get('window').width / 360;

var hierachyColor = [
    '#095EB0',
    '#AD09A6',
    '#E20C40',
    '#D8700A',
    '#B3CB00',
    '#0CE256',
    '#0CE2D2'
];

function range(start:any, stop:any, step:any){
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};

var userIcon = [
    require('./assets/user-1.png'),
    require('./assets/user-2.png'),
    require('./assets/user-3.png'),
    require('./assets/user-4.png'),
    require('./assets/user-5.png'),
    require('./assets/user-6.png'),
    require('./assets/user-7.png'),
];

var backgroundColor = [
    '#0867B7',
    '#B608A9',
    '#DC0C40',
    '#D16B0A',
    '#A8B921',
    '#0CE054',
]
const Card = ( props ) =>{
    var selected = props.selected;
    
    var color = selected ? '#fff' : hierachyColor[props.currentIndex-1];
    var user = props.user;
    return (
        <TouchableWithoutFeedback
            onPress={(e: any) => {
                props.onPress();
            }}>
            <View style={{
                backgroundColor: selected ? backgroundColor[props.currentIndex - 1] : (user.hasRecommanders ? '#ffffff00' : '#E6E6E6' ),
                borderWidth: selected ? 0 : (user.hasRecommanders ? 1 : 0 ), 
                borderColor: color, borderRadius: 33, height: 40, marginLeft: 5, marginRight: 5, flexDirection: 'row', alignItems: 'center',
                marginBottom:6
            }}>
                <Image source={selected ? require('./assets/user-select.png') : userIcon[props.currentIndex - 1]} style={{ marginLeft: 14, width: 22, height: 23 }} />
                <View style={{ marginLeft: 4 }}>
                    <Text style={{ fontFamily: 'NotoSans', includeFontPadding: false, fontSize: 10, color: color }}>{user.accountID}</Text>
                    <Text style={{ fontWeight: 'bold', fontFamily: 'Futura', fontSize: 10, color: color }}>{user.speed / 100000000} BTC/일</Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const EmptyCard = (props)=>{
    
    var color = hierachyColor[props.currentIndex-1]
    return (
        <View style={{ borderWidth: 1, borderColor: color, borderRadius: 33, height: 40, marginLeft: 5, marginRight: 5, flexDirection: 'row', alignItems: 'center' }}>
            <Image source={ userIcon[props.currentIndex-1]} style={{ marginLeft: 14, width: 22, height: 23 }} />
            <View>               
                 <Text style={{ fontFamily: 'NotoSans', includeFontPadding: false, fontSize: 10, color:color }}>없음</Text>
            </View>
        </View>
    );
}

const HierachyLine = ( props )=>{
    const selectUserPosition = props.selectUserPosition;
    const currentHierachyCount = props.currentHierachyCount;
    const count:any= props.nextHierachyCount;

    const maxCount = Math.max(count, selectUserPosition);
    return (
        <View style={{ zIndex: 1, width:18, position:'relative', marginTop:8, height:45 }}>
            {
                range(0, maxCount, 1).map((i) => {
                    return (
                        <View key={i} style={{borderWidth : 0 ,height:46}}> 
                            <View style={{borderWidth : 0 ,height:23, flexDirection:'row'}}>
                                <View style={{borderWidth : 0 ,width:9}}>
                                </View>
                                <View style={{ borderWidth : 0 ,width:9, borderLeftWidth: (maxCount == 1 || i == 0) ? 0 : 2, borderColor: hierachyColor[props.currentIndex-1] }}>
                                </View>
                            </View>
                            <View  style={{height:23, flexDirection:'row'}}>
                                <View style={{borderWidth : 0 ,width:9, borderTopWidth: (selectUserPosition -1) == i ? 2 : 0, borderColor: hierachyColor[props.currentIndex-1] }}>
                                </View>
                                <View style={{ borderWidth : 0 ,width:9,borderTopWidth : i < count ? 2 : 0, borderLeftWidth : (maxCount == 1 || i == maxCount-1 ? 0 : 2), borderColor: hierachyColor[props.currentIndex-1]}}>
                                </View>
                            </View>
                        </View> 
                    );
                })
            }
        </View>
    );
} 
export class Mining extends React.Component {
    constructor(props) {
        super(props);

        // 폰트로딩이 완료되면 true로 변경
        this.state = {
            btc: '',
            over: false,
            bitcoinAddress: Manager.GetInstance().user.bitcoinDepositAddress,
            checked: false,
            requested : false,

            currentIndex:1,
            selectUserPosition : 1,
            recommanderByUserList : {}, // 전체 유저별 추천자 목록 캐싱 list
            recommandersOfSelectedUser : [],
            currentIndexRecommanders : [],
            history : [],
            find : false,
        };

        this.RequestRecommanderQuery = this.RequestRecommanderQuery.bind(this);
        this.OnBackHistory = this.OnBackHistory.bind(this);
    }
    componentDidMount(){
        this.RequestRecommanderQuery(Manager.GetInstance().user.userID, 0, true);
    }

    
    RequestRecommanderQuery = async(userID : any, index : number, swap : boolean = false)=>{
        try
        {
            var data: any = this.state.recommanderByUserList;
            var datas : any;
            if (!data[userID] || data[userID].requested == false) {
                let result = await Client.query({
                    query: RecommandersQuery,
                    variables: { userID: userID }
                });
                datas = result.data.recommanders;
            }
            else
            {
                datas = data[userID].recommanders;
            }

            var list : any = [];
            for (var i = 0; i < datas.length; ++i) {
                data[datas[i].userID] = {
                    userID: datas[i].userID,
                    accountID: datas[i].accountID,
                    depositedBitcoin: datas[i].depositedBitcoin ,
                    hasRecommanders: datas[i].hasRecommanders,
                    recommanders: [],
                    requested: false                
                }

                list.push(data[datas[i].userID]);
            }
            
            if ( Manager.GetInstance().user.userID != userID )
            {
                data[userID].recommanders = list;
                data[userID].requested = true;
            }

            var history : any= this.state.history;
            if ( Manager.GetInstance().user.userID == userID )
            {
                // 위에서 받은걸 현재에 넣는다.
                data[userID] = {
                    userID: userID,
                    accountID: '',
                    depositedBitcoin: 0,
                    recommanders: list,
                    hasRecommanders: true,
                    requested: true                
                };
                history.push({
                    parentUserID:userID,
                    selectUserID: null,
                    index : null
                });
                
                this.setState({
                    history: history,
                    currentIndexRecommanders: list,
                    recommanderByUserList: data,
                    find: true
                });

                // 첫번째 것 선택
                if ( list.length > 0 )
                {
                    await this.RequestRecommanderQuery(list[0].userID, 0, false );
                } 
            }
            else if ( swap ) 
            {
                // next껄 현재로 옮기고, 위에서 받은 유저를 next에 넣는다,
                var next = this.state.recommandersOfSelectedUser;
                
                history.push({ 
                    parentUserID : history[history.length-1].selectUserID,
                    selectUserID: userID,
                    index:index
                })

                this.setState({
                        history : history,
                        currentIndexRecommanders: next,
                        recommandersOfSelectedUser: list,
                        recommanderByUserList: data,
                        selectUserPosition : this.state.selectUserPosition
                });
            }
            else
            {
                history[history.length-1].index = index;
                history[history.length-1].selectUserID = userID;

                // next에 위에서 받은 유저를 넣는다.
                this.setState( {
                        history : history,
                        recommandersOfSelectedUser: list,
                        recommanderByUserList: data,
                        selectUserPosition : this.state.selectUserPosition
                });
            }
        }
        catch(error)
        {

        }
    };

    // 뒤로가기..
    OnBackHistory = async() =>
    {
        if ( this.state.currentIndex == 1 )
            return;

        this.state.history.pop();
        var length = this.state.history.length;
        var data :any= this.state.history[length-1];
        var recommanders : any = this.state.recommanderByUserList;
        recommanders = recommanders[data.parentUserID].recommanders;
        this.state.selectUserPosition = Number(data.index+1);
        this.setState({
                currentIndex : this.state.currentIndex-1,
                currentIndexRecommanders: recommanders,
        });

        this.RequestRecommanderQuery(data.selectUserID, data.index, false);
    };

    render() {
        
        var user = Manager.GetInstance().user;
        var miningData = Manager.GetInstance().miningData;
        var currentVolume = Manager.GetInstance().getCurrentMiningVolumeAndSpeed()
        var volume = Number(user.depositedBitcoin) + currentVolume.volume

        console.log(currentVolume)
        console.log(miningData)
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
                        <Text style={{ fontSize: 15, color: '#222222' }}>채산성 정보</Text>
                    </View>
                </View>
                <View style={{ height:'100%'}}>
                <ScrollView style={{ }}>
                        <View style={{ height: '100%', }}>

                            <View style={{
                                margin: 20, backgroundColor: '#fff', marginTop: 40,
                                borderRadius: 8
                            }}>
                                <View style={{backgroundColor:'#FBB03B', height:110, borderTopLeftRadius:8, borderTopRightRadius:8, justifyContent:'center', alignItems:'center'}}>
                                    <Text style={{color:'#fff', fontSize:10, fontWeight:'bold'}}>현재 채산성(일)</Text>
                                    <Text style={{color:'#fff', fontSize:18, fontWeight:'bold'}}>{currentVolume.speed/100000000} BTC(일)</Text>
                                </View>
                                <View style={{marginLeft:14, marginRight:14}}>
                                    <View style={{ alignItems: 'center', marginTop: 23 }}>
                                        <Text style={{ color: '#FBB03B', fontSize: 12, fontWeight: 'bold' }}>유저 본인</Text>
                                    </View>
                                    <View style={{ height: 50, borderRadius: 33, borderColor: '#FBB03B', borderWidth: 1, marginTop: 8, flexDirection: 'row', alignItems: 'center' }}>
                                        <Image source={require('./assets/user-icon.png')} style={{ width: 25, height: 27, marginLeft: 20 }} />
                                        <View style={{ marginLeft: 4 }}>
                                            <Text style={{ color: '#FBB03B', fontSize: 10, fontWeight: 'bold' }}>{user.accountID}</Text>
                                            <Text style={{ color: '#FBB03B', fontSize: 14, fontWeight: 'bold' }}>{(currentVolume.speed - miningData.recommanderSpeed) / 100000000} BTC(일)</Text>
                                        </View>
                                        <View style={{ position: 'absolute', right: 12, width: 100, height: 34, borderRadius: 25, backgroundColor: '#FBB03B', justifyContent: 'center', alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => {
                                                this.props.ChangeMenu('package');
                                                this.props.OnClose();
                                            }}>
                                                <Text style={{ fontSize: 14, color: '#fff' }}>업그레이드</Text>
                                                </TouchableOpacity>
                                        </View>

                                    </View>
                                    {/*  */}
                                    <View style={{flexDirection:'row', alignItems:'center', justifyContent:'center', marginTop:16}}>
                                        <View style={{alignItems:'center', marginLeft:'auto', marginRight:'auto'}}>
                                            <Image source={require('./assets/user-1-dot.png')} style={{width:6, height:6, display: this.state.currentIndex == 1 ? 'flex' : 'none'}}/>
                                            <Image source={require('./assets/user-1.png')} style={{marginTop:6, width:22, height:24}}/>
                                            <Text style={{color:'#095EB0', marginTop:7, fontSize:10}}>1대</Text>
                                        </View>

                                        <View style={{alignItems:'center', marginLeft:'auto', marginRight:'auto'}}>
                                            <Image source={require('./assets/user-2-dot.png')} style={{width:6, height:6, display: this.state.currentIndex == 2 ? 'flex' : 'none'}}/>
                                            <Image source={require('./assets/user-2.png')} style={{marginTop:6, width:22, height:24}}/>
                                            <Text style={{color:'#AD09A6', marginTop:7, fontSize:10}}>2대</Text>
                                        </View>

                                        <View style={{alignItems:'center', marginLeft:'auto', marginRight:'auto'}}>
                                            <Image source={require('./assets/user-3-dot.png')} style={{width:6, height:6,display: this.state.currentIndex == 3 ? 'flex' : 'none'}}/>
                                            <Image source={require('./assets/user-3.png')} style={{marginTop:6, width:22, height:24}}/>
                                            <Text style={{color:'#E20C40', marginTop:7, fontSize:10}}>3대</Text>
                                        </View>

                                        <View style={{alignItems:'center', marginLeft:'auto', marginRight:'auto'}}>
                                            <Image source={require('./assets/user-4-dot.png')} style={{width:6, height:6,display: this.state.currentIndex == 4 ? 'flex' : 'none'}}/>
                                            <Image source={require('./assets/user-4.png')} style={{marginTop:6, width:22, height:24}}/>
                                            <Text style={{color:'#D8700A', marginTop:7, fontSize:10}}>4대</Text>
                                        </View>

                                        <View style={{alignItems:'center', marginLeft:'auto', marginRight:'auto'}}>
                                            <Image source={require('./assets/user-5-dot.png')} style={{width:6, height:6, display: this.state.currentIndex == 5 ? 'flex' : 'none'}}/>
                                            <Image source={require('./assets/user-5.png')} style={{marginTop:6, width:22, height:24}}/>
                                            <Text style={{color:'#B3CB00', marginTop:7, fontSize:10}}>5대</Text>
                                        </View>

                                        <View style={{alignItems:'center', marginLeft:'auto', marginRight:'auto'}}>
                                            <Image source={require('./assets/user-6-dot.png')} style={{width:6, height:6,display: this.state.currentIndex == 6 ? 'flex' : 'none'}}/>
                                            <Image source={require('./assets/user-6.png')} style={{marginTop:6, width:22, height:24}}/>
                                            <Text style={{color:'#0CE256', marginTop:7, fontSize:10}}>6대</Text>
                                        </View>

                                        <View style={{alignItems:'center', marginLeft:'auto', marginRight:'auto'}}>
                                            <Image source={require('./assets/user-7-dot.png')} style={{width:6, height:6,display: this.state.currentIndex == 7 ? 'flex' : 'none'}}/>
                                            <Image source={require('./assets/user-7.png')} style={{marginTop:6, width:22, height:24}}/>
                                            <Text style={{color:'#0CE2D2', marginTop:7, fontSize:10}}>7대</Text>
                                        </View>
                                    </View>
                                    {/*  */}
                                    <View style={{backgroundColor:'#F5F5F5', borderRadius:10, height:40, alignItems:'center', flexDirection:'row'}}>
                                        <TouchableWithoutFeedback onPress={()=>{
                                            this.OnBackHistory();
                                        }}>
                                        <Image source={ this.state.currentIndex == 1 ? require('./assets/arrow-left-disable.png') : require('./assets/arrow-left.png')} style={{marginLeft:10, width:10}}/>
                                        </TouchableWithoutFeedback>
                                        <View style={{alignItems:'center', marginLeft:'auto', marginRight:'auto'}}>
                                            <Text style={{color:hierachyColor[this.state.currentIndex-1], fontSize:10}}>{this.state.currentIndex}대 추천자</Text>
                                            
                                            <Text style={{color:hierachyColor[this.state.currentIndex-1], fontSize:10}}>채산성의 {dataManager.getRecommanderHierarchyMiningRate(this.state.currentIndex-1) * 100}%</Text>
                                        </View>
                                        <View style={{alignItems:'center', marginLeft:'auto', marginRight:'auto'}}>
                                            <Text style={{color:hierachyColor[this.state.currentIndex], fontSize:10}}>{this.state.currentIndex+1}대 추천자</Text>
                                            
                                            <Text style={{color:hierachyColor[this.state.currentIndex], fontSize:10}}>채산성의 {dataManager.getRecommanderHierarchyMiningRate(this.state.currentIndex) * 100}%</Text>
                                        </View>
                                        <Image source={this.state.currentIndex == 6 ? require('./assets/arrow-right-disable.png') : require('./assets/arrow-right.png')} style={{marginRight:10, width:10}}/>
                                    </View>
                                    {/*  */}

                                    <View style={{ flexDirection: 'row', marginTop:8 }}>
                                        <View style={{ backgroundColor: '#F2F7FC', flex: 1, width: 'auto', marginRight: -4, borderRadius: 10, paddingTop: 8 }}>
                                            {
                                                this.state.currentIndexRecommanders.length > 0 ? (
                                                    Object.values(this.state.currentIndexRecommanders).map((value: any, index) => {
                                                        return (
                                                            <Card key={index} 
                                                                onPress={() => {
                                                                    if ( value.hasRecommanders == false )
                                                                        return;

                                                                    this.RequestRecommanderQuery(value.userID, index, false);
                                                                    this.setState({
                                                                        selectUserPosition :index+1
                                                                    });
                                                                }}
                                                                currentIndex={this.state.currentIndex}
                                                                user={{
                                                                    accountID: value.accountID,
                                                                    speed: value.depositedBitcoin * dataManager.getRecommanderHierarchyMiningRate(this.state.currentIndex - 1),
                                                                    hasRecommanders : value.hasRecommanders
                                                                }}
                                                                selected={index + 1 == this.state.selectUserPosition}
                                                            />
                                                        );
                                                    })) :
                                                    (
                                                        <EmptyCard currentIndex={this.state.currentIndex} />
                                                    )
                                            }
                                        </View>

                                        {/* Grid */}
                                        <HierachyLine 
                                            currentIndex={this.state.currentIndex} selectUserPosition={this.state.selectUserPosition} 
                                            currentHierachyCount={ this.state.currentIndexRecommanders.length } 
                                            nextHierachyCount={ (this.state.recommandersOfSelectedUser == null || this.state.recommandersOfSelectedUser.length == 0 ) ? 1 : this.state.recommandersOfSelectedUser.length} />    
                                        
                                        {/* Right */}
                                        <View style={{ backgroundColor: '#F8ECF8', flex: 1, width: 'auto', marginLeft: -4, borderRadius: 10, paddingTop: 8 }}>
                                            {(this.state.recommandersOfSelectedUser == null || this.state.recommandersOfSelectedUser.length == 0) ? (
                                                <EmptyCard currentIndex={this.state.currentIndex + 1} />
                                            ) : (
                                                    Object.values(this.state.recommandersOfSelectedUser).map((value: any, index) => {
                                                        return (
                                                            <Card
                                                                key={index}
                                                                onPress={() => {
                                                                    if ( this.state.currentIndex == 6 )
                                                                        return;

                                                                    if ( value.hasRecommanders == false )
                                                                        return;
                                                                    this.RequestRecommanderQuery(value.userID, index, true);
                                                                    this.state.selectUserPosition = index + 1;
                                                                    this.state.currentIndex++;
                                                                }}
                                                                currentIndex={this.state.currentIndex + 1}
                                                                user={{
                                                                    accountID: value.accountID,
                                                                    speed: value.depositedBitcoin * dataManager.getRecommanderHierarchyMiningRate(this.state.currentIndex),
                                                                    hasRecommanders : value.hasRecommanders
                                                                }}
                                                            />
                                                        );
                                                    })
                                                )}
                                        </View>
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
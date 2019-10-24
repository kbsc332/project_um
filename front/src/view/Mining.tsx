
import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Form, Modal, Input, Row, Table } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import { StyledMainLayout, LocaleText } from '../styled';
import { UseRedux } from '../store/store';
import { Client } from '../apollo/client';
import { RecommandersQuery } from '../apollo/query';
import { Link, Redirect } from 'react-router-dom';
import { any } from 'prop-types';


//assets

const { Content } = Layout;

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

const Card: React.FC<any> = (props) => {
    const index = props.index;
    const accountID = props.user.accountID;
    const speed = props.user.speed / 100000000;
    const selected = props.selected;

    var liClassName = 'card ' + ' recommander-' + (selected ? 0 : index) + ' recommander' +( selected ? 'Select-' : 'Border-') + index;

    if ( props.user.hasRecommanders == false )
        liClassName += ' recommander-disable';

    return (
        <li className={liClassName}>
            <div style={{ margin: 'auto 7px auto 30px' }}>
                { selected ? (
                    <img src={'images/icon/user-select.png'}/>
                ) : 
                (<img src={'images/icon/user-' + index + '.png'} />)}
            </div>
            <div style={{ textAlign: 'left', margin: 'auto 0 auto 0' }}>
                <div style={{fontSize:'12px'}}>{accountID}</div>
                <div className={'bold'} style={{ fontSize: '14px' }}>
                    {speed} <LocaleText id={'dayPerBTC'} />
                </div>
            </div>
        </li>
    );    
};

const EmptyCard: React.FC<any> = (props) => {
    const index = props.index;
    return (
        <li className={'card ' + ' recommander-' + index + ' recommanderBorder-' + index}>
            <div style={{ margin: 'auto 7px auto 30px' }}>
                <img src={'images/icon/user-' + index + '.png'} />
            </div>
            <div style={{ textAlign: 'left', margin: 'auto 0 auto 0' }}>
                <div className={'bold'} style={{ fontSize: '14px' }}>
                    <LocaleText id={'empty'} />
                </div>
            </div>
        </li>
    );    
};

const HierachyLine : React.FC<any> = (props) => {
    const tdClassName = 'recommanderBorder-' + props.currentIndex;
    const selectUserPosition = props.selectUserPosition;
    const currentHierachyCount = props.currentHierachyCount;
    const count:any= props.nextHierachyCount;
    
    const maxCount = Math.max(count, selectUserPosition);
    // 한 셀당 두개의 tr, 
    return (
        <table>
                {range(0, maxCount, 1).map((i) => {
                    return (
                        <tbody >
                            <tr>
                                <td>

                                </td>

                                <td className={tdClassName} 
                                    style={{
                                    border: '0px',
                                    borderLeft: (maxCount == 1 || i == 0 ) ? '0px' : '2px solid'
                                }}>

                                </td>
                            </tr>
                            <tr>
                                <td className={tdClassName} style={{
                                    border:'0px', 
                                    borderTop: (selectUserPosition - 1) == i ? '2px solid' : '0px'
                                }}>

                                </td>

                                <td className={tdClassName} style={{
                                    border: '0px',
                                    // borderTop: (count - 1) == i ? '2px solid' : '0px',
                                    borderTop: i < count ? '2px solid' : '0px',
                                    borderLeft: (maxCount == 1 || i == maxCount-1) ? '0px' : '2px solid'
                                }}>

                                </td>
                            </tr>
                        </tbody>
                    );
                })}
        </table>
    );
};

const Mining: React.FC<any> = (props) => {
    let account: any = localStorage.getItem('user');

    const [values, setValues] = useState({
        currentIndex : 1,
        selectUserPosition : 1,
        recommanderByUserList : {}, // 전체 유저별 추천자 목록 캐싱 list
        recommandersOfSelectedUser : [],
        currentIndexRecommanders : [],
        history : [],
        find : false,
    });

    if (account == null) {
        return (<Redirect to={'/login'}></Redirect>);
    }

    account = JSON.parse(account);

    const [AppState] = UseRedux();
    const now = Date.now();

    var miningData: any = AppState.miningData;

    var miningVolume = dataManager.getCurrentMiningVolumeAndSpeed(AppState.user, AppState.miningData);
    var speed = miningVolume.speed;
    var mySpeed = dataManager.getDefaultMiningValue();
    var currentPackage = dataManager.getPackageDataByBitcoinRange( Number(AppState.user.depositedBitcoin) + miningVolume.volume);
    if ( currentPackage )
        mySpeed += currentPackage.volume;

    if (miningData.speedUpExpirationTime != 0 && now < miningData.speedUpExpirationTime) {
        speed += miningData.speedUp;
    }

    // 해당 userID를 추천한 사람들 쿼리.
    const RequestRecommanderQuery = async(userID : any, index : number, swap : boolean = false)=>{
        try
        {
            var data: any = values.recommanderByUserList;
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
            
            if ( AppState.user.userID != userID )
            {
                data[userID].recommanders = list;
                data[userID].requested = true;
            }

            var history : any= values.history;
            if ( AppState.user.userID == userID )
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
                
                setValues(initial => {
                    return {
                        ...initial,
                        history : history,
                        currentIndexRecommanders: list,
                        recommanderByUserList: data,
                        find: true
                    };
                });

                // 첫번째 것 선택
                if ( list.length > 0 )
                {
                    await RequestRecommanderQuery(list[0].userID, 0, false );
                }
            }
            else if ( swap ) 
            {
                // next껄 현재로 옮기고, 위에서 받은 유저를 next에 넣는다,
                var next = values.recommandersOfSelectedUser;
                
                history.push({
                    parentUserID : history[history.length-1].selectUserID,
                    selectUserID: userID,
                    index:index
                })

                setValues(initial => {
                    return {
                        ...initial,
                        history : history,
                        currentIndexRecommanders: next,
                        recommandersOfSelectedUser: list,
                        recommanderByUserList: data,
                        selectUserPosition : values.selectUserPosition
                    };
                });
            }
            else
            {
                history[history.length-1].index = index;
                history[history.length-1].selectUserID = userID;

                // next에 위에서 받은 유저를 넣는다.
                setValues(initial => {
                    return {
                        ...initial,
                        history : history,
                        recommandersOfSelectedUser: list,
                        recommanderByUserList: data,
                        selectUserPosition : values.selectUserPosition
                    };
                });
            }
        }
        catch(error)
        {

        }
    };

    // 뒤로가기 버튼 누를 때..
    const OnBackHistory = async() =>
    {
        if ( values.currentIndex == 1 )
            return;

        values.history.pop();
        var length = values.history.length;
        var data :any= values.history[length-1];
        var recommanders : any = values.recommanderByUserList;
        recommanders = recommanders[data.parentUserID].recommanders;
        values.selectUserPosition = Number(data.index+1);
        setValues(initial => {
            return {
                ...initial,
                currentIndex : values.currentIndex-1,
                currentIndexRecommanders: recommanders,
            };
        });

        RequestRecommanderQuery(data.selectUserID, data.index, false);
    };

    // 첫 진입 시, 쿼리 한번 요청.
    if ( values.find == false )
    {
        RequestRecommanderQuery(AppState.user.userID, 0, true);
    }

    var hasNextHierachy = (values.recommandersOfSelectedUser == null || values.recommandersOfSelectedUser.length == 0 ) == false ;
    return (
        <Layout style={{ background: '#F5F5F5' }}>
            <div style={{ textAlign: 'center' }}>
                <div >
                    <div style={{ marginTop: '70px', marginBottom: '17px', fontSize: '30px', color: '#222222' }}>
                        <LocaleText id={'miningSpeed.information'} />
                    </div>
                    <div style={{ marginBottom: '40px', fontSize: '16px', color: '#222222' }}>
                        <LocaleText id={'miningSpeed.description'} />
                    </div>
                </div>
                <div className={'miningSpeed-information-container'}>
                    <div className={'header'}>
                        <div style={{ margin: 'auto' }}>
                            <div>
                                <LocaleText id={'miningSpeed.current.volumePerDay'} />
                            </div>
                            <div className={'desc'}>
                                {(speed / 100000000)} <LocaleText id={'dayPerBTC'} />
                            </div>
                        </div>
                    </div>
                    {/* 내 정보 */}
                    <div className={'my-information'}>
                        <div style={{ margin: 'auto' }}>
                            <div>
                                <LocaleText id={'miningSpeed.user'} />
                            </div>
                            <div className={'desc'}>
                                <div className={'flex'} style={{ paddingLeft: '29px', paddingRight: '21px', height: '80px' }}>
                                    <span style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                                        <img src={'/images/icon/user-icon.png'} />
                                    </span>
                                    <span style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: '20px', textAlign: 'left', marginRight: 'auto' }}>
                                        <div>
                                            {AppState.user.accountID}
                                        </div>
                                        <div className={'bold'} style={{ fontSize: '20px' }}>
                                            {(mySpeed / 100000000)} <LocaleText id={'dayPerBTC'} />
                                        </div>
                                    </span>
                                    <span style={{ marginTop: 'auto', marginBottom: 'auto', marginRight: '0px', minWidth: '180px' }}>
                                        <Link to={'/package'}>
                                            <div className={'upgrade'} style={{ height: '40px', display: 'flex' }}>
                                                <div style={{ margin: 'auto' }}>
                                                    <LocaleText id={'upgrade'} />
                                                </div>
                                            </div>
                                        </Link>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 세대 정보 */}
                    <div className={'hierachy'}>
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        <img src={'/images/icon/user-1-dot.png'} className={ values.currentIndex == 1 ? '' : 'invisible'} />
                                    </td>
                                    <td>
                                        <img src={'/images/icon/user-2-dot.png'} className={ values.currentIndex == 2 ? '' : 'invisible'}/>
                                    </td>
                                    <td>
                                        <img src={'/images/icon/user-3-dot.png'} className={ values.currentIndex == 3 ? '' : 'invisible'}/>
                                    </td>
                                    <td>
                                        <img src={'/images/icon/user-4-dot.png'} className={ values.currentIndex == 4 ? '' : 'invisible'}/>
                                    </td>
                                    <td>
                                        <img src={'/images/icon/user-5-dot.png'} className={ values.currentIndex == 5 ? '' : 'invisible'}/>
                                    </td>
                                    <td>
                                        <img src={'/images/icon/user-6-dot.png'} className={ values.currentIndex == 6 ? '' : 'invisible'}/>
                                    </td>
                                    <td>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <img src={'images/icon/user-1.png'} width={'24px'} height={'26px'} />
                                    </td>
                                    <td>
                                        <img src={'images/icon/user-2.png'} width={'24px'} height={'26px'} />
                                    </td>
                                    <td>
                                        <img src={'images/icon/user-3.png'} width={'24px'} height={'26px'} />
                                    </td>
                                    <td>
                                        <img src={'images/icon/user-4.png'} width={'24px'} height={'26px'} />
                                    </td>
                                    <td>
                                        <img src={'images/icon/user-5.png'} width={'24px'} height={'26px'} />
                                    </td>
                                    <td>
                                        <img src={'images/icon/user-6.png'} width={'24px'} height={'26px'} />
                                    </td>
                                    <td>
                                        <img src={'images/icon/user-7.png'} width={'24px'} height={'26px'} />
                                    </td>
                                </tr>
                                <tr style={{fontSize:'12px'}}>
                                    <td className={'recommander-1'}>
                                        <FormattedMessage id={'miningSpeed.hierachy.recommander'} values={{ th: 1 }} />
                                    </td>
                                    <td className={'recommander-2'}>
                                        <FormattedMessage id={'miningSpeed.hierachy.recommander'} values={{ th: 2 }} />
                                    </td>
                                    <td className={'recommander-3'}>
                                        <FormattedMessage id={'miningSpeed.hierachy.recommander'} values={{ th: 3 }} />
                                    </td>
                                    <td className={'recommander-4'}>
                                        <FormattedMessage id={'miningSpeed.hierachy.recommander'} values={{ th: 4 }} />
                                    </td>
                                    <td className={'recommander-5'}>
                                        <FormattedMessage id={'miningSpeed.hierachy.recommander'} values={{ th: 5 }} />
                                    </td>
                                    <td className={'recommander-6'}>
                                        <FormattedMessage id={'miningSpeed.hierachy.recommander'} values={{ th: 6 }} />
                                    </td>
                                    <td className={'recommander-7'}>
                                        <FormattedMessage id={'miningSpeed.hierachy.recommander'} values={{ th: 7 }} />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {/*  */}
                    <div className={'tab'}>
                        <div className={'container'}>
                            <span style={{ margin: 'auto', marginLeft: '12px' }}>
                                {values.currentIndex == 1 ? (<img src={'/images/icon/arrow-left-disable.png'} />) : (
                                <img src={'/images/icon/arrow-left.png'} onClick={()=>{
                                    OnBackHistory();
                                }} />
                                )}
                            </span>
                            <span className={'recommander-' + values.currentIndex} style={{margin:'auto'}}>
                                <FormattedMessage id={'miningSpeed.hierachy.recommander'} values={{ th: values.currentIndex }} /><br/>
                                <FormattedMessage id={'miningSpeed.volume.rate'} values={{ value: 100 }}/>
                            </span>
                            <span className={'recommander-' + (values.currentIndex+1)} style={{margin:'auto'}}>
                                <FormattedMessage id={'miningSpeed.hierachy.recommander'} values={{ th: values.currentIndex+1 }} /><br/>
                                <FormattedMessage id={'miningSpeed.volume.rate'} values={{ value: 100 }}/>
                            </span>
                            <span style={{margin:'auto', marginRight:'12px'}}>
                                { ( values.currentIndex == 6 || hasNextHierachy == false ) ? (<img src={'/images/icon/arrow-right-disable.png'} />) : (<img src={'/images/icon/arrow-right.png'} />) }  
                            </span>
                        </div>
                    </div>
                    {/* 추천 유저 리스트 */}
                    <div style={{paddingTop:'5px', paddingBottom:'40px'}}>
                        <div style={{ margin: 'auto' }} className={'list'}>
                            {/* 왼쪽 리스트 */}
                            <div className={'container'} style={{}}>
                                <ul className={'recommander-background-' + (values.currentIndex-1)} style={{ marginRight: '-10px', paddingLeft: '10px', paddingRight: '10px' }}>
                                    { 
                                        values.currentIndexRecommanders.length > 0 ? (
                                            Object.values(values.currentIndexRecommanders).map((value: any, index) => {
                                                return (
                                                    <div
                                                        onClick={(e: any) => {
                                                            if ( value.hasRecommanders == false )
                                                                return;
                                                            RequestRecommanderQuery(value.userID, index, false);
                                                            values.selectUserPosition = index+1;
                                                        }}>
                                                        <Card index={values.currentIndex}
                                                            user={{
                                                                accountID: value.accountID,
                                                                speed: value.depositedBitcoin * dataManager.getRecommanderHierarchyMiningRate(values.currentIndex-1),
                                                                hasRecommanders: value.hasRecommanders
                                                            }}
                                                            selected={ index+1 == values.selectUserPosition}
                                                        />
                                                    </div>
                                                    );
                                            })) :
                                            (
                                                <EmptyCard index={values.currentIndex} />
                                            )
                                    }
                                </ul>
                            </div>
                            {/* 가운데... 라인 */}
                            <div style={{ zIndex: 1 }}>
                                <HierachyLine currentIndex={values.currentIndex} selectUserPosition={values.selectUserPosition} currentHierachyCount={ values.currentIndexRecommanders.length } nextHierachyCount={ (values.recommandersOfSelectedUser == null || values.recommandersOfSelectedUser.length == 0 ) ? 1 : values.recommandersOfSelectedUser.length} />
                            </div>
                            {/* 오른쪽 리스트 */}
                            <div className={'container'} style={{}}>
                                <ul className={'recommander-background-' + values.currentIndex} style={{ marginLeft: '-10px', paddingLeft: '10px', paddingRight: '10px' }}>
                                    { (values.recommandersOfSelectedUser == null || values.recommandersOfSelectedUser.length == 0 ) ? (
                                        <EmptyCard index={values.currentIndex+1}/>
                                    ) : (
                                        Object.values(values.recommandersOfSelectedUser).map((value: any, index) => {
                                            return (
                                                <div
                                                    onClick={(e: any) => {
                                                        if ( values.currentIndex == 6 )
                                                            return;

                                                        if ( value.hasRecommanders == false )
                                                                return;

                                                        RequestRecommanderQuery(value.userID, index, true);
                                                        values.selectUserPosition = index+1;
                                                        values.currentIndex++;
                                                    }}>
                                                    <Card index={values.currentIndex+1}
                                                        user={{
                                                            accountID: value.accountID,
                                                            speed: value.depositedBitcoin * dataManager.getRecommanderHierarchyMiningRate(values.currentIndex),
                                                            hasRecommanders: value.hasRecommanders
                                                        }}
                                                    />
                                                </div>
                                                );
                                        })
                                    ) }
                                    
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Mining;
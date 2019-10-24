import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Icon, message, Row, Col } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import { StyledMainLayout, LocaleText } from '../styled';
import Header from '../common/Header';
import { Link } from 'react-router-dom';
import PackageCard from '../common/PackageCard';
import { UseRedux } from '../store/store';
import {
    setIntervalAsync,
    clearIntervalAsync 
  } from 'set-interval-async/dynamic';


//assets

const { SubMenu } = Menu;
const { Content } = Layout;

const ReviewCard = (props: any) => {
    const reviewData = props.reviewData;
    const name = reviewData.name
    const btc = reviewData.miningBTC;
    const icon = reviewData.icon;
    const description = reviewData.description;
    return (
        <Col style={{ width: '550px', height: '290px', background: '#fff', borderRadius: '14px', margin: 'auto', marginBottom: '60px' }}>
            <div >
                <div style={{ marginTop: '-40px', marginLeft: '36px', width: '150px', height: '150px', display: 'inline-block' }}>
                    <img src={icon} />
                </div>
                <div style={{ background: '#f0', paddingLeft: '17px', paddingTop: '65px', display: 'inline', position: 'absolute', color: '#212121', fontSize: '20px' }}>
                    <FormattedMessage id={name} /> / {btc}
                    <span style={{ fontSize: '12px' }}> <FormattedMessage id="miningBitcoin" /> </span>
                </div>
                <div style={{ marginLeft: '40px', marginRight: '40px', marginTop: '20px', color: '#212121', fontSize: '14px' }}>
                    <FormattedMessage id={description} />
                </div>
            </div>
        </Col>
    );
}

const CurrentVolume = (props: any)  => {    
    const volume = props.AppState.miningData.speed * ((Date.now() - props.AppState.miningData.updateTime) / (3600 * 24 * 1000));
    const [counter, setCounter] = useState(volume + props.AppState.miningData.volume);
    const time = Math.max(((24*3600) / props.AppState.miningData.speed) * 1000, 100);
    useEffect(() => {
        const interval = setIntervalAsync(async () => {
            var result = dataManager.getCurrentMiningVolumeAndSpeed(props.AppState.user, props.AppState.miningData);
            setCounter(()=> {
                return result.volume;
            });
        }, time);
        return () => {
            clearIntervalAsync(interval);
        };
    }, [counter]);
    return ( <span>{Number(counter/100000000).toFixed(10).split('').map((char, index)=>{
        if ( char == '.' )
            return (<span key={index}><span ><span>{char}</span></span><span style={{fontSize:'30px'}}>{' '}</span></span>);
        return (
        <span key={index}>
            <span className={'background'} style={{position:'relative'}}>
                <span style={{color:'#868686'}}>8</span>
                <span style={{position:'absolute', right:'0px'}}>{char}</span>
            </span>
            <span style={{fontSize:'30px'}}>{' '}</span>
        </span>
        );
    })}</span>);
};

const Main: React.FC<any> = (props) => {
    const firstReview = dataManager.getReviewData(0);
    const secondReview = dataManager.getReviewData(1);

    const [AppState, AppActions] = UseRedux();

    var miningData : any = dataManager.getCurrentMiningVolumeAndSpeed( AppState.user, AppState.miningData );
    let speed = miningData.speed;
    if (AppState.isLoggedIn) {
        speed = miningData.speed;
        var appMiningData : any = AppState.miningData;
        if (appMiningData.speedUpExpirationTime != 0 && Date.now() < appMiningData.speedUpExpirationTime) {
            speed += appMiningData.speedUp;
        }
    }


    return (
        <div >
            {/* 
                메인 최상위 BG
                */}
                <div className={'main-top-bg'}>
            <img className={'main-top-bg-img'} src="/images/main_top_bg.png" alt="home" />
            </div>
            <Content>
                <div className={'main-top-container'}>
                    <div>
                        <div className={'main-top-content-title'}><LocaleText id={'mainDescription'} />
                        </div>
                        <div className={'main-top-content-button-container'}>
                            {AppState.isLoggedIn ? (<span />) : (
                            

                            <Link className={'main-top-content-button'} to={'/login'}>
                                <span style={{ textShadow: "0px 3px 6px rgba(1,1,1,0.1)" }}>
                                    <LocaleText id={"startFreeMining"} />
                                </span>
                            </Link>)}
                        </div>
                    </div>
                </div>
            </Content>

            {/* 무료 채산성 */}
            <Content>
                {AppState.isLoggedIn ? (
                    <div className={'mining-information-container'}>
                        <div className={'mining-container'} >
                            <div className={'mining-information-title'}>
                                <LocaleText id={'currentMiningBitcoin'} />
                                </div>
                            <div style={{ display: 'flex' }}>
                                <span >
                                    { miningData.avaliableMiningVolume == 0  ? (
                                    <div style={{textAlign:'right', fontSize:'18px', color:'#EFEFEF', fontFamily:'NotoSans'}}>
                                        <img src={'/images/information.png'} style={{marginRight:'10px'}}/> 일일 최대 채굴량에 도달하여 더 이상 채굴할 수 없습니다.
                                    </div>
                                    ) : (<div/>)}
                                    <div className={'mining-information-mining-value'} style={{ fontFamily: 'Digital-7' }}>
                                        <CurrentVolume AppState={AppState} AppActions={AppActions} />
                                    </div>
                                </span>
                                <span className={'mining-information-mining-unit'} style={{marginTop:'auto', marginBottom:'0'}}> BTC</span>
                            </div>

                            <Link className={'mining-information-withdrawal-button-container'} to={'/withdrawal'}>
                                    <span className={'mining-information-withdrawal-button'}>
                                    <LocaleText id = {'withdrawal'} />    
                                    </span>
                            </Link>
                        </div>
                        <table style={{textAlign:'left', marginLeft:'60px', marginTop:'50px'}}>
                            <tbody>
                                <tr>
                                    <td style={{paddingBottom:'20px'}}>

                                        <div className={'mining-information-title'}><LocaleText id={'miningVolumePerDay'} /></div>
                                    </td>

                                    <td className={'second-td'}>
                                        <div className={'mining-information-title'}><LocaleText id={'currentPoint'} /></div>
                                    </td>
                                </tr>
                                <tr >
                                    <td style={{paddingBottom:'20px'}}>
                                        <span className={'miningVolume-information-mining-value'}>{Number(speed / 100000000).toFixed(8)}
                                            <span className={'miningVolume-information-mining-unit'}> <LocaleText id={'dayPerBTC'} /></span>
                                        </span>
                                    </td>

                                    <td className={'second-td'}>
                                        <span className={'miningVolume-information-mining-value'}>{Number(AppState.user.depositedBitcoin) / 100000000}
                                            <span className={'miningVolume-information-mining-unit'}> UM</span>
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{paddingBottom:'20px'}}>
                                <Link className={'miningVolume-information-withdrawal-button-container'} to={'/package'}>
                                    <span className={'miningVolume-information-withdrawal-button'}>
                                        <LocaleText id={'upgrade'} />
                                        </span>
                                </Link>
                                </td>
                                    <td className={'second-td'}>
                                <Link className={'um-information-withdrawal-button-container'} to={'/point_charge'}>
                                    <span className={'um-information-withdrawal-button'}>
                                        <LocaleText id={'pointCharge'} /></span>
                                </Link></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                        <div className={'main-free-mining-container'}>
                            <div>
                                <div>
                                    <div className={'main-free-mining-title'}><LocaleText id={'miningVolumePerDay'} /></div>
                                    <span className={'main-free-mining-value'}>{Number(dataManager.getDefaultMiningValue() / 100000000) + ' '}</span>
                                    <span className={'main-free-mining-unit'}><LocaleText id={'dayPerBTC'} /></span>
                                </div>
                            </div>
                        </div>
                    )}
            </Content>

            {/* 패키지 정보 */}
            <Content>
                <div>
                    <div className={'package-information-description'}>
                        <FormattedMessage
                            id='recommendation.purchase.miner'
                            values={{ n: <br /> }}
                        />
                    </div>
                    <div className={'main-package-content'} >
                        <Row type="flex"  >
                            <PackageCard data={dataManager.getPackageData(1)} />
                            <PackageCard data={dataManager.getPackageData(2)} />
                            <PackageCard data={dataManager.getPackageData(3)} />
                            <PackageCard data={dataManager.getPackageData(4)} />
                            <PackageCard data={dataManager.getPackageData(5)} />
                            <PackageCard data={dataManager.getPackageData(6)} />
                        </Row>
                    </div>
                </div>
            </Content>

            {/* 리뷰 */}
            <div  className={'review-container'} style={{ width: '100%' }}>
                <Content>
                    <div>
                        <div>
                            <div style={{ paddingTop: '70px', paddingBottom: '126px', color: '#fff', fontSize: '40px', textAlign: 'center' }}>
                                <LocaleText id={'reviewDescription'} />
                            </div>
                            <Row type="flex">
                                {(firstReview ? (<ReviewCard reviewData={firstReview} />) : (<span />))}
                                {(secondReview ? (<ReviewCard reviewData={secondReview} />) : (<span />))}
                            </Row>
                            {/* 무료 채굴하기 */}
                            <div style={{
                                color: '#fff',
                                marginTop: '40px',
                                paddingBottom: '70px',
                                lineHeight: '50px',
                                textAlign: 'center'
                            }}>
                                <Link to={AppState.isLoggedIn ? 'package' : '/login'}>
                                    <span className={'main-top-content-button'}>
                                        <span style={{ textShadow: "0px 3px 6px rgba(1,1,1,0.1)" }}>
                                            <LocaleText id={AppState.isLoggedIn ? 'upgrade' : 'startFreeMining'} />
                                        </span>
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Content>
            </div>
        </div>
    );
};

export default Main;
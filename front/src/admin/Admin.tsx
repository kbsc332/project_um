
import React, { useState, useEffect } from 'react';
import { Layout, Menu, TimePicker, Button, Modal, DatePicker } from 'antd';
import { FormattedMessage, useIntl } from 'react-intl'
import dataManager from '../dataManager/dataManager';
import { StyledMainLayout, LocaleText } from '../styled';
import { Link, Redirect } from 'react-router-dom';
import { UseRedux } from '../store/store';
import { Client } from '../apollo/client';

import moment from 'moment';
import { RequestWithdrawalHistoryQuery, RequestHistoryQuery, GetEventTimeDataQuery, SetEventTimeDataMutation, RequestIssueMutation, GetIssueListQuery, RequestIssueCompleteMutation } from '../apollo/query';
//assets

const { SubMenu } = Menu;
const { Content } = Layout;


const Admin: React.FC<any> = (props) => {
    const [AppState, AppActions] = UseRedux();

    const [menuItemData, setMenuItemData]: any = useState([]);
    const [values, setValues]: any = useState({
        currentMenu: "withdrawal",
        withrawalHistory: null,

        // issue 
        issueDate: 0,
        issueList: null, 
        
        history: null,

        //event
        eventTimeData: null,
        eventStartTime: '00:00:00',
        eventEndTime: '23:59:59',

    });

    const intl = useIntl();

    const RequestHistory = async () => {
        const log = await Client.query({
            query: RequestHistoryQuery
        })
        global.console.log(log.data.requestHistory)
        setValues(initial => {
            return {
                ...initial,
                history: log.data.requestHistory,
            };
        });
    }

    const RequestEventTimeData = async () => {
        const result = await Client.query({
            query: GetEventTimeDataQuery
        })
        global.console.log(result.data.getEventOpenTime)

        setValues(initial => {
            return {
                ...initial,
                eventTimeData: result.data.getEventOpenTime,
                eventStartTime: result.data.getEventOpenTime.startTime,
                eventEndTime: result.data.getEventOpenTime.endTime,
            };
        });
    }

    const RequestSetEventTimeData = async () => {
        try {
            const result = await Client.mutate({
                mutation: SetEventTimeDataMutation,
                variables: { startTime: values.eventStartTime, endTime: values.eventEndTime }
            })

            Modal.info({
                content: (
                    <div>
                        변경 성공!
                    </div>
                ),
                onOk() { },
            });
        }
        catch
        {
            Modal.info({
                content: (
                    <div>
                        변경 실패!
                    </div>
                ),
                onOk() { },
            });
        }
    }
    
    const RequestIssueList = async () => {
        const result = await Client.query({
            query:GetIssueListQuery,
            variables:{date:values.issueDate}
        });

        setValues(initial => {
            return {
                ...initial,
                issueList: result.data.getIssueList,
            };
        });
    }

    const RequestIssueComplete = async (issueID) => {

        const result = await Client.mutate({
            mutation:RequestIssueCompleteMutation,
            variables:{issueID:issueID}
        });
        await RequestIssueList();
    }

    const RequestWithdrawalHistory = async () => {
        const log = await Client.query({
            query: RequestWithdrawalHistoryQuery
        })
        setValues(initial => {
            return {
                ...initial,
                withrawalHistory: log.data.requestWithdrawalHistory,
            };
        });
    }

    if (values.withrawalHistory == null)
        RequestWithdrawalHistory();

    const RenderEvent = () => {
        return (
            <div>
                <div style={{ display: values.eventTimeData == null ? 'none' : 'block' }}>
                    GMT+09 시 기준, 이벤트가 오픈될 시간 범위를 설정할 수 있습니다.
                    <div>
                        <TimePicker onChange={(time, timeString) => {

                            setValues(initial => {
                                return {
                                    ...initial,
                                    eventStartTime: timeString,
                                };
                            });
                        }} defaultValue={moment(values.eventStartTime, 'HH:mm:ss')} defaultOpenValue={moment(values.eventStartTime, 'HH:mm:ss')} />
                        ~
                        <TimePicker onChange={(time, timeString) => {
                            setValues(initial => {
                                return {
                                    ...initial,
                                    eventEndTime: timeString,
                                };
                            });
                        }} defaultValue={moment(values.eventEndTime, 'HH:mm:ss')} efaultOpenValue={moment(values.eventEndTime, 'HH:mm:ss')} />
                    </div>
                    <div>
                        <Button onClick={() => {
                            RequestSetEventTimeData();
                        }}>설정</Button>
                    </div>
                </div>
                <div style={{ display: values.eventTimeData == null ? 'block' : 'none' }}>
                    loading...
                </div>
            </div>
        )
    }

    const RenderHistory = () => {
        return (
            <table style={{ width: '100%', margin: '20px', paddingBottom: '20px', marginBottom: '100px' }}>
                <tbody>
                    <tr>
                        <td>
                            ID
                    </td>
                        <td>
                            날짜/시간
                    </td>
                        <td>
                            아이디
                    </td>
                        <td>
                            액션
                    </td>
                        <td>
                            BTC
                    </td>
                        <td>
                            트랜잭션
                    </td>
                        <td>
                            블럭 높이
                    </td>
                    </tr>
                    {
                        values.history && values.history.length > 0 ?
                            values.history.map((history) => {
                                var type = "";
                                if (history.type == 0)
                                    type = "입금"
                                else if (history.type == 1)
                                    type = "지급완료"
                                else if (history.type == 2)
                                    type = "소비"
                                else if (history.type == 3)
                                    type = "출금"
                                else if (history.type == 4)
                                    type = "회원가입"
                                return (
                                    <tr>
                                        <td>
                                            {history.index}
                                        </td>
                                        <td>
                                            {new Date(history.updateTime * 1000).toUTCString()}
                                        </td>
                                        <td>
                                            {history.accountID}
                                        </td>
                                        <td>
                                            {type}
                                        </td>
                                        <td>
                                            {(history.value / 100000000).toFixed(8)}
                                        </td>
                                        <td>
                                            {history.transaction}
                                        </td>
                                        <td>
                                            {history.blockHeight}
                                        </td>
                                    </tr>
                                )
                            })
                            : (<div />)
                    }
                </tbody>
            </table>
        )
    }

    const RenderIssue = () => {
        return (
            <div>
                <div>

                    <DatePicker onChange={(time, stringTime) => {
                        values.issueDate = time.unix()*1000;
                    }} />

                    <Button onClick={() => {
                        RequestIssueList();
                    }}>검색</Button>
                </div>
                <div>
                    <table style={{ width: '100%', margin: '20px', paddingBottom: '20px', marginBottom: '100px' }}>
                        <tbody>
                            <tr>
                                <td style={{width:'100px'}}>
                                    고유 아이디
                                </td>
                                <td style={{width:'200px'}}>
                                    이메일
                                </td>
                                <td style={{width:'300px'}}>
                                    내용
                                </td>
                                <td >
                                    등록 날짜
                                </td>
                                <td>
                                    진행 상태
                                </td>
                            </tr>
                            {
                                values.issueList && values.issueList.length > 0 ?
                                    values.issueList.map((issue) => {
                                        return (
                                            <tr>
                                                <td>
                                                    {issue.issueID}
                                                </td>
                                                <td style={{width:'200px'}}>
                                                    {issue.email}
                                                </td>
                                                <td>
                                                    {issue.text}
                                                </td>
                                                <td style={{width:'200px'}}>
                                                    {new Date(issue.date).toISOString()}
                                                </td>
                                                <td>
                                                    {issue.processComplete ? "완료" : <Button onClick={()=>{
                                                        RequestIssueComplete(issue.issueID);
                                                        issue.processComplete = true;
                                                    }}>완료로 변경</Button>}
                                                </td>
                                            </tr>
                                        )
                                    })
                                    : (<div />)
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    const RenderWithdrawal = () => {
        return (
            <table style={{ width: '100%', margin: '20px', paddingBottom: '20px', marginBottom: '100px' }}>
                <tbody>
                    <tr>
                        <td>
                            날짜/시간
                    </td>
                        <td>
                            아이디
                    </td>
                        <td>
                            출금 BTC
                    </td>
                        <td>
                            출금 주소
                    </td>
                        <td>
                            상황
                    </td>
                        <td>
                            액션
                    </td>
                    </tr>
                    {
                        values.withrawalHistory && values.withrawalHistory.length > 0 ?
                            values.withrawalHistory.map((history) => {
                                return (
                                    <tr>
                                        <td>
                                            {new Date(history.updateTime * 1000).toISOString()}
                                        </td>
                                        <td>
                                            {history.accountID}
                                        </td>
                                        <td>
                                            {(history.value + history.fee) / 100000000} BTC
                    </td>
                                        <td>
                                            {history.bitcoinDepositAddress}
                                        </td>
                                        <td>
                                            처리중
                    </td>
                                        <td>

                                        </td>
                                    </tr>
                                )
                            })
                            : (<div />)
                    }
                </tbody>
            </table>
        )
    }

    return (
        <div style={{ background: '#F5F5F5' }}>
            <div className={'flex'}>
                <div style={{ margin: 'auto', marginTop: '66px', fontSize: '30px' }}>
                    관리자 페이지
            </div>
            </div>
            <div style={{ marginLeft: '83px', marginRight: '83px' }}>
                <div style={{ marginLeft: '20px', display: 'flex' }}>
                    <span style={{
                        width: '93px',
                        color: values.currentMenu == "withdrawal" ? '#fff' : '#262626',
                        background: values.currentMenu == "withdrawal" ? '#4C84FF' : '#E6E6E6', borderTopLeftRadius: '5px', borderTopRightRadius: '5px', lineHeight: '53px'
                    }} onClick={() => {
                        setValues(initial => {
                            return {
                                ...initial,
                                currentMenu: "withdrawal"
                            };
                        });
                    }}>
                        <span style={{ height: '53px', display: 'flex' }}>
                            <span style={{ margin: 'auto' }}>출금관리</span>
                        </span>
                    </span>
                    <span style={{
                        width: '93px',
                        marginLeft: '10px',
                        color: values.currentMenu == "issue" ? '#fff' : '#262626',
                        background: values.currentMenu == "issue" ? '#4C84FF' : '#E6E6E6', borderTopLeftRadius: '5px', borderTopRightRadius: '5px', lineHeight: '53px'
                    }} onClick={() => {
                        setValues(initial => {
                            return {
                                ...initial,
                                currentMenu: "issue"
                            };
                        });
                    }}>
                        <span style={{ height: '53px', display: 'flex' }}>
                            <span style={{ margin: 'auto' }}>고객 문의</span>
                        </span>
                    </span>
                    <span style={{
                        marginLeft: '10px', width: '93px', height: '53px',
                        color: values.currentMenu == "event" ? '#fff' : '#262626',
                        background: values.currentMenu == "event" ? '#4C84FF' : '#E6E6E6', borderTopLeftRadius: '5px', borderTopRightRadius: '5px', lineHeight: '53px'
                    }} onClick={() => {
                        if (values.eventTimeData == null)
                            RequestEventTimeData();
                        setValues(initial => {
                            return {
                                ...initial,
                                currentMenu: "event"
                            };
                        });
                    }}>
                        <span style={{ height: '53px', display: 'flex' }}>
                            <span style={{ margin: 'auto' }}>이벤트 설정</span>
                        </span>
                    </span>

                    <span style={{
                        marginLeft: '10px', width: '93px', height: '53px',
                        color: values.currentMenu == "history" ? '#fff' : '#262626',
                        background: values.currentMenu == "history" ? '#4C84FF' : '#E6E6E6', borderTopLeftRadius: '5px', borderTopRightRadius: '5px', lineHeight: '53px'
                    }} onClick={() => {
                        global.console.log(values.history)
                        if (values.history == null)
                            RequestHistory();
                        setValues(initial => {
                            return {
                                ...initial,
                                currentMenu: "history"
                            };
                        });
                    }}>
                        <span style={{ height: '53px', display: 'flex' }}>
                            <span style={{ margin: 'auto' }}>로그</span>
                        </span>
                    </span>
                </div>
                <div style={{ background: '#fff' }}>
                    <div style={{ background: '#121E39', height: '5px', borderTopLeftRadius: 5, borderTopRightRadius: 5 }} />
                    {values.currentMenu == "withdrawal" ? <RenderWithdrawal /> : values.currentMenu == "history" ? <RenderHistory /> : values.currentMenu == "issue" ? <RenderIssue/> : <RenderEvent />}

                </div>
            </div>
        </div>
    );
};

export default Admin;
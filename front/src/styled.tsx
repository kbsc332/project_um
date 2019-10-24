import styled, {keyframes} from 'styled-components';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl'

export default styled;
export const Keyframes = keyframes;

export const StyledMainLayout = styled.div`
a {
    color: '#fff';
  }
// antd 기본 스타일 보정..
.ant-layout
{
    background:none;
}

.flex
{
    display:flex;
}

.ant-layout-content{
    margin-left:110px;
    margin-right:110px;
    background-color: #FFFFFF;
    > .container {
        border-radius: 5px;
    }
    background:none !important;
}

// 1336px + 110px margin + 110 = 1556;
@media(min-width:1556px)
{
    .ant-layout-content{
        margin-left:auto;
        margin-right:auto;
        width:1336px;
    }
}

.ant-menu-horizontal{
    border-bottom:0px;
    margin-top:-2px;
}

.ant-menu-horizontal > .ant-menu-submenu
{
    border-bottom:0px;
}

.ant-menu-horizontal > .ant-menu-item
{
    border-bottom:0px;
}

.ant-menu-horizontal > .ant-menu-item > a
{
    color:inherit;
}

.ant-menu-inline{
    border-bottom:0px;
    margin-top:-2px;
}

.ant-menu-inline > .ant-menu-submenu
{
    border-bottom:0px;
}

.ant-menu-inline > .ant-menu-item
{
    border-bottom:0px;
}

.ant-menu-inline > .ant-menu-item > a
{
    color:inherit;
}

.ant-layout-header {
    padding: 0 110px 0 110px
    background-color: #ffffff;
    height : 80px;
    z-index: 1;
    box-shadow: rgba(0,0,0, 0.2) 0px 5px 10px;
}

.ant-menu {
    color: #01467F;
    font-size: 16px;
}

// 헤더 메뉴 아이템, 마진
.ant-menu-submenu-title{
    padding: 0 21px 0 21px;
}

.desktop-menu {
    display: flex;
}

.desktop-menu ul{
    float:right;
}

.open-menu-btn {
    display: none;
    right: 15px;
    color: #fff !important;
}

.header-icon{
    vertical-align:bottom;
}

.footer-icon{
    vertical-align:bottom;
    position:relative;
    top:40px;
}


//// Main


// 헤더 아래 상위 콘텐츠.
.main-top-container
{
    color:#fff !important;
    line-height:normal;
    display:table;
    height:420px;
    width:100%;
    text-align:center;
    > div {
        display:table-cell;
        vertical-align:middle;
        margin-left:auto;
        margin-right:auto
    }
}

.main-top-content-title{
    font-size:50px;
}

.main-top-content-button-container{
    margin-top: 40px;
    line-height:50px;
}

.main-top-content-button{
    padding: 14px 80px;
    font-size:20px;
    color:#fff !important;
    background:#FBB03B;
    border-radius: 25px;
}

// 메인 최상위 bg
.main-top-bg {
    position: absolute;
    overflow:hidden;
    height:560px;
    top: 0px;
    width:100%;
    z-index:-1;
    margin-left: 50%;
    transform:translateX(-50%)
}

@media (min-width: 1366px)
{
    // 메인 최상위 
    .main-top-bg-img{
        width:100%;
    }
}

// 무료 채산성
.main-free-mining-container{
    background: radial-gradient(circle at 70% 25%, #4285BA 0%, #01467F 60%, #2B4E6D 100%);
    height:274px;
    border-radius: 20px;
    box-shadow: rgba(0,0,0,0.2) 3px 8px 20px;
    display:flex;
    width:100%;
    > div {
        vertical-align:middle;
        margin:auto;
        //position:absolute;

        // top: 55%;
        //left: 50%;
        //transform: translate(-50%, 0%);
    }
}
.main-free-mining-container::after
{
    //content:'';

    background-image:url("/images/metal_background.png") ;
    border-radius: 20px;
    position: relative;
    top: 0px;
    left: 0;
    width: 100%;
    height: 100%;
    opacity:0.1;
    background-size: contain;
}

.main-free-mining-title{
    font-weight:bold;
    font-size:24px;
    color:#fff; 
    text-shadow:0px 3px 6px rgba(0,0,0,0.16);
}
.main-free-mining-value{
    font-size:70px;
    font-family:'Futura';
    text-shadow:0px 3px 6px rgba(0,0,0,0.2);
    color:#FFFFFF;
}

.main-free-mining-unit{
    font-size:28px;
    font-family:'Futura';
    text-shadow:0px 3px 6px rgba(0,0,0,0.2);
    color:#FFFFFF;
}

// rounding button
.rounding-button {
    padding:0px 20px;
    color: #fff !important;
    margin-left : 22px;
    background-color: #01467F;
    border-radius: 20px;
    line-height: 40px !important;
    margin-top:20px;
    margin-bottom:20px;
}


.mobile-menu
{
    display:none;
    height:80px;
}

@media(max-width:1110px)
{
    .ant-layout-header
    {
        padding: 0px;
    }
    
    .ant-layout-header
    {
        padding: 0px;
    }
    
    .desktop-menu{
        display:none;
    }
    
    .header-icon{
        display:none;
    }

    .mobile-menu{
        display:flex;
    }
}

.main-package-content
{
    margin-bottom:27px;
}


.package-content
{
    margin:110px;
    margin-top: 100px;
    margin-bottom: 282px;
}   
// 패키지 정보 카드..
.package-information-description
{
    text-align:center;
    margin-top: 90px;
    margin-bottom: 70px;
    font-size: 40px;
    color:#1C1C1C;
}

.package-information-container
{
    position:relative;
    width:340px;
    margin:auto;
    margin-bottom:53px;
    min-height:400px;
    background: url('/images/package_bg.png') no-repeat;
}

.package-information-title
{
    background: radial-gradient(circle at 70% 30%, #225F90 0%, #193F60 50%, #1A4469 100%);
    line-height:40px;
    font-weight:bold;
    color:#fff;
    text-align:center;
    font-size:20px;
}

.package-information-footer
{
    position:absolute;
    bottom:0px;
    background:#F8F8F8;
    width:100%;
    height:160px;
}

.package-information-detail{
    font-size:16px;
    font-weight:bold;
    height:60px;
    margin-left: 40px; 
    margin-right: 40px; 
    margin-top: 17px; 
    margin-bottom: 20px; 
    > tr {
        > td{
        width:50%;
        }
    }
}

.package-information-purchase-container{
    line-height:40px;
    width:200px;
    margin-left:70px;
    margin-right:70px;
    background-color: #FBB03B;
    border-radius: 20px;
    text-align : center;
    border:0px;
    box-shadow:none;
}

.package-information-purchase{
    color:#fff;
    font-size:16px;
}

// 리뷰
.review-container{
    background: radial-gradient(circle at 70% 25%, #4285BA 0%, #01467F 60%, #2B4E6D 100%);
}

// 로그인 폼
.login-form-container{
    width:630px;
    height:350px;
    background:#fff;
    border-radius:10px;
    margin:auto;
    .form-item-input
    {
        height:40px;
    }

    .form-item-text
    {
        font-size:14px;
        color:#01467F;
        text-align:left;
        margin-bottom:4px;
    }
    .form-item-submit
    {
        margin-top:26px;
        font-size:16px;
        padding: 0px 60px 0px 60px;
        border-radius: 20px;
        background:#01467F;
        box-shadow: rgba(0,0,0,0.2) 0px 5px 10px;
        border:0px;
    }
}

// 회원가입 폼
.signup-form-container{
    width:630px;
    height:790px;
    background:#fff;
    border-radius:10px;
    margin:auto;
    margin-bottom:70px;
    .form-item-input
    {
        height:40px;
    }
    .form-item-account-confirm
    {
        font-size:14px;
        width:100px;
        margin-left:10px;
        background:#FBB03B;
        padding: 0px 23px 0px 23px;
        border-radius: 20px;
        border:0px;
    }

    .form-item-text
    {
        font-size:14px;
        color:#01467F;
        text-align:left;
        margin-bottom:4px;
    }
    .form-item-submit
    {
        margin-top:26px;
        font-size:16px;
        background:#01467F;
        padding: 0px 60px 0px 60px;
        border-radius: 20px;
        box-shadow: rgba(0,0,0,0.2) 0px 5px 10px;
        border:0px;
    }
}

// 채굴 현황
.mining-information-container
{
    background: radial-gradient(circle at 70% 25%, #4285BA 0%, #01467F 60%, #2B4E6D 100%);
    min-height:637px;
    border-radius: 20px;
    box-shadow: rgba(0,0,0,0.2) 3px 8px 20px;
    width:100%;
    text-align:center;
    > div {
        vertical-align:middle;

        margin-left:auto;
        margin-right:auto
    }

    .mining-container
    {
        text-align: left;
        margin-left: 60px
        padding-top: 50px;
        margin-right:130px;
        border-bottom: 1px solid #FFF;

    }

    .mining-information-title{
     font-size:20px;
     color:#fff;
     text-shadow:0px 3px 6px rgba(0,0,0,0.16);
    }

    .background{
        background: linear-gradient( 0deg, #0A0A0A, #535353, #0E0E0E, #000000);
    }
    .mining-information-mining-value
    {
        font-size:100px;
        color:#33FF52;
        text-shadow:0px 0px 10px rgba(0,0,0,0.5);
        font-family:'Futura';
    }
    
    .mining-information-mining-unit{
        font-size:30px;
        color:#33FF52;
        font-family:'Futura';
    }

    .miningVolume-information-mining-value
    {
        font-size:47px;
        color:#FFFFFF;
        font-family:'Futura';
    }

    .miningVolume-information-mining-unit{
        
        font-size:19px;
        color:#FFFFFF;
        font-family:'Futura';
    }

    .mining-information-withdrawal-button-container{
        margin-top:16px;
        display:flex;
        margin-top:auto;
        margin-bottom:auto;
        height:60px;
        background:#005FAD;
        width:306px;
        border-radius: 30px;
        box-shadow:rgba(54,154,235,100) 0px 0px 30px;
        margin-bottom:50px;
    }

    .mining-information-withdrawal-button{
        font-size:20px;
        color:#FFF;
        margin:auto;
        display:flex;
        text-shadow:0px 3px 6px rgba(1,1,1,0.1)
    }

    .miningVolume-information-withdrawal-button-container{
        display:flex;
        margin-top:auto;
        margin-bottom:auto;
        height:60px;
        margin-right:70px;
        margin-left:auto;
        background: #FBB03B;
        width:306px;
        border-radius: 30px;
        box-shadow:rgba(251,176,59,100) 0px 0px 30px;
    }

    .miningVolume-information-withdrawal-button{
        font-size:20px;
        color:#FFF;
        font-weight:bold;
        margin:auto;
        display:flex;
        text-shadow:0px 3px 6px rgba(1,1,1,0.1)
    }

    .um-information-withdrawal-button-container{
        display:flex;
        margin-top:auto;
        margin-bottom:auto;
        height:60px;
        margin-right:70px;
        margin-left:auto;
        background: #EFEFEF;
        width:306px;
        border-radius: 30px;
        box-shadow:rgba(0,0,0,0.2) 0px 5px 10px;
        box-shadow:rgba(255,255,255,100) 0px 0px 30px;
    }

    .um-information-withdrawal-button{
        font-weight:bold;
        font-size:20px;
        color:#0F0F0F;
        margin:auto;
        display:flex;
        text-shadow:0px 3px 6px rgba(1,1,1,0.1)
    }

    .second-td
    {
        padding-left:60px;
        padding-bottom:20px;
    }
}

// 패키지 정보 
.package-top-container
{
    color:#fff !important;
    line-height:normal;
    display:table;
    height:480px;
    width:100%;
    text-align:center;
    > div {
        display:table-cell;
        vertical-align:middle;
        margin-left:auto;
        margin-right:auto
    }
}
.package-title
{
    color:#FBB03B !important;
    font-size:50px;
    padding-top:16px;
}

.package-sub-title
{
    font-size:16px;
    padding-top:30px;
}

// 출금 폼

.withdrawal-form-container{
    width:630px;
    background:#fff;
    border-radius:10px;
    margin:auto;
    margin-bottom:60px;

    > form  {
        padding: 50px 110px 50px 110px;
    }

    .form-item-input
    {
        height:40px;
    }

    .form-item-account-confirm
    {
        font-size:14px;
        width:100px;
        margin-left:10px;
        background:#FBB03B;
        padding: 0px 23px 0px 23px;
        border-radius: 20px;
        border:0px;
    }

    .form-item-text
    {
        font-size:14px;
        color:#000;
        text-align:left;
        margin-bottom:4px;
    }
    .form-item-submit
    {
        margin-top:34px;
        margin-bottom:40px;
        font-size:16px;
        background:#01467F;
        padding: 0px 60px 0px 60px;
        border-radius: 20px;
        box-shadow: rgba(0,0,0,0.2) 0px 5px 10px;
        border:0px;
    }

    .withdrawal-cautions
    {
        background:#F5F5F5;
        width:100%;
        text-align:left;
        padding-left:18px;
        padding-right:18px;
        padding-top:15px;
        padding-bottom:30px;
        color:#ED634A;
        font-size:12px;
        .text{
            color:#262626;
            padding-top:15px;
        }
    }
}

.account-information-container
{
    width:630px;
    background:#fff;
    border-radius:10px;
    margin:auto;
    margin-bottom:60px;

    table {
        width:100%;
        tbody{
            font-size:14px;
            tr{
                border-top:1px solid #DBDBDB;
                text-align:left;
                height : 50px;
                td{
                    min-width:155px;
                }
            }
        }
    }
    .form-item-input
    {
        height:40px;
    }

    .form-item-account-confirm
    {
        font-size:14px;
        width:100px;
        margin-left:10px;
        background:#FBB03B;
        padding: 0px 23px 0px 23px;
        border-radius: 20px;
        border:0px;
    }

    .form-item-text
    {
        font-size:14px;
        color:#000;
        text-align:left;
        margin-bottom:4px;
    }
}

// 고객 지원

.service-top-container
{
    color:#fff !important;
    line-height:normal;
    display:table;
    height:480px;
    width:100%;
    text-align:center;
    > div {
        display:table-cell;
        vertical-align:middle;
        margin-left:auto;
        margin-right:auto
    }
}
.service-title
{
    color:#FBB03B !important;
    font-size:40px;
    padding-top:16px;
}

.service-sub-title
{
    font-size:16px;
    padding-top:30px;
}
.service-form-container
{
    background:#fff;
    border-radius:10px;
    padding-left:10px;
    padding-right:10px;
    margin:auto;
    margin-bottom:60px;
    
    text-align:center;

    table {
        width:100%;
        tbody{
            font-size:14px;
            tr{
                border-top:1px solid #DBDBDB;
                text-align:left;
                height : 50px;
                td{
                    min-width:155px;
                }
            }
        }
    }

    .form-title
    {
        font-size:20px;
        color:#01467F;
        padding-bottom:21px;
    }

    .form-item-input
    {
        height:40px;
        vertical-align:top;
    }

    .form-item-account-confirm
    {
        font-size:14px;
        width:100px;
        margin-left:10px;
        background:#FBB03B;
        padding: 0px 23px 0px 23px;
        border-radius: 20px;
        border:0px;
    }

    .form-item-text
    {
        font-size:14px;
        color:#000;
        text-align:left;
        margin-bottom:4px;
    }
    .form-item-submit
    {
        margin-top:26px;
        font-size:16px;
        padding: 0px 60px 0px 60px;
        border-radius: 20px;
        background:#01467F;
        box-shadow: rgba(0,0,0,0.2) 0px 5px 10px;
        border:0px;
    }
}

.point-charge-form-container
{
    width:630px;
    padding-bottom:34px;
    background:#fff;
    border-radius:10px;
    margin:auto;
    margin-bottom:108px;
    text-align:center;

    .card{
        border-radius: 10px;
        background: linear-gradient( 45deg, #F8BB59, #F29B16);
        width:234px;
        margin:auto;
        height:124px;
        .body{
            color:#fff;
            text-align:left;
            .title{
                
                font-size:14px;
                padding-left:15px;
                padding-top:15px;
                padding-bottom:11px;
            }
            .line{
                height:2px;
                background:#fff;
                margin-right:37px;
            }
            .body{
                display:flex;
                padding-top:14px;
                padding-left:11px;
                .text{
                    font-size:26px;
                }
            }
        }
    }
    
    .table-container{
        width:374px;
        margin-top:50px;
        margin-left:auto;
        margin-right:auto;
        
        .img{
         padding-left:17px;   
         margin-left:0px;
         margin-top:auto;
         margin-bottom:auto;
        }

        td {
            margin-left:auto;
        }
        .price{
            color:#262626;
            font-size:23px;
            
        }
        .unit{
            color:#262626;
            font-size:14px;
        }

        .btc-price
        {
            color:#fff;
            font-size:14px;
        }
        .btc-button
        {
            width:112px;
            height:40px;
            background:#FBB03B;
            border-radius: 80px;
            line-height:40px;            
            margin-right:19px;
        }
    }
}
.find-account
{
    width:630px;
    margin:auto;

    .select{
        cursor:pointer;
        border-radius: 5px 5px 0px 0px;
        background:#4C84FF;
        color:#fff;
    }
    
    .unselect
    {
        cursor:pointer;
        border-radius: 5px 5px 0px 0px;
        background:#E6E6E6;
        color:#262626;
    }
    .input-box
    {
        border-radius: 4px;
        width:412px;
        height:40px;
        border-color:#BCBCBC;
    }

    .verify
    {
        width:183px;
    }

    .find-account-contaniner
    {
        margin-top:100px;
        width:630px;
        height:420px;
        background:linear-gradient(180deg, #4C84FF 5px, #ffffff 5px);
        border-radius:10px;
        margin:auto;
    }

    .retry-button
    {
        display:flex;
        background:#FBB03B;
        margin:auto;
        color:#fff;
        font-size:16px;
        margin:auto;
        width:100px;
        height:40px;
        border-radius:4px;
    }
    .confirm-button
    { 
        display:flex;
        color:#fff;
        font-size:16px;
        margin:auto;
        width:162px;
        height:40px;
        background:#01467F;
        border-radius:20px;
        box-shadow: rgba(0,0,0,0.2) 0px 5px 10px;
    }
}
.event
{
    .event-top-container
    {
        color:#fff !important;
        line-height:normal;
        display:table;
        height:371px;
        width:100%;
        text-align:center;
        .sub-title {
            padding-top:73px;
            display:flex;
            margin-left:auto;
            margin-right:auto
        }
        .sub-title-textbox
        {
            width:196px;
            height:129px;
            background-image:url("/images/event_textbox.png");
        }
    }
    .event-title
    {
        font-size:60px;
        margin-top:auto;
        margin-bottom:10px;
        text-shadow: -1px 0 #FFFFFF, 0 1px #FFFFFF, 1px 0 #FFFFFF, 0 -1px #FFFFFF;
        -moz-text-shadow: -1px 0 #FFFFFF, 0 1px #FFFFFF, 1px 0 #FFFFFF, 0 -1px #FFFFFF;
        -webkit-text-shadow: -1px 0 #FFFFFF, 0 1px #FFFFFF, 1px 0 #FFFFFF, 0 -1px #FFFFFF;
    }

    .event-description-title
    {
        width: 140px;
        height: 40px;
        background: #606060;
        color: #ffffff;
        font-size: 18px;
        line-height: 40px;

        text-align: center;

        border-radius: 6px;
        text-shadow: 0px 3px 6px rgba(0,0,0,0.2);
        -moz-text-shadow: 0px 3px 6px rgba(0,0,0,0.2);
        -webkit-text-shadow: 0px 3px 6px rgba(0,0,0,0.2);

        position: relative;
        top: 20px;
        left: 20px;
    }
    .event-description-box
    {
        padding: 40px 20px 36px 20px;
        background: #ffffff;
        max-width: 460px;
        box-shadow: rgba(0,0,0, 0.2) 3px 5px 10px;
        border-radius: 10px;
    }

    .event-start-button
    {
        cursor:pointer;
        margin:auto;
        .box
        {
            margin-top:92px;
            background:#6307A5;
            border-radius: 45px;
            box-shadow: rgba(0,0,0, 0.3) 3px 7px 20px;
        }
        
        font-size:36px;
        color:#FFFFFF;
        max-width:400px;
        height:90px;
        line-height:90px;
        text-align:center;
    }
}
.bg
{
}
.bg::after
{

    content:'';

    background-image:url("/images/metal_background.png") ;
    position: fixed;
    top: 0px;
    left: 0;
    width: 100%;
    height: 100%;
    opacity:0.1;
    background-size: contain;
}
.bg::before
{
    background:linear-gradient( 45deg, #A7264E, #7C122F, #400A11);
    content:'';

    position: fixed;
    top: 0px;
    left: 0;
    width: 100%;
    height: 100%;
    z-index:-1;
}

.miningSpeed-information-container
{
    width:630px;
    margin-top:67px;
    margin-left:auto;
    margin-right:auto;
    margin-bottom:100px;
    background:#fff;
    
    .header{
        height:105px;
        color:#fff;
        font-size:16px;
        background:#FBB03B;
        display:flex;
        .desc {
            font-size:30px;
            font-weight:bold;
        }
    }

    .my-information
    {
        padding-top:23px;
        display:flex;
        color:#FBB03B;

        .desc{
            margin-top:10px;
            border: 1.5px solid #FBB03B;
            border-radius: 33px;
            width:480px;
            height:80px;
            font-size:14px;
        }

        .upgrade
        {
            border-radius: 20px;
            background:#FBB03B;
            font-size:16px;
            box-shadow: rgba(0,0,0, 0.2) 0px 5px 10px;
            color:#fff;
        }
    }

    .hierachy
    {
        margin-top:28px;
        display:flex;
        > table{
            margin:auto;
            width:480px;
        }
    }

    .recommander-0{
        color: #FFF;
    }
    .recommander-1{
        color: #095EB0;
    }

    .recommander-2{
        color: #AD09A6;
    }

    .recommander-3{
        color: #E20C40;
    }
    .recommander-4{
        color: #D8700A;
    }

    .recommander-5{
        color: #B3CB00;
    }

    .recommander-6{
        color: #0CE256;
    }

    .recommander-7{
        color: #0CE2D2;
    }

    .recommander-background-0{
        background: #F2F7FC;
    }
    .recommander-background-1{
        background: #F8ECF8;
    }

    .recommander-background-2{
        background: #FCF2F4;
    }

    .recommander-background-3{
        background: #F8F2EC;
    }
    .recommander-background-4{
        background: #F7F8EC;
    }

    .recommander-background-5{
        background: #F4FCF2;
    }

    .recommander-background-6{
        background: #ECF7F8;
    }

    .recommander-disable{
        background: #E6E6E6;
        border:0px !important;
    }

    .recommanderBorder-1{        
        border: 1px solid ;
        border-color:#095EB0 !important;
    }

    .recommanderBorder-2{        
        border: 1px solid;
        border-color:#AD09A6 !important;
    }

    .recommanderBorder-3{
        border: 1px solid ;
        border-color:#E20C40 !important;
    }
    .recommanderBorder-4{
        border: 1px solid;
        border-color:#D8700A !important;
    }

    .recommanderBorder-5{
        border: 1px solid;
        border-color:#B3CB00 !important;
    }

    .recommanderBorder-6{
        border: 1px solid ;
        border-color:#0CE256 !important;
    }

    .recommanderBorder-7{
        border: 1px solid ;
        border-color:#0CE2D2 !important;
    }

    .recommanderSelect-1{
        background:linear-gradient( 180deg, #13197B, #0868B8);
    }

    .recommanderSelect-2{
        background:linear-gradient( 180deg, #4F137D, #B708AA);
    }

    .recommanderSelect-3{
        background:linear-gradient( 180deg, #831254, #DE0C40);
    }

    .recommanderSelect-4{
        background:linear-gradient( 180deg, #803B12, #D36C0A);
    }

    .recommanderSelect-5{
        background:linear-gradient( 180deg, #767F12, #AABC22);
    }

    .recommanderSelect-6{
        background:linear-gradient( 180deg, #1F7D15, #0CE155);
    }
    
    .tab
    {
        margin-top:23px;
        .container{
            font-size:14px;
            height:53px;
            display:flex;
            margin:auto;
            width:510px;
            background:#F5F5F5;
            border-radius: 10px;
        }
    }

    .list
    {
        width:510px;
        height:580px;
        display:flex;
        overflow-x:hidden;
        overflow-y:auto;
        .container{
            height:100%;
            font-size:14px;
            margin:auto;
            width:50%;
        }

        table{
            margin-top:10px;
            width:30px;
        }
        tr {
            height:40px;
        }
        td{
        }

        ul{
            border-radius: 10px;
            padding:0px;
            padding-top:0.1px;
            padding-bottom:20px;
        }
    }

    .card
    {
        margin-top:20px;
        display:flex;
        width:230px;
        height:60px;
        border-radius: 33px;
    }
    
}
.bold
{
    font-weight:bold;
}

.invisible
{
    display:none;
}

.point-detail {
    width:462px;
    margin-top:50px;
    margin-left:auto;
    margin-right:auto;
    color:#fff;
    
    .img{
     padding-left:17px;   
     margin-left:0px;
     margin-top:auto;
     margin-bottom:auto;
    }
    
    tr{
        line-height:30px;
    }
    td {
        padding:0px;
        padding-top:4px;
        > div{
            background:#606060;
            height:30px;
        }
    }
}
.point-chage-button
{
    margin:auto;
    width:180px;
    height:40px;
    color:#fff
    margin-top:42px;
    background:#01467F;
    border-radius: 40px;
    line-height:40px; 
    box-shadow: rgba(0,0,0, 0.2) 0px 5px 10px;
}

.footer-container
{
    background:#00223E;
    height: 130px;
    padding-left: 110px;
    padding-right: 110px; 
    position: static; 
}

@media(max-width:1110px)
{
    .main-top-content-title
    {
        font-size:28px;
    }
    .ant-layout-content
    {
        margin: 0 50px;
    }

    .mining-information-container
    {
        .mining-container
        {
            margin-right:0px;
        }
        .mining-information-mining-value
        {
            font-size:70px;
        }
        .miningVolume-information-mining-value
        {
            font-size:24px;
        }
        .mining-information-withdrawal-button-container
        {
            width:250px;
        }
        .miningVolume-information-withdrawal-button-container
        {
            width:200px;
        }
        .um-information-withdrawal-button-container
        {
            width:200px;
        }
        .second-td
        {
            padding-left:0px;
        }
    }
    .footer-container
    {
        padding:0px;
    }
}

@media(max-width:700px)
{
    .header-icon-mobile
    {
        width:250px;
    }
    .main-top-content-title
    {
        font-size:28px;
    }
    .ant-layout-content
    {
        margin: 0 24px;
    }
    .main-free-mining-value
    {
        font-size:42px;
    }
    .package-information-description
    {
        font-size:24px;
    }
    .review-container > div {
        margin-left:24px;
        margin-right:24px;
    }
    .footer-icon
    {
        display:none;
    }
    .login-form-container
    {
        width:initial;
    }
    .find-account
    {
        width:initial;
        .find-account-contaniner
        {
            width:initial;
        }
    }
    .point-charge-form-container
    {
        width:initial;
        .form {
            padding: 30px 10px 30px 10px;
        }
    }
    .withdrawal-form-container 
    {
        width:initial;
        > form  {
            padding: 10px 30px;
        }
    }
    .account-information-container
    {
        width:initial;
        > div
        {
            padding:10px !important;
        }
    }
    
    .miningSpeed-information-container
    {
        width:initial;
    }

    .mining-information-container
    {
        min-height:500px;
        .mining-container
        {
            text-align: left;
            margin-left: 60px
            padding-top: 50px;
            margin-right:30px;
            border-bottom: 1px solid #FFF;
        }
        .mining-information-mining-value
        {
            font-size:24px;
        }
        .mining-information-mining-unit
        {
            font-size:18px;
        }
        .miningVolume-information-mining-value
        {
            font-size:14px;
        }
        .miningVolume-information-mining-value
        {
            font-size:12px;
        }
        .mining-information-withdrawal-button-container
        {
            width:100px;
        }
        .miningVolume-information-withdrawal-button-container
        {
            width:100px;
        }
        .um-information-withdrawal-button-container
        {
            width:100px;
        }
        .second-td
        {
            padding-left:0px;
        }
    }
    .footer-container
    {
        padding:0px;
    }
}
`;

export const LocaleText: React.FC<any> = (props) => {
    return (<FormattedMessage id={props.id}
        values={{ n: <br /> }} />);
}

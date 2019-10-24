import { createIntl } from 'react-intl';
import {ko, en, jp, ch} from './data';

const locale : {[index: string]:any}  = {
    'ko' : ko,
    'en' : en,
    'jp' : jp,
    'cn' : ch,
};

export default locale;
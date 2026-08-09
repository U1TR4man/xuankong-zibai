import { STAR_ELEMENTS, starName } from '../engine/flyingStar/types';
import { asStarNumber, type StarNumber } from '../overlay/types';
import type {
  PairKey, PurpleWhitePairRule, SourceGrade, SourceLevel,
} from './types';

const GENERATES: Readonly<Record<string, string>> = {
  木: '火', 火: '土', 土: '金', 金: '水', 水: '木',
};
const CONTROLS: Readonly<Record<string, string>> = {
  木: '土', 土: '水', 水: '火', 火: '金', 金: '木',
};

function pairKey(first: StarNumber, second: StarNumber): PairKey {
  return `${first}${second}`;
}

function elementRelation(first: StarNumber, second: StarNumber): string {
  const firstElement = STAR_ELEMENTS[first]!;
  const secondElement = STAR_ELEMENTS[second]!;
  const prefix = `${starName(first)}${firstElement}、${starName(second)}${secondElement}`;
  if (firstElement === secondElement) return `${prefix}：比和`;
  if (GENERATES[firstElement] === secondElement) return `${prefix}：${firstElement}生${secondElement}`;
  if (GENERATES[secondElement] === firstElement) return `${prefix}：${secondElement}生${firstElement}`;
  if (CONTROLS[firstElement] === secondElement) return `${prefix}：${firstElement}剋${secondElement}`;
  return `${prefix}：${secondElement}剋${firstElement}`;
}

interface ResearchEntry {
  meaning: string;
  grade: SourceGrade;
}

/**
 * 來自《紫白擇吉_考源與雙星81組_V1研究版》的現代精簡摘要。
 * 本表不是逐字古文，全部保持 needs-review 且 rankingWeight = 0。
 */
const RESEARCH_ENTRIES: Record<PairKey, ResearchEntry> = {
  '11': { meaning: '文思、智慧、流動；失衡則水寒、意志弱、耳腎類象', grade: 'B' },
  '12': { meaning: '阻滯、男女／上下相制；腹脾與水液類象不利', grade: 'B' },
  '13': { meaning: '生旺則名氣、升進、才智；失令則口舌與爭訟', grade: 'B' },
  '14': { meaning: '文昌科名、文章、學業、名聲', grade: 'A' },
  '15': { meaning: '五黃制一白，疾病阻滯；傳統兼取泌尿／陰部類象', grade: 'B' },
  '16': { meaning: '一六共宗，文章、官貴、助力；過寒則孤冷', grade: 'B' },
  '17': { meaning: '金水多情，桃花、交際；失度則酒色、情欲是非', grade: 'B' },
  '18': { meaning: '山水相制，阻滯；傳統多取中男／少男及脾腎不利', grade: 'C' },
  '19': { meaning: '水火既濟則協調、聰明；失衡則心眼、水火不交', grade: 'B' },
  '21': { meaning: '坤土制坎水；家內關係受壓，腹脾、水液類象', grade: 'B' },
  '22': { meaning: '土地、田產、積蓄；失令則病氣、停滯加重', grade: 'B' },
  '23': { meaning: '鬥牛煞：爭執、官非、腹疾', grade: 'A' },
  '24': { meaning: '婆媳／女性長幼不和；風、脾胃類象', grade: 'B' },
  '25': { meaning: '二五交加：病災、人口受損，重點避用', grade: 'A' },
  '26': { meaning: '土金相生，可取資產、權責；但古訣多帶乾坤條件', grade: 'B/C' },
  '27': { meaning: '財氣與桃花並見；失衡則女性關係、腸胃／泄痢', grade: 'B' },
  '28': { meaning: '合十、田產、積聚；失衡則少男／幼輩受壓', grade: 'B' },
  '29': { meaning: '火土生扶可取喜慶、丁口；過燥則愚鈍、病滯', grade: 'B/C' },
  '31': { meaning: '生旺則升進、名聲、行動力；失令則是非', grade: 'B' },
  '32': { meaning: '鬥牛煞：官刑、爭鬥、腹部不適', grade: 'A' },
  '33': { meaning: '行動、競爭加倍；失運則好勇、爭鬥、盜賊是非', grade: 'B' },
  '34': { meaning: '雙木：才學、人文；失衡則反覆、風疾、賊性', grade: 'B' },
  '35': { meaning: '三木犯五黃：病災、爭財反傷、瘟疾類象', grade: 'B' },
  '36': { meaning: '金木交戰；壓力、碰撞、足／頭／長男類象', grade: 'B' },
  '37': { meaning: '三遇七：病、官非；三七疊至：劫盜官災', grade: 'A' },
  '38': { meaning: '三八傳統視為重凶，小口／幼輩、肢體不利', grade: 'A' },
  '39': { meaning: '木火通明：才智、文采、聲名；失衡則急躁刻薄', grade: 'B' },
  '41': { meaning: '四一同宮：文昌、科名、學業、文章', grade: 'A' },
  '42': { meaning: '長女／主母不和；脾胃、風疾類象', grade: 'B' },
  '43': { meaning: '木氣旺，文藝、人文；失衡則反覆、風疾、是非', grade: 'B' },
  '44': { meaning: '文昌加重：學術、設計、文化；失運則飄蕩不定', grade: 'B' },
  '45': { meaning: '四木犯五黃：疾病；傳統有乳疾、瘟病類象', grade: 'B' },
  '46': { meaning: '金木相凌：勞碌、壓制、女性／筋骨或意外類象', grade: 'B' },
  '47': { meaning: '金木交戰：刀傷、口舌、女性失和、精神壓力', grade: 'B' },
  '48': { meaning: '八四／四八相會：傳統取小口、孕育不利', grade: 'A/B' },
  '49': { meaning: '木火相生：聰明、創意、名氣；過旺則火躁', grade: 'B' },
  '51': { meaning: '五黃制水：病災、阻滯，水液／泌尿類象', grade: 'B' },
  '52': { meaning: '黃遇黑：二五病災，傳統尤警孕婦／家母', grade: 'A' },
  '53': { meaning: '三木犯五：病災、瘟疾、衝突', grade: 'B' },
  '54': { meaning: '四木犯五：病災、乳疾、耗財與習性失控類象', grade: 'B' },
  '55': { meaning: '五黃疊臨：災病阻滯，原則避用', grade: 'A' },
  '56': { meaning: '五土生六金；可有權財象，但五黃背景使吉凶混雜', grade: 'B' },
  '57': { meaning: '五黃與七赤：毒傷、口喉、酒色／破損類象', grade: 'B' },
  '58': { meaning: '五黃壓艮：少男、筋骨、肢體及停滯之象', grade: 'B' },
  '59': { meaning: '九火生五黃：放大五黃，火災、難產、病災類象', grade: 'B' },
  '61': { meaning: '官貴、文章、助力；過寒則水冷金寒', grade: 'B' },
  '62': { meaning: '土生乾金：財產、管理、權位；家中長輩關係須參看', grade: 'B' },
  '63': { meaning: '金木交戰：頭足、長男、碰撞與壓力', grade: 'B' },
  '64': { meaning: '金制巽木：勞碌、傷損、女性／筋骨類象', grade: 'B' },
  '65': { meaning: '五土生六金：有權財潛力，但五黃使結果混雜', grade: 'B' },
  '66': { meaning: '權力、領導、決斷；過剛則孤克、頭肺／父象受壓', grade: 'B' },
  '67': { meaning: '交劍煞：劫掠、刀兵、競爭；得勢亦可取武權', grade: 'A/B' },
  '68': { meaning: '六八：武科、韜略、權位、尊榮', grade: 'A' },
  '69': { meaning: '六九：血證、肺／長房、火金相戰，慎火', grade: 'A' },
  '71': { meaning: '金水多情：交際、桃花；失度則酒色、犯法是非', grade: 'B' },
  '72': { meaning: '財與桃花同現；純陰則感情／女性問題較突出', grade: 'B' },
  '73': { meaning: '七逢三到：可先見財，後有盜損；並主衝突', grade: 'A' },
  '74': { meaning: '金伐巽木：刀傷、女性不睦、精神／神經類象', grade: 'B' },
  '75': { meaning: '五七相會：毒傷、喉口、疾病、破損類象', grade: 'B' },
  '76': { meaning: '交劍煞：武力、劫掠、金刃衝突', grade: 'A/B' },
  '77': { meaning: '口才、醫卜、金工；失令則口舌、刀傷、盜搶', grade: 'B' },
  '78': { meaning: '少男少女相感：感情、婚戀、財帛；失衡則私情', grade: 'B' },
  '79': { meaning: '九七／七九：回祿、火災、血光，並見酒色之象', grade: 'A' },
  '81': { meaning: '艮土制坎水：阻滯；少男／中男、脾腎類象', grade: 'C' },
  '82': { meaning: '合十、田產、財富；失衡則幼輩、家內關係受壓', grade: 'B' },
  '83': { meaning: '三八類：少男／幼輩、肢體、兄弟不和，傳統偏凶', grade: 'A' },
  '84': { meaning: '八會四：傳統以小口／孕育不利論', grade: 'A' },
  '85': { meaning: '五黃壓艮：停滯、少男、筋骨、病災', grade: 'B' },
  '86': { meaning: '八六：文士參軍、異途擢用、由文入權', grade: 'A' },
  '87': { meaning: '財帛、少男少女感情、求名；須防私情', grade: 'B' },
  '88': { meaning: '土地、資產、積聚；失令則閉塞、筋骨／少男受壓', grade: 'B' },
  '89': { meaning: '八逢紫曜：婚喜、喜慶，兼有位階／財產象', grade: 'A' },
  '91': { meaning: '水火既濟則協調、才智；失衡則眼心／情緒、水火不交', grade: 'B' },
  '92': { meaning: '可取喜慶、丁口；火土過燥則愚鈍、脾胃與婦女類象', grade: 'B/C' },
  '93': { meaning: '木火通明：聰明、名氣、文采；失衡則刻薄、急躁', grade: 'B' },
  '94': { meaning: '文藝、創作、文明；失衡則漂蕩、耗散', grade: 'B' },
  '95': { meaning: '九火生五黃：放大五黃，火災、病災、難產類象', grade: 'B' },
  '96': { meaning: '九六／六九：血證、肺、長房、火金衝突', grade: 'A' },
  '97': { meaning: '九七合轍：回祿、火災、血光；慎酒色與衝突', grade: 'A' },
  '98': { meaning: '八九相會：婚喜、喜氣、名位；火土過燥須另論', grade: 'A' },
  '99': { meaning: '名聲、喜慶、曝光加倍；過旺則火災、眼心、躁烈', grade: 'B' },
};

const TITLES: Partial<Record<PairKey, string>> = {
  '14': '四一同宮', '16': '一六共宗', '23': '鬥牛煞', '25': '二五交加',
  '32': '鬥牛煞', '37': '三七疊至', '38': '三八相逢', '41': '四一同宮',
  '48': '八四相會', '52': '黃遇黑', '55': '五黃疊臨', '61': '一六共宗',
  '67': '交劍煞', '68': '六八', '69': '火金相戰', '73': '七逢三到',
  '76': '交劍煞', '79': '九七相會', '83': '三八類', '84': '八四相會',
  '86': '八六', '89': '八九相會', '96': '火金相戰', '97': '九七相會',
  '98': '八九相會',
};

const ORDER_SENSITIVE = new Set<PairKey>(['25', '37', '52', '68', '73', '86']);

function normalizedSourceLevel(grade: SourceGrade): SourceLevel {
  if (grade === 'A') return 'A';
  if (grade === 'B' || grade === 'A/B') return 'B';
  return 'C';
}

function tagsFor(meaning: string): string[] {
  const tags = new Set<string>();
  if (meaning.includes('文昌')) tags.add('文昌');
  if (meaning.includes('科名')) tags.add('科名');
  if (meaning.includes('學業')) tags.add('考試');
  if (/\u6587\u7ae0|\u6587\u601d|\u6587\u91c7|\u6587\u85dd|\u5275\u4f5c|\u5b78\u8853|\u8a2d\u8a08/.test(meaning)) tags.add('文書');
  if (/\u540d\u8072|\u540d\u6c23|\u5347\u9032|\u5b98\u8cb4|\u6b0a\u4f4d|\u5c0a\u69ae|\u64e2\u7528|\u6c42\u540d|\u540d\u4f4d|\u66dd\u5149/.test(meaning)) tags.add('求名');
  if (meaning.includes('權位') || meaning.includes('權力')) tags.add('權力');
  if (meaning.includes('韜略')) tags.add('韜略');
  if (meaning.includes('武科')) tags.add('武職');
  if (meaning.includes('文士')) tags.add('文職');
  if (meaning.includes('異途')) tags.add('異途');
  if (/\u8ca1|\u7530\u7522|\u8cc7\u7522|\u7a4d\u84c4|\u7a4d\u805a/.test(meaning)) tags.add('求財');
  if (/\u5a5a\u559c|\u559c\u6176|\u559c\u6c23/.test(meaning)) tags.add('喜慶');
  if (meaning.includes('婚喜')) tags.add('婚喜');
  return [...tags];
}

function buildRule(first: StarNumber, second: StarNumber): PurpleWhitePairRule {
  const pair = pairKey(first, second);
  const entry = RESEARCH_ENTRIES[pair];
  const orderSensitive = ORDER_SENSITIVE.has(pair);
  return {
    pair,
    firstStar: first,
    secondStar: second,
    elementRelation: elementRelation(first, second),
    title: TITLES[pair] ?? `${starName(first)} × ${starName(second)}`,
    shortMeaning: entry.meaning,
    modernInterpretation: entry.meaning,
    polarity: 'neutral',
    priority: 'normal',
    tags: tagsFor(entry.meaning),
    reversePair: pairKey(second, first),
    directionSensitive: orderSensitive,
    orderSensitive,
    sourceLevel: normalizedSourceLevel(entry.grade),
    sourceGrade: entry.grade,
    reviewStatus: 'needs-review',
    sources: [{
      title: '紫白擇吉：考源與雙星 81 組 V1 研究版',
      evidenceType: 'research_summary',
      note: `研究版歸類為 ${entry.grade}；未附版本頁碼與逐字引文，仍需逐條覆核。`,
    }],
    context: 'temporal_experimental',
    verified: false,
    temporalUse: 'reference_only',
    rankingWeight: 0,
    applicability: {
      samePalace: true,
      temporalSelection: 'reference',
      requiresPalaceContext: false,
      requiresProsperityContext: true,
    },
  };
}

export const PURPLE_WHITE_PAIR_RULES: readonly PurpleWhitePairRule[] = Object.freeze(
  Array.from({ length: 9 }, (_, firstIndex) => asStarNumber(firstIndex + 1))
    .flatMap((first) => Array.from({ length: 9 }, (_, secondIndex) => (
      buildRule(first, asStarNumber(secondIndex + 1))
    ))),
);

const RULE_BY_PAIR = new Map(PURPLE_WHITE_PAIR_RULES.map((rule) => [rule.pair, rule]));

export function asPairKey(value: string): PairKey {
  if (/^[1-9]{2}$/.test(value)) return value as PairKey;
  throw new RangeError(`雙星組合必須是 11–99，目前為 ${value}`);
}

export function getPairRule(value: string): PurpleWhitePairRule {
  const pair = asPairKey(value);
  const rule = RULE_BY_PAIR.get(pair);
  if (!rule) throw new RangeError(`找不到雙星規則：${pair}`);
  return rule;
}

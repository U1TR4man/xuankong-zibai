import type { StarNumber } from '../overlay/types';
import { getPairRule } from './pairRules';
import { PAIR_LAYERS, type DirectionLevel, type DirectionSnapshot, type PairHit } from './types';

function starFor(snapshot: DirectionSnapshot, level: DirectionLevel): StarNumber {
  if (level === 'year') return snapshot.yearStar;
  if (level === 'month') return snapshot.monthStar;
  if (level === 'day') return snapshot.dayStar;
  return snapshot.hourStar;
}

export function buildPairHits(snapshot: DirectionSnapshot): PairHit[] {
  return PAIR_LAYERS.map((layer) => {
    const firstStar = starFor(snapshot, layer.first);
    const secondStar = starFor(snapshot, layer.second);
    const pair = `${firstStar}${secondStar}`;
    return {
      layer: layer.key,
      layerLabel: layer.label,
      pair: getPairRule(pair).pair,
      firstStar,
      secondStar,
      rule: getPairRule(pair),
    };
  });
}

import type { PairHit, SelectionPurpose } from './types';

export const PURPOSE_OPTIONS: readonly { value: SelectionPurpose; label: string; tags: string[] }[] = [
  { value: 'general', label: '通用', tags: [] },
  { value: 'writing', label: '文書／考試', tags: ['文昌', '科名', '考試', '文書'] },
  { value: 'wealth', label: '求財', tags: ['求財', '財'] },
  { value: 'negotiation', label: '商談', tags: ['商談', '交涉'] },
  { value: 'fame', label: '求名', tags: ['求名', '功名', '權力'] },
  { value: 'celebration', label: '喜慶', tags: ['婚喜', '喜慶'] },
  { value: 'travel', label: '出行', tags: ['出行', '行旅'] },
];

export function purposeLabel(purpose: SelectionPurpose): string {
  return PURPOSE_OPTIONS.find((item) => item.value === purpose)?.label ?? '通用';
}

export function purposeHits(hits: readonly PairHit[], purpose: SelectionPurpose): PairHit[] {
  const tags = PURPOSE_OPTIONS.find((item) => item.value === purpose)?.tags ?? [];
  if (tags.length === 0) return [];
  return hits.filter((hit) => hit.rule.tags.some((tag) => tags.includes(tag)));
}

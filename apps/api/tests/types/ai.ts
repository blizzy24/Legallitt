import type { AiPort } from '../../src/ai/ai.port';
export async function contract(ai: AiPort) {
  const demands=await ai.generate({task:'demands',prompt:'Synthetic'});
  const options:string[]=demands.options;
  // @ts-expect-error Demand responses are not prose to split.
  demands.text;
  const subject=await ai.generate({task:'subject',prompt:'Synthetic'});
  const title:string=subject.text;
  // @ts-expect-error Subject responses do not contain options.
  subject.options;
  const notice=await ai.generate({task:'notice',prompt:'Synthetic'});
  const draft:string=notice.text;
  // @ts-expect-error Notice responses do not contain options.
  notice.options;
  // @ts-expect-error Tasks are closed, not arbitrary strings.
  ai.generate({task:'anything',prompt:'Synthetic'});
  return {options,title,draft};
}

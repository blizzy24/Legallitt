import { Module } from '@nestjs/common';
import { AI, type AiPort } from './ai.port';
import { SimulatedAi } from './simulated-ai';
import { GeminiAi } from './gemini-ai';
import { BedrockAi } from './bedrock-ai';

/** Selection happens once during Nest registration. No consumer reads AI_MODE. */
export async function aiAdapter():Promise<AiPort> {
  const mode=process.env.AI_MODE??'simulated';
  switch(mode) {
    case 'simulated': return new SimulatedAi();
    case 'gemini': return new GeminiAi({apiKey:process.env.GEMINI_API_KEY?.trim()??'',
      model:process.env.GEMINI_MODEL??'gemini-3.5-flash-lite',
      environment:process.env.ENVIRONMENT,nodeEnv:process.env.NODE_ENV});
    case 'bedrock': return BedrockAi.create({region:process.env.AWS_REGION??process.env.AWS_DEFAULT_REGION??'ap-south-1',
      models:{subject:process.env.BEDROCK_SUBJECT_MODEL_ID??'in.anthropic.claude-haiku-4-5-20251001-v1:0',
        demands:process.env.BEDROCK_DEMANDS_MODEL_ID??'in.anthropic.claude-haiku-4-5-20251001-v1:0',
        notice:process.env.BEDROCK_NOTICE_MODEL_ID??'in.anthropic.claude-haiku-4-5-20251001-v1:0'}});
    default: throw new Error('AI_MODE must be simulated, gemini or bedrock');
  }
}
@Module({providers:[{provide:AI,useFactory:aiAdapter}],exports:[AI]})
export class AiModule {}

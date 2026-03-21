export type AIStyleLikelihood = 'low' | 'medium' | 'high';

export interface AnalyzePostRequest {
  text: string;
}

export interface AnalyzePostResult {
  hype: number;
  substance: number;
  evidence: number;
  specificity: number;
  operatorSignals: number;
  aiStyleLikelihood: AIStyleLikelihood;
  verdict: string;
  explanation: string[];
  strongerRewrite: string;
}

export interface AnalyzePostResponse {
  result: AnalyzePostResult;
}

export interface SignalMatch {
  phrase: string;
  count: number;
}

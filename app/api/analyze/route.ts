import { NextResponse } from 'next/server';

import { analyzePost } from '../../../lib/analyzePost';
import { AnalyzePostRequest, AnalyzePostResponse } from '../../../lib/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AnalyzePostRequest>;
    const text = typeof body.text === 'string' ? body.text.trim() : '';

    if (!text) {
      return NextResponse.json({ error: 'Please provide post text to analyze.' }, { status: 400 });
    }

    if (text.length < 40) {
      return NextResponse.json({ error: 'Please provide at least 40 characters for a meaningful analysis.' }, { status: 400 });
    }

    const response: AnalyzePostResponse = {
      result: analyzePost(text),
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }
}

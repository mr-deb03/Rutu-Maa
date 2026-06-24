import { NextResponse } from 'next/server';
import { hasKey, MODEL } from '@/lib/ai';
import { pushEnabled, publicKey } from '@/lib/push';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    aiEnabled: hasKey(),
    pushEnabled: pushEnabled(),
    vapidPublicKey: publicKey(),
    model: MODEL
  });
}

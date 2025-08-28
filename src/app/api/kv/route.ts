import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { CloudflareEnv, KVGetResponse, KVPutRequest, KVResponse, ApiError } from '@/types/cloudflare';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext();
    const value = await (env as CloudflareEnv).DEV_KV.get(key);
    
    return NextResponse.json({
      key,
      value,
      found: value !== null
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get value from KV' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as KVPutRequest;
    const { key, value, ttl } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' }, 
        { status: 400 }
      );
    }

    const { env } = await getCloudflareContext();
    const options: KVNamespacePutOptions = {};
    
    if (ttl) {
      options.expirationTtl = ttl;
    }

    await (env as CloudflareEnv).DEV_KV.put(key, JSON.stringify(value), options);
    
    return NextResponse.json({
      success: true,
      key,
      message: 'Value stored successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to store value in KV' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (!key) {
    return NextResponse.json({ error: 'Key parameter is required' }, { status: 400 });
  }

  try {
    const { env } = await getCloudflareContext();
    await (env as CloudflareEnv).DEV_KV.delete(key);
    
    return NextResponse.json({
      success: true,
      key,
      message: 'Key deleted successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete key from KV' }, 
      { status: 500 }
    );
  }
}
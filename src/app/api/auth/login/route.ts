import { NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';

const workos = new WorkOS(process.env.WORKOS_API_KEY!);
const clientId = process.env.WORKOS_CLIENT_ID!;

export async function GET() {
  const organization = 'org_test_idp'; // replace later with dynamic
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback`;

  const authorizationUrl = workos.sso.getAuthorizationUrl({
    organization,
    redirectUri,
    clientId,
  });

  return NextResponse.redirect(authorizationUrl);
}

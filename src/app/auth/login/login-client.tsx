'use client';

import { useSearchParams } from 'next/navigation';
import LoginPageContent from './login-content';

export default function LoginClient() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';
  
  return <LoginPageContent callbackUrl={callbackUrl} />;
}
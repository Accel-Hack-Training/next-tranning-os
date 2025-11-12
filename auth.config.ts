import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {  // pagesオプションでカスタムのサインイン、サインアウト、エラーページのルート指定可能
    signIn: '/login',  // カスタムログインページにリダイレクト
  },
} satisfies NextAuthConfig;
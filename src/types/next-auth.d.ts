import { DefaultSession } from "next-auth";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession["user"];
  }
}

// Add simple polyfills to avoid ReflectApply errors
if (typeof window !== "undefined") {
  if (!Reflect.apply) {
    // @ts-ignore
    Reflect.apply = Function.prototype.apply.bind(Function.prototype.call);
  }
} 
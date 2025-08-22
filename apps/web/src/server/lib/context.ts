import type { NextRequest } from "next/server";

export async function createContext(req: NextRequest) {
  return {
    session: {} as any,
  };
}


export type Context = Awaited<ReturnType<typeof createContext>>;

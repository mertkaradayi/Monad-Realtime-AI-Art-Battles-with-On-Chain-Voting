import type { ReactNode } from 'react'

export const dynamicParams = false

export async function generateStaticParams(): Promise<Array<{ battleId: string }>> {
  return []
}

export default function BattleVoteLayout({ children }: { children: ReactNode }) {
  return children
}



import type { Metadata } from 'next'
import { StoreProvider } from '@/providers/StoreProvider'
import { AppInitProvider } from '@/providers/AppInitProvider'

export const metadata: Metadata = {
  title: 'ys-test-react-next',
  description: 'Next.js port of ys-test-react',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <StoreProvider>
      <AppInitProvider>{children}</AppInitProvider>
    </StoreProvider>
  )
}

import BottomNav from '@/app/components/bottom-nav'
import DailyQuote from '@/app/components/daily-quote'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DailyQuote />
      {children}
      <BottomNav />
    </>
  )
}

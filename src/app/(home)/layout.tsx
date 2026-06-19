import { MobileShell } from '@/presentation/layout/MobileShell';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <MobileShell bg="bg-white">{children}</MobileShell>;
}

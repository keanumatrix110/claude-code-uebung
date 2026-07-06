import {
  Wallet,
  Laptop,
  PiggyBank,
  Home,
  ShoppingCart,
  Car,
  Popcorn,
  HeartPulse,
  ShoppingBag,
  MoreHorizontal,
  type LucideProps,
} from 'lucide-react'

const ICONS: Record<string, React.ComponentType<LucideProps>> = {
  Wallet,
  Laptop,
  PiggyBank,
  Home,
  ShoppingCart,
  Car,
  Popcorn,
  HeartPulse,
  ShoppingBag,
  MoreHorizontal,
}

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = ICONS[name] ?? MoreHorizontal
  return <Cmp {...props} />
}

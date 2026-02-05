import Link from "next/link"
import { DollarSign, Twitter, Github, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <DollarSign className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold text-foreground">
                Cashback ID
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Turn every purchase into an investment. Earn cashback that grows automatically.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="text-muted-foreground hover:text-foreground transition-colors">
                  History
                </Link>
              </li>
              <li>
                <Link href="/transactions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Transactions
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Partners
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Cashback ID. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Your financial data is encrypted and never shared
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

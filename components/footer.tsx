import Link from "next/link"
import { DollarSign, Github, MessageCircle, ExternalLink } from "lucide-react"

const protocolLinks = [
  { name: "ENS", href: "https://ens.domains", description: "Identity Layer" },
  { name: "LI.FI", href: "https://li.fi", description: "Cross-Chain Routing" },
  { name: "Sui", href: "https://sui.io", description: "Settlement" },
  { name: "Filecoin", href: "https://filecoin.io", description: "Proof Storage" },
  { name: "Safe", href: "https://safe.global", description: "Multi-Sig Control" },
]

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container px-4 md:px-6">
        {/* Protocol Strip */}
        <div className="py-8 border-b border-border/50">
          <p className="text-xs text-muted-foreground text-center mb-4 uppercase tracking-widest">
            Powered by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {protocolLinks.map((protocol) => (
              <a
                key={protocol.name}
                href={protocol.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="text-sm font-semibold">{protocol.name}</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>

        {/* Main Footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
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
              Your name, your rules, your cashback. Spend on any chain, 
              receive on your <span className="text-primary font-mono">.eth</span> name.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="text-muted-foreground hover:text-foreground transition-colors">
                  History
                </Link>
              </li>
              <li>
                <Link href="/verify" className="text-muted-foreground hover:text-foreground transition-colors">
                  Payment Profile
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Technology</h4>
            <ul className="space-y-2.5 text-sm">
              {protocolLinks.map((p) => (
                <li key={p.name}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    {p.name}
                    <span className="text-xs text-muted-foreground/60">— {p.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Community</h4>
            <div className="flex items-center gap-3 mb-4">
              <a href="https://github.com/SegFaultPapi/cashback-id" target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="h-9 w-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Built for the cross-chain future. Cashback that flows 
              where you need it, when you need it.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Cashback ID. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            ENS + LI.FI + Sui + Filecoin + Safe
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

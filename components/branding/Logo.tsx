import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: number
  showWordmark?: boolean
  onClick?: () => void
}

export default function Logo({
  size = 40,
  showWordmark = true,
  onClick,
}: LogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="flex items-center gap-3"
      aria-label="Go to SLIPA homepage"
    >
      <Image
        src="/branding/slipa-icon.svg"
        alt="SLIPA"
        width={size}
        height={size}
        priority
      />

      {showWordmark && (
        <Image
          src="/branding/slipa-wordmark.svg"
          alt="SLIPA"
          width={110}
          height={32}
          priority
        />
      )}
    </Link>
  )
}
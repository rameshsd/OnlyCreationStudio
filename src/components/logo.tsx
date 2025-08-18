import { type SVGProps } from "react"

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 40"
      width="140"
      height="40"
      {...props}
    >
      <g>
        <circle cx="20" cy="20" r="18" fill="hsl(var(--primary))" />
        <polygon points="15,12 15,28 28,20" fill="hsl(var(--primary-foreground))" />
        <text
          x="48"
          y="29"
          fontFamily="Manrope, sans-serif"
          fontSize="22"
          fontWeight="800"
          fill="hsl(var(--foreground))"
          className="font-headline"
        >
          OnlyCreation
        </text>
      </g>
    </svg>
  )
}

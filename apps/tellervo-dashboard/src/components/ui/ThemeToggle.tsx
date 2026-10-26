import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="relative rounded-xl w-9 h-9 border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-ring shadow-2xs"
      aria-label="Toggle theme"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
    >
      <Sun className="absolute w-[1.2rem] h-[1.2rem] text-amber-500 transition-all rotate-0 scale-100 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute w-[1.2rem] h-[1.2rem] text-indigo-400 transition-all rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
    </button>
  )
}

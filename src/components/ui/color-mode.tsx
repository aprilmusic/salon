"use client"

import type { IconButtonProps } from "@chakra-ui/react"
import { ClientOnly, IconButton, Skeleton } from "@chakra-ui/react"
import { ThemeProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import * as React from "react"
import { LuMoon } from "react-icons/lu"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ColorModeProviderProps extends ThemeProviderProps { }

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider 
      attribute="class" 
      disableTransitionOnChange 
      defaultTheme="dark"
      forcedTheme="dark"
      {...props} 
    />
  )
}

export type ColorMode = "light" | "dark"

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const toggleColorMode = () => {
    // We're not changing the actual color mode anymore as we want a consistent black background
    // But keeping this function for compatibility
    console.log("Color mode toggling is disabled in this theme");
}
  return {
    colorMode: "dark", // Always return dark for our black background theme
    setColorMode: () => console.log("Color mode changing is disabled in this theme"),
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  // Always return the dark value for our black background theme
  return dark;
}

export function ColorModeIcon() {
  // Always show moon icon for our dark theme
  return <LuMoon />;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ColorModeButtonProps extends Omit<IconButtonProps, "aria-label"> { }

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton
        variant="ghost"
        aria-label="Toggle color mode (disabled)"
        size="sm"
        ref={ref}
        {...props}
        css={{
          _icon: {
            width: "5",
            height: "5",
          },
        }}
      >
        <ColorModeIcon />
      </IconButton>
    </ClientOnly>
  )
})

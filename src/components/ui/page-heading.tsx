import { Heading, HeadingProps } from "@chakra-ui/react";
import { Great_Vibes } from "next/font/google";
import * as React from "react";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
});

type HeadingSize = "xl" | "lg" | "md";

interface PageHeadingProps extends Omit<HeadingProps, "size"> {
  size?: HeadingSize;
}

export const PageHeading = React.forwardRef<HTMLHeadingElement, PageHeadingProps>(
  function PageHeading(props, ref) {
    const { size = "xl", children, className, ...rest } = props;
    
    const fontSizeVar = size === "xl" 
      ? "var(--heading-size-xl)" 
      : size === "lg" 
        ? "var(--heading-size-lg)" 
        : "var(--heading-size-md)";
    
    return (
      <Heading
        ref={ref}
        as="h1"
        textAlign="center"
        mb={8}
        color="var(--text-primary)"
        className={`${greatVibes.className} ${className || ""}`}
        fontWeight="semibold"
        fontSize={fontSizeVar}
        {...rest}
      >
        {children}
      </Heading>
    );
  }
); 
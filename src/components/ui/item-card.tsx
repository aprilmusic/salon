import { Box, BoxProps } from "@chakra-ui/react";
import { Playfair_Display } from "next/font/google";
import * as React from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export interface ItemCardProps extends BoxProps {
  onClick?: () => void;
  isDraggable?: boolean;
  isFrozen?: boolean;
}

export const ItemCard = React.forwardRef<HTMLDivElement, ItemCardProps>(
  function ItemCard(props, ref) {
    const { 
      children, 
      onClick, 
      isDraggable = false,
      isFrozen = false,
      ...rest 
    } = props;
    
    return (
      <Box
        ref={ref}
        position="relative"
        width="100%"
        padding={`var(--item-padding-v) var(--item-padding-h)`}
        marginBottom="var(--item-margin-bottom)"
        borderBottom="var(--border-style)"
        transition="all 0.2s ease"
        _hover={{ 
          cursor: onClick ? "pointer" : (isDraggable && !isFrozen ? "grab" : "default"),
          backgroundColor: "var(--hover-bg)",
        }}
        _active={isDraggable && !isFrozen ? { cursor: "grabbing" } : undefined}
        className={playfair.className}
        {...rest}
        onClick={onClick}
      >
        {children}
      </Box>
    );
  }
); 
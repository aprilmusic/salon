import { Box, Button, Container, Text, BoxProps } from "@chakra-ui/react";
import { Playfair_Display } from "next/font/google";
import * as React from "react";
import { PageHeading } from "./page-heading";
import { ItemCard } from "./item-card";
import { DeleteButton } from "./delete-button";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export interface ProgramItem {
  id: string;
  title: string;
  rightText: string;
  description?: string;
  onClick?: () => void;
  onDelete?: () => void;
  additionalInfo?: string;
}

export interface ProgramProps extends BoxProps {
  title: string;
  items?: ProgramItem[];
  leftButton?: {
    label: string;
    onClick: () => void;
  };
  rightButton?: {
    label: string;
    onClick: () => void;
  };
  children?: React.ReactNode;
}

export const Program = React.forwardRef<HTMLDivElement, ProgramProps>(
  function Program(props, ref) {
    const { 
      title, 
      items, 
      leftButton, 
      rightButton,
      children,
      ...rest 
    } = props;
    
    return (
      <Container maxW="container.xl" px={3} ref={ref} {...rest}>
        {/* Top buttons */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={8} mt={4}>
          {leftButton && (
            <Button p={4} onClick={leftButton.onClick} alignSelf="flex-start">
              {leftButton.label}
            </Button>
          )}
          {rightButton && (
            <Button p={4} onClick={rightButton.onClick}>
              {rightButton.label}
            </Button>
          )}
        </Box>

        {/* Title */}
        <Box textAlign="center" mb={8}>
          <PageHeading>
            {title}
          </PageHeading>
        </Box>

        {/* Items list */}
        <Box 
          bg="var(--content-background)"
          p={4}
          mb={8}
          className={playfair.className}
        >
          {children || (
            <Box display="flex" flexDirection="column" gap={6}>
              {items?.map((item) => (
                <ItemCard
                  key={item.id}
                  onClick={item.onClick}
                >
                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="baseline"
                    mb={4}
                    width="100%"
                  >
                    <Text
                      fontSize="var(--perf-title-size)"
                      fontWeight="600"
                      color="var(--text-primary)"
                      className={playfair.className}
                      maxWidth="40%"
                    >
                      {item.title}
                    </Text>
                    <Box 
                      display="flex" 
                      alignItems="baseline"
                      flex="1"
                      minWidth="0"
                    >
                      <Text 
                        as="span" 
                        color="var(--text-secondary)" 
                        fontSize="var(--perf-composer-size)"
                        mx={2}
                        flexGrow={1}
                        overflow="hidden"
                        style={{
                          width: "100%",
                          textOverflow: "clip",
                          whiteSpace: "nowrap",
                          letterSpacing: "0.5em"
                        }}
                      >
                        {".".repeat(100)}
                      </Text>
                      <Text
                        fontSize="var(--perf-composer-size)"
                        fontWeight="600"
                        color="var(--text-primary)"
                        textAlign="right"
                      >
                        {item.rightText}
                      </Text>
                    </Box>
                  </Box>
                  
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      {item.additionalInfo && (
                        <Text color="var(--text-tertiary)" fontSize="sm" mb={2} className={playfair.className}>
                          {item.additionalInfo}
                        </Text>
                      )}
                      
                      {item.description && (
                        <Box display="flex" flexDirection="column" gap={2} mt={4}>
                          <Text 
                            color="var(--text-tertiary)" 
                            fontSize="var(--perf-performers-size)"
                            className={playfair.className}
                            ml={4}
                            maxWidth="80%"
                          >
                            {item.description}
                          </Text>
                        </Box>
                      )}
                    </Box>
                    
                    {item.onDelete && (
                      <DeleteButton 
                        onDelete={item.onDelete}
                        alignSelf="flex-start"
                        mt={2}
                      />
                    )}
                  </Box>
                </ItemCard>
              ))}
            </Box>
          )}
        </Box>
      </Container>
    );
  }
); 
import { Button, ButtonProps } from "@chakra-ui/react";
import * as React from "react";

interface DeleteButtonProps extends ButtonProps {
  onDelete: () => void;
}

export const DeleteButton = React.forwardRef<HTMLButtonElement, DeleteButtonProps>(
  function DeleteButton(props, ref) {
    const { onDelete, children = "Delete", ...rest } = props;
    return (
      <Button
        ref={ref}
        size="sm"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete();
        }}
        ml={4}
        mt={-1}
        minWidth="auto"
        height="auto"
        padding="4px 8px"
        _hover={{ 
          backgroundColor: "var(--button-hover-bg)",
          color: "var(--button-hover-color)" 
        }}
        {...rest}
      >
        {children}
      </Button>
    );
  }
); 
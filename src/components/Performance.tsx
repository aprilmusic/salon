import { Button, Heading, Field, Input, Portal, Box } from "@chakra-ui/react";
import { Text, Card, Dialog } from "@chakra-ui/react";
import { Playfair_Display } from "next/font/google";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

interface PerformanceProps {
    title: string;
    composer: string;
    performers: string;
    id: string;
    concertId: string;
    passcode: string;
}

const handleDeletePerformance = async (id: string, concertId: string, passcode: string) => {
    try {
        const response = await fetch('/api/performances', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, concertId, passcode })
        });
        if (!response.ok) {
            throw new Error('Failed to delete performance');
        }
        window.location.reload();
    } catch (error) {
        console.error('Error deleting performance:', error);
    }
};

export default function Performance({
    title,
    composer,
    performers,
    id,
    concertId,
    passcode,
}: PerformanceProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [enteredPassword, setEnteredPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
    };

    const handleOpenDeleteDialog = () => {
        console.log('handleOpenDeleteDialog');
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (enteredPassword === passcode) {
            handleDeletePerformance(id, concertId, enteredPassword);
            setIsDeleteDialogOpen(false);
        } else {
            setPasswordError("Incorrect password");
        }
    };

    const handleCloseDialog = () => {
        setIsDeleteDialogOpen(false);
        setEnteredPassword("");
        setPasswordError("");
    };

    return (
        <>
            <Box position="relative" width="100%">
                {/* Main card content - draggable */}
                <Card.Root
                    ref={setNodeRef}
                    style={style}
                    {...attributes}
                    {...listeners}
                    bg="var(--background-secondary)"
                    backdropFilter="blur(8px)"
                    borderColor="var(--border)"
                    _hover={{ cursor: 'grab' }}
                    _active={{ cursor: 'grabbing' }}
                    width="100%"
                    minHeight="160px"
                >
                    <Card.Body p={6} fontFamily={playfair.className}>
                        <Heading
                            as="h1"
                            size="lg"
                            fontSize="1.5rem"
                            color="var(--text-primary)"
                            mb={4}
                            fontFamily={playfair.className}
                        >
                            {title}
                        </Heading>
                        <Text color="var(--text-secondary)" fontSize="md" mb={3}>
                            Composer: {composer}
                        </Text>
                        <Text color="var(--text-tertiary)" fontSize="md">
                            Performers: {performers}
                        </Text>
                    </Card.Body>
                </Card.Root>

                {/* Delete button positioned absolutely */}
                <Box
                    position="absolute"
                    bottom={6}
                    right={6}
                    zIndex={2}
                >
                    <Button
                        px={4}
                        onClick={handleOpenDeleteDialog}
                    >
                        Delete
                    </Button>
                </Box>
            </Box>

            {/* Delete Dialog */}
            <Dialog.Root
                open={isDeleteDialogOpen}
                onOpenChange={(details) => !details.open && handleCloseDialog()}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content
                            p={4}
                            bg="var(--background)"
                            backdropFilter="blur(8px)"
                            borderColor="var(--border)"
                        >
                            <Dialog.Header>
                                <Dialog.Title color="var(--text-primary)">Delete Performance</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body pb="4">
                                <Text mb={4}>Are you sure you want to delete this performance?</Text>
                                <Field.Root>
                                    <Field.Label>Enter concert password to confirm</Field.Label>
                                    <Input
                                        value={enteredPassword}
                                        onChange={(e) => setEnteredPassword(e.target.value)}
                                        placeholder="Concert password"
                                        paddingLeft={1}
                                        bg="var(--background-secondary)"
                                        color="black"
                                    />
                                    {passwordError && <Text color="red.500" fontSize="sm">{passwordError}</Text>}
                                </Field.Root>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button px={2} onClick={handleCloseDialog}>
                                        Cancel
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Dialog.ActionTrigger asChild>
                                    <Button px={2} onClick={handleDeleteConfirm}>
                                        Delete
                                    </Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
}
import { Button, Field, Input, Portal, Box } from "@chakra-ui/react";
import { Text, Dialog } from "@chakra-ui/react";
import { Great_Vibes, Playfair_Display } from "next/font/google";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ItemCard } from "./ui/item-card";
import { PerformanceUpdate } from "@/lib/types";

const greatVibes = Great_Vibes({
    subsets: ["latin"],
    weight: ["400"],
});

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
    isFrozen?: boolean;
}

type EditPerformanceFormValues = PerformanceUpdate;

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

const handleUpdatePerformance = async (id: string, data: EditPerformanceFormValues) => {
    try {
        const response = await fetch(`/api/performances/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error('Failed to update performance');
        }
        window.location.reload();
    } catch (error) {
        console.error('Error updating performance:', error);
    }
};

export default function Performance({
    title,
    composer,
    performers,
    id,
    concertId,
    passcode,
    isFrozen = false,
}: PerformanceProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [enteredPassword, setEnteredPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [editError, setEditError] = useState("");

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id,
        disabled: isFrozen,
    });

    const {
        register: registerEditForm,
        handleSubmit: handleSubmitEditForm,
        formState: { errors: errorsEditForm },
        reset: resetEditForm,
    } = useForm<EditPerformanceFormValues>({
        defaultValues: {
            title,
            composer,
            performers,
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isFrozen ? 'default' : 'grab',
    };

    const handleOpenEditDialog = () => {
        console.log('handleOpenEditDialog');
        setIsEditDialogOpen(true);
        resetEditForm({
            title,
            composer,
            performers,
        });
        setEditError("");
        setEnteredPassword("");
        setPasswordError("");
    };

    const handleEditConfirm = (data: EditPerformanceFormValues) => {
        handleUpdatePerformance(id, data);
        setIsEditDialogOpen(false);
    };

    const handleDeleteConfirm = () => {
        if (enteredPassword === passcode) {
            handleDeletePerformance(id, concertId, enteredPassword);
            setIsEditDialogOpen(false);
        } else {
            setPasswordError("Incorrect password");
        }
    };

    const handleCloseEditDialog = () => {
        setIsEditDialogOpen(false);
        setEditError("");
        setEnteredPassword("");
        setPasswordError("");
    };

    return (
        <>
            <ItemCard
                ref={setNodeRef}
                style={style}
                {...(!isFrozen ? { ...attributes } : {})}
                isDraggable={true}
                isFrozen={isFrozen}
                title={isFrozen ? "This concert is frozen. Performances cannot be reordered." : ""}
                padding={`var(--item-padding-v) 0`}
            >
                <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="baseline"
                    className={playfair.className}
                    mb={1}
                    width="100%"
                    {...(!isFrozen ? { ...listeners } : {})}
                >
                    <Text 
                        fontSize="var(--perf-title-size)"
                        fontWeight="600"
                        color="var(--text-primary)"
                        fontStyle="italic"
                        maxWidth="40%"
                    >
                        {title}
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
                            {".".repeat(500)}
                        </Text>
                        <Text 
                            fontSize="var(--perf-composer-size)"
                            fontWeight="600"
                            color="var(--text-primary)"
                            textAlign="right"
                            maxWidth="40%"
                        >
                            {composer}
                        </Text>
                    </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Text 
                        color="var(--text-tertiary)" 
                        fontSize="var(--perf-performers-size)"
                        className={playfair.className}
                        ml={4}
                        maxWidth="80%"
                    >
                        {performers}
                    </Text>

                    {/* Edit button - only enabled if not frozen */}
                    {!isFrozen && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleOpenEditDialog}
                            px={2}
                            py={1}
                            fontSize="sm"
                            borderColor="var(--border)"
                            color="var(--text-primary)"
                            _hover={{
                                backgroundColor: "var(--hover-bg)",
                                borderColor: "var(--text-secondary)"
                            }}
                        >
                            Edit
                        </Button>
                    )}
                </Box>
            </ItemCard>

            {/* Edit/Delete Dialog */}
            <Dialog.Root
                open={isEditDialogOpen}
                onOpenChange={(details) => !details.open && handleCloseEditDialog()}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content
                            p={4}
                            backgroundColor="transparent"
                            backgroundImage="url('/paper.jpg')"
                            borderColor="var(--border)"
                            boxShadow="md"
                            maxWidth="500px"
                        >
                            <Dialog.Header>
                                <Dialog.Title color="var(--text-primary)" className={greatVibes.className}>
                                    Edit Performance
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body pb="4" className={playfair.className}>
                                <form onSubmit={handleSubmitEditForm(handleEditConfirm)}>
                                    <Box display="flex" flexDirection="column" gap={4}>
                                        <Field.Root>
                                            <Field.Label>Title</Field.Label>
                                            <Input
                                                paddingLeft={1}
                                                color="var(--text-primary)"
                                                {...registerEditForm("title", { required: "Title is required" })}
                                            />
                                            {errorsEditForm.title && (
                                                <Text color="red.500" fontSize="sm">{errorsEditForm.title.message}</Text>
                                            )}
                                        </Field.Root>
                                        <Field.Root>
                                            <Field.Label>Composer</Field.Label>
                                            <Input
                                                paddingLeft={1}
                                                color="var(--text-primary)"
                                                {...registerEditForm("composer", { required: "Composer is required" })}
                                            />
                                            {errorsEditForm.composer && (
                                                <Text color="red.500" fontSize="sm">{errorsEditForm.composer.message}</Text>
                                            )}
                                        </Field.Root>
                                        <Field.Root>
                                            <Field.Label>Performers</Field.Label>
                                            <Input
                                                paddingLeft={1}
                                                color="var(--text-primary)"
                                                {...registerEditForm("performers", { required: "Performers are required" })}
                                            />
                                            {errorsEditForm.performers && (
                                                <Text color="red.500" fontSize="sm">{errorsEditForm.performers.message}</Text>
                                            )}
                                        </Field.Root>
                                    </Box>
                                </form>

                                {/* Danger Zone - Delete Section */}
                                <Box mt={6} pt={4} borderTop="1px solid var(--border)">
                                    <Text mb={3} color="var(--text-secondary)" fontSize="sm" fontWeight="600">
                                        Danger Zone
                                    </Text>
                                    
                                    <Box mb={3}>
                                        <Field.Root>
                                            <Field.Label>Enter concert password to delete this performance</Field.Label>
                                            <Input
                                                value={enteredPassword}
                                                onChange={(e) => setEnteredPassword(e.target.value)}
                                                placeholder="Concert password"
                                                paddingLeft={1}
                                                color="var(--text-primary)"
                                                size="sm"
                                            />
                                            {passwordError && (
                                                <Text color="red.500" fontSize="sm">{passwordError}</Text>
                                            )}
                                        </Field.Root>
                                    </Box>
                                    
                                    <Button
                                        onClick={handleDeleteConfirm}
                                        colorScheme="red"
                                        variant="outline"
                                        size="sm"
                                        px={3}
                                        _hover={{
                                            backgroundColor: "red.50",
                                            borderColor: "red.400"
                                        }}
                                    >
                                        Delete Performance
                                    </Button>
                                </Box>

                                {editError && (
                                    <Text color="red.500" fontSize="sm" mt={3}>
                                        {editError}
                                    </Text>
                                )}
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button px={2} onClick={handleCloseEditDialog}>
                                        Cancel
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Dialog.ActionTrigger asChild>
                                    <Button px={2} onClick={handleSubmitEditForm(handleEditConfirm)}>
                                        Save Changes
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
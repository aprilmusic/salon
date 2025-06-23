import { Button, Field, Input, Portal, Box } from "@chakra-ui/react";
import { Text, Dialog } from "@chakra-ui/react";
import { Great_Vibes, Playfair_Display } from "next/font/google";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { DeleteButton } from "./ui/delete-button";
import { ItemCard } from "./ui/item-card";

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

interface EditPerformanceFormValues {
    title: string;
    composer: string;
    performers: string;
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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

    const handleOpenDeleteDialog = () => {
        console.log('handleOpenDeleteDialog');
        setIsDeleteDialogOpen(true);
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
    };

    const handleDeleteConfirm = () => {
        if (enteredPassword === passcode) {
            handleDeletePerformance(id, concertId, enteredPassword);
            setIsDeleteDialogOpen(false);
        } else {
            setPasswordError("Incorrect password");
        }
    };

    const handleEditConfirm = (data: EditPerformanceFormValues) => {
        handleUpdatePerformance(id, data);
        setIsEditDialogOpen(false);
    };

    const handleCloseDialog = () => {
        setIsDeleteDialogOpen(false);
        setEnteredPassword("");
        setPasswordError("");
    };

    const handleCloseEditDialog = () => {
        setIsEditDialogOpen(false);
        setEditError("");
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

                    {/* Action buttons - only enabled if not frozen */}
                    {!isFrozen && (
                        <Box display="flex" gap={2}>
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
                            <DeleteButton
                                onDelete={handleOpenDeleteDialog}
                            >
                                Delete
                            </DeleteButton>
                        </Box>
                    )}
                </Box>
            </ItemCard>

            {/* Edit Dialog */}
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
                        >
                            <Dialog.Header>
                                <Dialog.Title color="var(--text-primary)" className={greatVibes.className}>Edit Performance</Dialog.Title>
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
                                        {editError && (
                                            <Text color="red.500" fontSize="sm">{editError}</Text>
                                        )}
                                    </Box>
                                </form>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button px={2} onClick={handleCloseEditDialog}>
                                        Cancel
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Dialog.ActionTrigger asChild>
                                    <Button px={2} onClick={handleSubmitEditForm(handleEditConfirm)}>
                                        Save
                                    </Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

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
                            backgroundColor="transparent"
                            backgroundImage="url('/paper.jpg')"
                            borderColor="var(--border)"
                            boxShadow="md"
                        >
                            <Dialog.Header>
                                <Dialog.Title color="var(--text-primary)" className={greatVibes.className}>Delete Performance</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body pb="4" className={playfair.className}>
                                <Text mb={4}>Are you sure you want to delete this performance?</Text>
                                <Field.Root>
                                    <Field.Label>Enter concert password to confirm</Field.Label>
                                    <Input
                                        value={enteredPassword}
                                        onChange={(e) => setEnteredPassword(e.target.value)}
                                        placeholder="Concert password"
                                        paddingLeft={1}
                                        color="var(--text-primary)"
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
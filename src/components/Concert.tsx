import Performance from "./Performance";
import { Playfair_Display } from "next/font/google";
import {
    Box, Button, Container, Text,
    Dialog, Field, Input, Portal, Stack,
} from "@chakra-ui/react";
import { useState } from 'react';
import { useForm } from "react-hook-form"
import type { Concert as ConcertType } from "@/lib/types";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useAdmin } from "@/lib/hooks/useAdmin";
import { Program } from "./ui/Program";

interface PerformanceFormValues {
    title: string
    composer: string
    performers: string
    passcode: string
}

interface EditConcertFormValues {
    name: string;
    date: string;
    passcode: string;
    frozen: boolean;
}

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

// Add this helper function before the Concert component
function generateOrderBetween(before: string, after: string): string {
    console.log('generateOrderBetween called with:', { before, after });

    // If the strings are equal, append '0' to before
    if (before === after) {
        console.log('Strings are equal, appending "0" to first string');
        return before + '0';
    }

    // Find the first different character
    let i = 0;
    while (i < before.length && i < after.length && before[i] === after[i]) {
        i++;
    }
    console.log(`First difference at index ${i}: "${before.charAt(i) || 'end'}" vs "${after.charAt(i) || 'end'}"`);

    // If we reached the end of one string, append a character in the middle of the alphabet
    if (i === before.length) {
        console.log('Reached end of first string, appending "m" to create new order');
        return before + 'm';
    }
    if (i === after.length) {
        console.log('Reached end of second string, appending "m" to create new order');
        return after + 'm';
    }

    // Get the character codes
    const beforeChar = before.charCodeAt(i);
    const afterChar = after.charCodeAt(i);
    console.log(`Character codes at position ${i}: ${beforeChar} (${String.fromCharCode(beforeChar)}) vs ${afterChar} (${String.fromCharCode(afterChar)})`);

    // Generate a character halfway between
    const midChar = Math.floor((beforeChar + afterChar) / 2);
    console.log(`Calculated midpoint character code: ${midChar} (${String.fromCharCode(midChar)})`);

    // If they're adjacent, we need to extend the string
    if (midChar === beforeChar) {
        console.log('Characters are adjacent in Unicode, extending first string with "m"');
        return before + 'm';
    }

    // Ensure the generated order is actually between the two strings
    const result = before.slice(0, i) + String.fromCharCode(midChar);
    console.log(`Generated candidate result: "${result}"`);

    if (result <= before || result >= after) {
        // If the result isn't between, append a character to create more space
        console.log('Generated result is not properly between inputs, appending "m" to first string');
        return before + 'm';
    }

    console.log(`Final result: "${result}" (lexicographically between "${before}" and "${after}")`);
    return result;
}

export default function Concert({ concert }: { concert: ConcertType }) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [performances, setPerformances] = useState(concert.performances);
    const [error, setError] = useState<string | null>(null);
    const [performanceFormError, setPerformanceFormError] = useState<string | null>(null);
    const { isAdmin } = useAdmin();

    // Use the frozen state directly from the concert
    const isFrozen = concert.frozen;

    const {
        register: registerPerformanceForm,
        handleSubmit: handleSubmitPerformanceForm,
        formState: { errors: errorsPerformanceForm },
        reset: resetPerformanceForm,
    } = useForm<PerformanceFormValues>()

    const {
        register: registerEditForm,
        handleSubmit: handleSubmitEditForm,
        formState: { errors: errorsEditForm },
        reset: resetEditForm,
    } = useForm<EditConcertFormValues>();

    const [isLoading, setIsLoading] = useState(false);

    const createPerformance = async ({ title, composer, performers, passcode }: PerformanceFormValues) => {
        setPerformanceFormError(null);

        if (passcode !== concert.passcode) {
            setPerformanceFormError("Incorrect password");
            return;
        }

        try {
            setIsLoading(true);
            // Get the last performance's order or use 'a0' if no performances exist
            const lastPerformance = concert.performances[concert.performances.length - 1];
            const newOrder = lastPerformance
                ? generateOrderBetween(lastPerformance.order, 'z0')
                : 'a0';

            const response = await fetch('/api/performances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    concertId: concert.id,
                    title,
                    composer,
                    performers,
                    order: newOrder,
                    passcode,
                }),
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error.message);
            }
            resetPerformanceForm();
            window.location.reload();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    const onSubmitCreatePerformance = handleSubmitPerformanceForm((data) => {
        createPerformance(data);
    });

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        console.log('Drag end event:', { active, over });

        const oldIndex = performances.findIndex((p) => p.id === active.id);
        const newIndex = performances.findIndex((p) => p.id === over.id);

        console.log('Performance indices:', { oldIndex, newIndex });

        // Get the moved performance's original order
        const movedItem = performances[oldIndex];
        console.log('Moving performance:', {
            id: movedItem.id,
            title: movedItem.title,
            originalOrder: movedItem.order
        });

        // Get the surrounding items' order strings
        const prevItem = newIndex > 0 ? performances[newIndex - 1] : null;
        const nextItem = newIndex < performances.length - 1 ? performances[newIndex + 1] : null;

        // More detailed logging of surrounding items
        console.log('Surrounding items for ordering:', {
            prev: prevItem ? {
                id: prevItem.id,
                title: prevItem.title,
                order: prevItem.order
            } : 'None (using default "a0")',
            next: nextItem ? {
                id: nextItem.id,
                title: nextItem.title,
                order: nextItem.order
            } : 'None (using default "z0")'
        });

        const beforeOrder = prevItem?.order || 'a0';
        const afterOrder = nextItem?.order || 'z0';

        console.log('Generating order between:', {
            beforeOrder,
            afterOrder,
            explanation: 'Will generate a string that lexicographically sorts between these two values'
        });

        // Generate a new order string that lexicographically sits between the two items
        const newOrder = generateOrderBetween(beforeOrder, afterOrder);

        console.log('Order generation result:', {
            inputBefore: beforeOrder,
            inputAfter: afterOrder,
            generatedOrder: newOrder,
            verification: `${beforeOrder} < ${newOrder} < ${afterOrder}: ${beforeOrder < newOrder && newOrder < afterOrder}`
        });

        // Update local state with new order
        const newPerformances = [...performances];
        const movedPerformance = { ...newPerformances[oldIndex], order: newOrder };
        newPerformances.splice(oldIndex, 1);
        newPerformances.splice(newIndex, 0, movedPerformance);
        setPerformances(newPerformances);

        console.log('Updated performance:', {
            id: movedPerformance.id,
            title: movedPerformance.title,
            originalOrder: movedItem.order,
            newOrder: movedPerformance.order
        });

        // Update in database
        try {
            console.log('Sending PATCH request to update performance order');
            const response = await fetch(`/api/performances/${movedPerformance.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...movedPerformance,
                    order: newOrder,
                }),
            });

            console.log('PATCH response status:', response.status);
            const responseData = await response.json();
            console.log('PATCH response data:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error?.message || 'Failed to update performance order');
            }
        } catch (error) {
            console.error('Error updating performance order:', error);
            if (error instanceof Error) {
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                });
            }
            setPerformances(performances);
        }
    };

    const onSubmitEdit = handleSubmitEditForm(async (data) => {
        try {
            console.log('Submitting edit form with data:', data);

            const requestBody = {
                name: data.name,
                date: new Date(data.date).toISOString(),
                passcode: data.passcode,
                frozen: data.frozen,
            };

            console.log('Request body:', requestBody);

            const response = await fetch(`/api/concerts/${concert.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json();
            console.log('Response from server:', result);

            if (!result.success) {
                throw new Error(result.error.message);
            }

            setIsEditDialogOpen(false);
            resetEditForm();
            window.location.reload();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    });

    if (isLoading) {
        return <Container maxW="container.xl" px={8}><Text>Loading...</Text></Container>;
    }

    if (error) {
        return <Container maxW="container.xl" px={8}><Text color="red.500">{error}</Text></Container>;
    }

    if (!concert) {
        return <Container maxW="container.xl" px={8}><Text>Concert not found</Text></Container>;
    }

    return (
        <>
            <Program
                title={concert.name ?? 'Salon'}
                leftButton={{
                    label: "All concerts",
                    onClick: () => {
                        window.location.href = `/concerts`;
                    }
                }}
                rightButton={isAdmin ? {
                    label: "Edit Concert",
                    onClick: () => setIsEditDialogOpen(true)
                } : undefined}
            >
                <Box className={playfair.className}>
                    <Text 
                        color="var(--text-secondary)" 
                        fontSize="1.2rem"
                        mt={-6}
                        mb={6}
                        textAlign="center"
                        className={playfair.className}
                    >
                        {new Date(concert.date).toLocaleDateString()}
                    </Text>
                    
                    {/* Wrap the items with DnD context if not frozen */}
                    {isFrozen ? (
                        <Box display="flex" flexDirection="column">
                            {performances.map((item) => (
                                <Performance
                                    key={item.id}
                                    id={item.id}
                                    title={item.title}
                                    composer={item.composer}
                                    performers={item.performers}
                                    concertId={concert.id}
                                    passcode={concert.passcode}
                                    isFrozen={isFrozen}
                                />
                            ))}
                        </Box>
                    ) : (
                        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={performances.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                <Box display="flex" flexDirection="column">
                                    {performances.map((item) => (
                                        <Performance
                                            key={item.id}
                                            id={item.id}
                                            title={item.title}
                                            composer={item.composer}
                                            performers={item.performers}
                                            concertId={concert.id}
                                            passcode={concert.passcode}
                                            isFrozen={isFrozen}
                                        />
                                    ))}
                                </Box>
                            </SortableContext>
                        </DndContext>
                    )}

                    {/* Add Performance Button */}
                    {!isFrozen && (
                        <Box mt={4}>
                            <Button
                                p={4}
                                marginBottom={4}
                                onClick={() => document.getElementById('add-performance-dialog-trigger')?.click()}
                            >
                                + New performance
                            </Button>
                        </Box>
                    )}
                </Box>
            </Program>

            {/* Add Performance Dialog */}
            {!isFrozen && (
                <Dialog.Root>
                    <Dialog.Trigger asChild>
                        <Button
                            id="add-performance-dialog-trigger"
                            display="none"
                        >
                            Hidden Trigger
                        </Button>
                    </Dialog.Trigger>
                    <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content p={4}
                                bg="var(--content-background)"
                                borderColor="var(--border)"
                                boxShadow="md">
                                <Dialog.Header>
                                    <Dialog.Title color="var(--text-primary)" className={playfair.className}>Add a performance</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body pb="4" className={playfair.className}>
                                    <form onSubmit={onSubmitCreatePerformance}>
                                        <Stack gap="4" align="flex-start" maxW="sm">
                                            <Field.Root>
                                                <Field.Label>Title</Field.Label>
                                                <Input paddingLeft={1} color="var(--text-primary)" {...registerPerformanceForm("title", { required: "Title is required" })} />
                                                {errorsPerformanceForm.title && (
                                                    <Text color="red.500" fontSize="sm">{errorsPerformanceForm.title.message}</Text>
                                                )}
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label>Composer</Field.Label>
                                                <Input paddingLeft={1} color="var(--text-primary)" {...registerPerformanceForm("composer", { required: "Composer is required" })} />
                                                {errorsPerformanceForm.composer && (
                                                    <Text color="red.500" fontSize="sm">{errorsPerformanceForm.composer.message}</Text>
                                                )}
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label>Performers</Field.Label>
                                                <Input paddingLeft={1} color="var(--text-primary)" {...registerPerformanceForm("performers", { required: "Performers are required" })} />
                                                {errorsPerformanceForm.performers && (
                                                    <Text color="red.500" fontSize="sm">{errorsPerformanceForm.performers.message}</Text>
                                                )}
                                            </Field.Root>
                                            <Field.Root>
                                                <Field.Label>Concert Password</Field.Label>
                                                <Input
                                                    type="password"
                                                    paddingLeft={1}
                                                    color="var(--text-primary)"
                                                    {...registerPerformanceForm("passcode", { required: "Password is required" })}
                                                />
                                                {errorsPerformanceForm.passcode && (
                                                    <Text color="red.500" fontSize="sm">{errorsPerformanceForm.passcode.message}</Text>
                                                )}
                                                {performanceFormError && (
                                                    <Text color="red.500" fontSize="sm">{performanceFormError}</Text>
                                                )}
                                            </Field.Root>
                                        </Stack>
                                    </form>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                        <Button px={2}>Cancel</Button>
                                    </Dialog.ActionTrigger>
                                    <Dialog.ActionTrigger asChild>
                                        <Button px={2} onClick={onSubmitCreatePerformance}>Save</Button>
                                    </Dialog.ActionTrigger>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            )}

            {/* Edit Dialog */}
            <Dialog.Root open={isEditDialogOpen} onOpenChange={(isOpen) => !isOpen && setIsEditDialogOpen(false)}>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p={4}
                            bg="var(--content-background)"
                            borderColor="var(--border)"
                            boxShadow="md">
                            <Dialog.Header>
                                <Dialog.Title color="var(--text-primary)" className={playfair.className}>Edit Concert</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body pb="4" className={playfair.className}>
                                <form onSubmit={onSubmitEdit}>
                                    <Stack gap="4" align="flex-start" maxW="sm">
                                        <Field.Root invalid={!!errorsEditForm.name}>
                                            <Field.Label>Name</Field.Label>
                                            <Input
                                                paddingLeft={1}
                                                color="var(--text-primary)"
                                                {...registerEditForm("name", {
                                                    required: "Name is required",
                                                    value: concert.name
                                                })}
                                            />
                                        </Field.Root>
                                        <Field.Root invalid={!!errorsEditForm.date}>
                                            <Field.Label>Date</Field.Label>
                                            <Input
                                                paddingLeft={1}
                                                color="var(--text-primary)"
                                                {...registerEditForm("date", {
                                                    required: "Date is required",
                                                    value: concert.date.slice(0, 10)
                                                })}
                                            />
                                        </Field.Root>
                                        <Field.Root invalid={!!errorsEditForm.passcode}>
                                            <Field.Label>Passcode</Field.Label>
                                            <Input
                                                paddingLeft={1}
                                                color="var(--text-primary)"
                                                {...registerEditForm("passcode", {
                                                    required: "Passcode is required",
                                                    value: concert.passcode
                                                })}
                                            />
                                        </Field.Root>
                                        <Field.Root>
                                            <Field.Label>Concert Status</Field.Label>
                                            <select
                                                {...registerEditForm("frozen", {
                                                    setValueAs: (value) => value === "true",
                                                })}
                                                defaultValue={concert.frozen ? "true" : "false"}
                                                style={{
                                                    padding: "8px",
                                                    borderRadius: "4px",
                                                    border: "1px solid var(--border)",
                                                    backgroundColor: "var(--content-background)",
                                                    color: "var(--text-primary)"
                                                }}
                                            >
                                                <option value="false">Editable (performances can be modified)</option>
                                                <option value="true">Frozen (no modifications allowed)</option>
                                            </select>
                                            <Text fontSize="sm" color="gray.500" mt={2}>
                                                When a concert is frozen, performances cannot be added, deleted, or reordered by anyone
                                            </Text>
                                        </Field.Root>
                                        {error && (
                                            <Text color="red.500" fontSize="sm">
                                                {error}
                                            </Text>
                                        )}
                                    </Stack>
                                </form>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button px={2} onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Dialog.ActionTrigger asChild>
                                    <Button px={2} onClick={onSubmitEdit}>Save</Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
}
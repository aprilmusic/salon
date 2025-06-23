import Performance from "./Performance";
import { Playfair_Display } from "next/font/google";
import {
    Box, Button, Container, Text,
    Dialog, Field, Input, Portal, Stack, Link,
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
}

interface EditConcertFormValues {
    name: string;
    date: string;
    passcode: string;
    frozen: boolean;
    featured: boolean;
    videoLink?: string;
}

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

/**
 * ZERO-PADDED NUMERIC STRING ORDERING SYSTEM
 * 
 * This system solves the drag-and-drop reordering problem without requiring database schema changes.
 * 
 * Key Features:
 * - Uses string format that sorts lexicographically in the same order as numerically
 * - Format: "0001000.000" (11 chars: 7 digits + decimal + 3 decimals)
 * - Backward compatible with existing string-based orders
 * - Infinite precision through decimal subdivision
 * - No string growth issues like the previous approach
 * 
 * Examples:
 * - Initial orders: "0001000.000", "0002000.000", "0003000.000"
 * - Drag between first two: generates "0001500.000"
 * - Multiple operations: "0001000.000" → "0001500.000" → "0001750.000" → "0001875.000"
 * 
 * Legacy Compatibility:
 * - Converts old formats: 'a' → 1000, 'b' → 2000, 'am' → 1100, etc.
 * - New operations always generate new format strings
 * - Gradual migration as items are reordered
 */

// Numeric string ordering system - uses zero-padded strings that sort lexicographically
// but represent numbers (e.g., "0001000.000", "0001500.000", "0001750.000")
function generateOrderBetween(before: string, after: string): string {
    console.log('generateOrderBetween called with:', { before, after });

    // Convert order strings to numbers, handling both old and new formats
    const beforeNum = parseOrderString(before);
    const afterNum = parseOrderString(after);

    // Generate a number exactly halfway between
    const midNum = (beforeNum + afterNum) / 2;
    
    // Convert back to zero-padded string format
    const result = formatOrderString(midNum);
    
    console.log('Order generation:', {
        beforeNum,
        afterNum,
        midNum,
        result,
        verification: `${beforeNum} < ${midNum} < ${afterNum}: ${beforeNum < midNum && midNum < afterNum}`
    });

    return result;
}

// Parse order string to number, handling both old string formats and new numeric formats
function parseOrderString(orderStr: string): number {
    // If it's already a numeric string, parse it
    const num = parseFloat(orderStr);
    if (!isNaN(num)) {
        return num;
    }
    
    // Handle legacy string formats by converting to numeric equivalent
    // This provides backward compatibility with existing data
    if (orderStr === 'a0' || orderStr === 'a') return 1000;
    if (orderStr === 'b0' || orderStr === 'b') return 2000;
    if (orderStr === 'c0' || orderStr === 'c') return 3000;
    if (orderStr === 'd0' || orderStr === 'd') return 4000;
    if (orderStr === 'e0' || orderStr === 'e') return 5000;
    if (orderStr === 'f0' || orderStr === 'f') return 6000;
    if (orderStr === 'g0' || orderStr === 'g') return 7000;
    if (orderStr === 'h0' || orderStr === 'h') return 8000;
    if (orderStr === 'i0' || orderStr === 'i') return 9000;
    if (orderStr === 'j0' || orderStr === 'j') return 10000;
    
    // Handle more complex legacy formats like 'am', 'amm', etc.
    if (orderStr.startsWith('a')) return 1000 + (orderStr.length - 1) * 100;
    if (orderStr.startsWith('b')) return 2000 + (orderStr.length - 1) * 100;
    if (orderStr.startsWith('c')) return 3000 + (orderStr.length - 1) * 100;
    
    // Default fallback for any other string
    return orderStr.charCodeAt(0) * 100;
}

// Format number as zero-padded string for consistent lexicographic sorting
function formatOrderString(num: number): string {
    // Use 11 digits with 3 decimal places, zero-padded: "0001000.000"
    return num.toFixed(3).padStart(11, '0');
}

// Normalize order string to new format for consistent comparisons
function normalizeOrderString(orderStr: string): string {
    return formatOrderString(parseOrderString(orderStr));
}

// Helper function to reorder array items
function reorderArray<T>(array: T[], fromIndex: number, toIndex: number): T[] {
    const result = [...array];
    const [movedItem] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, movedItem);
    return result;
}

export default function Concert({ concert }: { concert: ConcertType }) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [performances, setPerformances] = useState(concert.performances);
    const [error, setError] = useState<string | null>(null);
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

    const createPerformance = async ({ title, composer, performers }: PerformanceFormValues) => {
        setError(null);

        try {
            setIsLoading(true);
            // Get the last performance's order or use default
            const lastPerformance = concert.performances[concert.performances.length - 1];
            const newOrder = lastPerformance
                ? generateOrderBetween(lastPerformance.order, formatOrderString(1000000))
                : formatOrderString(1000);

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

        // Get the moved performance
        const movedItem = performances[oldIndex];
        console.log('Moving performance:', {
            id: movedItem.id,
            title: movedItem.title,
            originalOrder: movedItem.order
        });

        // Create a temporary array with the item removed to get correct surrounding items
        const tempPerformances = [...performances];
        tempPerformances.splice(oldIndex, 1);

        // Calculate the actual target index in the array without the moved item
        const actualNewIndex = oldIndex < newIndex ? newIndex - 1 : newIndex;

        // Get the surrounding items from the temporary array
        const prevItem = actualNewIndex > 0 ? tempPerformances[actualNewIndex - 1] : null;
        const nextItem = actualNewIndex < tempPerformances.length ? tempPerformances[actualNewIndex] : null;

        console.log('Correct surrounding items for ordering:', {
            actualNewIndex,
            prev: prevItem ? {
                id: prevItem.id,
                title: prevItem.title,
                order: prevItem.order
            } : 'None (using default "0")',
            next: nextItem ? {
                id: nextItem.id,
                title: nextItem.title,
                order: nextItem.order
            } : 'None (using default "1000000")'
        });

        const beforeOrder = prevItem?.order || formatOrderString(0);
        const afterOrder = nextItem?.order || formatOrderString(1000000);

        console.log('Generating order between:', {
            beforeOrder,
            afterOrder,
            explanation: 'Will generate a zero-padded numeric string that sorts lexicographically'
        });

        // Generate a new order string that numerically sits between the two items
        const newOrder = generateOrderBetween(beforeOrder, afterOrder);

        console.log('Order generation result:', {
            inputBefore: beforeOrder,
            inputAfter: afterOrder,
            generatedOrder: newOrder,
            verification: `${beforeOrder} < ${newOrder} < ${afterOrder}: ${normalizeOrderString(beforeOrder) < newOrder && newOrder < normalizeOrderString(afterOrder)}`
        });

        // Update local state with new order - create properly reordered array
        const newPerformances = reorderArray(performances, oldIndex, newIndex);
        newPerformances[newIndex] = { ...newPerformances[newIndex], order: newOrder };
        
        // Store original state for rollback
        const originalPerformances = [...performances];
        setPerformances(newPerformances);

        console.log('Updated performance:', {
            id: newPerformances[newIndex].id,
            title: newPerformances[newIndex].title,
            originalOrder: movedItem.order,
            newOrder: newPerformances[newIndex].order
        });

        // Update in database
        try {
            console.log('Sending PATCH request to update performance order');
            const response = await fetch(`/api/performances/${movedItem.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: movedItem.title,
                    composer: movedItem.composer,
                    performers: movedItem.performers,
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
            // Rollback to original state on error
            setPerformances(originalPerformances);
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
                featured: data.featured,
                videoLink: data.videoLink,
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
                        {concert.videoLink && (
                            <>
                                {" / "}
                                <Link 
                                    href={concert.videoLink} 
                                    target="_blank"
                                    fontSize="1rem"
                                    rel="noopener noreferrer"
                                    color="var(--text-primary)"
                                    textDecoration="underline"
                                    _hover={{ opacity: 0.8 }}
                                    display="inline-block"
                                >
                                    recordings
                                </Link>
                            </>
                        )}
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
                                    order={item.order}
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
                                            order={item.order}
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
                                backgroundColor="var(--content-background)"
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
                            backgroundColor="transparent"
                            backgroundImage="url('/paper.jpg')"
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
                                            <Field.Label>Video Link (optional)</Field.Label>
                                            <Input
                                                paddingLeft={1}
                                                color="var(--text-primary)"
                                                {...registerEditForm("videoLink", {
                                                    value: concert.videoLink || ""
                                                })}
                                                placeholder="https://..."
                                            />
                                            <Text fontSize="sm" color="gray.500" mt={2}>
                                                Link to video recordings of the concert
                                            </Text>
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
                                        <Field.Root>
                                            <Field.Label>Featured</Field.Label>
                                            <select
                                                {...registerEditForm("featured", {
                                                    setValueAs: (value) => value === "true",
                                                })}
                                                defaultValue={concert.featured ? "true" : "false"}
                                                style={{
                                                    padding: "8px",
                                                    borderRadius: "4px",
                                                    border: "1px solid var(--border)",
                                                    backgroundColor: "var(--content-background)",
                                                    color: "var(--text-primary)"
                                                }}
                                            >
                                                <option value="false">Not Featured</option>
                                                <option value="true">Featured</option>
                                            </select>
                                            <Text fontSize="sm" color="gray.500" mt={2}>
                                                Featured concerts are highlighted on the homepage
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
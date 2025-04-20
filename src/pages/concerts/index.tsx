"use client"

import { Playfair_Display } from "next/font/google";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"
import { GetConcertsResponse, getConcertsResponseSchema, createConcertResponseSchema } from "../api/concerts/index";
import {
    Box, Button, Container, Text,
    Dialog, Field, Input, Portal, Stack
} from "@chakra-ui/react";
import { useAdmin } from "@/lib/hooks/useAdmin";
import { Program } from "@/components/ui/Program";

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

interface ConcertFormValues {
    name: string
    dateString: string
    passcode: string
}

export default function ConcertListPage() {
    const { isAdmin } = useAdmin()

    const [concerts, setConcerts] = useState<GetConcertsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [concertToDelete, setConcertToDelete] = useState<string | null>(null);

    const {
        register: registerConcertForm,
        handleSubmit: handleSubmitConcertForm,
        formState: { errors: errorsConcertForm },
    } = useForm<ConcertFormValues>()

    const {
        register: registerDeleteForm,
        handleSubmit: handleSubmitDeleteForm,
        formState: { errors: errorsDeleteForm },
        reset: resetDeleteForm,
    } = useForm<{ passcode: string }>()

    const onSubmitCreateConcert = handleSubmitConcertForm((data) => {
        createConcert(data)
    })

    const createConcert = async ({ name, dateString, passcode }: {
        name: string;
        dateString: string;
        passcode: string;
    }) => {
        try {
            const response = await fetch('/api/concerts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    date: new Date(dateString),
                    passcode,
                    performances: [],
                }),
            });
            const data = await response.json();
            console.log(data)
            const newConcert = createConcertResponseSchema.parse(data)
            if (!newConcert.success) {
                throw new Error(newConcert.error.message)
            }
            window.location.href = `/concerts/${newConcert.result.id}`
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);

        }
    }

    const deleteConcert = async (id: string, passcode: string) => {
        try {
            const response = await fetch(`/api/concerts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ passcode }),
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error.message)
            }
            setConcertToDelete(null);
            resetDeleteForm();
            window.location.reload()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    }

    const onSubmitDelete = handleSubmitDeleteForm((data) => {
        if (concertToDelete) {
            deleteConcert(concertToDelete, data.passcode);
        }
    });

    useEffect(() => {
        async function fetchConcerts() {
            try {
                const response = await fetch('/api/concerts');
                const data = await response.json();
                setConcerts(getConcertsResponseSchema.parse(data));
            } catch (error) {
                console.error('Error fetching concerts:', error);
            }
        }
        console.log('fetching concerts')
        fetchConcerts();
    }, []);

    if (isLoading) {
        return <Container maxW="container.xl"><Text>Loading...</Text></Container>;
    }

    if (error) {
        return (
            <Container maxW="container.xl">
                <Text color="red.500" fontSize="xl" textAlign="center" className={playfair.className}>
                    {error}
                </Text>
            </Container>
        );
    }

    // Transform concerts into program items
    const programItems = concerts && concerts.success
        ? concerts.result.map((concert, index) => ({
            id: concert.id,
            title: concert.name || "Salon",
            rightText: new Date(concert.date).toLocaleDateString(),
            description: concert.performances.map(perf => perf.title).join(", "),
            additionalInfo: isAdmin ? `Passcode: ${concert.passcode}` : undefined,
            onClick: () => {
                const url = index === 0 ? '/' : `/concerts/${concert.id}`;
                window.location.href = url;
            },
            onDelete: isAdmin ? () => {
                setConcertToDelete(concert.id);
            } : undefined
        }))
        : [];

    return (
        <Box
            as="main"
            minH="100vh"
            bg="var(--background)"
        >
            <div className="content-container">
                <Program
                    title="All concerts"
                    items={programItems}
                    rightButton={isAdmin ? {
                        label: "+ New concert",
                        onClick: () => document.getElementById('new-concert-dialog-trigger')?.click()
                    } : undefined}
                />

                {/* New Concert Dialog */}
                {isAdmin && (
                    <Dialog.Root>
                        <Dialog.Trigger asChild>
                            <Button id="new-concert-dialog-trigger" display="none">
                                Hidden Trigger
                            </Button>
                        </Dialog.Trigger>
                        <Portal>
                            <Dialog.Backdrop />
                            <Dialog.Positioner>
                                <Dialog.Content p={4}
                                    backgroundColor="transparent"
                                    backgroundImage="url('/paper.jpg')"
                                    borderColor="var(--border)"
                                    boxShadow="md">
                                    <Dialog.Header>
                                        <Dialog.Title color="var(--text-primary)" className={playfair.className}>Create a new concert</Dialog.Title>
                                    </Dialog.Header>
                                    <Dialog.Body pb="4" className={playfair.className}>
                                        <form onSubmit={onSubmitCreateConcert}>
                                            <Stack gap="4" align="flex-start" maxW="sm">
                                                <Field.Root>
                                                    <Field.Label>Name</Field.Label>
                                                    <Input paddingLeft={1} color="var(--text-primary)" {...registerConcertForm("name")} />
                                                </Field.Root>
                                                <Field.Root>
                                                    <Field.Label>Date</Field.Label>
                                                    <Input paddingLeft={1} color="var(--text-primary)" {...registerConcertForm("dateString")} />
                                                </Field.Root>
                                                <Field.Root invalid={!!errorsConcertForm.passcode}>
                                                    <Field.Label>passcode</Field.Label>
                                                    <Input paddingLeft={1} color="var(--text-primary)" {...registerConcertForm("passcode")} />
                                                </Field.Root>
                                            </Stack>
                                        </form>
                                    </Dialog.Body>
                                    <Dialog.Footer>
                                        <Dialog.ActionTrigger asChild>
                                            <Button px={2}>Cancel</Button>
                                        </Dialog.ActionTrigger>
                                        <Dialog.ActionTrigger asChild>
                                            <Button px={2} onClick={onSubmitCreateConcert}>Save</Button>
                                        </Dialog.ActionTrigger>
                                    </Dialog.Footer>
                                </Dialog.Content>
                            </Dialog.Positioner>
                        </Portal>
                    </Dialog.Root>
                )}

                {/* Delete Confirmation Dialog */}
                <Dialog.Root open={!!concertToDelete} onOpenChange={(isOpen) => !isOpen && setConcertToDelete(null)}>
                    <Portal>
                        <Dialog.Backdrop />
                        <Dialog.Positioner>
                            <Dialog.Content p={4}
                                backgroundColor="transparent"
                                backgroundImage="url('/paper.jpg')"
                                borderColor="var(--border)"
                                boxShadow="md">
                                <Dialog.Header>
                                    <Dialog.Title color="var(--text-primary)" className={playfair.className}>Wait! Are you sure?</Dialog.Title>
                                </Dialog.Header>
                                <Dialog.Body pb="4" className={playfair.className}>
                                    <form onSubmit={onSubmitDelete}>
                                        <Stack gap="4" align="flex-start" maxW="sm">
                                            <Field.Root invalid={!!errorsDeleteForm.passcode}>
                                                <Field.Label>Enter concert passcode to confirm deletion</Field.Label>
                                                <Input
                                                    paddingLeft={1}
                                                    color="var(--text-primary)"
                                                    type="password"
                                                    {...registerDeleteForm("passcode", { required: "Passcode is required" })}
                                                />
                                            </Field.Root>
                                        </Stack>
                                    </form>
                                </Dialog.Body>
                                <Dialog.Footer>
                                    <Dialog.ActionTrigger asChild>
                                        <Button px={2} onClick={() => setConcertToDelete(null)}>Cancel</Button>
                                    </Dialog.ActionTrigger>
                                    <Dialog.ActionTrigger asChild>
                                        <Button px={2} onClick={onSubmitDelete}>Delete</Button>
                                    </Dialog.ActionTrigger>
                                </Dialog.Footer>
                            </Dialog.Content>
                        </Dialog.Positioner>
                    </Portal>
                </Dialog.Root>
            </div>
        </Box>
    );
}
"use client"

import { Playfair_Display } from "next/font/google";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"
import { GetConcertsResponse, getConcertsResponseSchema, createConcertResponseSchema } from "../api/concerts/index";
import {
    Box, Button, Container, Heading, Text,
    Dialog, Field, Input, Portal, Stack, Card

} from "@chakra-ui/react";
const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

interface ConcertFormValues {
    dateString: string
    passcode: string
}



export default function ConcertListPage() {

    const [concerts, setConcerts] = useState<GetConcertsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register: registerConcertForm,
        handleSubmit: handleSubmitConcertForm,
        formState: { errors: errorsConcertForm },
    } = useForm<ConcertFormValues>()


    const onSubmitCreateConcert = handleSubmitConcertForm((data) => {
        createConcert(data)
    })

    const createConcert = async ({ dateString, passcode }: {
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

    const deleteConcert = async (id: string) => {
        try {
            const response = await fetch(`/api/concerts/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error.message)
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    }

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


    return (
        <Container maxW="container.xl" p={8}>
            <Heading
                as="h1"
                size="2xl"
                textAlign="center"
                mb={12}
                color="var(--text-primary)"
                fontFamily={playfair.className}
                fontWeight="semibold"
            >
                All concerts
            </Heading>
            {isLoading && ("Loading...")}
            {error && (
                <Text color="red.500" fontSize="xl" textAlign="center">
                    {error}
                </Text>
            )}

            <Dialog.Root  >
                <Dialog.Trigger asChild>
                    <Button p={4} marginBottom={4}>+ New concert</Button>
                </Dialog.Trigger>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p={4}
                            bg="var(--background)"
                            backdropFilter="blur(8px)"
                            borderColor="var(--text-primary)">
                            <Dialog.Header>
                                <Dialog.Title color="var(--text-secondary)" >Add a new concert</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body pb="4">
                                <form onSubmit={onSubmitCreateConcert}>
                                    <Stack gap="4" align="flex-start" maxW="sm">

                                        <Field.Root>
                                            <Field.Label>Date</Field.Label>
                                            <Input color="black" {...registerConcertForm("dateString")} />
                                        </Field.Root>
                                        <Field.Root invalid={!!errorsConcertForm.passcode}>
                                            <Field.Label>passcode</Field.Label>
                                            <Input color="black" {...registerConcertForm("passcode")} />
                                        </Field.Root>

                                    </Stack>
                                </form>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button variant="outline">Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Dialog.ActionTrigger asChild>
                                    <Button onClick={onSubmitCreateConcert}>Save</Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
            <Box display="flex" flexDirection="column" gap={8}>
                {concerts?.success ? concerts.result.map((concert) => (
                    <Card.Root
                        key={concert.id}
                        bg="rgba(255, 255, 255, 0.8)"
                        backdropFilter="blur(8px)"
                        borderColor="#ffe082"
                    >
                        <Card.Body p={4} fontFamily={playfair.className} onClick={() => window.location.href = `/concerts/${concert.id}`}>
                            <Heading
                                as="h2"
                                size="lg"
                                fontSize="1.5rem"
                                color="var(--text-secondary)"
                                mb={4}
                                fontFamily={playfair.className}
                            >
                                {new Date(concert.date).toLocaleDateString()}
                            </Heading>
                            <Box display="flex" flexDirection="column" gap={4}>
                                {concert.performances.map((performance) => (
                                    <Box key={performance.id}>
                                        <Text color="var(--text-tertiary)" fontSize="md" mb={2}>
                                            {performance.title}
                                        </Text>
                                    </Box>
                                ))}
                            </Box>
                            <Button alignSelf="flex-end" onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                deleteConcert(concert.id)
                            }}>Delete</Button>
                        </Card.Body>
                    </Card.Root>
                )) : (
                    <Text color="#ff8f00" fontSize="xl" textAlign="center">
                        No concerts available at the moment.
                    </Text>
                )}


            </Box>
        </Container>
    );
}
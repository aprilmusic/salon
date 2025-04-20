"use client"

import { Alex_Brush, Playfair_Display } from "next/font/google";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form"
import { GetConcertsResponse, getConcertsResponseSchema, createConcertResponseSchema } from "../api/concerts/index";
import {
    Box, Button, Container, Heading, Text,
    Dialog, Field, Input, Portal, Stack

} from "@chakra-ui/react";
import { useAdmin } from "@/lib/hooks/useAdmin";

const alexBrush = Alex_Brush({
    subsets: ["latin"],
    weight: ["400"],
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

interface ConcertFormValues {
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


    return (
        <Box
            as="main"
            minH="100vh"
            bg="var(--background)"
        >
            <div className="content-container">
                <Container maxW="container.xl" p={8}>
                    <Heading
                        as="h1"
                        size="2xl"
                        textAlign="center"
                        mb={12}
                        color="var(--text-primary)"
                        className={alexBrush.className}
                        fontWeight="semibold"
                    >
                        All concerts
                    </Heading>
                    {isLoading && ("Loading...")}
                    {error && (
                        <Text color="red.500" fontSize="xl" textAlign="center" className={playfair.className}>
                            {error}
                        </Text>
                    )}

                    {isAdmin && (
                        <Dialog.Root  >
                            <Dialog.Trigger asChild>
                                <Button p={4} marginBottom={4}>+ New concert</Button>
                            </Dialog.Trigger>
                            <Portal>
                                <Dialog.Backdrop />
                                <Dialog.Positioner>
                                    <Dialog.Content p={4}
                                        bg="var(--content-background)"
                                        borderColor="var(--border)"
                                        boxShadow="md">
                                        <Dialog.Header>
                                            <Dialog.Title color="var(--text-primary)" className={alexBrush.className}>Add a new concert</Dialog.Title>
                                        </Dialog.Header>
                                        <Dialog.Body pb="4" className={playfair.className}>
                                            <form onSubmit={onSubmitCreateConcert}>
                                                <Stack gap="4" align="flex-start" maxW="sm">
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
                                    bg="var(--content-background)"
                                    borderColor="var(--border)"
                                    boxShadow="md">
                                    <Dialog.Header>
                                        <Dialog.Title color="var(--text-primary)" className={alexBrush.className}>Wait! Are you sure?</Dialog.Title>
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

                    <Box display="flex" flexDirection="column" gap={6}>
                        {concerts && concerts.success ? concerts.result.map((concert, index) => (
                            <Box
                                key={concert.id}
                                bg="var(--content-background)"
                                border="none"
                                padding="20px"
                                marginBottom="10px"
                                borderBottom="1px dotted var(--text-secondary)"
                                transition="all 0.2s ease"
                                _hover={{ backgroundColor: "rgba(0,0,0,0.03)" }}
                                onClick={() => window.location.href = index === 0 ? '/' : `/concerts/${concert.id}`}
                                cursor="pointer"
                                className={playfair.className}
                                position="relative"
                            >
                                <Box 
                                    display="flex" 
                                    justifyContent="space-between" 
                                    alignItems="baseline"
                                    mb={4}
                                    width="100%"
                                >
                                    <Text
                                        fontSize="1.6rem"
                                        fontWeight="600"
                                        color="var(--text-primary)"
                                        className={playfair.className}
                                        maxWidth="30%"
                                    >
                                        Salon
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
                                            fontSize="1.4rem"
                                            mx={2}
                                            flexGrow={1}
                                            overflow="hidden"
                                            style={{
                                                textOverflow: "clip",
                                                whiteSpace: "nowrap"
                                            }}
                                        >
                                            {".".repeat(100)}
                                        </Text>
                                        <Text
                                            fontSize="1.4rem"
                                            fontWeight="600"
                                            color="var(--text-primary)"
                                            textAlign="right"
                                        >
                                            {new Date(concert.date).toLocaleDateString()}
                                        </Text>
                                    </Box>
                                </Box>
                                
                                <Box display="flex" justifyContent="space-between">
                                    <Box>
                                        {isAdmin && (
                                            <Text color="var(--text-tertiary)" fontSize="sm" mb={2} className={playfair.className}>
                                                Passcode: {concert.passcode}
                                            </Text>
                                        )}
                                        
                                        <Box display="flex" flexDirection="column" gap={2} mt={4}>
                                            {concert.performances.map((performance) => (
                                                <Box key={performance.id} ml={4}>
                                                    <Text 
                                                        color="var(--text-secondary)" 
                                                        fontSize="1.1rem"
                                                        fontStyle="italic" 
                                                    >
                                                        {performance.title}
                                                    </Text>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                    
                                    {isAdmin && (
                                        <Button 
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                setConcertToDelete(concert.id);
                                            }}
                                            alignSelf="flex-start"
                                            mt={2}
                                        >
                                            Delete
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        )) : (
                            <Text color="var(--text-primary)" fontSize="xl" textAlign="center">
                                No concerts available at the moment.
                            </Text>
                        )}
                    </Box>
                </Container>
            </div>
        </Box>
    );
}
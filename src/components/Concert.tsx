import Performance from "./Performance";
import { Playfair_Display } from "next/font/google";
import {
    Box, Button, Container, Heading, Text,
    Dialog, Field, Input, Portal, Stack,
} from "@chakra-ui/react";
import { useState } from 'react';
import { useForm } from "react-hook-form"
import type { Concert } from "@/lib/types";


interface PerformanceFormValues {
    title: string
    composer: string
    performers: string
}

interface PasswordFormValues {
    passcode: string
}

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

export default function Concert({ concert }: { concert: Concert }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [authMessage, setAuthMessage] = useState<{type: "success" | "error", text: string} | null>(null);

    const {
        register: registerPasswordForm,
        handleSubmit: handleSubmitPasswordForm,
        formState: { errors: errorsPasswordForm },
    } = useForm<PasswordFormValues>()

    const {
        register: registerPerformanceForm,
        handleSubmit: handleSubmitPerformanceForm,
        formState: { errors: errorsPerformanceForm },
    } = useForm<PerformanceFormValues>()

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validatePassword = (enteredPassword: string) => {
        return enteredPassword === concert.passcode;
    }

    const onSubmitPassword = handleSubmitPasswordForm((data) => {
        if (validatePassword(data.passcode)) {
            setIsAuthenticated(true);
            setIsPasswordDialogOpen(false);
            setAuthMessage({type: "success", text: "Access granted"});
        } else {
            setAuthMessage({type: "error", text: "Incorrect password"});
        }
    });

    const createPerformance = async ({ title, composer, performers }: {
        title: string;
        composer: string;
        performers: string;
    }) => {
        if (!isAuthenticated) {
            setIsPasswordDialogOpen(true);
            return;
        }

        try {
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
                    order: concert.performances.length ?? 0,
                }),
            });
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error.message);
            }
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
        <Container maxW="container.xl" px={8} >
            <Button p={4} onClick={() => {
                window.location.href = `/concerts`
            }} alignSelf="flex-start" >
                Back to all concerts
            </Button>
            <Heading
                as="h1"
                size="2xl"
                textAlign="center"
                mb={12}
                color="var(--text-primary)"
                fontFamily={playfair.className}
                fontWeight="semibold"
            >
                Salon ({new Date(concert.date).toLocaleDateString()})
            </Heading>

            <Box display="flex" flexDirection="column" gap={8} paddingBottom={8}>
                {(concert.performances ?? []).map((item, index) => (
                    <Performance
                        key={index}
                        id={item.id}
                        title={item.title}
                        composer={item.composer}
                        performers={item.performers}
                        concertId={concert.id}
                        passcode={concert.passcode}
                        isAuthenticated={isAuthenticated}
                        onRequestAuth={() => setIsPasswordDialogOpen(true)}
                    />
                ))}
            </Box>

            {/* Password Dialog */}
            <Dialog.Root 
                open={isPasswordDialogOpen} 
                onOpenChange={(details) => setIsPasswordDialogOpen(details.open)}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p={4}
                            bg="var(--background)"
                            backdropFilter="blur(8px)"
                            borderColor="var(--border)">
                            <Dialog.Header>
                                <Dialog.Title>Authentication Required</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body pb="4">
                                <Text mb={4}>Please enter the concert password to modify performances.</Text>
                                <form onSubmit={onSubmitPassword}>
                                    <Stack gap="4" align="flex-start" maxW="sm">
                                        <Field.Root invalid={!!errorsPasswordForm.passcode}>
                                            <Field.Label>Password</Field.Label>
                                            <Input 
                                                color="black" 
                                                type="password" 
                                                {...registerPasswordForm("passcode", { required: "Password is required" })} 
                                            />
                                            {errorsPasswordForm.passcode && (
                                                <Text color="red.500" fontSize="sm">{errorsPasswordForm.passcode.message}</Text>
                                            )}
                                        </Field.Root>
                                        {authMessage && (
                                            <Text color={authMessage.type === "success" ? "green.500" : "red.500"}>{authMessage.text}</Text>
                                        )}
                                    </Stack>
                                </form>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                    <Button px={2} onClick={() => setIsPasswordDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                </Dialog.ActionTrigger>
                                <Dialog.ActionTrigger asChild>
                                    <Button px={2} onClick={onSubmitPassword}>
                                        Submit
                                    </Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            {/* Add Performance Dialog */}
            <Dialog.Root>
                <Dialog.Trigger asChild>
                    <Button p={4} marginBottom={4}>+ New performance</Button>
                </Dialog.Trigger>
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content p={4}
                            bg="var(--background)"
                            backdropFilter="blur(8px)"
                            borderColor="var(--border)">
                            <Dialog.Header>
                                <Dialog.Title color="var(--text-primary)">Add a performance</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body pb="4">
                                <form onSubmit={onSubmitCreatePerformance}>
                                    <Stack gap="4" align="flex-start" maxW="sm">
                                        <Field.Root>
                                            <Field.Label>Title</Field.Label>
                                            <Input paddingLeft={1} color="black" {...registerPerformanceForm("title")} />
                                        </Field.Root>
                                        <Field.Root invalid={!!errorsPerformanceForm.composer}>
                                            <Field.Label>Composer</Field.Label>
                                            <Input paddingLeft={1} color="black" {...registerPerformanceForm("composer")} />
                                        </Field.Root>
                                        <Field.Root invalid={!!errorsPerformanceForm.performers}>
                                            <Field.Label>Performers</Field.Label>
                                            <Input paddingLeft={1} color="black" {...registerPerformanceForm("performers")} />
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
        </Container>
    );
}
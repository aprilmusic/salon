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

const playfair = Playfair_Display({
    subsets: ["latin"],
    weight: ["400", "600"],
});

export default function Concert({ concert }: { concert: Concert }) {

    const {
        register: registerPerformanceForm,
        handleSubmit: handleSubmitPerformanceForm,
        formState: { errors: errorsPerformanceForm },
    } = useForm<PerformanceFormValues>()

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const createPerformance = async ({ title, composer, performers }: {
        title: string;
        composer: string;
        performers: string;
    }) => {
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
            console.log(data)
            window.location.reload()

        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
        return {
            ...concert,
            performances: [...concert.performances, {
                title,
                composer,
                performers,
                order: concert.performances.length ?? 0,
            }]
        }
    }

    const onSubmitCreatePerformance = handleSubmitPerformanceForm((data) => {
        createPerformance(data)
    })

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
            <Button p={2} onClick={() => {
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
                    />
                ))}
            </Box>
            <Dialog.Root  >
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
                                    <Button>Cancel</Button>
                                </Dialog.ActionTrigger>
                                <Dialog.ActionTrigger asChild>
                                    <Button onClick={onSubmitCreatePerformance}>Save</Button>
                                </Dialog.ActionTrigger>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

        </Container>
    );
}
import { Button, Heading } from "@chakra-ui/react";
import { Text, Card } from "@chakra-ui/react";
import { Playfair_Display } from "next/font/google";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
    isAuthenticated: boolean;
    onRequestAuth: () => void;
}

const handleDeletePerformance = async (id: string, concertId: string, passcode: string) => {
    try {
        const response = await fetch('/api/performances', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, concertId, passcode })
        })
        if (!response.ok) {
            throw new Error('Failed to delete performance')
        }
        window.location.reload();
    } catch (error) {
        console.error('Error deleting performance:', error)
    }
}

export default function Performance({
    title,
    composer,
    performers,
    id,
    concertId,
    passcode,
    isAuthenticated,
    onRequestAuth
}: PerformanceProps) {
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
    const handleDelete = () => {
        if (!isAuthenticated) {
            onRequestAuth();
            return;
        }
        handleDeletePerformance(id, concertId, passcode);
    };

    return (
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
        >
            <Card.Body p={4} fontFamily={playfair.className}>
                <Heading
                    as="h1"
                    size="lg"
                    fontSize="1.5rem"
                    color="var(--text-primary)" // amber-800
                    mb={4}
                    fontFamily={playfair.className}
                >
                    {title}
                </Heading>
                <Text color="var(--text-secondary)" fontSize="md" mb={2}>
                    Composer: {composer}
                </Text>
                <Text color="var(--text-tertiary)" fontSize="md">
                    Performers: {performers}
                </Text>
            </Card.Body>
            <Card.Footer display="flex" justifyContent="flex-end" p={4}>
                <Button px={4} onClick={handleDelete}>Delete</Button>
            </Card.Footer>
        </Card.Root>
    );
}
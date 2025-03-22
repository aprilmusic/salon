import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SystemError404() {
    const router = useRouter();

    useEffect(() => {
        // Grant admin access when this page is visited
        fetch('/api/dont-visit')
            .then(() => {
                // Redirect to home after a short delay
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            })
            .catch(console.error);
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
            <div className="text-center p-8">
                <h1 className="text-4xl font-bold mb-4">System Error 404</h1>
                <p className="text-gray-400 mb-4">Internal system page - Access restricted</p>
                <div className="animate-pulse text-sm text-gray-500">
                    Redirecting to home page...
                </div>
            </div>
        </div>
    );
} 
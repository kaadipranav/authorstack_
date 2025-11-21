import { ABTestList } from '@/components/ab-testing/ABTestList';
import { CreateABTest } from '@/components/ab-testing/CreateABTest';

export const metadata = {
    title: 'A/B Testing Dashboard',
    description: 'Manage split tests for covers and titles',
};

export default function ABTestsPage() {
    return (
        <div className="min-h-screen bg-paper flex flex-col items-center p-8">
            <h1 className="text-3xl font-bold mb-6">A/B Testing</h1>
            <CreateABTest />
            <div className="mt-8 w-full max-w-3xl">
                <ABTestList />
            </div>
        </div>
    );
}

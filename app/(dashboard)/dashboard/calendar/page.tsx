import { LaunchCalendar } from "@/components/calendar/LaunchCalendar";
import { CreateTaskModal } from "@/components/calendar/CreateTaskModal";

export const metadata = {
    title: "Launch Calendar",
    description: "Track your book launch tasks and deadlines",
};

export default function CalendarPage() {
    return (
        <div className="min-h-screen bg-paper flex flex-col p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Launch Calendar</h1>
                <CreateTaskModal />
            </div>
            <div className="flex-1 rounded-xl border border-burgundy/10 bg-surface p-6 shadow-sm">
                <LaunchCalendar />
            </div>
        </div>
    );
}

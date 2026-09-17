import { Header } from "@/components/layout/header";
import { TaskList } from "@/components/tasks/task-list";

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <TaskList />
      </main>
    </div>
  );
}

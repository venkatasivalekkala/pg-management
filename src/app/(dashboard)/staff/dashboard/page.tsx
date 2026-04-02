"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { useApi } from "@/hooks/use-api";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Users,
  Play,
  LogIn,
  XCircle,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
  dueTime?: string;
  category?: string;
}

interface Visitor {
  id: string;
  visitorName: string;
  phone: string;
  guest: string;
  room: string;
  purpose: string;
  entryTime: string | null;
  exitTime: string | null;
  status: string;
}

const priorityConfig: Record<string, { variant: "danger" | "warning" | "success"; label: string }> = {
  HIGH: { variant: "danger", label: "High" },
  MEDIUM: { variant: "warning", label: "Medium" },
  LOW: { variant: "success", label: "Low" },
};

export default function StaffDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const { loading: tasksLoading, error: tasksError, get: getTasks, setError: setTasksError } = useApi();
  const { loading: visitorsLoading, error: visitorsError, get: getVisitors, setError: setVisitorsError } = useApi();
  const { loading: mutating, put } = useApi();

  const fetchTasks = useCallback(async () => {
    const data = await getTasks("/api/tasks");
    if (data) setTasks(data);
  }, [getTasks]);

  const fetchVisitors = useCallback(async () => {
    const data = await getVisitors("/api/visitors");
    if (data) setVisitors(data);
  }, [getVisitors]);

  useEffect(() => {
    fetchTasks();
    fetchVisitors();
  }, [fetchTasks, fetchVisitors]);

  const handleCompleteTask = async (id: string) => {
    setMutatingId(id);
    const result = await put(`/api/tasks/${id}`, { status: "COMPLETED" });
    setMutatingId(null);
    if (result) await fetchTasks();
  };

  const handleCheckInVisitor = async (id: string) => {
    setMutatingId(id);
    const result = await put(`/api/visitors/${id}`, { status: "CHECKED_IN" });
    setMutatingId(null);
    if (result) await fetchVisitors();
  };

  const today = new Date().toISOString().split("T")[0];
  const todayTasks = tasks.filter((t) => t.dueDate === today);
  const pendingTasks = todayTasks.filter((t) => t.status === "PENDING");
  const inProgressTasks = todayTasks.filter((t) => t.status === "IN_PROGRESS");
  const completedToday = todayTasks.filter((t) => t.status === "COMPLETED");
  const expectedVisitors = visitors.filter((v) => v.status === "EXPECTED");
  const activeTasks = todayTasks.filter((t) => t.status !== "COMPLETED");

  const displayError = tasksError || visitorsError;
  const isLoading = tasksLoading || visitorsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Your daily overview and quick actions.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ClipboardList className="w-5 h-5" />}
          label="My Tasks Today"
          value={todayTasks.length.toString()}
        />
        <StatCard
          icon={<Clock className="w-5 h-5" />}
          label="Pending Tasks"
          value={(pendingTasks.length + inProgressTasks.length).toString()}
        />
        <StatCard
          icon={<CheckCircle2 className="w-5 h-5" />}
          label="Completed Today"
          value={completedToday.length.toString()}
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Visitors Expected"
          value={expectedVisitors.length.toString()}
        />
      </div>

      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{displayError}</span>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => {
              setTasksError(null);
              setVisitorsError(null);
            }}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {activeTasks.length === 0 ? (
                <EmptyState
                  icon={<CheckCircle2 className="w-6 h-6" />}
                  title="All caught up!"
                  description="No pending tasks for today."
                />
              ) : (
                <div className="space-y-3">
                  {activeTasks.map((task) => {
                    const priority = priorityConfig[task.priority] || priorityConfig.LOW;
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {task.title}
                            </p>
                            <Badge variant={priority.variant}>{priority.label}</Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={task.status} />
                            {task.dueTime && (
                              <span className="text-xs text-gray-500">
                                {task.dueTime}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-3 shrink-0"
                          disabled={mutating && mutatingId === task.id}
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          {mutating && mutatingId === task.id ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Done
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Visitors */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => (window.location.href = "/staff/tasks")}
                  >
                    <Play className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm">View All Tasks</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => (window.location.href = "/staff/visitors")}
                  >
                    <LogIn className="w-5 h-5 text-green-600" />
                    <span className="text-sm">Visitor Log</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Expected Visitors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Expected Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                {expectedVisitors.length === 0 ? (
                  <EmptyState
                    icon={<Users className="w-6 h-6" />}
                    title="No expected visitors"
                    description="No visitors are expected today."
                  />
                ) : (
                  <div className="space-y-3">
                    {expectedVisitors.slice(0, 5).map((visitor) => (
                      <div
                        key={visitor.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {visitor.visitorName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Visiting {visitor.guest}
                            {visitor.room !== "\u2014" ? ` \u00B7 Room ${visitor.room}` : ""}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600"
                          disabled={mutating && mutatingId === visitor.id}
                          onClick={() => handleCheckInVisitor(visitor.id)}
                        >
                          {mutating && mutatingId === visitor.id ? (
                            <Spinner size="sm" />
                          ) : (
                            <>
                              <LogIn className="w-3.5 h-3.5 mr-1" />
                              Check In
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner, SkeletonCard } from "@/components/ui/loading";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useApi } from "@/hooks/use-api";
import {
  ClipboardList,
  Play,
  CheckCircle2,
  Calendar,
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
  assignedTo?: string;
}

const priorityConfig: Record<
  string,
  { variant: "danger" | "warning" | "success"; label: string; color: string }
> = {
  HIGH: { variant: "danger", label: "High", color: "border-l-red-500" },
  MEDIUM: { variant: "warning", label: "Medium", color: "border-l-amber-500" },
  LOW: { variant: "success", label: "Low", color: "border-l-green-500" },
};

export default function StaffTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const { loading, error, get, setError } = useApi();
  const { loading: mutating, put, error: mutationError, setError: setMutationError } = useApi();

  const fetchTasks = useCallback(async () => {
    const data = await get("/api/tasks");
    if (data) setTasks(data);
  }, [get]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const updateTaskStatus = async (id: string, status: string) => {
    setMutatingId(id);
    setMutationError(null);
    const result = await put(`/api/tasks/${id}`, { status });
    setMutatingId(null);
    if (result) await fetchTasks();
  };

  const displayError = error || mutationError;

  const filteredTasks =
    activeTab === "ALL"
      ? tasks
      : tasks.filter((t) => t.status === activeTab);

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === "PENDING").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderActionButton = (task: Task) => {
    const isCurrentlyMutating = mutating && mutatingId === task.id;

    if (task.status === "PENDING") {
      return (
        <Button
          size="sm"
          variant="secondary"
          disabled={isCurrentlyMutating}
          onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")}
        >
          {isCurrentlyMutating ? (
            <Spinner size="sm" className="mr-1" />
          ) : (
            <Play className="w-3.5 h-3.5 mr-1" />
          )}
          Start
        </Button>
      );
    }

    if (task.status === "IN_PROGRESS") {
      return (
        <Button
          size="sm"
          variant="primary"
          disabled={isCurrentlyMutating}
          onClick={() => updateTaskStatus(task.id, "COMPLETED")}
        >
          {isCurrentlyMutating ? (
            <Spinner size="sm" className="mr-1" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          )}
          Complete
        </Button>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-sm text-green-600">
        <CheckCircle2 className="w-4 h-4" />
        Done
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage your assigned tasks.
        </p>
      </div>

      {displayError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          <span>{displayError}</span>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => {
              setError(null);
              setMutationError(null);
            }}
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <Tabs defaultValue="ALL" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ALL">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="PENDING">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="IN_PROGRESS">
            In Progress ({counts.inProgress})
          </TabsTrigger>
          <TabsTrigger value="COMPLETED">
            Completed ({counts.completed})
          </TabsTrigger>
        </TabsList>

        {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredTasks.length === 0 ? (
              <EmptyState
                icon={<ClipboardList className="w-6 h-6" />}
                title={
                  tasks.length === 0
                    ? "No tasks assigned"
                    : "No tasks in this category"
                }
                description={
                  tasks.length === 0
                    ? "Tasks assigned to you will appear here."
                    : "Try selecting a different status filter."
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map((task) => {
                  const priority =
                    priorityConfig[task.priority] || priorityConfig.LOW;
                  return (
                    <Card
                      key={task.id}
                      className={`border-l-4 ${priority.color}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {task.title}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {task.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={priority.variant}>
                                {priority.label}
                              </Badge>
                              <StatusBadge status={task.status} />
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {formatDate(task.dueDate)}
                                {task.dueTime && ` ${task.dueTime}`}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {renderActionButton(task)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

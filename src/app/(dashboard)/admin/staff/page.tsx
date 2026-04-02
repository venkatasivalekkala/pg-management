"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/use-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/loading";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/modal";
import { Plus, Phone, Users, ClipboardList, CheckCircle, Clock } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignedTo?: string;
  assignedToUser?: { name: string };
  propertyId?: string;
}

export default function StaffPage() {
  const api = useApi();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("");
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [taskForm, setTaskForm] = useState({
    propertyId: "",
    assignedTo: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  const fetchData = async () => {
    const [staffRes, tasksRes] = await Promise.all([
      api.get("/api/users?role=STAFF"),
      api.get("/api/tasks"),
    ]);
    if (staffRes) setStaff(Array.isArray(staffRes) ? staffRes : staffRes.users || []);
    if (tasksRes) setTasks(Array.isArray(tasksRes) ? tasksRes : tasksRes.tasks || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStaff = async () => {
    const res = await api.post("/api/auth/register", {
      ...staffForm,
      role: "STAFF",
    });
    if (res) {
      setShowAddStaff(false);
      setStaffForm({ name: "", email: "", phone: "", password: "" });
      fetchData();
    }
  };

  const handleCreateTask = async () => {
    const res = await api.post("/api/tasks", taskForm);
    if (res) {
      setShowCreateTask(false);
      setTaskForm({ propertyId: "", assignedTo: "", title: "", description: "", priority: "MEDIUM", dueDate: "" });
      fetchData();
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    const res = await api.put(`/api/tasks/${taskId}`, { status });
    if (res) fetchData();
  };

  const getTasksForStaff = (staffId: string) =>
    tasks.filter((t) => t.assignedTo === staffId);

  const filteredStaff = staff.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredTasks = tasks.filter((t) => {
    if (taskStatusFilter && t.status !== taskStatusFilter) return false;
    return true;
  });

  const activeStaff = staff.filter((s) => s.status === "ACTIVE" || !s.status).length;
  const pendingTasks = tasks.filter((t) => t.status === "PENDING" || t.status === "IN_PROGRESS").length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED" || t.status === "DONE").length;

  if (api.loading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage staff, shifts, and task assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateTask(true)}>
            <ClipboardList className="w-4 h-4 mr-2" /> Create Task
          </Button>
          <Button onClick={() => setShowAddStaff(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Staff
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />} label="Total Staff" value={staff.length} />
        <StatCard icon={<CheckCircle className="w-5 h-5" />} label="Active Staff" value={activeStaff} />
        <StatCard icon={<Clock className="w-5 h-5" />} label="Pending Tasks" value={pendingTasks} />
        <StatCard icon={<ClipboardList className="w-5 h-5" />} label="Completed Tasks" value={completedTasks} />
      </div>

      {/* Staff Directory */}
      <div>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <SearchInput
              placeholder="Search staff by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
            />
          </div>
        </div>

        {filteredStaff.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No staff found"
            description="Add staff members to get started."
            action={<Button onClick={() => setShowAddStaff(true)}>Add Staff</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStaff.map((member) => {
              const memberTasks = getTasksForStaff(member.id);
              const activeTasks = memberTasks.filter(
                (t) => t.status === "PENDING" || t.status === "IN_PROGRESS"
              ).length;
              return (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{member.name}</h3>
                            <p className="text-sm text-indigo-600 font-medium">{member.role}</p>
                          </div>
                          {member.status && <StatusBadge status={member.status} />}
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>{member.email}</p>
                          {member.phone && (
                            <p className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5" /> {member.phone}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span>{activeTasks} active tasks</span>
                            <span className="text-gray-400">
                              {memberTasks.filter((t) => t.status === "COMPLETED" || t.status === "DONE").length} completed
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTaskForm((f) => ({ ...f, assignedTo: member.id }));
                              setShowCreateTask(true);
                            }}
                          >
                            Assign Task
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Task List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle>Tasks</CardTitle>
            <Select
              label=""
              value={taskStatusFilter}
              onChange={(e) => setTaskStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Status" },
                { value: "PENDING", label: "Pending" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "COMPLETED", label: "Completed" },
                { value: "DONE", label: "Done" },
              ]}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<ClipboardList className="w-6 h-6" />}
                title="No tasks found"
                description="Create a task to assign to staff members."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{task.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.assignedToUser?.name || staff.find((s) => s.id === task.assignedTo)?.name || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          task.priority === "HIGH" || task.priority === "URGENT"
                            ? "danger"
                            : task.priority === "MEDIUM"
                            ? "warning"
                            : "default"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell>
                      <Select
                        label=""
                        value={task.status}
                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                        options={[
                          { value: "PENDING", label: "Pending" },
                          { value: "IN_PROGRESS", label: "In Progress" },
                          { value: "COMPLETED", label: "Completed" },
                          { value: "DONE", label: "Done" },
                        ]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Staff Modal */}
      <Modal open={showAddStaff} onClose={() => setShowAddStaff(false)}>
        <ModalHeader onClose={() => setShowAddStaff(false)}>
          <ModalTitle>Add New Staff</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={staffForm.name}
              onChange={(e) => setStaffForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Enter full name"
            />
            <Input
              label="Email"
              type="email"
              value={staffForm.email}
              onChange={(e) => setStaffForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Enter email address"
            />
            <Input
              label="Phone"
              value={staffForm.phone}
              onChange={(e) => setStaffForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Enter phone number"
            />
            <Input
              label="Password"
              type="password"
              value={staffForm.password}
              onChange={(e) => setStaffForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Set initial password"
            />
          </div>
          {api.error && <p className="mt-3 text-sm text-red-600">{api.error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddStaff(false)}>Cancel</Button>
          <Button onClick={handleAddStaff} disabled={api.loading}>
            {api.loading ? <Spinner size="sm" /> : "Add Staff"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Create Task Modal */}
      <Modal open={showCreateTask} onClose={() => setShowCreateTask(false)}>
        <ModalHeader onClose={() => setShowCreateTask(false)}>
          <ModalTitle>Create Task</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Task Title"
              value={taskForm.title}
              onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Enter task title"
            />
            <Textarea
              label="Description"
              value={taskForm.description}
              onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the task"
            />
            <Select
              label="Assign To"
              value={taskForm.assignedTo}
              onChange={(e) => setTaskForm((f) => ({ ...f, assignedTo: e.target.value }))}
              placeholder="Select staff member"
              options={staff.map((s) => ({ value: s.id, label: s.name }))}
            />
            <Select
              label="Priority"
              value={taskForm.priority}
              onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
              options={[
                { value: "LOW", label: "Low" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HIGH", label: "High" },
                { value: "URGENT", label: "Urgent" },
              ]}
            />
            <Input
              label="Property ID"
              value={taskForm.propertyId}
              onChange={(e) => setTaskForm((f) => ({ ...f, propertyId: e.target.value }))}
              placeholder="Enter property ID"
            />
            <Input
              label="Due Date"
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </div>
          {api.error && <p className="mt-3 text-sm text-red-600">{api.error}</p>}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateTask(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} disabled={api.loading}>
            {api.loading ? <Spinner size="sm" /> : "Create Task"}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

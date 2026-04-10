'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Task } from '@/lib/types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<Task[]>('/tasks');
      setTasks(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (title: string) => {
    const { data } = await api.post<Task>('/tasks', { title });
    setTasks((prev) => [...prev, data]);
  };

  const toggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextCompleted = !task.isCompleted;
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isCompleted: nextCompleted } : t)),
    );
    try {
      const { data } = await api.patch<Task>(`/tasks/${id}`, {
        isCompleted: nextCompleted,
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isCompleted: task.isCompleted } : t)),
      );
    }
  };

  const deleteTask = async (id: string) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const addAiTasks = (newTasks: Task[]) => {
    setTasks((prev) => [...prev, ...newTasks]);
  };

  return { tasks, isLoading, fetchTasks, createTask, toggleComplete, deleteTask, addAiTasks };
}

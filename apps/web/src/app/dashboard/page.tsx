"use client"
import { api } from "@whatsapp-mcp-client/backend/convex/api"
import type { Id } from "@whatsapp-mcp-client/backend/convex/dataModel"

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Agregado: import para navegación

import { useMutation, useQuery } from "convex/react";

export default function TodosPageExample() {
  const [newTodoText, setNewTodoText] = useState("");
  const router = useRouter(); // Agregado: hook para navegación

  const todos = useQuery(api.todo.lisTodos);
  const createTodoMutation = useMutation(api.todo.createTodo);
  const toggleTodoMutation = useMutation(api.todo.toggleTodo);
  const deleteTodoMutation = useMutation(api.todo.deleteTodo);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newTodoText.trim();
    if (!text) return;
    await createTodoMutation({ title: text });
    setNewTodoText("");
  };

  const handleToggleTodo = (id: Id<"todos">, currentCompleted: boolean) => {
    toggleTodoMutation({ id });
  };

  const handleDeleteTodo = (id: Id<"todos">) => {
    deleteTodoMutation({ id });
  };

  // Agregado: función para crear workflow y navegar
  const handleCreateWorkflow = () => {
    // Generar ID único para el workflow
    const workflowId = crypto.randomUUID();
    
    // Navegar al editor con la ruta dinámica
    router.push(`/dashboard/editor/${workflowId}`);
  };

  return (
    <div className="flex items-center justify-center min-h-full">
      <div className="w-full max-w-md">
        <Card>
        <CardHeader>
          <CardTitle>Todo List</CardTitle>
          <CardDescription>Manage your tasks efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAddTodo}
            className="mb-6 flex items-center space-x-2"
          >
            <Input
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="Add a new task..."
            />
            <Button
              type="submit"
              disabled={!newTodoText.trim()}
            >
              Add
            </Button>
          </form>

          {todos === undefined ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : todos.length === 0 ? (
            <p className="py-4 text-center">No todos yet. Add one above!</p>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo._id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={todo.done}
                      onCheckedChange={() =>
                        handleToggleTodo(todo._id, todo.done)
                      }
                      id={`todo-${todo._id}`}
                    />
                    <label
                      htmlFor={`todo-${todo._id}`}
                      className={`${todo.done ? "line-through text-muted-foreground" : ""}`}
                    >
                      {todo.title}
                    </label>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTodo(todo._id)}
                    aria-label="Delete todo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Botón Create Workflow con navegación */}
      <div className="mt-4">
        <Button 
          className="w-full" 
          variant="outline"
          onClick={handleCreateWorkflow} // Cambiado: ahora usa la función
        >
          Create Workflow
        </Button>
        </div>
      </div>
    </div>
  );
}

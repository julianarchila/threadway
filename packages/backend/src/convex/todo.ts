import { v } from "convex/values"
import { query, mutation } from "./_generated/server"


export const lisTodos = query({
  handler: async (ctx) => {
    return ctx.db.query("todos").collect()
  }
})


export const createTodo = mutation({
  args: v.object({
    title: v.string(),
  }),
  handler: async (ctx, { title }) => {
    ctx.db.insert("todos", {
      title,
      done: false
    })
  }
})

export const deleteTodo = mutation({
  args: v.object({
    id: v.id("todos")
  }),
  handler: async (ctx, args) => {
    return ctx.db.delete(args.id)
  }
})

export const toggleTodo = mutation({
  args: v.object({
    id: v.id("todos")
  }),
  handler: async (ctx, { id }) => {
    const todo = await ctx.db.get(id)
    if (!todo) throw new Error("Todo not found")
    return ctx.db.patch(id, { done: !todo.done })
  }
})

<script lang="ts">
  import type { Task, Category } from "$lib/server/schema";

  let { data }: { data: any } = $props();
  let tasks = $derived(data?.resolvedTasks || []);
  let categories = $derived(data?.misCategorias || data?.categories || []);
  
  let isDeleteModalOpen = $state(false);
  let deleteTargetId = $state<number | null>(null);

  let sortBy = $state("fecha_desc");

  function getCategoryById(id: number | null | undefined): Category | undefined {
    if (!id) return undefined;
    return categories.find(c => c.id === id);
  }

  function getSortedTasks() {
    return [...tasks].sort((a: any, b: any) => {
      if (sortBy === "fecha_desc") return b.createdAt - a.createdAt;
      if (sortBy === "fecha_asc") return a.createdAt - b.createdAt;
      if (sortBy === "nombre") return a.title.localeCompare(b.title);
      return 0;
    });
  }

  function openDeleteModal(id: number, event: Event) {
    event.stopPropagation();
    deleteTargetId = id;
    isDeleteModalOpen = true;
  }

  function closeDeleteModal() {
    deleteTargetId = null;
    isDeleteModalOpen = false;
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    
    try {
      const response = await fetch(`/api/tasks/${deleteTargetId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Error al eliminar la tarea");
      }
    } catch {
      alert("Error de conexión");
    }
    
    closeDeleteModal();
  }

  async function toggleTaskComplete(task: any) {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch {
      alert("Error de conexión");
    }
  }
</script>

<main class="max-w-5xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-xl md:text-2xl font-bold text-gray-900">Tareas Resueltas</h1>
    <select 
      value={sortBy}
      onchange={(e) => sortBy = e.currentTarget.value}
      class="px-3 py-2 text-sm border border-gray-300 rounded-lg"
    >
      <option value="fecha_desc">Más Recientes</option>
      <option value="fecha_asc">Más Antiguas</option>
      <option value="nombre">Alfabético</option>
    </select>
  </div>

  {#if tasks.length === 0}
    <div class="text-center py-8 bg-white rounded-lg shadow-sm">
      <p class="text-gray-500 text-sm">No hay tareas resueltas</p>
    </div>
  {:else}
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each getSortedTasks() as task (task.id)}
        {@const cat = getCategoryById(task.categoryId)}
        <div 
          class="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all border-l-4 relative group"
          style="border-left-color: {cat?.color || '#e5e7eb'}"
        >
          <button 
            onclick={() => toggleTaskComplete(task)}
            class="w-8 h-8 rounded-full border-2 bg-green-500 border-green-500 text-white flex items-center justify-center"
          >
            ✓
          </button>
          <h3 class="font-semibold text-gray-900 text-sm mt-3 line-through">{task.title}</h3>
          {#if task.description}
            <p class="text-xs text-gray-500 mt-2 line-clamp-2">{task.description}</p>
          {/if}
          {#if cat}
            <div class="mt-3 flex items-center gap-1">
              <span class="w-2 h-2 rounded-full" style="background-color: {cat.color}"></span>
              <span class="text-xs text-gray-500">{cat.name}</span>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</main>
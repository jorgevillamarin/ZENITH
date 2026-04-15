<script lang="ts">
  import type { PageData } from "./$types";
  import type { Task, Category } from "$lib/server/schema";
  import { goto } from '$app/navigation';

  export let data: PageData;
  let categories: { category: Category; tasks: Task[] }[] = data.categories;
  let uncategorized: Task[] = data.uncategorized || [];
  
  let completingId: number | null = null;
  let isDeleteModalOpen = false;
  let deleteTargetId: number | null = null;
  let expandedCategory: number | null = null;

  function toggleCategory(catId: number) {
    expandedCategory = expandedCategory === catId ? null : catId;
  }

  async function toggleTask(task: Task, event: Event) {
    event.stopPropagation();
    completingId = task.id;
    
    try {
      setTimeout(async () => {
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !task.completed }),
        });

        if (response.ok) {
          window.location.reload();
        } else {
          alert("Error al completar la tarea");
          completingId = null;
        }
      }, 400);
    } catch {
      completingId = null;
      alert("Error de conexión");
    }
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
      const response = await fetch(`/api/tasks/${deleteTargetId}`, { method: "DELETE" });

      if (response.ok) {
        window.location.reload();
      }
    } catch {
      alert("Error de conexión");
    }
    closeDeleteModal();
  }
</script>

<main>
  <div class="mb-6 md:mb-8">
    <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Categorías</h2>
    <p class="text-gray-600 mt-1">Explora tus tareas organizadas por categoría</p>
  </div>

  {#if categories.length === 0 && uncategorized.length === 0}
    <div class="text-center text-lg md:text-xl text-gray-600 p-8 md:p-10 bg-white rounded-lg shadow-md">
      No hay categorías con tareas aún.
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each categories as { category, tasks } (category.id)}
        <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <button
            on:click={() => toggleCategory(category.id)}
            class="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-4 h-4 rounded-full"
                style="background-color: {category.color}"
              ></div>
              <span class="text-lg font-bold text-gray-900">{category.name}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                {tasks.length}
              </span>
              <svg 
                class="w-5 h-5 text-gray-400 transition-transform {expandedCategory === category.id ? 'rotate-180' : ''}"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {#if expandedCategory === category.id && tasks.length > 0}
            <div class="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
              {#each tasks as task (task.id)}
                <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate">{task.title}</p>
                    {#if task.description}
                      <p class="text-xs text-gray-500 truncate">{task.description}</p>
                    {/if}
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      on:click={(e) => toggleTask(task, e)}
                      class="text-gray-500 hover:text-green-500 p-1"
                      title="Completar"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      on:click={(e) => openDeleteModal(task.id, e)}
                      class="text-red-500 hover:text-red-700 p-1"
                      title="Borrar"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
      
      {#if uncategorized.length > 0}
        <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <button
            on:click={() => toggleCategory(0)}
            class="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 rounded-full bg-gray-400"></div>
              <span class="text-lg font-bold text-gray-900">Sin categoría</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                {uncategorized.length}
              </span>
              <svg 
                class="w-5 h-5 text-gray-400 transition-transform {expandedCategory === 0 ? 'rotate-180' : ''}"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
          
          {#if expandedCategory === 0}
            <div class="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
              {#each uncategorized as task (task.id)}
                <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate">{task.title}</p>
                    {#if task.description}
                      <p class="text-xs text-gray-500 truncate">{task.description}</p>
                    {/if}
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      on:click={(e) => toggleTask(task, e)}
                      class="text-gray-500 hover:text-green-500 p-1"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      on:click={(e) => openDeleteModal(task.id, e)}
                      class="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {/if}

  {#if isDeleteModalOpen}
    <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div class="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-sm">
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Eliminar Tarea</h3>
          <p class="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar esta tarea?</p>
          
          <div class="flex gap-3">
            <button on:click={closeDeleteModal} class="flex-1 px-5 py-2.5 rounded-lg text-gray-600 font-semibold hover:bg-gray-100">
              Cancelar
            </button>
            <button on:click={confirmDelete} class="flex-1 px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</main>
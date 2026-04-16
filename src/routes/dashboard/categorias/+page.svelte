<script lang="ts">
  import type { Task, Category } from "$lib/server/schema";
  import { goto } from '$app/navigation';

  let { data }: { data: any } = $props();
  let categories = $derived(data?.catGroups || data?.categories || []);
  let uncategorized = $derived(data?.sinCat || data?.uncategorized || []);
  
  let completingId = $state<number | null>(null);
  let isDeleteModalOpen = $state(false);
  let deleteTargetId = $state<number | null>(null);
  let expandedCategory = $state<number | null>(null);

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

  let newCategoryName = $state('');
  let newCategoryColor = $state('#4facfe');
  let isCreatingCategory = $state(false);
  let categoryMessage = $state('');

  async function createCategory() {
    if (!newCategoryName.trim()) {
      categoryMessage = 'El nombre es obligatorio';
      return;
    }

    isCreatingCategory = true;
    categoryMessage = '';

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName, color: newCategoryColor })
      });

      if (response.ok) {
        newCategoryName = '';
        newCategoryColor = '#4facfe';
        window.location.reload();
      } else {
        const err = await response.json();
        categoryMessage = err.message || 'Error al crear';
      }
    } catch {
      categoryMessage = 'Error de conexión';
    }

    isCreatingCategory = false;
  }
</script>

<main class="max-w-4xl mx-auto">
  <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Categorías</h1>

  <div class="mb-6 bg-white rounded-xl shadow-md p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Nueva Categoría</h2>
    
    {#if categoryMessage}
      <p class="mb-4 text-sm {categoryMessage.includes('error') || categoryMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}">
        {categoryMessage}
      </p>
    {/if}
    
    <div class="flex flex-col md:flex-row gap-3">
      <input 
        type="text" 
        value={newCategoryName}
        oninput={(e) => newCategoryName = e.currentTarget.value}
        placeholder="Nombre de la categoría"
        class="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none"
      />
      <input 
        type="color" 
        value={newCategoryColor}
        oninput={(e) => newCategoryColor = e.currentTarget.value}
        class="h-10 w-16 rounded border border-gray-300 cursor-pointer"
      />
      <button 
        onclick={createCategory}
        disabled={isCreatingCategory}
        class="px-6 py-2 bg-[#4facfe] text-white font-semibold rounded-lg hover:bg-[#3facde] transition-colors disabled:opacity-50"
      >
        {isCreatingCategory ? 'Creando...' : 'Crear'}
      </button>
    </div>
  </div>

  <div class="space-y-4">
    {#each categories as { category, tasks } (category.id)}
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <button 
          onclick={() => toggleCategory(category.id)}
          class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full" style="background-color: {category.color}"></div>
            <span class="font-semibold text-gray-900">{category.name}</span>
            <span class="text-sm text-gray-500">({tasks.length} tareas)</span>
          </div>
          <span class="text-gray-400">{expandedCategory === category.id ? '▼' : '▶'}</span>
        </button>
        
        {#if expandedCategory === category.id}
          <div class="border-t border-gray-200 p-4 space-y-2">
            {#if tasks.length === 0}
              <p class="text-gray-500 text-center py-4">No hay tareas en esta categoría</p>
            {:else}
              {#each tasks as task (task.id)}
                <div 
                  class="flex items-center justify-between p-3 rounded-lg {task.completed ? 'bg-gray-100' : 'bg-gray-50'}"
                >
                  <button 
                    onclick={(e) => toggleTask(task, e)}
                    disabled={completingId === task.id}
                    class="flex-1 flex items-center gap-3 text-left"
                  >
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      disabled={completingId === task.id}
                      class="w-5 h-5 rounded border-gray-300"
                    />
                    <span class="{task.completed ? 'line-through text-gray-400' : 'text-gray-700'}">{task.title}</span>
                  </button>
                  <button 
                    onclick={(e) => openDeleteModal(task.id, e)}
                    class="text-red-500 hover:text-red-700 p-2"
                  >
                    🗑️
                  </button>
                </div>
              {/each}
            {/if}
          </div>
        {/if}
      </div>
    {/each}

    {#if uncategorized.length > 0}
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <button 
          onclick={() => toggleCategory(0)}
          class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full bg-gray-400"></div>
            <span class="font-semibold text-gray-900">Sin categoría</span>
            <span class="text-sm text-gray-500">({uncategorized.length} tareas)</span>
          </div>
          <span class="text-gray-400">{expandedCategory === 0 ? '▼' : '▶'}</span>
        </button>
        
        {#if expandedCategory === 0}
          <div class="border-t border-gray-200 p-4 space-y-2">
            {#each uncategorized as task (task.id)}
              <div 
                class="flex items-center justify-between p-3 rounded-lg {task.completed ? 'bg-gray-100' : 'bg-gray-50'}"
              >
                <button 
                  onclick={(e) => toggleTask(task, e)}
                  disabled={completingId === task.id}
                  class="flex-1 flex items-center gap-3 text-left"
                >
                  <input 
                    type="checkbox" 
                    checked={task.completed}
                    disabled={completingId === task.id}
                    class="w-5 h-5 rounded border-gray-300"
                  />
                  <span class="{task.completed ? 'line-through text-gray-400' : 'text-gray-700'}">{task.title}</span>
                </button>
                <button 
                  onclick={(e) => openDeleteModal(task.id, e)}
                  class="text-red-500 hover:text-red-700 p-2"
                >
                  🗑️
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</main>

{#if isDeleteModalOpen}
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Eliminar Tarea</h3>
      <p class="text-gray-600 mb-6">¿Estás seguro de que quieres eliminar esta tarea?</p>
      
      <div class="flex gap-3">
        <button 
          onclick={closeDeleteModal}
          class="flex-1 px-5 py-2.5 rounded-lg text-gray-600 font-semibold hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button 
          onclick={confirmDelete}
          class="flex-1 px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
        >
          Eliminar
        </button>
      </div>
    </div>
  </div>
{/if}
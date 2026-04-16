<script lang="ts">
  import type { Task, Category } from "$lib/server/schema";

  let { data }: { data: any } = $props();
  let tasks = data?.misTareas || [];
  let categories = data?.misCategorias || [];
  
  let completingId = $state<number | null>(null);
  let isDeleteModalOpen = $state(false);
  let deleteTargetId = $state<number | null>(null);
  let editingTaskId = $state<number | null>(null);
  let newTitle = $state('');
  let newDescription = $state('');
  let newPriority = $state('media');
  let newCategoryId = $state<number | null>(null);
  let isSaving = $state(false);
  let formError = $state('');
  let isModalOpen = $state(false);

  function openCreateModal() {
    editingTaskId = null;
    newTitle = '';
    newDescription = '';
    newPriority = 'media';
    newCategoryId = null;
    formError = '';
    isModalOpen = true;
  }

  function openEditModal(task: Task) {
    editingTaskId = task.id;
    newTitle = task.title;
    newDescription = task.description || '';
    newPriority = task.priority || 'media';
    newCategoryId = task.categoryId || null;
    formError = '';
    isModalOpen = true;
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

  function closeModal() {
    editingTaskId = null;
    isModalOpen = false;
  }

  async function saveTask() {
    if (!newTitle.trim() || newTitle.length < 5) {
      formError = 'El título debe tener al menos 5 caracteres';
      return;
    }

    isSaving = true;
    formError = '';

    try {
      const method = editingTaskId ? 'PUT' : 'POST';
      const url = editingTaskId ? `/api/tasks/${editingTaskId}` : '/api/tasks';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          priority: newPriority,
          categoryId: newCategoryId
        })
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const err = await response.json();
        formError = err.errors?.[0] || err.message || 'Error al guardar';
      }
    } catch {
      formError = 'Error de conexión';
    }

    isSaving = false;
  }

  async function toggleTaskComplete(task: Task) {
    completingId = task.id;
    
    try {
      setTimeout(async () => {
        const response = await fetch('/api/streak', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: task.id, completed: !task.completed }),
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
</script>

<main class="max-w-5xl mx-auto">
  <div class="flex items-center justify-between mb-6">
    <h1 class="text-xl md:text-2xl font-bold text-gray-900">Mis Tareas</h1>
    <button 
      onclick={openCreateModal}
      class="px-4 py-2 bg-[#4facfe] text-white text-sm font-medium rounded-lg hover:bg-[#3facde] transition-colors"
    >
      + Nueva
    </button>
  </div>

  {#if tasks.length === 0}
    <div class="text-center py-8 bg-white rounded-lg shadow-sm">
      <p class="text-gray-500 text-sm mb-3">No hay tareas pendientes</p>
      <button 
        onclick={openCreateModal}
        class="text-[#4facfe] hover:underline text-sm"
      >
        Crear primera tarea
      </button>
    </div>
  {:else}
    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each tasks as task (task.id)}
        {@const cat = categories.find((c: any) => c.id === task.categoryId)}
        <div 
          class="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all border-l-4 relative group"
          style="border-left-color: {cat?.color || '#e5e7eb'}"
        >
          <div class="flex items-start justify-between">
            <button 
              onclick={(e) => { e.stopPropagation(); toggleTaskComplete(task); }}
              disabled={completingId === task.id}
              class="w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all z-10 relative
                {task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-green-500 hover:text-green-500'}"
            >
              ✓
            </button>
            <button 
              onclick={(e) => { e.stopPropagation(); openDeleteModal(task.id, e); }}
              class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 relative"
            >
              ✕
            </button>
          </div>
          <button 
            onclick={() => openEditModal(task)}
            class="absolute inset-0 w-full h-full cursor-pointer opacity-0"
            aria-label="Editar tarea"
          ></button>
          <h3 class="font-semibold text-gray-900 text-sm mt-3 {task.completed ? 'line-through text-gray-400' : ''}">{task.title}</h3>
          {#if task.description}
            <p class="text-xs text-gray-500 mt-2 line-clamp-3">{task.description}</p>
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

{#if isModalOpen}
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
      <h3 class="text-xl font-bold text-gray-900 mb-4">
        {editingTaskId ? 'Editar Tarea' : 'Nueva Tarea'}
      </h3>
      
      {#if formError}
        <p class="mb-4 text-sm text-red-600">{formError}</p>
      {/if}
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input 
            type="text" 
            value={newTitle}
            oninput={(e) => newTitle = e.currentTarget.value}
            placeholder="Título de la tarea"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea 
            value={newDescription}
            oninput={(e) => newDescription = e.currentTarget.value}
            placeholder="Descripción opcional"
            rows="3"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none"
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
          <select 
            value={newPriority}
            onchange={(e) => newPriority = e.currentTarget.value}
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select 
            value={newCategoryId?.toString() || ''}
            onchange={(e) => newCategoryId = e.currentTarget.value ? Number(e.currentTarget.value) : null}
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none"
          >
            <option value="">Sin categoría</option>
            {#each categories as cat (cat.id)}
              <option value={cat.id}>{cat.name}</option>
            {/each}
          </select>
        </div>
      </div>
      
      <div class="flex gap-3 mt-6">
        <button 
          onclick={closeModal}
          class="flex-1 px-5 py-2.5 rounded-lg text-gray-600 font-semibold hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button 
          onclick={saveTask}
          disabled={isSaving}
          class="flex-1 px-5 py-2.5 rounded-lg bg-[#4facfe] text-white font-semibold hover:bg-[#3facde] disabled:opacity-50"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  </div>
{/if}

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
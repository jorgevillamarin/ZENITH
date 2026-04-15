<script lang="ts">
  import type { PageData } from "./$types";
  import type { Task, Category } from "$lib/server/schema";

  export let data: PageData;
  let tasks: Task[] = data.tasks;
  let categories: Category[] = data.categories || [];
  let completingId: number | null = null;

  let isModalOpen = false;
  let isDeleteModalOpen = false;
  let deleteTargetId: number | null = null;
  let editingTaskId: number | null = null;
  let newTitle = "";
  let newDescription = "";
  let newPriority = "media";
  let newCategoryId: number | null = null;
  let isSaving = false;
  let formError = "";

  function openCreateModal() {
    editingTaskId = null;
    newTitle = "";
    newDescription = "";
    newPriority = "media";
    newCategoryId = null;
    formError = "";
    isModalOpen = true;
  }

  function openEditModal(task: Task) {
    editingTaskId = task.id;
    newTitle = task.title;
    newDescription = task.description || "";
    newPriority = task.priority || "media";
    newCategoryId = task.categoryId || null;
    formError = "";
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

  function hasOnlySpecialChars(str: string): boolean {
    const cleanStr = str.replace(/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
    return cleanStr.length === str.length;
  }

  function validateForm(): boolean {
    formError = "";
    
    if (!newTitle.trim()) {
      formError = "El título es obligatorio";
      return false;
    }
    if (newTitle.trim().length < 5) {
      formError = "El título debe tener al menos 5 caracteres";
      return false;
    }
    if (hasOnlySpecialChars(newTitle.trim())) {
      formError = "El título no puede contener solo caracteres especiales";
      return false;
    }
    if (newDescription.trim().length > 0 && newDescription.trim().length < 5) {
      formError = "La descripción debe tener al menos 5 caracteres";
      return false;
    }
    if (newDescription.trim().length > 0 && hasOnlySpecialChars(newDescription.trim())) {
      formError = "La descripción no puede contener solo caracteres especiales";
      return false;
    }
    
    return true;
  }

  async function saveTask() {
    if (!validateForm()) return;

    isSaving = true;
    formError = "";
    const taskData = {
      title: newTitle,
      description: newDescription,
      priority: newPriority,
      categoryId: newCategoryId,
    };

    try {
      if (editingTaskId) {
        const response = await fetch(`/api/tasks/${editingTaskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });

        if (response.ok) {
          const updatedTask: Task = await response.json();
          tasks = tasks.map((t) =>
            t.id === editingTaskId ? { ...t, ...updatedTask } : t,
          );
          isModalOpen = false;
        } else {
          const err = await response.json();
          formError = err.message || "Error al actualizar";
        }
      } else {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });

        if (response.ok) {
          const newTask: Task = await response.json();
          tasks = [...tasks, newTask];
          isModalOpen = false;
        } else {
          const err = await response.json();
          formError = err.message || "Error al crear";
        }
      }
    } catch {
      formError = "Error de conexión";
    }
    isSaving = false;
  }
  let sortBy = "fecha_desc";
  let selectedCategory: number | null = null;

  $: sortedTasks = tasks
    .filter(t => selectedCategory === null || t.categoryId === selectedCategory)
    .slice()
    .sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    
    if (sortBy === "fecha_desc") {
      return dateB - dateA;
    } else if (sortBy === "fecha_asc") {
      return dateA - dateB;
    } else if (sortBy === "prioridad") {
      const valores = { alta: 3, media: 2, baja: 1 };
      const valorA = valores[a.priority as keyof typeof valores] || 2;
      const valorB = valores[b.priority as keyof typeof valores] || 2;
      return valorB - valorA;
    } else if (sortBy === "estado") {
      return Number(a.completed) - Number(b.completed);
    }
    return 0;
  });

  function getCategoryById(id: number | null | undefined): Category | undefined {
    if (!id) return undefined;
    return categories.find(c => c.id === id);
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
          tasks = tasks.filter(t => t.id !== task.id);
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

  async function confirmDelete() {
    if (!deleteTargetId) return;

    try {
      const response = await fetch(`/api/tasks/${deleteTargetId}`, { method: "DELETE" });

      if (response.ok) {
        tasks = tasks.filter((t) => t.id !== deleteTargetId);
      } else {
        alert("Hubo un error al intentar borrar la tarea.");
      }
    } catch {
      alert("Error de conexión");
    }
    closeDeleteModal();
  }

  function formatTaskDate(dateValue: Date | string | number | null) {
    if (!dateValue) return "Sin fecha";

    const date = new Date(dateValue);
    const today = new Date();

    const timeString = date.toLocaleTimeString("es-VE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return `Hoy, ${timeString}`;
    } else {
      const dateString = date.toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${dateString}, ${timeString}`;
    }
  }
</script>

<style>
  @keyframes checkmark {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  @keyframes slideOut {
    0% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(100%); opacity: 0; }
  }
  @keyframes checkFade {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.5); }
  }
  .animate-check {
    animation: checkmark 0.4s ease-out;
  }
  .animate-slideOut {
    animation: slideOut 0.4s ease-out forwards;
  }
  .animate-checkFade {
    animation: checkFade 0.4s ease-out forwards;
  }
</style>

<main class="relative pb-24 md:pb-0"> <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
    <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Mis Tareas</h2>
    
    <div class="flex flex-wrap gap-3">
      {#if categories.length > 0}
      <select
        bind:value={selectedCategory}
        class="text-sm md:text-lg text-gray-600 p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#4facfe]"
      >
        <option value={null}>Todas las categorías</option>
        {#each categories as category}
          <option value={category.id}>{category.name}</option>
        {/each}
      </select>
      {/if}
      <select
        bind:value={sortBy}
        class="text-sm md:text-lg text-gray-600 p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#4facfe]"
      >
        <option value="fecha_desc">🕒 Más recientes</option>
        <option value="fecha_asc">🕰️ Más antiguas</option>
        <option value="prioridad">🔥 Prioridad (Alta a Baja)</option>
        <option value="estado">✅ Pendientes primero</option>
      </select>
    </div>
  </div>

  <section>
    {#if tasks.length === 0}
      <div
        class="text-center text-lg md:text-xl text-gray-600 p-8 md:p-10 bg-white rounded-lg shadow-md mx-4 md:mx-0"
      >
        No tienes tareas pendientes. ¡Todo en orden!
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
        {#each sortedTasks as task (task.id)}
          <div
            on:click={() => openEditModal(task)}
            on:keydown={(e) => e.key === "Enter" && openEditModal(task)}
            role="button"
            tabindex="0"
            class="bg-white p-4 md:p-5 rounded-lg shadow-md border border-gray-200 flex flex-col h-full min-h-[160px] md:min-h-[180px] hover:shadow-lg transition-shadow cursor-pointer {completingId === task.id ? 'animate-slideOut' : ''}"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <div
                class="text-base md:text-lg font-bold text-[#1a1a2e] break-words line-clamp-2 flex-1"
                style="text-decoration: {task.completed
                  ? 'line-through'
                  : 'none'}; opacity: {task.completed ? 0.6 : 1};"
              >
                {task.title}
              </div>

              <div class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shrink-0">
                <button
                  on:click={(e) => toggleTask(task, e)}
                  class="text-gray-500 hover:text-[#4facfe] transition-colors p-1.5 sm:p-0 {completingId === task.id ? 'animate-check' : ''}"
                  title={task.completed ? "Deshacer" : "Completar"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  on:click={(e) => openDeleteModal(task.id, e)}
                  class="text-red-500 hover:text-red-700 transition-colors p-1.5 sm:p-0"
                  title="Borrar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {#if task.description}
              <p class="text-gray-600 text-xs sm:text-sm line-clamp-3 md:line-clamp-4 mb-3 flex-grow break-words overflow-hidden">{task.description}</p>
            {/if}

            <div
              class="flex items-center justify-between border-t border-gray-200 pt-2 mt-auto"
            >
              <div class="flex items-center gap-2">
                {#if task.categoryId}
                  {@const cat = getCategoryById(task.categoryId)}
                  {#if cat}
                  <span 
                    class="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                    style="background-color: {cat.color || '#4facfe'}"
                  >
                    {cat.name}
                  </span>
                  {/if}
                {/if}
                <div
                  class="flex items-center gap-1 text-xs sm:text-sm font-medium
                  {task.priority === 'alta'
                    ? 'text-red-500'
                    : task.priority === 'media'
                      ? 'text-yellow-500'
                      : 'text-green-500'}"
                >
                  <span class="text-base">
                    {task.priority === "alta"
                      ? "🔴"
                      : task.priority === "media"
                        ? "🟡"
                        : "🟢"}
                  </span>
                  <span class="capitalize hidden sm:inline">{task.priority}</span>
                </div>
              </div>
              <div class="text-gray-500 text-xs text-right shrink-0">
                {formatTaskDate(task.createdAt)}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <div class="mt-12 text-center hidden md:block">
    <button
      on:click={openCreateModal}
      class="bg-[#4facfe] text-white text-xl font-bold py-4 px-10 rounded-xl shadow-lg hover:bg-[#3facde] hover:scale-105 transition-transform flex items-center space-x-3 mx-auto"
    >
      <span class="text-3xl">+</span>
      <span>AGREGAR NUEVA TAREA</span>
    </button>
  </div>

  <button
    on:click={openCreateModal}
    class="md:hidden fixed bottom-6 right-6 bg-[#4facfe] text-white w-14 h-14 rounded-full shadow-2xl hover:bg-[#3facde] transition-transform active:scale-95 flex items-center justify-center text-3xl z-40"
    aria-label="Agregar nueva tarea"
  >
    +
  </button>

  {#if isModalOpen}
    <div
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all max-h-[90vh] overflow-y-auto"
      >
        <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-6">
          {editingTaskId ? "Editar Tarea" : "Nueva Tarea"}
        </h3>

        <div class="space-y-4">
          {#if formError}
            <div class="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200">
              {formError}
            </div>
          {/if}
          <div>
            <label
              for="title"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Título de la tarea</label
            >
            <input
              id="title"
              type="text"
              bind:value={newTitle}
              placeholder="Ej. Limpiar Jardín"
              maxlength="100"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none transition-all"
            />
          </div>

          <div>
            <label
              for="desc"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Descripción (Opcional)</label
            >
            <textarea
              id="desc"
              bind:value={newDescription}
              placeholder="Detalles adicionales..."
              rows="3"
              maxlength="500"
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div>
            <label
              for="priority"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Prioridad</label
            >
            <select
              id="priority"
              bind:value={newPriority}
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none bg-white transition-all cursor-pointer appearance-none"
            >
              <option value="baja">🟢 Baja</option>
              <option value="media">🟡 Media</option>
              <option value="alta">🔴 Alta</option>
            </select>
          </div>

          {#if categories.length > 0}
          <div>
            <label
              for="category"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Categoría</label
            >
            <select
              id="category"
              bind:value={newCategoryId}
              class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none bg-white transition-all cursor-pointer appearance-none"
            >
              <option value={null}>Sin categoría</option>
              {#each categories as category}
                <option value={category.id}>{category.name}</option>
              {/each}
            </select>
          </div>
          {/if}
        </div>

        <div class="mt-8 flex flex-col-reverse sm:flex-row justify-end sm:space-x-3 gap-y-3 sm:gap-y-0">
          <button
            on:click={() => (isModalOpen = false)}
            class="px-5 py-3 sm:py-2.5 rounded-lg text-gray-600 font-semibold hover:bg-gray-100 transition-colors w-full sm:w-auto text-center"
          >
            Cancelar
          </button>
          <button
            on:click={saveTask}
            disabled={isSaving || !newTitle.trim()}
            class="px-5 py-3 sm:py-2.5 rounded-lg bg-[#4facfe] text-white font-semibold hover:bg-[#3facde] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto text-center"
          >
            {isSaving
              ? "Guardando..."
              : editingTaskId
                ? "Actualizar"
                : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if isDeleteModalOpen}
    <div
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-sm transform transition-all"
      >
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Eliminar Tarea</h3>
          <p class="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.</p>
          
          <div class="flex gap-3">
            <button
              on:click={closeDeleteModal}
              class="flex-1 px-5 py-2.5 rounded-lg text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              on:click={confirmDelete}
              class="flex-1 px-5 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</main>
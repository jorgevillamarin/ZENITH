<script lang="ts">
  import type { PageData } from "./$types";
  import type { Task } from "$lib/server/schema";

  export let data: PageData;
  let tasks: Task[] = data.tasks;

  let sortBy = "fecha_desc";

  $: sortedTasks = tasks.slice().sort((a, b) => {
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
    }
    return 0;
  });

  async function toggleTask(task: Task) {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (response.ok) {
        tasks = tasks.filter((t) => t.id !== task.id);
      } else {
        alert("Error al cambiar el estado de la tarea");
      }
    } catch {
      alert("Error de conexión");
    }
  }

  async function deleteTask(id: number) {
    const isConfirmed = confirm(
      "¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.",
    );
    if (!isConfirmed) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });

      if (response.ok) {
        tasks = tasks.filter((t) => t.id !== id);
      } else {
        alert("Hubo un error al intentar borrar la tarea.");
      }
    } catch {
      alert("Error de conexión");
    }
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

<main>
  <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 space-y-4 md:space-y-0">
    <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Tareas Resueltas</h2>
    
    <div
      class="text-sm md:text-lg text-gray-600 flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 p-3 border border-gray-300 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-[#4facfe]"
    >
      <span class="text-xs md:text-sm font-semibold uppercase tracking-wider text-gray-500"
        >Ordenar por:</span
      >
      <select
        bind:value={sortBy}
        class="font-bold text-gray-900 bg-transparent outline-none cursor-pointer appearance-none w-full sm:w-auto pr-8"
      >
        <option value="fecha_desc">🕒 Más recientes</option>
        <option value="fecha_asc">🕰️ Más antiguas</option>
        <option value="prioridad">🔥 Prioridad (Alta a Baja)</option>
      </select>
    </div>
  </div>

  <section>
    {#if tasks.length === 0}
      <div
        class="text-center text-lg md:text-xl text-gray-600 p-8 md:p-10 bg-white rounded-lg shadow-md mx-4 md:mx-0"
      >
        No tienes tareas resueltas aún.
      </div>
    {:else}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
        {#each sortedTasks as task (task.id)}
          <div
            class="bg-white p-4 md:p-5 rounded-lg shadow-md border border-gray-200 flex flex-col h-full min-h-[160px] md:min-h-[180px] opacity-75"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <div
                class="text-base md:text-lg font-bold text-[#1a1a2e] break-words line-clamp-2 flex-1 line-through opacity-60"
              >
                {task.title}
              </div>

              <div class="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm shrink-0">
                <button
                  on:click={() => toggleTask(task)}
                  class="text-green-500 hover:text-[#4facfe] transition-colors p-1.5 sm:p-0"
                  title="Marcar como pendiente"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </button>
                <button
                  on:click={() => deleteTask(task.id)}
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
              <div
                class="flex items-center gap-1 text-xs sm:text-sm font-medium text-gray-500"
              >
                <span class="text-base">✅</span>
                <span class="capitalize hidden sm:inline">completada</span>
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
</main>

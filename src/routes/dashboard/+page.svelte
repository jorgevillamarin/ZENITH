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
  let categoryValue = $derived(newCategoryId === null ? '' : String(newCategoryId));
  let newDueDate = $state('');
  let showCalendar = $state(false);
  let calendarMonth = $state(new Date().getMonth());
  let calendarYear = $state(new Date().getFullYear());
  let isSaving = $state(false);
  let formError = $state('');
  let isModalOpen = $state(false);

  function openCreateModal() {
    editingTaskId = null;
    newTitle = '';
    newDescription = '';
    newPriority = 'media';
    newCategoryId = null;
    newDueDate = '';
    showCalendar = false;
    calendarMonth = new Date().getMonth();
    calendarYear = new Date().getFullYear();
    formError = '';
    isModalOpen = true;
  }

  function openEditModal(task: Task) {
    editingTaskId = task.id;
    newTitle = task.title;
    newDescription = task.description || '';
    newPriority = task.priority || 'media';
    newCategoryId = task.categoryId;
    newDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '';
    showCalendar = false;
    if (task.dueDate) {
        const d = new Date(task.dueDate);
        calendarMonth = d.getMonth();
        calendarYear = d.getFullYear();
    } else {
        calendarMonth = new Date().getMonth();
        calendarYear = new Date().getFullYear();
    }
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
    showCalendar = false;
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
          categoryId: newCategoryId,
          dueDate: newDueDate || null
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
          const data = await response.json();
          if (data.success && data.justIncreased) {
            showStreakAnimation = true;
            streakJustIncreased = data.streak;
            streakAnimationKey += 1;
            setTimeout(() => {
              showStreakAnimation = false;
            }, 2500);
          }
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
  
  let showStreakAnimation = $state(false);
  let streakAnimationKey = $state(0);
  let streakJustIncreased = $state(0);
  let showCompletionAnimation = $state(false);
  let completionAnimationKey = $state(0);
  let lastXP = $state(0);
  let newLevel = $state(0);
  
  async function triggerCompletionAnimation(xp: number, level: number) {
    showCompletionAnimation = true;
    lastXP = xp;
    newLevel = level;
    completionAnimationKey += 1;
    setTimeout(() => {
      showCompletionAnimation = false;
      window.location.reload();
    }, 2000);
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
          {#if task.dueDate}
            {@const dueDate = new Date(task.dueDate)}
            {@const today = new Date()}
            {@const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()}
            {@const dueTime = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate()).getTime()}
            {@const isOverdue = dueTime < todayTime}
            {@const isToday = dueTime === todayTime}
            <div class="mt-2 flex items-center gap-1">
              <span class="text-xs {isOverdue ? 'text-red-500' : isToday ? 'text-orange-500' : 'text-gray-400'}">
                {isOverdue ? '⚠️' : isToday ? '📅' : '📆'} {dueDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</main>

{#if showStreakAnimation}
  <div class="streak-overlay">
    <div class="streak-popup">
      <div class="streak-fire">
        <img src="/racha-on.png" alt="Racha" class="w-24 h-24" />
      </div>
      <div class="streak-text">
        <span class="streak-label">¡RACHA!</span>
        <span class="streak-number">+{streakJustIncreased}</span>
      </div>
      <div class="streak-particles">
        {#each Array(12) as _, i}
          <div class="particle" style="--delay: {i * 0.1}s; --angle: {i * 30}deg"></div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .streak-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }

  .streak-popup {
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ffcc00 100%);
    padding: 40px 60px;
    border-radius: 24px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(255, 107, 53, 0.5);
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: visible;
  }

  .streak-fire {
    animation: firePulse 0.5s ease infinite alternate;
  }

  .streak-text {
    margin-top: 10px;
  }

  .streak-label {
    display: block;
    color: white;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 4px;
    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
  }

  .streak-number {
    display: block;
    color: white;
    font-size: 48px;
    font-weight: 900;
    text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  }

  .streak-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .particle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #ffcc00;
    border-radius: 50%;
    left: 50%;
    top: 50%;
    animation: explode 1s ease-out infinite;
    animation-delay: var(--delay);
    --distance: 100px;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes popIn {
    0% { transform: scale(0) rotate(-10deg); opacity: 0; }
    50% { transform: scale(1.1) rotate(5deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }

  @keyframes firePulse {
    from { transform: scale(1); }
    to { transform: scale(1.1); }
  }

  @keyframes explode {
    0% { 
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0); 
      opacity: 1; 
      scale: 1;
    }
    100% { 
      transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-80px); 
      opacity: 0; 
      scale: 0;
    }
  }
</style>

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
            bind:value={newCategoryId}
            onchange={(e) => newCategoryId = e.currentTarget.value ? Number(e.currentTarget.value) : null}
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none"
          >
            <option value={undefined}>Sin categoría</option>
            {#each categories as cat (cat.id)}
              <option value={cat.id}>{cat.name}</option>
            {/each}
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento</label>
          <div class="relative flex flex-col justify-end">
            <button 
              type="button"
              onclick={() => showCalendar = !showCalendar}
              class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none text-left flex items-center justify-between hover:border-[#4facfe] transition-colors"
            >
              <span class={newDueDate ? 'text-gray-800' : 'text-gray-400'}>
                {newDueDate ? new Date(newDueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Seleccionar fecha'}
              </span>
              <span class="text-xl">📅</span>
            </button>
            
            {#if showCalendar}
              <div class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 w-80" style="transform: translateX(-50%)">
                <div class="flex items-center justify-between mb-4">
                  <button 
                    type="button"
                    onclick={() => { if (calendarMonth === 0) { calendarMonth = 11; calendarYear--; } else calendarMonth--; }}
                    class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                  >
                    ‹
                  </button>
                  <span class="font-semibold text-gray-800">
                    {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][calendarMonth]} {calendarYear}
                  </span>
                  <button 
                    type="button"
                    onclick={() => { if (calendarMonth === 11) { calendarMonth = 0; calendarYear++; } else calendarMonth++; }}
                    class="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
                  >
                    ›
                  </button>
                </div>
                
                <div class="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                  {#each ['D', 'L', 'M', 'X', 'J', 'V', 'S'] as day, i}
                    <span class="text-gray-400 font-medium">{day}</span>
                  {/each}
                </div>
                
                <div class="grid grid-cols-7 gap-1">
                  {#each Array(new Date(calendarYear, calendarMonth, 1).getDay()) as _}
                    <span></span>
                  {/each}
                  {#each Array(new Date(calendarYear, calendarMonth + 1, 0).getDate()).fill(0).map((_, i) => i + 1) as day}
                    {@const isToday = new Date().getDate() === day && new Date().getMonth() === calendarMonth && new Date().getFullYear() === calendarYear}
                    {@const isSelected = newDueDate === `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
                    <button 
                      type="button"
                      onclick={() => { newDueDate = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; showCalendar = false; }}
                      class="w-9 h-9 rounded-xl text-sm font-medium transition-all
                        {isSelected ? 'bg-[#4facfe] text-white shadow-lg' : isToday ? 'bg-orange-100 text-orange-600 font-bold' : 'hover:bg-gray-100 text-gray-700'}"
                    >
                      {day}
                    </button>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
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
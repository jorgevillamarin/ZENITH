<script lang="ts">
  import { invalidateAll } from '$app/navigation';

  let { data = $bindable() }: { data: any } = $props();
  let user = $derived(data.user);
  let editName = $state('');
  
  $effect(() => {
    if (user?.name) {
      editName = user.name;
    }
  });

  let showImageModal = $state(false);
  let selectedFile = $state<File | null>(null);
  let imagePreview = $state('');
  let isSavingImage = $state(false);
  let imageMessage = $state('');

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  let showPasswordModal = $state(false);
  let currentPassword = $state('');
  let newPassword = $state('');
  let confirmPassword = $state('');
  let passwordMessage = $state('');
  let isSavingPassword = $state(false);
  let isSavingProfile = $state(false);
  let profileMessage = $state('');
  
  function extractNameParts(fullName: string) {
    const parts = fullName.trim().split(' ');
    return {
      name: parts[0] || '',
      lastname: parts.slice(1).join(' ') || ''
    };
  }
  
  let nameParts = $derived(extractNameParts(user?.name || ''));

  async function saveProfile() {
    if (!editName.trim()) {
      profileMessage = 'El nombre es obligatorio';
      return;
    }

    isSavingProfile = true;
    profileMessage = '';

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      });

      if (response.ok) {
        const data = await response.json();
        user = data.user;
        profileMessage = 'Perfil actualizado correctamente';
        await invalidateAll();
      } else {
        const err = await response.json();
        profileMessage = err.message || 'Error al guardar';
      }
    } catch {
      profileMessage = 'Error de conexión';
    }

    isSavingProfile = false;
  }

  async function saveImage() {
    if (!selectedFile && !imagePreview) {
      imageMessage = 'Selecciona una imagen';
      return;
    }

    isSavingImage = true;
    imageMessage = '';

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileImage: imagePreview })
      });

      if (response.ok) {
        const data = await response.json();
        user = data.user;
        imageMessage = 'Imagen guardada correctamente';
        showImageModal = false;
        selectedFile = null;
        imagePreview = '';
        await invalidateAll();
      } else {
        const err = await response.json();
        imageMessage = err.message || 'Error al guardar';
      }
    } catch {
      imageMessage = 'Error de conexión';
    }

    isSavingImage = false;
  }

  async function changePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      passwordMessage = 'Todos los campos son obligatorios';
      return;
    }

    if (newPassword !== confirmPassword) {
      passwordMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (newPassword.length < 6) {
      passwordMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    isSavingPassword = true;
    passwordMessage = '';

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (response.ok) {
        passwordMessage = 'Contraseña actualizada correctamente';
        currentPassword = '';
        newPassword = '';
        confirmPassword = '';
        showPasswordModal = false;
      } else {
        const err = await response.json();
        passwordMessage = err.message || 'Error al cambiar contraseña';
      }
    } catch {
      passwordMessage = 'Error de conexión';
    }

    isSavingPassword = false;
  }
</script>

<main class="max-w-2xl mx-auto">
  <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

  <div class="bg-white rounded-xl shadow-md p-6 space-y-6">
    <div class="flex items-center gap-6">
      <div class="relative">
        {#if user?.profileImage}
          <img src={user.profileImage} alt="Perfil" class="w-24 h-24 rounded-full object-cover border-4 border-[#4facfe]" />
        {:else}
          <div class="w-24 h-24 rounded-full bg-[#4facfe] flex items-center justify-center text-white text-3xl font-bold border-4 border-[#4facfe]">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        {/if}
        <button 
          onclick={() => showImageModal = true}
          aria-label="Cambiar foto de perfil"
          class="absolute bottom-0 right-0 bg-[#4facfe] text-white p-2 rounded-full hover:bg-[#3facde] transition-colors"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.76-.9l.813-1.22A2 2 0 0111.07 3H13a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-900">{user?.name}</h2>
        <p class="text-gray-500">{user?.email}</p>
      </div>
    </div>

    <div class="border-t pt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
          <input 
            type="text" 
            value={editName}
            oninput={(e) => editName = (e.target as HTMLInputElement).value}
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none"
            placeholder="Tu nombre"
          />
        </div>
      </div>
      
      {#if profileMessage}
        <p class="mt-3 text-sm {profileMessage.includes('error') || profileMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}">
          {profileMessage}
        </p>
      {/if}
      
      <button 
        onclick={saveProfile}
        disabled={isSavingProfile}
        class="mt-4 px-6 py-2 bg-[#4facfe] text-white font-semibold rounded-lg hover:bg-[#3facde] transition-colors disabled:opacity-50"
      >
        {isSavingProfile ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>

    <div class="border-t pt-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Seguridad</h3>
      <button 
        onclick={() => showPasswordModal = true}
        class="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
      >
        Cambiar Contraseña
      </button>
    </div>
  </div>
</main>

{#if showImageModal}
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
<h3 class="text-xl font-bold text-gray-900 mb-4">Cambiar Foto de Perfil</h3>
       
      {#if imageMessage}
        <p class="mb-4 text-sm {imageMessage.includes('error') || imageMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}">
          {imageMessage}
        </p>
      {/if}
      
      {#if imagePreview}
        <div class="mb-4 flex justify-center">
          <img src={imagePreview} alt="Preview" class="w-32 h-32 rounded-full object-cover border-4 border-[#4facfe]" />
        </div>
      {/if}
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar imagen</label>
        <input 
          type="file" 
          accept="image/*"
          onchange={handleFileSelect}
          class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none"
        />
      </div>
      
      <div class="flex gap-3 mt-6">
        <button 
          onclick={() => { showImageModal = false; selectedFile = null; imagePreview = ''; imageMessage = ''; }}
          class="flex-1 px-5 py-2.5 rounded-lg text-gray-600 font-semibold hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button 
          onclick={saveImage}
          disabled={isSavingImage}
          class="flex-1 px-5 py-2.5 rounded-lg bg-[#4facfe] text-white font-semibold hover:bg-[#3facde] disabled:opacity-50"
        >
          {isSavingImage ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  </div>
{/if}

{#if showPasswordModal}
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
      <h3 class="text-xl font-bold text-gray-900 mb-4">Cambiar Contraseña</h3>
      
      {#if passwordMessage}
        <p class="mb-4 text-sm {passwordMessage.includes('error') || passwordMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}">
          {passwordMessage}
        </p>
      {/if}
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
          <input 
            type="password" 
            value={currentPassword}
            oninput={(e) => currentPassword = e.currentTarget.value}
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
          <input 
            type="password" 
            value={newPassword}
            oninput={(e) => newPassword = e.currentTarget.value}
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
          <input 
            type="password" 
            value={confirmPassword}
            oninput={(e) => confirmPassword = e.currentTarget.value}
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none"
          />
        </div>
      </div>
      
      <div class="flex gap-3 mt-6">
        <button 
          onclick={() => { showPasswordModal = false; passwordMessage = ''; }}
          class="flex-1 px-5 py-2.5 rounded-lg text-gray-600 font-semibold hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button 
          onclick={changePassword}
          disabled={isSavingPassword}
          class="flex-1 px-5 py-2.5 rounded-lg bg-[#4facfe] text-white font-semibold hover:bg-[#3facde] disabled:opacity-50"
        >
          {isSavingPassword ? 'Cambiando...' : 'Cambiar'}
        </button>
      </div>
    </div>
  </div>
{/if}
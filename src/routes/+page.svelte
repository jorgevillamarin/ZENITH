<script lang="ts">
  import { goto } from '$app/navigation';
  
  let email = '';
  let password = '';
  let error = '';
  let isLoading = false;
  
  let showRegister = false;
  let regName = '';
  let regLastname = '';
  let regEmail = '';
  let regPassword = '';
  let regError = '';
  let regSuccess = '';
  let isRegistering = false;

  async function handleLogin() {
    if (!email || !password) {
      error = 'Por favor completa todos los campos';
      return;
    }

    isLoading = true;
    error = '';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        goto('/dashboard');
      } else {
        const data = await response.json();
        error = data.message || 'Credenciales incorrectas';
      }
    } catch {
      error = 'Error de conexión';
    }

    isLoading = false;
  }

  async function handleRegister() {
    if (!regName || !regLastname || !regEmail || !regPassword) {
      regError = 'Todos los campos son obligatorios';
      return;
    }

    isRegistering = true;
    regError = '';
    regSuccess = '';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: regName, 
          lastname: regLastname, 
          email: regEmail, 
          password: regPassword 
        })
      });

      if (response.ok) {
        regSuccess = '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.';
        setTimeout(() => {
          showRegister = false;
          email = regEmail;
          regName = '';
          regLastname = '';
          regEmail = '';
          regPassword = '';
          regSuccess = '';
        }, 2000);
      } else {
        const data = await response.json();
        regError = data.message || 'Error al crear la cuenta';
      }
    } catch {
      regError = 'Error de conexión';
    }

    isRegistering = false;
  }
</script>

<main class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4">
  <div class="w-full max-w-md">
    <div class="bg-white rounded-2xl shadow-2xl p-8">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 mb-4">
          <img src="/Icon.jpeg" alt="Logo Zenith" class="w-16 h-16 rounded-xl object-contain" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Zenith</h1>
        <p class="text-gray-500 mt-1">Ingresa a tu cuenta</p>
      </div>

      {#if error}
        <div class="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      {/if}

      <form on:submit|preventDefault={handleLogin} class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            bind:value={email}
            placeholder="correo@ejemplo.com"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            bind:value={password}
            placeholder="••••••••"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          class="w-full py-3 px-4 bg-[#4facfe] hover:bg-[#3facde] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-gray-500">
        <p>¿No tienes cuenta? <button on:click={() => showRegister = true} class="text-[#4facfe] hover:underline font-medium">Crear cuenta</button></p>
      </div>
    </div>
  </div>
</main>

{#if showRegister}
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">Crear Cuenta</h2>
        <button on:click={() => showRegister = false} class="text-gray-400 hover:text-gray-600 text-2xl">
          &times;
        </button>
      </div>

      {#if regError}
        <div class="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {regError}
        </div>
      {/if}

      {#if regSuccess}
        <div class="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {regSuccess}
        </div>
      {/if}

      <form on:submit|preventDefault={handleRegister} class="space-y-4">
        <div>
          <label for="regName" class="block text-sm font-medium text-gray-700 mb-1">
            Nombres
          </label>
          <input
            type="text"
            id="regName"
            bind:value={regName}
            placeholder="Juan"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label for="regLastname" class="block text-sm font-medium text-gray-700 mb-1">
            Apellidos
          </label>
          <input
            type="text"
            id="regLastname"
            bind:value={regLastname}
            placeholder="Pérez"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label for="regEmail" class="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            id="regEmail"
            bind:value={regEmail}
            placeholder="correo@ejemplo.com"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label for="regPassword" class="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            type="password"
            id="regPassword"
            bind:value={regPassword}
            placeholder="Mínimo 6 caracteres"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#4facfe] focus:border-transparent outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={isRegistering}
          class="w-full py-3 px-4 bg-[#4facfe] hover:bg-[#3facde] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRegistering ? 'Creando...' : 'Crear Cuenta'}
        </button>
      </form>
    </div>
  </div>
{/if}
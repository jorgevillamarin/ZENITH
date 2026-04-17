<script lang="ts">
  import { goto } from '$app/navigation';
  import '../app.css';
  
  let email = $state('');
  let password = $state('');
  let error = $state('');
  let isLoading = $state(false);
  let isLoadingText = $state('Iniciar Sesión');
  
  let showRegister = $state(false);
  let regName = $state('');
  let regLastname = $state('');
  let regEmail = $state('');
  let regPassword = $state('');
  let regError = $state('');
  let regSuccess = $state('');
  let isRegistering = $state(false);
  let registerBtnText = $state('Crear Cuenta');

  async function handleLogin(e: Event) {
    e.preventDefault();
    
    if (!email || !password) {
      error = 'Por favor completa todos los campos';
      return;
    }

    isLoading = true;
    isLoadingText = 'Verificando...';
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
    isLoadingText = 'Iniciar Sesión';
  }

  async function handleRegister(e: Event) {
    e.preventDefault();
    
    if (!regName || !regLastname || !regEmail || !regPassword) {
      regError = 'Todos los campos son obligatorios';
      return;
    }

    isRegistering = true;
    registerBtnText = 'Creando...';
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
        regSuccess = '¡Cuenta creada exitosamente!';
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
    registerBtnText = 'Crear Cuenta';
  }

  function closeRegister() {
    showRegister = false;
    regError = '';
    regSuccess = '';
    regName = '';
    regLastname = '';
    regEmail = '';
    regPassword = '';
  }
</script>

<div class="login-page">
  <div class="login-container">
    <form onsubmit={handleLogin} class="login-form">
      <div class="logo-container">
        <img src="/Icon.jpeg" alt="Zenith Logo" class="logo" />
      </div>
      <h2>LOGIN</h2>
      
      {#if error}
        <p class="error-message">{error}</p>
      {/if}
      
      <div class="input-group">
        <i class="fas fa-envelope"></i>
        <input 
          type="email" 
          bind:value={email} 
          required 
        />
        <label>Email</label>
      </div>
      
      <div class="input-group">
        <i class="fas fa-lock"></i>
        <input 
          type="password" 
          bind:value={password} 
          required 
        />
        <label>Password</label>
      </div>
      
      <button type="submit" class="login-btn" disabled={isLoading}>
        {isLoadingText}
      </button>
      
      <p class="signup-link">
        New here? <button type="button" onclick={() => showRegister = true}>Create Account</button>
      </p>
    </form>
  </div>
</div>

{#if showRegister}
  <div class="modal-overlay" onclick={closeRegister}>
    <div class="login-container register-modal" onclick={(e) => e.stopPropagation()}>
      <button class="close-btn" onclick={closeRegister}>&times;</button>
      <form onsubmit={handleRegister} class="login-form">
        <div class="logo-container">
          <img src="/Icon.jpeg" alt="Zenith Logo" class="logo" />
        </div>
        <h2>CREATE ACCOUNT</h2>
        
        {#if regError}
          <p class="error-message">{regError}</p>
        {/if}
        
        {#if regSuccess}
          <p class="success-message">{regSuccess}</p>
        {/if}
        
        <div class="input-group">
          <i class="fas fa-user"></i>
          <input 
            type="text" 
            bind:value={regName} 
            required 
          />
          <label>First Name</label>
        </div>
        
        <div class="input-group">
          <i class="fas fa-user"></i>
          <input 
            type="text" 
            bind:value={regLastname} 
            required 
          />
          <label>Last Name</label>
        </div>
        
        <div class="input-group">
          <i class="fas fa-envelope"></i>
          <input 
            type="email" 
            bind:value={regEmail} 
            required 
          />
          <label>Email</label>
        </div>
        
        <div class="input-group">
          <i class="fas fa-lock"></i>
          <input 
            type="password" 
            bind:value={regPassword} 
            required 
          />
          <label>Password</label>
        </div>
        
        <button type="submit" class="login-btn" disabled={isRegistering}>
          {registerBtnText}
        </button>
      </form>
    </div>
  </div>
{/if}

<style>
  .login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-image: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    position: relative;
    overflow: hidden;
  }

  .login-page::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(15, 23, 42, 0.4);
    z-index: 1;
  }

  .login-container {
    position: relative;
    width: 380px;
    padding: 50px 40px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
    z-index: 10;
  }

  .login-form h2 {
    color: #ffffff;
    text-align: center;
    margin-bottom: 30px;
    font-weight: 500;
    letter-spacing: 3px;
    font-size: 24px;
  }

  .logo-container {
    display: flex;
    justify-content: center;
    margin-bottom: 25px;
  }

  .logo {
    width: 70px;
    height: 70px;
    border-radius: 16px;
    object-fit: cover;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .input-group {
    position: relative;
    margin-bottom: 30px;
  }

  .input-group i {
    position: absolute;
    left: 0;
    top: 14px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 16px;
    transition: 0.3s;
  }

  .input-group input {
    width: 100%;
    padding: 12px 5px 12px 30px;
    font-size: 15px;
    color: #ffffff;
    background: transparent;
    border: none;
    border-bottom: 1.5px solid rgba(255, 255, 255, 0.3);
    outline: none;
    transition: 0.3s;
  }

  .input-group label {
    position: absolute;
    top: 14px;
    left: 30px;
    color: rgba(255, 255, 255, 0.7);
    pointer-events: none;
    transition: 0.3s ease;
    font-size: 14px;
  }

  .input-group input:focus {
    border-bottom: 1.5px solid #38bdf8;
  }

  .input-group input:focus ~ label,
  .input-group input:valid ~ label {
    top: -18px;
    left: 0;
    font-size: 12px;
    color: #38bdf8;
    font-weight: 500;
  }

  .input-group input:focus ~ i,
  .input-group input:valid ~ i {
    color: #38bdf8;
  }

  .login-btn {
    width: 100%;
    padding: 14px;
    background: #0ea5e9;
    border: none;
    border-radius: 8px;
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 10px;
  }

  .login-btn:hover {
    background: #0284c7;
    box-shadow: 0 10px 20px rgba(14, 165, 233, 0.3);
    transform: translateY(-1px);
  }

  .login-btn:active {
    transform: translateY(0);
  }

  .login-btn:disabled {
    background: #64748b;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .signup-link {
    text-align: center;
    margin-top: 25px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
  }

  .signup-link button {
    color: #38bdf8;
    text-decoration: none;
    font-weight: 600;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
  }

  .signup-link button:hover {
    color: #7dd3fc;
    text-decoration: underline;
  }

  .error-message {
    color: #f87171;
    text-align: center;
    margin-bottom: 15px;
    font-size: 13px;
    background: rgba(239, 68, 68, 0.2);
    padding: 8px;
    border-radius: 6px;
  }

  .success-message {
    color: #4ade80;
    text-align: center;
    margin-bottom: 15px;
    font-size: 13px;
    background: rgba(74, 222, 128, 0.2);
    padding: 8px;
    border-radius: 6px;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .register-modal {
    max-height: 90vh;
    overflow-y: auto;
  }

  .close-btn {
    position: absolute;
    top: 15px;
    right: 20px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 28px;
    cursor: pointer;
    transition: 0.3s;
  }

  .close-btn:hover {
    color: #ffffff;
  }
</style>
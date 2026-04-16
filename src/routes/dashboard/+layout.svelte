<script lang="ts">
    import '../../app.css';
    import { page } from '$app/state';
    
    let { data, children }: { data: any, children: any } = $props();
    
    let isMenuOpen = $state(false);

    let currentPath = $derived(page.url.pathname);
    
    function isActive(href: string) {
        return currentPath === href;
    }

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }

    async function logout() {
        await fetch('/api/auth/me', { method: 'DELETE' });
        window.location.href = '/';
    }
</script>

<div class="flex flex-col md:flex-row min-h-screen font-sans antialiased bg-[#f9f9f9]">
    
    <div class="md:hidden bg-[#1a1a2e] text-white p-4 flex justify-between items-center shadow-md">
        <div class="flex items-center space-x-2">
            <img src="/Icon.jpeg" alt="Logo Zenith" class="w-8 h-8 rounded-lg" />
            <span class="font-bold text-xl text-[#4facfe]">Zenith</span>
        </div>
        <button onclick={toggleMenu} class="text-2xl focus:outline-none">
            {isMenuOpen ? '✕' : '☰'}
        </button>
    </div>

    <aside class="
        {isMenuOpen ? 'flex' : 'hidden'} 
        md:flex md:w-64 bg-[#1a1a2e] text-white p-6 flex-col justify-between shadow-lg 
        fixed md:sticky md:top-0 z-50 h-screen w-3/4 max-w-xs md:max-w-none
    ">
        <div class="flex flex-col space-y-6">
            <div class="flex items-center gap-3 px-2">
                {#if data.user?.profileImage}
                    <img src={data.user.profileImage} alt="Perfil" class="w-12 h-12 rounded-full object-cover border-2 border-[#4facfe]" />
                {:else}
                    <div class="w-12 h-12 bg-[#4facfe] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {data.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                {/if}
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-white truncate">{data.user?.name || 'Usuario'}</p>
                    <div class="flex items-center gap-1">
                        <span class="text-base">🔥</span>
                        <span class="text-sm font-bold {data.streak?.currentStreak > 0 ? 'text-orange-400' : 'text-gray-500'}">
                            {data.streak?.currentStreak || 0}
                        </span>
                    </div>
                </div>
            </div>
            
            <nav class="flex flex-col space-y-2">
                <a href="/dashboard" onclick={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg {isActive('/dashboard') ? 'bg-[#4facfe] text-white font-semibold' : 'text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors'}">
                    <span>🏠</span> <span>Inicio</span>
                </a>
                <a href="/dashboard/categorias" onclick={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg {isActive('/dashboard/categorias') ? 'bg-[#4facfe] text-white font-semibold' : 'text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors'}">
                    <span>📁</span> <span class="text-base md:text-lg">Categorías</span>
                </a>
                <a href="/dashboard/resueltos" onclick={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg {isActive('/dashboard/resueltos') ? 'bg-[#4facfe] text-white font-semibold' : 'text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors'}">
                    <span>✅</span> <span class="text-base md:text-lg">Resueltos</span>
                </a>
                <a href="/dashboard/perfil" onclick={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg {isActive('/dashboard/perfil') ? 'bg-[#4facfe] text-white font-semibold' : 'text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors'}">
                    <span>👤</span> <span class="text-base md:text-lg">Mi Perfil</span>
                </a>
            </nav>
        </div>
        
        <div class="border-t border-gray-700 pt-4">
            <button 
                onclick={logout}
                class="w-full flex items-center space-x-3 text-lg p-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
            >
                <span>🚪</span> <span>Salir</span>
            </button>
            <div class="flex items-center space-x-3 mt-4 px-3">
                <img src="/Icon.jpeg" alt="Logo Zenith" class="w-8 h-8 object-contain rounded-lg" />
                <span class="text-xl font-bold text-[#4facfe]">Zenith</span>
            </div>
        </div>
    </aside>

    {#if isMenuOpen}
        <div 
            role="button" 
            tabindex="0"
            class="fixed inset-0 bg-black opacity-50 z-40 md:hidden" 
            onclick={toggleMenu}
            onkeydown={(e) => e.key === 'Enter' && toggleMenu()}
        ></div>
    {/if}

    <main class="flex-1 flex flex-col min-w-0">
        <header class="bg-white p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
            <h1 class="text-xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            
            <div class="flex items-center space-x-3 md:space-x-6">
                <span class="text-xl md:text-2xl cursor-pointer">🔔</span>
            </div>
        </header>

        <div class="p-4 md:p-10 flex-grow">
            {@render children()}
        </div>
    </main>
</div>
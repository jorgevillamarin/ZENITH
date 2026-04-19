<script lang="ts">
    import '../../app.css';
    import { page } from '$app/state';
    
    let { data, children }: { data: any, children: any } = $props();
    
    let isMenuOpen = $state(false);
    let showNotifications = $state(false);

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
        fixed md:sticky md:top-0 z-50 h-screen w-3/4 max-w-xs md:max-w-none overflow-y-auto
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
                        <img 
                            src={data.streak?.isActive ? '/racha-on.png' : '/racha-off.png'} 
                            alt="Racha" 
                            class="w-6 h-6"
                        />
                        <span class="text-sm font-bold {data.streak?.isActive ? 'text-orange-400' : 'text-gray-400'}">
                            {data.streak?.currentStreak || 0}
                        </span>
                    </div>
                </div>
            </div>
            
            <nav class="flex flex-col space-y-2">
                <a href="/dashboard" onclick={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg {isActive('/dashboard') ? 'bg-[#4facfe] text-white font-semibold' : 'text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors'}">
                    <span>🏠</span> <span>Inicio</span>
                </a>
                <a href="/dashboard/clasificacion" onclick={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg {isActive('/dashboard/clasificacion') ? 'bg-[#4facfe] text-white font-semibold' : 'text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors'}">
                    <span>🏆</span> <span>Clasificación</span>
                </a>
                <a href="/dashboard/logros" onclick={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg {isActive('/dashboard/logros') ? 'bg-[#4facfe] text-white font-semibold' : 'text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors'}">
                    <span>🏅</span> <span>Logros</span>
                </a>
                <a href="/dashboard/categorias" onclick={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg {isActive('/dashboard/categorias') ? 'bg-[#4facfe] text-white font-semibold' : 'text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors'}">
                    <span>📁</span> <span>Categorías</span>
                </a>
                <a href="/dashboard/resueltos" onclick={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg {isActive('/dashboard/resueltos') ? 'bg-[#4facfe] text-white font-semibold' : 'text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors'}">
                    <span>✅</span> <span>Resueltos</span>
                </a>
                <a href="/dashboard/perfil" onclick={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg {isActive('/dashboard/perfil') ? 'bg-[#4facfe] text-white font-semibold' : 'text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors'}">
                    <span>👤</span> <span>Mi Perfil</span>
                </a>
            </nav>
            
            {#if data.gamification?.stats}
            <div class="mt-4 p-3 bg-[#2a2a4e] rounded-xl border border-[#4facfe]/30">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm text-gray-400">Nivel {data.gamification.stats.level}</span>
                    <span class="text-sm font-bold text-[#4facfe]">{data.gamification.stats.xp} XP</span>
                </div>
                <div class="w-full bg-gray-700 rounded-full h-2">
                    <div class="bg-gradient-to-r from-[#4facfe] to-[#00f2fe] h-2 rounded-full" style="width: {Math.min((data.gamification.stats.xp % 100), 100)}%"></div>
                </div>
                
                {#if data.gamification?.dailyChallenge}
                <div class="mt-3 pt-3 border-t border-gray-700">
                    <div class="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Desafío diario</span>
                        <span>{data.gamification.dailyChallenge.completedTasks}/{data.gamification.dailyChallenge.targetTasks}</span>
                    </div>
                    <div class="w-full bg-gray-700 rounded-full h-1.5">
                        <div class="bg-orange-500 h-1.5 rounded-full" style="width: {Math.min((data.gamification.dailyChallenge.completedTasks / data.gamification.dailyChallenge.targetTasks) * 100, 100)}%"></div>
                    </div>
                    <p class="text-xs text-orange-400 mt-1">+{data.gamification.dailyChallenge.xpReward} XP</p>
                </div>
                {/if}
            </div>
            {/if}
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
            
            <div class="flex items-center gap-3 md:space-x-6">
                <div class="relative">
                    <button 
                        type="button"
                        onclick={() => showNotifications = !showNotifications}
                        class="text-xl md:text-2xl cursor-pointer hover:scale-110 transition-transform"
                    >
                        🔔
                    </button>
                    {#if (data.notifications?.overdue || 0) + (data.notifications?.dueToday || 0) > 0}
                        <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {(data.notifications?.overdue || 0) + (data.notifications?.dueToday || 0)}
                        </span>
                    {/if}
                    {#if showNotifications}
                        <div class="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 w-80 z-50 overflow-hidden">
                            <div class="p-4 border-b border-gray-100">
                                <h3 class="font-semibold text-gray-800">Notificaciones</h3>
                            </div>
                            <div class="max-h-80 overflow-y-auto">
                                {#if (data.notifications?.overdue || 0) > 0}
                                    <div class="p-3 bg-red-50 border-b border-red-100">
                                        <p class="text-sm font-medium text-red-700">
                                            ⚠️ {data.notifications.overdue} tarea(s) vencida(s)
                                        </p>
                                    </div>
                                {/if}
                                {#if (data.notifications?.dueToday || 0) > 0}
                                    <div class="p-3 bg-orange-50 border-b border-orange-100">
                                        <p class="text-sm font-medium text-orange-700">
                                            📅 {data.notifications.dueToday} tarea(s) para hoy
                                        </p>
                                    </div>
                                {/if}
                                {#if (data.notifications?.overdue || 0) === 0 && (data.notifications?.dueToday || 0) === 0}
                                    <div class="p-4 text-center text-gray-500">
                                        <p class="text-sm">No hay notificaciones</p>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}
                </div>
            </div>
        </header>

        <div class="p-4 md:p-10 flex-grow">
            {@render children()}
        </div>
    </main>
</div>
<script lang="ts">
    import '../../app.css';
    
    // Variable para controlar el menú lateral en móviles
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }
</script>

<div class="flex flex-col md:flex-row min-h-screen font-sans antialiased bg-[#f9f9f9]">
    
    <div class="md:hidden bg-[#1a1a2e] text-white p-4 flex justify-between items-center shadow-md">
        <div class="flex items-center space-x-2">
            <img src="/Icon.jpeg" alt="Logo Zenith" class="w-8 h-8 rounded-lg" />
            <span class="font-bold text-xl text-[#4facfe]">Zenith</span>
        </div>
        <button on:click={toggleMenu} class="text-2xl focus:outline-none">
            {isMenuOpen ? '✕' : '☰'}
        </button>
    </div>

    <aside class="
        {isMenuOpen ? 'flex' : 'hidden'} 
        md:flex md:w-64 bg-[#1a1a2e] text-white p-6 flex-col space-y-10 shadow-lg 
        fixed md:sticky md:top-0 z-50 h-screen w-3/4 max-w-xs md:max-w-none
    ">
        <div class="hidden md:flex text-3xl font-extrabold text-[#4facfe] items-center space-x-3">
            <img src="/Icon.jpeg" alt="Logo Zenith" class="w-9 h-9 object-contain rounded-lg" />
            <span>Zenith</span>
        </div>

        <nav class="flex-grow flex flex-col space-y-4">
            <a href="/dashboard" on:click={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg bg-[#4facfe] text-white font-semibold">
                <span>🏠</span> <span>Inicio</span>
            </a>
            <a href="/dashboard/categorias" on:click={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors">
                <span>📁</span> <span class="text-base md:text-lg">Categorías</span>
            </a>
            <a href="/dashboard/resueltos" on:click={() => isMenuOpen = false} class="flex items-center space-x-3 text-lg p-3 rounded-lg text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors">
                <span>✅</span> <span class="text-base md:text-lg">Resueltos</span>
            </a>
        </nav>
    </aside>

    {#if isMenuOpen}
        <div 
            role="button" 
            tabindex="0"
            class="fixed inset-0 bg-black opacity-50 z-40 md:hidden" 
            on:click={toggleMenu}
            on:keydown={(e) => e.key === 'Enter' && toggleMenu()}
        ></div>
    {/if}

    <main class="flex-1 flex flex-col min-w-0"> <header class="bg-white p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
            <h1 class="text-xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            
            <div class="flex items-center space-x-3 md:space-x-6">
                <div class="relative hidden sm:block">
                    <input type="text" placeholder="Buscar..." class="pl-9 pr-4 py-2 border border-gray-300 rounded-lg w-40 lg:w-72 focus:ring-2 focus:ring-[#4facfe]" />
                    <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
                
                <span class="text-xl md:text-2xl cursor-pointer">🔔</span>
                <img src="https://via.placeholder.com/40" alt="Usuario" class="w-8 h-8 md:w-10 md:h-10 rounded-full" />
            </div>
        </header>

        <div class="p-4 md:p-10 flex-grow">
            <slot />
        </div>
    </main>
</div>
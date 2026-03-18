<script lang="ts">
    import '../../app.css';
</script>

<div class="flex min-h-screen font-sans antialiased">
    <aside class="w-64 bg-[#1a1a2e] text-white p-6 flex flex-col space-y-10 shadow-lg">
       <div class="text-3xl font-extrabold text-[#4facfe] flex items-center space-x-3">
            <img src="/Icon.jpeg" alt="Logo Zenith" class="w-9 h-9 object-contain rounded-lg" />
            <span>Zenith</span>
        </div>

        <nav class="flex-grow flex flex-col space-y-4">
            <a href="/dashboard" class="flex items-center space-x-3 text-lg p-3 rounded-lg bg-[#4facfe] text-white font-semibold">
                <span>🏠</span> <span>Inicio</span>
            </a>
            <a href="#pendientes" class="flex items-center space-x-3 text-lg p-3 rounded-lg text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors">
                <span>✅</span> <span>Revisar Pendientes</span>
            </a>
            <a href="#prioridad" class="flex items-center space-x-3 text-lg p-3 rounded-lg text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors">
                <span>📊</span> <span>Ajustar Prioridad</span>
            </a>
            <a href="#reporte" class="flex items-center space-x-3 text-lg p-3 rounded-lg text-gray-300 hover:bg-[#2a2a4e] hover:text-white transition-colors">
                <span>📈</span> <span>Reporte de completados</span>
            </a>
        </nav>
    </aside>

    <main class="flex-1 bg-[#f9f9f9]">
        <header class="bg-white p-6 border-b border-gray-200 flex items-center justify-between">
            <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div class="flex items-center space-x-6">
                <div class="relative">
                    <input type="text" placeholder="Búsqueda..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-72 focus:ring-2 focus:ring-[#4facfe]" />
                    <span class="absolute left-3 top-2.5 text-gray-400">🔍</span>
                </div>
                <span class="text-2xl cursor-pointer">🔔</span>
                <img src="https://via.placeholder.com/40" alt="Usuario" class="w-10 h-10 rounded-full" />
            </div>
        </header>

        <div class="p-10">
            <slot />
        </div>
    </main>
</div>
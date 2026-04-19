<script lang="ts">
    let { data }: { data: any } = $props();
</script>

<div class="max-w-3xl mx-auto">
    <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">🏅 Mis Logros</h1>
        <p class="text-gray-500 mb-6">Desarrolla tu perfil completando logros</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each data.badges as badge}
                <div class="p-4 rounded-xl border-2 {badge.earned ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-50 border-gray-200'}">
                    <div class="flex items-start gap-3">
                        <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl {badge.earned ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-400'}">
                            {badge.icon}
                        </div>
                        <div class="flex-1">
                            <h3 class="font-semibold {badge.earned ? 'text-gray-900' : 'text-gray-500'}">{badge.name}</h3>
                            <p class="text-sm text-gray-500">{badge.description}</p>
                            {#if !badge.earned}
                            <div class="mt-2">
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-yellow-500 h-2 rounded-full" style="width: {badge.percentage}%"></div>
                                </div>
                                <p class="text-xs text-gray-400 mt-1">{badge.progress}/{badge.target}</p>
                            </div>
                            {:else}
                            <p class="text-xs text-green-600 mt-1">✓ Desbloqueado</p>
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>
    
    <div class="bg-white rounded-2xl shadow-lg p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">📊 Estadísticas</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-gradient-to-br from-[#4facfe] to-[#00f2fe] rounded-xl text-white">
                <p class="text-2xl font-bold">{data.stats.level}</p>
                <p class="text-sm">Nivel</p>
            </div>
            <div class="text-center p-4 bg-orange-500 rounded-xl text-white">
                <p class="text-2xl font-bold">{data.stats.xp}</p>
                <p class="text-sm">XP Total</p>
            </div>
            <div class="text-center p-4 bg-green-500 rounded-xl text-white">
                <p class="text-2xl font-bold">{data.stats.totalTasks}</p>
                <p class="text-sm">Tareas</p>
            </div>
            <div class="text-center p-4 bg-red-500 rounded-xl text-white">
                <p class="text-2xl font-bold">{data.stats.longestStreak}</p>
                <p class="text-sm"> mejor racha</p>
            </div>
        </div>
    </div>
</div>
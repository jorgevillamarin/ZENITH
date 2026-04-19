<script lang="ts">
    let { data }: { data: any } = $props();
    
    const levelColors = [
        '#6b7280', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', 
        '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
    ];
    
    function getLevelColor(level: number) {
        return levelColors[Math.min(level - 1, levelColors.length - 1)];
    }
    
    const medals = ['🥇', '🥈', '🥉'];
</script>

<div class="max-w-2xl mx-auto">
    <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center">🏆 Clasificación</h1>
        
        <div class="space-y-3">
            {#each data.leaderboard as entry, i}
                <div class="flex items-center gap-4 p-4 rounded-xl {entry.userId === data.currentUserId ? 'bg-[#4facfe]/10 border-2 border-[#4facfe]' : 'bg-gray-50'}">
                    <span class="text-2xl w-10 text-center">
                        {i < 3 ? medals[i] : `#${i + 1}`}
                    </span>
                    
                    <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                         style="background: {getLevelColor(entry.level)}">
                        {entry.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <p class="font-semibold text-gray-900 truncate">{entry.name}</p>
                        <div class="flex items-center gap-2 text-sm text-gray-500">
                            <span>Nivel {entry.level}</span>
                            <span>•</span>
                            <span>{entry.totalTasksCompleted} tareas</span>
                        </div>
                    </div>
                    
                    <div class="text-right">
                        <p class="text-xl font-bold text-[#4facfe]">{entry.xp.toLocaleString()}</p>
                        <p class="text-xs text-gray-500">XP</p>
                    </div>
                </div>
            {/each}
        </div>
        
        {#if data.leaderboard.length === 0}
            <p class="text-center text-gray-500 py-8">No hay datos disponibles</p>
        {/if}
    </div>
</div>
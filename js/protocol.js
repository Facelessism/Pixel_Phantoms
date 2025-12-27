document.addEventListener('DOMContentLoaded', () => {
    initCircuitBackground();
    renderLogicMatrix();
});

/**
 * Procedurally generates flickering circuit lines
 */
function initCircuitBackground() {
    const bg = document.getElementById('circuit-bg');
    const lineCount = 15;

    for (let i = 0; i < lineCount; i++) {
        const line = document.createElement('div');
        line.className = 'circuit-trace';
        
        // Randomize dimensions and position
        const isVertical = Math.random() > 0.5;
        line.style.width = isVertical ? '1px' : Math.random() * 400 + 100 + 'px';
        line.style.height = isVertical ? Math.random() * 400 + 100 + 'px' : '1px';
        line.style.left = Math.random() * 100 + '%';
        line.style.top = Math.random() * 100 + '%';
        
        // Vary animation speed for organic flickering
        line.style.animationDuration = (Math.random() * 3 + 2) + 's';
        line.style.animationDelay = Math.random() * 5 + 's';

        bg.appendChild(line);
    }
}

/**
 * Renders the transparency table for Ranking Logic
 */
function renderLogicMatrix() {
    const matrixData = [
        { vector: "PR Complexity (L3)", weight: "0.60", impact: "CRITICAL", color: "#bc13fe" },
        { vector: "Event Attendance", weight: "0.25", impact: "STABLE", color: "#0aff9d" },
        { vector: "R&D Archive Bonus", weight: "0.10", impact: "STRATEGIC", color: "#00aaff" },
        { vector: "Community Support", weight: "0.05", impact: "AUXILIARY", color: "#cbd5e0" }
    ];

    const container = document.getElementById('logic-rows');
    if (!container) return;

    container.innerHTML = matrixData.map(row => `
        <div class="lb-row">
            <span style="font-weight: bold;">${row.vector}</span>
            <span class="lb-xp-val">${row.weight}</span>
            <span class="text-right" style="color: ${row.color}; letter-spacing: 1px;">
                <i class="fas fa-circle" style="font-size: 0.6rem;"></i> ${row.impact}
            </span>
        </div>
    `).join('');
}
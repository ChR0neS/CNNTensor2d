// ==========================================
// MÓDULO 1: IMAGEN A TENSOR (TU CÓDIGO RESTAURADO)
// ==========================================
const M = 15; 
const N = 15;
let tensorMatrix = Array(M).fill().map(() => Array(N).fill(0));

window.addEventListener('load', () => {
    const canvas = document.getElementById('image-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const tensorGrid = document.getElementById('tensor-grid');

    const img = new Image();
    img.crossOrigin = "Anonymous"; 
    img.src = 'foto1.jpg'; 

    img.onload = function() {
        ctx.clearRect(0, 0, M, N);
        ctx.drawImage(img, 0, 0, M, N);
        
        const imageData = ctx.getImageData(0, 0, M, N).data;
        tensorGrid.innerHTML = ''; 
        tensorGrid.style.gridTemplateColumns = `repeat(${N}, 1fr)`;

        for (let i = 0; i < M; i++) {
            for (let j = 0; j < N; j++) {
                const index = (i * N + j) * 4;
                const r = imageData[index];
                const g = imageData[index + 1];
                const b = imageData[index + 2];
                
                let gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
                tensorMatrix[i][j] = gray; // Guardado matemático
                
                // Representación en cuadrícula original
                const cell = document.createElement('div');
                cell.className = 'cell cell-small';
                cell.innerText = gray;
                cell.style.backgroundColor = `rgb(${gray}, ${gray}, ${gray})`;
                cell.style.color = gray < 128 ? 'white' : 'black';
                tensorGrid.appendChild(cell);
            }
        }
        
        // Ejecutar los módulos dependientes SOLO cuando la imagen ya existe
        initSeparable();
        initSVD();
    }

    img.onerror = function() {
        if(tensorGrid) tensorGrid.innerHTML = '<p style="color:red;">Error: No se encontró "foto1.jpg".</p>';
    }
});

function applyInverseIsomorphism() {
    const invCanvas = document.getElementById('inverse-canvas');
    if (!invCanvas) return;
    const invCtx = invCanvas.getContext('2d');
    invCtx.clearRect(0, 0, M, N);
    for (let i = 0; i < M; i++) {
        for (let j = 0; j < N; j++) {
            const val = tensorMatrix[i][j];
            invCtx.fillStyle = `rgb(${val}, ${val}, ${val})`;
            invCtx.fillRect(j, i, 1, 1);
        }
    }
}

// ==========================================
// MÓDULO 2: CONVOLUCIÓN INTERACTIVA (TOTALMENTE AISLADA)
// ==========================================
const inputData = [
    [2, 1, 0, 2, 1], [0, 1, 2, 1, 0], [1, 0, 1, 2, 1], [2, 1, 0, 0, 1], [1, 1, 2, 1, 0]
];
const kernelData = [
    [1, 0, -1], [1, 0, -1], [1, 0, -1]
];
let outputData = Array(3).fill().map(() => Array(3).fill(0));
let currentStep = -1; 
const maxSteps = 9;   

function createMod2Grid(containerId, data, isOutput = false) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    data.forEach((row, i) => {
        row.forEach((val, j) => {
            const div = document.createElement('div');
            div.className = 'cell'; // Tamaño grande original
            div.id = `${containerId}-${i}-${j}`;
            div.innerText = (isOutput && val === 0 && currentStep === -1) ? '' : val;
            container.appendChild(div);
        });
    });
}

function initConvolution() {
    createMod2Grid('input-grid', inputData);
    createMod2Grid('kernel-grid', kernelData);
    createMod2Grid('output-grid', outputData, true);
    updateVisuals();
}

function nextStep() {
    if (currentStep < maxSteps - 1) {
        currentStep++;
        calculateCurrentStep();
        updateVisuals();
    }
}

function prevStep() {
    if (currentStep >= 0) {
        const outRow = Math.floor(currentStep / 3);
        const outCol = currentStep % 3;
        outputData[outRow][outCol] = 0; 
        currentStep--;
        updateVisuals();
    }
}

function calculateCurrentStep() {
    if (currentStep === -1) return;
    const outRow = Math.floor(currentStep / 3);
    const outCol = currentStep % 3;
    let sum = 0;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            sum += inputData[outRow + i][outCol + j] * kernelData[i][j];
        }
    }
    outputData[outRow][outCol] = sum;
}

function updateVisuals() {
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const formulaDisplay = document.getElementById('formula-display');
    if(!btnPrev || !btnNext || !formulaDisplay) return;

    btnPrev.disabled = currentStep === -1;
    btnNext.disabled = currentStep === maxSteps - 1;

    // Limpieza de clases específica para Mod 2
    document.querySelectorAll('#input-grid .cell, #kernel-grid .cell, #output-grid .cell').forEach(c => {
        c.classList.remove('highlight-input', 'highlight-kernel', 'highlight-output');
    });

    createMod2Grid('output-grid', outputData, true);

    if (currentStep === -1) {
        formulaDisplay.innerText = 'Haz clic en "Siguiente Paso" para comenzar el cálculo.';
        return;
    }

    const outRow = Math.floor(currentStep / 3);
    const outCol = currentStep % 3;
    let formulaText = `S(${outRow},${outCol}) = `;
    
    for(let r=0; r<3; r++){
        for(let c=0; c<3; c++){
            const kCell = document.getElementById(`kernel-grid-${r}-${c}`);
            if(kCell) kCell.classList.add('highlight-kernel');
        }
    }

    let terms = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const inR = outRow + i;
            const inC = outCol + j;
            const iCell = document.getElementById(`input-grid-${inR}-${inC}`);
            if(iCell) iCell.classList.add('highlight-input');
            const valIn = inputData[inR][inC];
            const valKer = kernelData[i][j];
            terms.push(`(${valIn}×${valKer})`);
        }
    }
    
    const oCell = document.getElementById(`output-grid-${outRow}-${outCol}`);
    if(oCell) oCell.classList.add('highlight-output');
    
    formulaText += terms.join(' + ') + ` = ${outputData[outRow][outCol]}`;
    formulaDisplay.innerText = formulaText;
}

initConvolution(); // Ejecutar Mod 2 inmediatamente

// ==========================================
// MÓDULO 3: CONVOLUCIÓN SEPARABLE VISUAL (CON IMAGEN)
// ==========================================
const uData = [[1], [2], [1]]; 
const vData = [[1, 0, -1]];    

let interData = Array(13).fill().map(() => Array(15).fill(0));
let sepOutputData = Array(13).fill().map(() => Array(13).fill(0));
let sepPhase = 0; 

// Nuevo generador que renderiza las matrices puramente como imagen (sin números)
function createVisualGrid(containerId, matrix) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${matrix[0].length}, 1fr)`;

    // Normalizar para que los filtros (que dan valores negativos) se vean como imagen
    let min = Infinity, max = -Infinity;
    matrix.forEach(row => row.forEach(val => {
        if (val < min) min = val;
        if (val > max) max = val;
    }));

    matrix.forEach(row => {
        row.forEach(val => {
            const div = document.createElement('div');
            div.className = 'cell cell-visual'; // Sin texto, solo color
            
            let intensity;
            if (max === min) {
                intensity = Math.max(0, Math.min(255, val));
            } else {
                intensity = Math.round(255 * (val - min) / (max - min));
            }
            
            // Ocultamos la celda si estamos en fase 0 y es de salida
            if (containerId.includes('inter') && sepPhase < 1) intensity = 221; // Gris claro (vacío)
            if (containerId.includes('output') && sepPhase < 2) intensity = 221;
            
            div.style.backgroundColor = `rgb(${intensity}, ${intensity}, ${intensity})`;
            container.appendChild(div);
        });
    });
}

// Renderizador para los filtros u y v (estos sí llevan números porque son 3 celdas)
function createFilterGrid(containerId, data) {
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    data.forEach(row => {
        row.forEach(val => {
            const div = document.createElement('div');
            div.className = 'cell cell-small';
            div.innerText = val;
            container.appendChild(div);
        });
    });
}

function initSeparable() {
    createVisualGrid('sep-input-grid', tensorMatrix); 
    createFilterGrid('u-grid', uData);
    createFilterGrid('v-grid', vData);
    
    createVisualGrid('inter-grid', interData);
    createVisualGrid('inter-grid-2', interData);
    createVisualGrid('sep-output-grid', sepOutputData);
}

function calculateInter() {
    for(let c = 0; c < 15; c++) { 
        for(let r = 0; r < 13; r++) { 
            let sum = 0;
            for(let i = 0; i < 3; i++) {
                sum += tensorMatrix[r + i][c] * uData[i][0];
            }
            interData[r][c] = sum;
        }
    }
}

function calculateSepOutput() {
    for(let r = 0; r < 13; r++) { 
        for(let c = 0; c < 13; c++) { 
            let sum = 0;
            for(let j = 0; j < 3; j++) {
                sum += interData[r][c + j] * vData[0][j];
            }
            sepOutputData[r][c] = sum;
        }
    }
}

function nextSepPhase() { if(sepPhase < 2) { sepPhase++; updateSepVisuals(); } }
function prevSepPhase() { if(sepPhase > 0) { sepPhase--; updateSepVisuals(); } }

function updateSepVisuals() {
    document.getElementById('btn-sep-prev').disabled = (sepPhase === 0);
    document.getElementById('btn-sep-next').disabled = (sepPhase === 2);

    if(sepPhase >= 1) calculateInter(); 
    else interData = Array(13).fill().map(() => Array(15).fill(0));
    
    if(sepPhase >= 2) calculateSepOutput(); 
    else sepOutputData = Array(13).fill().map(() => Array(13).fill(0));

    createVisualGrid('inter-grid', interData);
    createVisualGrid('inter-grid-2', interData);
    createVisualGrid('sep-output-grid', sepOutputData);
}

// ==========================================
// MÓDULO 4: SVD Y COMPRESIÓN TENSORIAL
// ==========================================
let svdU, svdS, svdV;

function initSVD() {
    const statusText = document.getElementById('svd-status');
    if (typeof numeric === 'undefined') {
        if(statusText) statusText.innerText = "Error: La librería Math no cargó. Verifica tu internet.";
        return;
    }
    
    try {
        const svd = numeric.svd(tensorMatrix);
        svdU = svd.U; 
        svdS = svd.S; 
        svdV = svd.V; 

        drawMatrixToCanvas('svd-original-canvas', tensorMatrix, false);
        updateSVD(); // Arrancar en k=1
    } catch (e) {
        if(statusText) statusText.innerText = "Error calculando SVD: " + e.message;
    }
}

function updateSVD() {
    if (!svdU) return; // Prevenir ejecución si falló initSVD
    
    const k = parseInt(document.getElementById('svd-slider').value);
    document.getElementById('k-value').innerText = k;

    let reconMatrix = Array(M).fill().map(() => Array(N).fill(0));
    let currentRank1Matrix = Array(M).fill().map(() => Array(N).fill(0));

    for (let i = 0; i < k; i++) {
        let sigma = svdS[i];
        for (let r = 0; r < M; r++) {
            for (let c = 0; c < N; c++) {
                let val = sigma * svdU[r][i] * svdV[c][i];
                reconMatrix[r][c] += val;
                if (i === k - 1) currentRank1Matrix[r][c] = val;
            }
        }
    }

    drawMatrixToCanvas('svd-recon-canvas', reconMatrix, false);
    drawMatrixToCanvas('svd-component-canvas', currentRank1Matrix, true);
}

function drawMatrixToCanvas(canvasId, matrix, normalize = false) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let min = Infinity, max = -Infinity;
    if (normalize) {
        for (let r = 0; r < M; r++) {
            for (let c = 0; c < N; c++) {
                if (matrix[r][c] < min) min = matrix[r][c];
                if (matrix[r][c] > max) max = matrix[r][c];
            }
        }
    }

    for (let r = 0; r < M; r++) {
        for (let c = 0; c < N; c++) {
            let val = matrix[r][c];
            let intensity;
            
            if (normalize) {
                intensity = (max === min) ? 128 : Math.round(255 * (val - min) / (max - min));
            } else {
                intensity = Math.max(0, Math.min(255, Math.round(val)));
            }
            
            ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
            ctx.fillRect(c, r, 1, 1);
        }
    }
}

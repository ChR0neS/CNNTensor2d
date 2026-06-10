// ==========================================
// MÓDULO 1: IMAGEN A TENSOR 
// ==========================================
const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');
const tensorGrid = document.getElementById('tensor-grid');

const M = 15; 
const N = 15;

// Variable global para almacenar el tensor puramente como matriz matemática
let tensorMatrix = Array(M).fill().map(() => Array(N).fill(0));

window.addEventListener('load', () => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; 
    img.src = 'foto1.jpg'; 

    img.onload = function() {
        ctx.clearRect(0, 0, M, N);
        ctx.drawImage(img, 0, 0, M, N);
        extractTensorData(); // Aplicamos isomorfismo de ida
    }

    img.onerror = function() {
        if(tensorGrid) {
            tensorGrid.innerHTML = '<p style="color:#d63031; background:#ffeaa7; padding: 10px; border-radius: 4px;">Error: No se encontró la imagen. Verifica que el archivo se llame exactamente "foto1.jpg".</p>';
        }
    }
});

// Función de ida: Espacio Visual -> Espacio Matricial
function extractTensorData() {
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
            
            // 1. Guardamos el escalar en la matriz matemática pura
            tensorMatrix[i][j] = gray;
            
            // 2. Renderizamos en la web
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.innerText = gray;
            cell.style.backgroundColor = `rgb(${gray}, ${gray}, ${gray})`;
            cell.style.color = gray < 128 ? 'white' : 'black';
            tensorGrid.appendChild(cell);
        }
    }
}

// NUEVO - Función de vuelta: Espacio Matricial -> Espacio Visual
function applyInverseIsomorphism() {
    const invCanvas = document.getElementById('inverse-canvas');
    if (!invCanvas) return;
    const invCtx = invCanvas.getContext('2d');
    
    invCtx.clearRect(0, 0, M, N);

    // Recorremos la matriz pura para reconstruir el estado físico
    for (let i = 0; i < M; i++) {
        for (let j = 0; j < N; j++) {
            const intensity = tensorMatrix[i][j];
            
            // Traducimos el escalar a color RGB
            invCtx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
            
            // fillRect(x, y, ancho, alto). En matrices: x es columna (j), y es fila (i)
            invCtx.fillRect(j, i, 1, 1);
        }
    }
}

// ==========================================
// FIN MÓDULO 1
// ==========================================



// ==========================================
// MÓDULO 2: CONVOLUCIÓN INTERACTIVA
// ==========================================

// Datos iniciales de prueba (Tensor 5x5 y Kernel 3x3)
const inputData = [
    [2, 1, 0, 2, 1],
    [0, 1, 2, 1, 0],
    [1, 0, 1, 2, 1],
    [2, 1, 0, 0, 1],
    [1, 1, 2, 1, 0]
];

const kernelData = [
    [1, 0, -1],
    [1, 0, -1],
    [1, 0, -1]
];

let outputData = Array(3).fill().map(() => Array(3).fill(0));
let currentStep = -1; // Estado inicial sin calcular
const maxSteps = 9;   // Posiciones totales para salida 3x3

// Funciones de renderizado
function createGrid(containerId, data, isOutput = false) {
    const container = document.getElementById(containerId);
    if(!container) return;
    
    container.innerHTML = '';
    data.forEach((row, i) => {
        row.forEach((val, j) => {
            const div = document.createElement('div');
            div.className = 'cell';
            div.id = `${containerId}-${i}-${j}`;
            // Si es salida y aún no se calcula, mostramos vacío
            div.innerText = (isOutput && val === 0 && currentStep === -1) ? '' : val;
            container.appendChild(div);
        });
    });
}

function initConvolution() {
    createGrid('input-grid', inputData);
    createGrid('kernel-grid', kernelData);
    createGrid('output-grid', outputData, true);
    updateVisuals();
}

// Lógica matemática paso a paso
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

    // Limpiar clases de resaltado
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('highlight-input', 'highlight-kernel', 'highlight-output');
    });

    createGrid('output-grid', outputData, true);

    if (currentStep === -1) {
        formulaDisplay.innerText = 'Haz clic en "Siguiente Paso" para comenzar el cálculo.';
        return;
    }

    const outRow = Math.floor(currentStep / 3);
    const outCol = currentStep % 3;
    let formulaText = `S(${outRow},${outCol}) = `;
    
    // Resaltar Kernel
    for(let r=0; r<3; r++){
        for(let c=0; c<3; c++){
            const kCell = document.getElementById(`kernel-grid-${r}-${c}`);
            if(kCell) kCell.classList.add('highlight-kernel');
        }
    }

    // Resaltar Entrada y construir ecuación
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
    
    // Resaltar Salida
    const oCell = document.getElementById(`output-grid-${outRow}-${outCol}`);
    if(oCell) oCell.classList.add('highlight-output');
    
    formulaText += terms.join(' + ') + ` = ${outputData[outRow][outCol]}`;
    formulaDisplay.innerText = formulaText;
}







// Iniciar la simulación interactiva
initConvolution();









// ==========================================
// MÓDULO 3: CONVOLUCIÓN SEPARABLE
// ==========================================

// Factorización del Filtro Sobel (3x3)
// uData * vData generaría la matriz kernelData que usamos en el Módulo 2
const uData = [[1], [2], [1]]; // Vector columna 3x1 (Eje Y)
const vData = [[1, 0, -1]];    // Vector fila 1x3 (Eje X)

let interData = Array(3).fill().map(() => Array(5).fill(0));
let sepOutputData = Array(3).fill().map(() => Array(3).fill(0));
let sepPhase = 0; // Control de fases: 0 (Inicio), 1 (Intermedio calculada), 2 (Salida calculada)

function initSeparable() {
    createGrid('sep-input-grid', inputData);
    createGrid('u-grid', uData);
    createGrid('inter-grid', interData, true);
    
    createGrid('inter-grid-2', interData, true);
    createGrid('v-grid', vData);
    createGrid('sep-output-grid', sepOutputData, true);
}

// Fase 1: Aplicación Lineal Vertical
function calculateInter() {
    for(let c = 0; c < 5; c++) { // Recorremos las 5 columnas
        for(let r = 0; r < 3; r++) { // El resultado tendrá 3 filas
            let sum = 0;
            for(let i = 0; i < 3; i++) {
                sum += inputData[r + i][c] * uData[i][0];
            }
            interData[r][c] = sum;
        }
    }
}

// Fase 2: Aplicación Lineal Horizontal
function calculateSepOutput() {
    for(let r = 0; r < 3; r++) { // Recorremos las 3 filas intermedias
        for(let c = 0; c < 3; c++) { // El resultado final tendrá 3 columnas
            let sum = 0;
            for(let j = 0; j < 3; j++) {
                sum += interData[r][c + j] * vData[0][j];
            }
            sepOutputData[r][c] = sum;
        }
    }
}

function nextSepPhase() {
    if(sepPhase < 2) {
        sepPhase++;
        updateSepVisuals();
    }
}

function prevSepPhase() {
    if(sepPhase > 0) {
        sepPhase--;
        updateSepVisuals();
    }
}

function updateSepVisuals() {
    document.getElementById('btn-sep-prev').disabled = (sepPhase === 0);
    document.getElementById('btn-sep-next').disabled = (sepPhase === 2);

    // Calcular o resetear datos según la fase actual
    if(sepPhase >= 1) calculateInter(); 
    else interData = Array(3).fill().map(() => Array(5).fill(0));
    
    if(sepPhase >= 2) calculateSepOutput(); 
    else sepOutputData = Array(3).fill().map(() => Array(3).fill(0));

    // Re-renderizar las cuadrículas
    createGrid('inter-grid', interData, sepPhase < 1);
    createGrid('inter-grid-2', interData, sepPhase < 1);
    createGrid('sep-output-grid', sepOutputData, sepPhase < 2);
}

// Inicializar el Módulo 3 cuando cargue la página
window.addEventListener('load', () => {
    initSeparable();
});























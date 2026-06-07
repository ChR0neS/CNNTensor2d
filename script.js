// Datos iniciales
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
let currentStep = -1; // -1 significa estado inicial sin calcular
const maxSteps = 9; // Para una salida de 3x3, hay 9 posiciones

// Funciones de renderizado
function createGrid(containerId, data, isOutput = false) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    data.forEach((row, i) => {
        row.forEach((val, j) => {
            const div = document.createElement('div');
            div.className = 'cell';
            div.id = `${containerId}-${i}-${j}`;
            // Si es salida y aún no se calcula, mostrar vacío
            div.innerText = (isOutput && val === 0 && currentStep === -1) ? '' : val;
            container.appendChild(div);
        });
    });
}

function init() {
    createGrid('input-grid', inputData);
    createGrid('kernel-grid', kernelData);
    createGrid('output-grid', outputData, true);
    updateVisuals();
}

// Lógica de pasos
function nextStep() {
    if (currentStep < maxSteps - 1) {
        currentStep++;
        calculateCurrentStep();
        updateVisuals();
    }
}

function prevStep() {
    if (currentStep >= 0) {
        // Borrar el valor actual de la salida si retrocedemos
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
    // Actualizar botones
    document.getElementById('btn-prev').disabled = currentStep === -1;
    document.getElementById('btn-next').disabled = currentStep === maxSteps - 1;

    // Limpiar resaltados
    document.querySelectorAll('.cell').forEach(c => {
        c.classList.remove('highlight-input', 'highlight-kernel', 'highlight-output');
    });

    // Re-renderizar salida para mostrar números actualizados
    createGrid('output-grid', outputData, true);

    if (currentStep === -1) {
        document.getElementById('formula-display').innerText = 'Haz clic en "Siguiente Paso" para comenzar el cálculo.';
        return;
    }

    const outRow = Math.floor(currentStep / 3);
    const outCol = currentStep % 3;
    let formulaText = `S(${outRow},${outCol}) = `;
    let sum = 0;

    // Resaltar Kernel completo siempre durante el cálculo
    for(let r=0; r<3; r++){
        for(let c=0; c<3; c++){
            document.getElementById(`kernel-grid-${r}-${c}`).classList.add('highlight-kernel');
        }
    }

    // Resaltar Entrada y construir fórmula
    let terms = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const inR = outRow + i;
            const inC = outCol + j;
            document.getElementById(`input-grid-${inR}-${inC}`).classList.add('highlight-input');
            
            const valIn = inputData[inR][inC];
            const valKer = kernelData[i][j];
            terms.push(`(${valIn}×${valKer})`);
        }
    }
    
    // Resaltar Salida
    document.getElementById(`output-grid-${outRow}-${outCol}`).classList.add('highlight-output');
    
    formulaText += terms.join(' + ') + ` = ${outputData[outRow][outCol]}`;
    document.getElementById('formula-display').innerText = formulaText;
}

// Iniciar
init();

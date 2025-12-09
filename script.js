// IA GEMINI API
const API_KEY = 'AIzaSyA0o1GiDU3PY-8XtGjKET0bte0lm-4UrLY'; 
const URL_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + API_KEY;

// ELEMENTS DOM 
const btnGenerar = document.getElementById('btn-generar');
const btnLimpiar = document.getElementById('btn-limpiar');
const inputTexto = document.getElementById('texto-usuario');
const selectCantidad = document.getElementById('num-preguntes');
const selectOpciones = document.getElementById('num-opciones');
const divResultado = document.getElementById('resultado');
const divPreguntas = document.getElementById('contenedor-preguntas');

// --- MODAL INFO ---
const modal = document.getElementById('ajuda-info');
const btnInfo = document.getElementById('btn-info');
const spanClose = document.getElementById('close-info');

btnInfo.onclick = () => modal.classList.add('active');
spanClose.onclick = () => modal.classList.remove('active');
window.onclick = (e) => { if (e.target == modal) modal.classList.remove('active'); }

// --- BOTÓ NETEJAR ---
btnLimpiar.addEventListener('click', () => {
    if(confirm("Segur que vols esborrar-ho tot?")) {
        inputTexto.value = '';
        divResultado.style.display = 'none';
        divPreguntas.innerHTML = '';
    }
});

// --- BOTÓ GENERAR (PRINCIPAL) ---
btnGenerar.addEventListener('click', async () => {
    const texto = inputTexto.value.trim();
    const cantidad = selectCantidad.value;
    const opciones = selectOpciones.value;

    if (texto.length < 50) return alert("Si us plau, escriu més text (mínim 50 lletres).");

    // UI Càrrega
    btnGenerar.disabled = true;
    btnGenerar.innerText = "🧠 Pensant preguntes...";
    divResultado.style.display = 'none';
    divPreguntas.innerHTML = '';

    try {
        const preguntas = await pedirPreguntasAGemini(texto, cantidad, opciones);
        mostrarPreguntasEnPantalla(preguntas);
        divResultado.style.display = 'block';
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        btnGenerar.disabled = false;
        btnGenerar.innerText = "✨ Generar Test";
    }
});

// --- API FETCH (GEMINI) ---
async function pedirPreguntasAGemini(texto, cantidad, numOpciones) {
    const prompt = `
        Actua com un professor. Genera ${cantidad} preguntes tipus test.
        REQUISITS:
        1. Idioma: CATALÀ.
        2. Opcions per pregunta: ${numOpciones}.
        3. Format: Array JSON pur.
        
        FORMATO JSON:
        [
          {
            "pregunta": "Pregunta?",
            "opciones": ["A", "B", "C"],
            "correcta": "Text correcta",
            "explicacion": "Per què"
          }
        ]
        
        TEXT: "${texto}"
    `;

    const respuesta = await fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const datos = await respuesta.json();
    if (!datos.candidates) throw new Error("La IA no ha contestat.");

    let jsonTexto = datos.candidates[0].content.parts[0].text;
    // Netejar marcadors de codi si n'hi ha
    jsonTexto = jsonTexto.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonTexto);
}

// --- RENDERITZAR HTML ---
function mostrarPreguntasEnPantalla(lista) {
    lista.forEach((p, index) => {
        const html = `
            <div class="pregunta">
                <h3>${index + 1}. ${p.pregunta}</h3>
                <ul>${p.opciones.map(o => `<li>${o}</li>`).join('')}</ul>
                <button onclick="this.nextElementSibling.style.display='block'" class="btn-secondary" style="margin-top:10px;">👁️ Veure Resposta</button>
                <div class="respuesta">
                    <strong>Correcta:</strong> ${p.correcta}<br>
                    <em>${p.explicacion}</em>
                </div>
            </div>`;
        divPreguntas.innerHTML += html;
    });
}

// --- UTILITATS ---
document.getElementById('btn-pdf').onclick = () => window.print();
document.getElementById('btn-copiar').onclick = () => {
    alert("Text copiat (simulat)!");
};
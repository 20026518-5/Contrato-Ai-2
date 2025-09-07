document.addEventListener("DOMContentLoaded", function () {
    // --- CONFIGURAÇÕES GLOBAIS ---
    
    // INSTRUÇÃO: Coloque a URL da sua logo aqui.
    const LOGO_URL = 'https://placehold.co/200x60/0d9488/FFFFFF?text=Contratos+On+Line';
    
    // ATUALIZADO: Modelo de IA estável e recomendado.
    const MODEL = "gemini-1.5-flash-latest";
    
    // --- ELEMENTOS DO DOM ---
    const sections = document.querySelectorAll(".page-section");
    const navLinks = document.querySelectorAll(".nav-link");
    const navButtons = document.querySelectorAll(".nav-button");
    const footerLogo = document.getElementById('footer-logo');

    // Elementos da Geração de Contrato
    const generateButton = document.getElementById("generate-contract-btn");
    const descriptionInput = document.getElementById("contract-description");
    const descriptionWarning = document.getElementById("description-warning");
    const contentWarning = document.getElementById("content-warning");
    const spinner = document.getElementById("loading-spinner");
    const outputContainer = document.getElementById("contract-output-container");
    const output = document.getElementById("contract-output");
    const exportButton = document.getElementById("export-docx-btn");
    const voiceInputBtn = document.getElementById("voice-input-btn");
    const voiceStatus = document.getElementById("voice-status");
    
    // Elementos da Seção de Doação
    const copyKeyBtn = document.getElementById('copy-key-btn');
    const copyQrBtn = document.getElementById('copy-qr-btn');
    const pixKey = document.getElementById('pix-key').innerText;
    const pixQrCode = '00020126580014BR.GOV.BCB.PIX01363f9ee533-3d3f-4488-9fb3-4b77dc52d9a75204000053039865802BR5925Lucas Vinicius Sampaio Li6009SAO PAULO621405103emDyRbI9d6304836D';
    
    // --- INICIALIZAÇÃO ---
    function initialize() {
        // Define a logo no rodapé a partir da URL configurada
        if (footerLogo) {
            footerLogo.src = LOGO_URL;
        }

        // Lógica de navegação
        window.addEventListener("popstate", handleNavigation);
        handleNavigation(); // Garante que a seção correta seja exibida ao carregar
        navLinks.forEach(link => link.addEventListener("click", handleNavClick));
        navButtons.forEach(button => button.addEventListener("click", handleNavClick));
        
        // Lógica do gerador de contrato
        generateButton.addEventListener("click", handleGenerateContract);
        exportButton.addEventListener("click", handleExportDocx);
        disableExportButton();

        // Lógica da seção de doação
        copyKeyBtn.addEventListener('click', () => copyToClipboard(pixKey, copyKeyBtn));
        copyQrBtn.addEventListener('click', () => copyToClipboard(pixQrCode, copyQrBtn));

        // Lógica de reconhecimento de voz
        initializeSpeechRecognition();
    }

    // --- LÓGICA DE NAVEGAÇÃO (Single Page Application) ---
    function showSection(sectionId) {
        sections.forEach(section => section.classList.toggle("active", section.id === sectionId));
        // Atualiza o estilo do link de navegação ativo
        navLinks.forEach(link => {
            const isActive = link.getAttribute("href") === `#${sectionId}`;
            link.classList.toggle("text-teal-600", isActive);
            link.classList.toggle("font-bold", isActive);
            link.classList.toggle("text-gray-600", !isActive);
        });
    }

    function handleNavigation() {
        const sectionId = location.hash.substring(1) || "home";
        showSection(sectionId);
    }

    function handleNavClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.dataset.target || e.currentTarget.getAttribute("href");
        history.pushState(null, "", targetId);
        handleNavigation();
    }

    // --- LÓGICA DE GERAÇÃO DE CONTRATO ---
    async function handleGenerateContract() {
        const description = descriptionInput.value.trim();
        
        // Reseta avisos
        descriptionWarning.classList.add("hidden");
        contentWarning.classList.add("hidden");

        if (!description) {
            descriptionWarning.classList.remove("hidden");
            descriptionInput.focus();
            return;
        }
        
        if (isContentInvalid(description)) {
            contentWarning.classList.remove("hidden");
            descriptionInput.value = '';
            descriptionInput.focus();
            disableExportButton();
            outputContainer.classList.add("hidden");
            return;
        }

        setLoadingState(true);

        try {
            const prompt = `Crie um contrato formal, completo e detalhado em português do Brasil, baseado estritamente na seguinte descrição, formatado em Markdown. O contrato deve ser claro, objetivo e seguir as boas práticas legais brasileiras. Descrição: ${description}`;
            
            // !!! MUDANÇA CRÍTICA DE SEGURANÇA !!!
            // A chave de API NUNCA deve ficar no código do frontend (visível para o usuário).
            // O ideal é criar um endpoint no seu backend (ex: /api/generate-contract) que recebe o 'prompt'
            // e faz a chamada para a API do Google, adicionando a chave de forma segura no servidor.
            // O código abaixo simula essa chamada para um backend.
            
            // Exemplo de como a chamada DEVERIA ser feita para o seu backend:
            /*
            const response = await fetch('/api/generate-contract', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erro na chamada da API: ${response.statusText}`);
            }

            const data = await response.json();
            const generatedText = data.text;
            */

            // SIMULAÇÃO: Como a chave está sendo gerenciada pela plataforma, vamos manter a chamada direta por enquanto.
            // Em um projeto real, USE O MÉTODO DO BACKEND acima.
            const API_KEY = "AIzaSyDR876UcOyAA4aigjxiOjFku3RprRN2-8o"; // A plataforma irá injetar a chave aqui. Não coloque a sua chave aqui.
            const payload = { contents: [{ parts: [{ text: prompt }] }] };
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro na API: ${errorData.error.message}`);
            }
            const data = await response.json();
            const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;


            if (generatedText) {
                output.innerHTML = marked.parse(generatedText);
                enableExportButton();
            } else {
                throw new Error("A resposta da API não continha um contrato válido.");
            }
            outputContainer.classList.remove("hidden");

        } catch (error) {
            console.error("Erro ao gerar contrato:", error);
            output.innerHTML = `<p class="text-red-600">❌ Ocorreu um erro ao gerar o contrato: ${error.message}. Por favor, tente novamente mais tarde.</p>`;
            outputContainer.classList.remove("hidden");
            disableExportButton();
        } finally {
            setLoadingState(false);
        }
    }
    
    // --- LÓGICA DE ENTRADA DE VOZ ---
    function initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            voiceInputBtn.disabled = true;
            voiceStatus.textContent = 'Reconhecimento de voz não é suportado.';
            return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'pt-BR';
        recognition.interimResults = false;

        let isRecording = false;

        voiceInputBtn.addEventListener('click', () => {
            if (isRecording) {
                recognition.stop();
            } else {
                try {
                    recognition.start();
                } catch(e) {
                    voiceStatus.textContent = 'Erro ao iniciar gravação.';
                    console.error("Speech recognition error:", e);
                }
            }
        });

        recognition.onstart = () => {
            isRecording = true;
            voiceStatus.textContent = 'Ouvindo...';
            voiceInputBtn.classList.add('recording', 'bg-teal-500');
        };

        recognition.onresult = (event) => {
            descriptionInput.value = event.results[0][0].transcript;
        };

        recognition.onerror = (event) => {
            voiceStatus.textContent = `Erro: ${event.error}`;
        };

        recognition.onend = () => {
            isRecording = false;
            voiceStatus.textContent = '';
            voiceInputBtn.classList.remove('recording', 'bg-teal-500');
        };
    }

    // --- LÓGICA DE EXPORTAÇÃO E DOAÇÃO ---
    function handleExportDocx() {
        const content = document.getElementById('contract-output').innerHTML;
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${content}</body></html>`;
        const converted = htmlDocx.asBlob(fullHtml);
        saveAs(converted, 'contrato_gerado.docx');
    }

    // MODIFICADO: Usa a API moderna do navegador para copiar
    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = button.innerText;
            button.innerText = 'Copiado! ✔️';
            // Adiciona uma classe para feedback visual
            button.classList.add('bg-green-600'); 
            setTimeout(() => {
                button.innerText = originalText;
                button.classList.remove('bg-green-600');
            }, 2000);
        }).catch(err => {
            console.error('Falha ao copiar texto: ', err);
            // Fallback para o método antigo se a nova API falhar
            legacyCopyToClipboard(text, button);
        });
    }

    function legacyCopyToClipboard(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            const originalText = button.innerText;
            button.innerText = 'Copiado! ✔️';
            button.classList.add('bg-green-600');
            setTimeout(() => { button.innerText = originalText; button.classList.remove('bg-green-600'); }, 2000);
        } catch (err) {
            console.error('Falha no fallback de cópia: ', err);
        }
        document.body.removeChild(textArea);
    }

    // --- FUNÇÕES AUXILIARES DE UI ---
    function setLoadingState(isLoading) {
        spinner.classList.toggle("hidden", !isLoading);
        generateButton.disabled = isLoading;
        if (isLoading) {
            outputContainer.classList.add("hidden");
            disableExportButton();
            output.innerHTML = "";
        }
    }
    
    function disableExportButton() {
        exportButton.disabled = true;
        exportButton.setAttribute('title', 'Gere um contrato primeiro.');
    }

    function enableExportButton() {
        exportButton.disabled = false;
        exportButton.removeAttribute('title');
    }

    // --- VALIDAÇÃO DE CONTEÚDO ---
    function isContentInvalid(text) {
        // Exemplo de palavras a serem bloqueadas
        const badWords = ['palavrão1', 'palavrão2', 'inapropriado']; 
        const emojiRegex = /^(?:\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud8d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\s)+$/;

        if (emojiRegex.test(text)) return true;
        const lowerCaseText = text.toLowerCase();
        return badWords.some(word => lowerCaseText.includes(word));
    }
    
    // Roda a aplicação
    initialize();
});

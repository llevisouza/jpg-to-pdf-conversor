let isProcessing = false; // Estado de processamento
let shouldStop = false;   // Estado de parada

document.getElementById('convertBtn').addEventListener('click', async function () {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    if (files.length === 0) {
        alert("Por favor, selecione alguns arquivos de imagem.");
        return;
    }

    if (isProcessing) {
        alert("A conversão já está em andamento. Por favor, aguarde.");
        return;
    }

    isProcessing = true;
    shouldStop = false; // Resetar a parada

    this.disabled = true; // Desabilitar o botão de conversão
    document.getElementById('stopBtn').disabled = false; // Habilitar o botão de parar

    const zip = new JSZip();
    let convertedCount = 0;
    const totalFiles = files.length;
    const batchSize = 10;
    const delay = 100;

    document.getElementById('status').innerText = `Converting... ${convertedCount} of ${totalFiles}`;

    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.getElementById('progressBar');
    progressContainer.style.display = 'block';

    async function processBatch(startIndex) {
        for (let i = startIndex; i < Math.min(startIndex + batchSize, files.length); i++) {
            if (shouldStop) {
                alert("Processamento parado. Você pode continuar depois.");
                return i; // Retornar o índice atual para continuar mais tarde
            }

            const file = files[i];
            if (!file.type.match('image/jpeg') && !file.type.match('image/jpg')) {
                alert(`Tipo de arquivo não suportado: ${file.name}`);
                continue; // Continua para o próximo arquivo
            }

            const imgData = await readFile(file);
            const img = new Image();
            img.src = imgData;

            await new Promise((resolve) => {
                img.onload = async function () {
                    const imgWidth = img.width;
                    const imgHeight = img.height;

                    const pdfWidth = imgWidth * 0.264583;
                    const pdfHeight = imgHeight * 0.264583;

                    const { jsPDF } = window.jspdf;
                    const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
                    const doc = new jsPDF(orientation, 'mm', [pdfWidth, pdfHeight]);

                    doc.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

                    const pdfFilename = file.name.replace(/\.[^/.]+$/, "") + ".pdf";
                    const pdfData = doc.output('blob');

                    zip.file(pdfFilename, pdfData);

                    // Atualiza o contador e a barra de progresso
                    convertedCount++;
                    document.getElementById('status').innerText = `Converting... ${convertedCount} of ${totalFiles}`;
                    progressBar.style.width = `${(convertedCount / totalFiles) * 100}%`; // Atualiza a barra de progresso

                    resolve(); // Indica que a conversão está completa
                };

                img.onerror = function () {
                    console.error("Erro ao carregar imagem: " + file.name);
                    alert("Erro ao carregar imagem: " + file.name);
                    resolve(); // Continua mesmo com erro
                };
            });

            // Adiciona um delay entre as conversões
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Chama a próxima batch se houver
        return Math.min(startIndex + batchSize, files.length);
    }

    let currentIndex = 0;

    try {
        while (currentIndex < totalFiles) {
            currentIndex = await processBatch(currentIndex); // Processa um lote e atualiza o índice atual
        }

        // Criar o arquivo ZIP e iniciar o download
        const content = await zip.generateAsync({ type: "blob" });
        const zipFilename = "converted_images.zip";
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = zipFilename;
        link.click();
        alert("Conversão completa! Total convertido: " + convertedCount);
        document.getElementById('status').innerText = ""; // Limpar o status após a conclusão

    } catch (error) {
        console.error("Erro ao gerar o ZIP:", error);
        alert("Ocorreu um erro ao gerar o arquivo ZIP.");
    } finally {
        // Esconder a barra de progresso
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%'; // Reiniciar a barra de progresso

        // Muda o estado de processamento para falso
        isProcessing = false;

        // Habilitar o botão novamente após a conversão
        document.getElementById('convertBtn').disabled = false; // Garantir que o botão seja habilitado aqui
        document.getElementById('stopBtn').disabled = true; // Desabilitar o botão de parar novamente
    }
});

document.getElementById('stopBtn').addEventListener('click', function () {
    shouldStop = true; // Define a variável para parar o processamento
});

// Função para ler arquivos
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.onerror = () => reject(new Error("Erro ao ler o arquivo: " + file.name));
        reader.readAsDataURL(file);
    });
}

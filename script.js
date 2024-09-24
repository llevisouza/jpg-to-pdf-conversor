document.getElementById('convertBtn').addEventListener('click', async function () {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    if (files.length === 0) {
        alert("Por favor, selecione alguns arquivos de imagem.");
        return;
    }

    const zip = new JSZip();
    let convertedCount = 0;
    const totalFiles = files.length;
    const batchSize = 10; // Número de imagens a processar por vez
    const delay = 100; // Delay em milissegundos entre conversões

    document.getElementById('status').innerText = `Converting... ${convertedCount} of ${totalFiles}`;

    // Mostrar a barra de progresso
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.getElementById('progressBar');
    progressContainer.style.display = 'block'; // Tornar visível
    

    async function processBatch(startIndex) {
        for (let i = startIndex; i < Math.min(startIndex + batchSize, files.length); i++) {
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
        if (startIndex + batchSize < files.length) {
            await processBatch(startIndex + batchSize);
        }
    }

    await processBatch(0); // Iniciar o processamento

    // Criar o arquivo ZIP e iniciar o download
    zip.generateAsync({ type: "blob" }).then(function (content) {
        const zipFilename = "converted_images.zip";
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = zipFilename;
        link.click();
        alert("Conversão completa! Total convertido: " + convertedCount);
        document.getElementById('status').innerText = ""; // Limpar o status após a conclusão

        // Esconder a barra de progresso
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%'; // Reiniciar a barra de progresso
    });
});

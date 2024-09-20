document.getElementById('convertBtn').addEventListener('click', function () {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    if (files.length === 0) {
        alert("Please select some image files.");
        return;
    }

    let convertedCount = 0; // Contador de arquivos convertidos

    Array.from(files).forEach(file => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const imgData = event.target.result;

            const img = new Image();
            img.src = imgData;

            img.onload = function () {
                // Obtém as dimensões da imagem original
                const imgWidth = img.width;
                const imgHeight = img.height;

                // Calcula as dimensões do PDF com base na imagem
                const pdfWidth = imgWidth * 0.264583; // Conversão de pixels para mm
                const pdfHeight = imgHeight * 0.264583;

                // Cria uma instância de jsPDF no modo apropriado
                const { jsPDF } = window.jspdf;
                const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
                const doc = new jsPDF(orientation, 'mm', [pdfWidth, pdfHeight]);

                // Adiciona a imagem ao PDF com a largura e altura ajustadas
                doc.addImage(imgData, file.type === 'image/png' ? 'PNG' : 'JPEG', 0, 0, pdfWidth, pdfHeight);

                // Salva o arquivo PDF
                const pdfFilename = file.name.split('.')[0] + '.pdf';
                doc.save(pdfFilename);

                convertedCount++; // Incrementa o contador
                console.log("Converted: " + pdfFilename);

                // Verifica se todos os arquivos foram convertidos
                if (convertedCount === files.length) {
                    alert("Conversion complete! Total converted: " + convertedCount);
                }
            };
        };

        // Lê o arquivo como uma URL base64
        reader.readAsDataURL(file);
    });
});

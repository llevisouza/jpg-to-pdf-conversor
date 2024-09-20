document.getElementById('convertBtn').addEventListener('click', async function () {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    if (files.length === 0) {
        alert("Please select some image files.");
        return;
    }

    const zip = new JSZip();
    let convertedCount = 0; // Contador de arquivos convertidos

    const promises = Array.from(files).map(file => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const imgData = event.target.result;

                const img = new Image();
                img.src = imgData;

                img.onload = function () {
                    const imgWidth = img.width;
                    const imgHeight = img.height;

                    const pdfWidth = imgWidth * 0.264583; // Conversão de pixels para mm
                    const pdfHeight = imgHeight * 0.264583;

                    const { jsPDF } = window.jspdf;
                    const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
                    const doc = new jsPDF(orientation, 'mm', [pdfWidth, pdfHeight]);

                    doc.addImage(imgData, file.type === 'image/png' ? 'PNG' : 'JPEG', 0, 0, pdfWidth, pdfHeight);

                    const pdfFilename = file.name.split('.')[0] + '.pdf';
                    const pdfData = doc.output('blob');

                    zip.file(pdfFilename, pdfData);

                    convertedCount++;
                    console.log("Converted: " + pdfFilename);
                    resolve();
                };

                img.onerror = function () {
                    console.error("Error loading image: " + file.name);
                    reject(); // Tratar erro
                };
            };
            reader.readAsDataURL(file);
        });
    });

    await Promise.all(promises); // Esperar todas as conversões

    // Criar o arquivo ZIP e iniciar o download
    zip.generateAsync({ type: "blob" }).then(function (content) {
        const zipFilename = "converted_images.zip";
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = zipFilename;
        link.click();
        alert("Conversion complete! Total converted: " + convertedCount);
    });
});

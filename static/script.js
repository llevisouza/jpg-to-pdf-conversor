document.getElementById('convertBtn').addEventListener('click', async function () {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    if (!files.length) {
        document.getElementById('errorMsg').innerText = "Selecione ao menos uma imagem.";
        return;
    }

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files[]', file));

    try {
        document.getElementById('status').innerText = "Enviando arquivos...";
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error("Erro ao processar os arquivos.");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "converted_pdfs.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        document.getElementById('status').innerText = "Conversão concluída!";
    } catch (error) {
        document.getElementById('errorMsg').innerText = error.message;
    }
});

from flask import Flask, render_template, request, send_file, jsonify
from werkzeug.utils import secure_filename
from fpdf import FPDF
import os
import zipfile

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

# Certifique-se de que a pasta 'uploads' existe
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_files():
    files = request.files.getlist('files[]')
    if not files:
        return jsonify({"error": "Nenhum arquivo enviado."}), 400

    pdf_files = []
    for file in files:
        if file.filename.endswith(('.jpeg', '.jpg')):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # Cria o PDF
            pdf = FPDF()
            pdf.add_page()
            pdf.image(filepath, x=0, y=0, w=210, h=297)  # A4: 210x297 mm
            pdf_filename = f"{os.path.splitext(filename)[0]}.pdf"
            pdf_filepath = os.path.join(app.config['UPLOAD_FOLDER'], pdf_filename)
            pdf.output(pdf_filepath)
            pdf_files.append(pdf_filepath)

    # Compacta os PDFs
    zip_filepath = os.path.join(app.config['UPLOAD_FOLDER'], "converted_pdfs.zip")
    with zipfile.ZipFile(zip_filepath, 'w') as zipf:
        for pdf_file in pdf_files:
            zipf.write(pdf_file, os.path.basename(pdf_file))

    return send_file(zip_filepath, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)

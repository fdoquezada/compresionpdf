async function separarPDF() {
    const input = document.getElementById("pdfToSplit");
    if (!input.files.length) return alert("Selecciona un PDF");
    showProgressBar(5, 'Cargando PDF...');
    setStatusMessage('Procesando páginas...');
    const pdfBytes = await input.files[0].arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const zip = new JSZip();
    const total = pdfDoc.getPageCount();
    for (let i = 0; i < total; i++) {
        const newDoc = await PDFLib.PDFDocument.create();
        const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
        newDoc.addPage(copiedPage);
        const pdfData = await newDoc.save();
        zip.file(`pagina_${i + 1}.pdf`, pdfData);
        showProgressBar(Math.round(((i+1)/total)*80)+10, `Procesando página ${i+1} de ${total}`);
    }
    showProgressBar(95, 'Comprimiendo ZIP...');
    const zipBlob = await zip.generateAsync({ type: "blob" });
    showProgressBar(100, 'Descargando...');
    setStatusMessage('¡Listo! Descargando ZIP.');
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = "paginas_separadas.zip";
    link.click();
    setStatusMessage('¡Descarga exitosa!');
    setTimeout(()=>{ hideProgressBar(); setStatusMessage(''); location.reload(); }, 1200);
}

async function unirPDFs() {
    const input = document.getElementById("pdfsToMerge");
    if (!input.files.length) return alert("Selecciona uno o más PDFs");
    showProgressBar(5, 'Preparando...');
    setStatusMessage('Uniendo archivos...');
    const mergedPdf = await PDFLib.PDFDocument.create();
    const total = input.files.length;
    let idx = 0;
    for (let file of input.files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
        idx++;
        showProgressBar(Math.round((idx/total)*80)+10, `Agregando archivo ${idx} de ${total}`);
    }
    showProgressBar(95, 'Generando PDF...');
    const finalPdf = await mergedPdf.save();
    showProgressBar(100, 'Descargando...');
    setStatusMessage('¡Listo! Descargando PDF.');
    const blob = new Blob([finalPdf], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pdf_unido.pdf";
    link.click();
    setStatusMessage('¡Descarga exitosa!');
    setTimeout(()=>{ hideProgressBar(); setStatusMessage(''); location.reload(); }, 1200);
}

async function imagenAPDF() {
    const input = document.getElementById("imageToPdf");
    if (!input.files.length) return alert("Selecciona una imagen");
    showProgressBar(10, 'Cargando imagen...');
    setStatusMessage('Procesando imagen...');
    const file = input.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async function (e) {
        showProgressBar(40, 'Generando PDF...');
        const imageDataUrl = e.target.result;
        const pdfDoc = await PDFLib.PDFDocument.create();
        let image, imageDims;
        if (file.type === "image/png") {
            image = await pdfDoc.embedPng(imageDataUrl);
            imageDims = image.scale(1);
        } else {
            image = await pdfDoc.embedJpg(imageDataUrl);
            imageDims = image.scale(1);
        }
        const page = pdfDoc.addPage([imageDims.width, imageDims.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: imageDims.width,
            height: imageDims.height
        });
        showProgressBar(80, 'Guardando PDF...');
        const pdfBytes = await pdfDoc.save();
        showProgressBar(100, 'Descargando...');
        setStatusMessage('¡Listo! Descargando PDF.');
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = file.name.replace(/\.[^.]+$/, "") + ".pdf";
        link.click();
        setStatusMessage('¡Descarga exitosa!');
        setTimeout(()=>{ hideProgressBar(); setStatusMessage(''); location.reload(); }, 1200);
    };
}

async function dosImagenesAPDF() {
    const input = document.getElementById("twoImagesToPdf");
    if (!input.files.length) return alert("Selecciona dos imágenes");
    if (input.files.length !== 2) return alert("Debes seleccionar exactamente dos imágenes");
    await convertirMultiplesImagenesAPDF(input.files, "dos_imagenes.pdf");
}

async function multiplesImagenesAPDF() {
    const input = document.getElementById("multiImagesToPdf");
    if (!input.files.length) return alert("Selecciona una o más imágenes");
    showProgressBar(10, 'Cargando imágenes...');
    setStatusMessage('Procesando imágenes...');
    await convertirMultiplesImagenesAPDF(input.files, "imagenes_multiples.pdf");
}

function showProgressBar(percent, text) {
    const container = document.getElementById('progressContainer');
    const fill = document.getElementById('progressFill');
    const label = document.getElementById('progressText');
    container.style.display = 'block';
    fill.style.width = percent + '%';
    label.textContent = text || '';
}

function hideProgressBar() {
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('progressFill').style.width = '0';
    document.getElementById('progressText').textContent = '';
}

function setStatusMessage(msg) {
    document.getElementById('statusMessage').textContent = msg || '';
}

async function convertirMultiplesImagenesAPDF(files, filename) {
    const pdfDoc = await PDFLib.PDFDocument.create();
    const total = files.length;
    let idx = 0;
    for (let file of files) {
        const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.readAsDataURL(file);
        });
        let image, imageDims;
        if (file.type === "image/png") {
            image = await pdfDoc.embedPng(dataUrl);
            imageDims = image.scale(1);
        } else {
            image = await pdfDoc.embedJpg(dataUrl);
            imageDims = image.scale(1);
        }
        const page = pdfDoc.addPage([imageDims.width, imageDims.height]);
        page.drawImage(image, {
            x: 0,
            y: 0,
            width: imageDims.width,
            height: imageDims.height
        });
        idx++;
        showProgressBar(Math.round((idx/total)*80)+10, `Procesando imagen ${idx} de ${total}`);
    }
    showProgressBar(95, 'Guardando PDF...');
    const pdfBytes = await pdfDoc.save();
    showProgressBar(100, 'Descargando...');
    setStatusMessage('¡Listo! Descargando PDF.');
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setStatusMessage('¡Descarga exitosa!');
    setTimeout(()=>{ hideProgressBar(); setStatusMessage(''); location.reload(); }, 1200);
}
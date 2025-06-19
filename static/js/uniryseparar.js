async function separarPDF() {
    const input = document.getElementById("pdfToSplit");
    if (!input.files.length) return alert("Selecciona un PDF");

    const pdfBytes = await input.files[0].arrayBuffer();
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const zip = new JSZip();

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
        const newDoc = await PDFLib.PDFDocument.create();
        const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
        newDoc.addPage(copiedPage);
        const pdfData = await newDoc.save();
        zip.file(`pagina_${i + 1}.pdf`, pdfData);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = "paginas_separadas.zip";
    link.click();
}

async function unirPDFs() {
    const input = document.getElementById("pdfsToMerge");
    if (!input.files.length) return alert("Selecciona uno o más PDFs");

    const mergedPdf = await PDFLib.PDFDocument.create();

    for (let file of input.files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const finalPdf = await mergedPdf.save();
    const blob = new Blob([finalPdf], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "pdf_unido.pdf";
    link.click();
}
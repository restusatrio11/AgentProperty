const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('Prime_Property_Acceptance_Criteria.pdf');

pdf(dataBuffer).then(function(data) {
    // number of pages
    console.log("Pages:", data.numpages);
    // number of rendered pages
    console.log("Rendered Pages:", data.numrender);
    // PDF info
    console.log("Info:", data.info);
    // PDF metadata
    console.log("Metadata:", data.metadata); 
    // PDF version
    console.log("Version:", data.version);
    // PDF text
    fs.writeFileSync('pdf_content.txt', data.text, 'utf-8');
    console.log("PDF text extracted successfully to pdf_content.txt");
}).catch(function(error){
    console.error("Error extraction:", error);
});

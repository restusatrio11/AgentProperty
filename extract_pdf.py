import sys
try:
    import PyPDF2
    reader = PyPDF2.PdfReader("/mnt/d/Website Restu Satrio Pinanggih/PropertyAgent/Prime_Property_Acceptance_Criteria.pdf")
    for page in reader.pages:
        print(page.extract_text())
except Exception as e:
    print(f"Error: {e}")

import os
import sys

pdf_path = "Prime_Property_Acceptance_Criteria.pdf"

try:
    import pypdf
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for i, page in enumerate(reader.pages):
        text += f"--- Page {i+1} ---\n"
        text += page.extract_text() + "\n"
    with open("pdf_content.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Successfully extracted using pypdf")
except ImportError:
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(pdf_path)
        text = ""
        for i, page in enumerate(reader.pages):
            text += f"--- Page {i+1} ---\n"
            text += page.extract_text() + "\n"
        with open("pdf_content.txt", "w", encoding="utf-8") as f:
            f.write(text)
        print("Successfully extracted using PyPDF2")
    except ImportError:
        print("Neither pypdf nor PyPDF2 is installed.")
        sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

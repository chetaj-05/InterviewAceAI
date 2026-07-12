import pdf from "pdf-parse-new";
import axios from "axios";

export const extractTextFromPdfUrl = async (pdfUrl) => {
  const response = await axios.get(pdfUrl, {
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(response.data);
  const data = await pdf(buffer);

  return data.text;
};

import pdfParse from "pdf-parse";

const extractText = async (buffer) => {
  const data = await pdfParse(buffer);

  return data.text;
};

export default extractText;

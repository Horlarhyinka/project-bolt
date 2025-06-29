import axios from 'axios';
import { getTextExtractor } from 'office-text-extractor';
import { fileTypeFromBuffer } from 'file-type';

export const extractFileFromURL = async (url: string) => {
  console.log({fileUrl: url})
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const fileType = await fileTypeFromBuffer(buffer);
  
    let resumeText;
  
    try {
      if (fileType && fileType.mime === 'application/x-cfb') {
        resumeText = buffer.toString().replace(/[^\x20-\x7E]/g, '');
      } else {
        const extractor = getTextExtractor();
        resumeText = await extractor.extractText({ input: url, type: 'url' });
      }
    } catch (error) {
      console.log("Couldn't extract", error);
      return;
    }
  
    return resumeText;
  };
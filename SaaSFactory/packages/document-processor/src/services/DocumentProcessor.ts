// Node.js built-in modules
import { promises as fs } from 'fs';
import * as path from 'path';
const pdf = require('pdf-parse');
import { ProcessedFile } from '../types';

/**
 * DocumentProcessor handles the processing of PDF files into text content
 * and generates unique hashes for the processed content.
 */
export class DocumentProcessor {
  /**
   * Processes an array of PDF files and returns their content with hash values
   * @param files - Array of PDF file buffers to process
   * @returns Promise resolving to array of ProcessedFile objects containing content and hash
   */
  async processFiles(files: Buffer[]): Promise<ProcessedFile[]> {
    const processedFiles: ProcessedFile[] = [];

    for (const file of files) {
      try {
        const content = await this.processPDF(file);
        processedFiles.push({
          content,
          hash: await this.hashContent(content)
        });
      } catch (error) {
        console.error('Error processing PDF:', error);
        throw error;
      }
    }

    return processedFiles;
  }

  /**
   * Extracts text content from a PDF buffer
   * @param buffer - PDF file buffer
   * @returns Promise resolving to extracted text content
   */
  private async processPDF(buffer: Buffer): Promise<string> {
    const data = await pdf(buffer);
    return data.text;
  }

  /**
   * Generates a SHA-256 hash of the provided content
   * @param content - Text content to hash
   * @returns Promise resolving to hex string representation of the hash
   */
  private async hashContent(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
} 
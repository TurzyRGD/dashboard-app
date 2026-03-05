import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = join(process.cwd(), 'public', 'uploads', filename);

    // Sprawdzamy, czy plik istnieje
    if (!existsSync(filePath)) {
      return new NextResponse('Plik nie istnieje', { status: 404 });
    }

    // Czytamy plik z dysku
    const fileBuffer = await readFile(filePath);

    // Próbujemy zgadnąć typ MIME na podstawie rozszerzenia
    const ext = filename.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'gif') contentType = 'image/gif';
    else if (ext === 'svg') contentType = 'image/svg+xml';
    else if (ext === 'webp') contentType = 'image/webp';

    // Zwracamy plik z odpowiednim nagłówkiem Content-Type
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Błąd serwowania pliku:', error);
    return new NextResponse('Błąd serwera', { status: 500 });
  }
}

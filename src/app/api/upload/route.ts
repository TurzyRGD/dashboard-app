import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'Brak pliku' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Zabezpieczenie: generujemy unikalną nazwę pliku, żeby obrazki się nie nadpisywały
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');

    // Upewniamy się, że folder uploads istnieje na serwerze i ma odpowiednie uprawnienia
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Błąd tworzenia katalogu:', err);
    }

    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    // Zwracamy relatywną ścieżkę, którą przeglądarka i Next.js zrozumieją
    // Dodajemy cache-busting dla pewności, że obrazek od razu się przeładuje
    return NextResponse.json({ success: true, path: `/uploads/${filename}` });
  } catch (error) {
    console.error('Błąd zapisu pliku:', error);
    return NextResponse.json({ success: false, error: 'Błąd serwera podczas wgrywania pliku' }, { status: 500 });
  }
}
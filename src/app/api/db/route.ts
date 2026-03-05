import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Ścieżka do naszego wirtualnego pliku bazy danych
const dataDir = join(process.cwd(), 'data');
const dbFile = join(dataDir, 'db.json');

export async function GET() {
  try {
    const file = await readFile(dbFile, 'utf-8');
    return NextResponse.json(JSON.parse(file));
  } catch (e) {
    // Jeśli plik nie istnieje (pierwsze uruchomienie), zwracamy 404, by frontend załadował domyślne dane
    return NextResponse.json({ error: 'Brak bazy' }, { status: 404 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await mkdir(dataDir, { recursive: true }); // Upewniamy się, że folder /data istnieje
    await writeFile(dbFile, JSON.stringify(body, null, 2), 'utf-8'); // Zapisujemy ładnie sformatowany JSON
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Błąd zapisu do bazy:', e);
    return NextResponse.json({ error: 'Błąd zapisu' }, { status: 500 });
  }
}
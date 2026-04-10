import { useState } from 'react';
import { api } from '../services/api';

export function UploadPage(): React.JSX.Element {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setLoading(true);
    try {
      const response = await api.uploadMedicalDoc(file);
      setResult(`Upload ok: ${response.fileName} (${response.size} bytes)`);
    } catch {
      setResult('Echec upload. Verifiez auth et backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <h1 className="text-3xl font-black">Upload documents medicaux</h1>
      <p className="text-sm text-slate-600">PDF, image ou document clinique (max 5MB cote API actuelle).</p>
      <input aria-label="Importer un document medical" type="file" onChange={onFileChange} className="block w-full rounded-xl border border-slate-300 p-3" />
      {loading ? <p className="text-sm">Upload en cours...</p> : null}
      {result ? <p className="text-sm font-semibold text-cyan-700">{result}</p> : null}
    </div>
  );
}

import React, { useState } from 'react';
import UploadCard from './components/UploadCard';
import ExtractedCard from './components/ExtractedCard';
import { extractBusinessCard, submitBusinessCard } from './services/api';

function App() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Submission States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleExtract = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setData(null);
    setSubmitSuccess(false);
    setSubmitError(null);

    try {
      let response;
      if ((activeTab === 'upload' || activeTab === 'camera') && file) {
        response = await extractBusinessCard(file, true);
      } else if (activeTab === 'url' && url.trim()) {
        response = await extractBusinessCard(url.trim(), false);
      } else {
        setIsLoading(false);
        return;
      }

      if (response && response.data) {
        setData(response.data);
        setSuccess(true);
      } else {
        setError('Extraction failed. No data returned.');
      }
    } catch (err) {
      console.error('Extraction error:', err);
      const errMsg = err.response?.data?.error || 'Unable to extract information. Please try another image.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!data) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await submitBusinessCard(data);
      if (response && response.data) {
        setSubmitSuccess(true);
      } else {
        setSubmitError('Failed to save to Google Sheets.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      const errMsg = err.response?.data?.error || 'Unable to save record. Please try again.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSubmitError = () => {
    setSubmitError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4 md:p-8 select-none">
      {/* Centered Main Title and Subtitle */}
      <header className="w-full max-w-4xl text-center flex flex-col gap-3 py-8 md:py-12 animate-fade-in">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
          Business Card Information <span className="text-gradient">Extractor</span>
        </h1>
        <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload a business card image or paste an image URL .
        </p>
      </header>

      {/* Main Grid Content: Side-by-side or stacked */}
      <main className="w-full max-w-5xl flex-1 flex items-start justify-center py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-start">
          <UploadCard
            file={file}
            setFile={setFile}
            url={url}
            setUrl={setUrl}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onExtract={handleExtract}
            isLoading={isLoading}
          />
          <ExtractedCard
            data={data}
            isLoading={isLoading}
            error={error}
            success={success}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitSuccess={submitSuccess}
            submitError={submitError}
            onCloseSubmitError={handleCloseSubmitError}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-slate-600 border-t border-slate-900/50 mt-12">
        <p>AI Business Card Information Extractor &copy; 2026. Made with Premium Design Ethics.</p>
      </footer>
    </div>
  );
}

export default App;

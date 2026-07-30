import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Briefcase,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import ProgressBar from './ProgressBar';

const ExtractedCard = ({ data, isLoading, error, success, onSubmit, isSubmitting, submitSuccess, submitError, onCloseSubmitError }) => {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const renderValue = (val) => {
    if (val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
      return <span className="text-slate-500 italic">Not Available</span>;
    }
    return val;
  };

  const hasValue = (val) => {
    return !(val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0));
  };

  const SkeletonRow = () => (
    <div className="flex items-start gap-4 animate-pulse py-1">
      <div className="p-2 bg-slate-800/80 rounded-lg w-8 h-8 flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 bg-slate-850 rounded w-1/4" />
        <div className="h-4 bg-slate-800/50 rounded w-3/4" />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-xl flex flex-col gap-4">
      {/* Extracted Details Card */}
      <div className="glass-panel p-6 min-h-[400px] flex flex-col h-full">
        {/* Card Header */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-5">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold tracking-wide">Extracted Details</h2>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex flex-col gap-6 py-4 animate-fade-in">
            <div className="w-full flex flex-col gap-3 text-center mb-2">
              <span className="text-xs font-bold tracking-widest text-blue-400 uppercase animate-pulse">
                Extracting Card Details...
              </span>
              <ProgressBar isLoading={isLoading} />
            </div>
            
            <div className="flex flex-col gap-5">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm font-medium animate-fade-in">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500" />
            <span>{typeof error === 'string' ? error : 'Unable to extract information. Please try another image.'}</span>
          </div>
        )}

        {/* Idle State */}
        {!isLoading && !error && !data && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-8 animate-fade-in">
            <span className="text-slate-400 font-medium">No information extracted yet.</span>
            <span className="text-xs text-slate-500 max-w-xs">
              Upload an image or paste a URL and click Extract to see results here.
            </span>
          </div>
        )}

        {/* Success State & Data Display */}
        {!isLoading && !error && data && (
          <div className={`flex-1 flex flex-col gap-5 ${success ? 'animate-slide-up' : 'animate-fade-in'}`}>
            {/* Success Message Banner */}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm font-medium animate-fade-in">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Information Extracted Successfully! Review below.</span>
              </div>
            )}

            {/* Submit Success Banner */}
            {submitSuccess && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 text-sm font-medium animate-fade-in">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Successfully Saved to Google Sheets!</span>
              </div>
            )}

            {/* Fields List */}
            <div className="flex flex-col gap-5 text-sm">
              {/* Name */}
              <div className="flex items-start gap-4 group/row">
                <div className="p-2 bg-slate-800/80 rounded-lg text-slate-400 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</span>
                  <span className="text-base font-semibold text-slate-200">{renderValue(data.name)}</span>
                </div>
                {hasValue(data.name) && (
                  <button
                    onClick={() => copyToClipboard(data.name, 'name')}
                    className={`copy-btn ${copiedField === 'name' ? 'copied' : ''}`}
                    title="Copy Name"
                  >
                    {copiedField === 'name' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Designation */}
              <div className="flex items-start gap-4 group/row">
                <div className="p-2 bg-slate-800/80 rounded-lg text-slate-400 mt-0.5">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Designation</span>
                  <span className="text-sm font-medium text-slate-300">{renderValue(data.designation)}</span>
                </div>
                {hasValue(data.designation) && (
                  <button
                    onClick={() => copyToClipboard(data.designation, 'designation')}
                    className={`copy-btn ${copiedField === 'designation' ? 'copied' : ''}`}
                    title="Copy Designation"
                  >
                    {copiedField === 'designation' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Company */}
              <div className="flex items-start gap-4 group/row">
                <div className="p-2 bg-slate-800/80 rounded-lg text-slate-400 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</span>
                  <span className="text-sm font-medium text-slate-300">{renderValue(data.company)}</span>
                </div>
                {hasValue(data.company) && (
                  <button
                    onClick={() => copyToClipboard(data.company, 'company')}
                    className={`copy-btn ${copiedField === 'company' ? 'copied' : ''}`}
                    title="Copy Company"
                  >
                    {copiedField === 'company' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Phone Numbers */}
              <div className="flex items-start gap-4 group/row">
                <div className="p-2 bg-slate-800/80 rounded-lg text-slate-400 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone Numbers</span>
                  <div className="flex flex-wrap gap-2">
                    {data.phone && data.phone.length > 0 ? (
                      data.phone.map((ph, idx) => (
                        <span key={idx} className="chip chip-blue">
                          {ph}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">Not Available</span>
                    )}
                  </div>
                </div>
                {hasValue(data.phone) && (
                  <button
                    onClick={() => copyToClipboard(data.phone.join(', '), 'phone')}
                    className={`copy-btn ${copiedField === 'phone' ? 'copied' : ''}`}
                    title="Copy Phone Numbers"
                  >
                    {copiedField === 'phone' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Email Addresses */}
              <div className="flex items-start gap-4 group/row">
                <div className="p-2 bg-slate-800/80 rounded-lg text-slate-400 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Addresses</span>
                  <div className="flex flex-wrap gap-2">
                    {data.email && data.email.length > 0 ? (
                      data.email.map((email, idx) => (
                        <span key={idx} className="chip">
                          {email}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">Not Available</span>
                    )}
                  </div>
                </div>
                {hasValue(data.email) && (
                  <button
                    onClick={() => copyToClipboard(data.email.join(', '), 'email')}
                    className={`copy-btn ${copiedField === 'email' ? 'copied' : ''}`}
                    title="Copy Email Addresses"
                  >
                    {copiedField === 'email' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Websites */}
              <div className="flex items-start gap-4 group/row">
                <div className="p-2 bg-slate-800/80 rounded-lg text-slate-400 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Website(s)</span>
                  <div className="flex flex-wrap gap-2">
                    {data.website && data.website.length > 0 ? (
                      data.website.map((web, idx) => (
                        <span key={idx} className="chip chip-blue">
                          {web}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-500 italic">Not Available</span>
                    )}
                  </div>
                </div>
                {hasValue(data.website) && (
                  <button
                    onClick={() => copyToClipboard(data.website.join(', '), 'website')}
                    className={`copy-btn ${copiedField === 'website' ? 'copied' : ''}`}
                    title="Copy Websites"
                  >
                    {copiedField === 'website' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Address */}
              <div className="flex items-start gap-4 group/row">
                <div className="p-2 bg-slate-800/80 rounded-lg text-slate-400 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Address</span>
                  <span className="text-sm font-medium text-slate-300 leading-relaxed">
                    {renderValue(data.address)}
                  </span>
                </div>
                {hasValue(data.address) && (
                  <button
                    onClick={() => copyToClipboard(data.address, 'address')}
                    className={`copy-btn ${copiedField === 'address' ? 'copied' : ''}`}
                    title="Copy Address"
                  >
                    {copiedField === 'address' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Submit to Google Sheets Button */}
            {!submitSuccess && (
              <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="primary-btn w-full mt-6"
                style={{
                  background: isSubmitting
                    ? 'rgba(37, 99, 235, 0.4)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: isSubmitting ? 'none' : '0 4px 14px 0 rgba(16, 185, 129, 0.25)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <div
                      className="inline-block rounded-full border-t-transparent border-solid animate-spin w-4 h-4 border-2 border-white"
                      role="status"
                    />
                    <span>Saving to Google Sheets...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Save to Google Sheets</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Warning Dialog Modal Overlay */}
      {submitError && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale-up">
            <div className="modal-header">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-2 animate-pulse" />
              <h3 className="text-xl font-bold text-slate-800">Duplicate Record</h3>
            </div>
            <p className="modal-body text-sm text-slate-600 my-4 text-center leading-relaxed">
              {submitError}
            </p>
            <button
              type="button"
              onClick={onCloseSubmitError}
              className="modal-close-btn"
            >
              Okay, Close Warning
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtractedCard;

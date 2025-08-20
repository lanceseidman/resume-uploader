import React, { useState } from "react";
import styled, { keyframes } from "styled-components";

const API_URL = process.env.REACT_APP_API_URL;
const API_KEY = process.env.REACT_APP_API_KEY;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
`;

// Styled components
const Container = styled.div`
  max-width: 1000px;
  margin: 2em auto;
  padding: 2em;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  animation: ${fadeIn} 0.5s ease-out;
`;
const Title = styled.h2`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 1.5em;
  font-weight: 600;
`;
const UploadForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5em;
`;
const FileInputContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2em;
  border: 2px dashed #ddd;
  border-radius: 8px;
  transition: all 0.3s;
  background: #f9f9f9;

  &:hover {
    border-color: #3498db;
    background: #f0f7fc;
  }
`;
const FileInput = styled.input`
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;
const FileInputLabel = styled.label`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
  color: #555;
  font-size: 1em;
  cursor: pointer;
`;
const UploadIcon = styled.div`
  font-size: 2.5em;
  color: #3498db;
`;
const FileName = styled.div`
  margin-top: 0.5em;
  font-size: 0.9em;
  color: #3498db;
  font-weight: 500;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const SubmitButton = styled.button`
  padding: 0.8em 1.5em;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  align-self: center;
  min-width: 150px;

  &:hover { background: #2980b9; transform: translateY(-2px); }
  &:disabled { background: #bdc3c7; cursor: not-allowed; transform: none; }
`;
const StatusContainer = styled.div`
  margin-top: 2em;
  padding: 1.5em;
  background: #f8f9fa;
  border-radius: 8px;
  animation: ${fadeIn} 0.3s ease-out;
`;
const StatusText = styled.div`
  font-weight: 500;
  color: ${p =>
    p.$status === "Uploading..." ? "#3498db" :
    p.$status === "Done!" ? "#27ae60" :
    p.$status?.toLowerCase().includes("failed") ? "#e74c3c" :
    "#2c3e50"};
  text-align: center;
  margin-bottom: ${p => p.$hasResult ? "1em" : "0"};
`;
const LoadingDots = styled.span`
  &::after { content: '.'; animation: ${pulse} 1.5s steps(5, end) infinite; }
`;
const ResultGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;
const ResultColumn = styled.div` display: flex; flex-direction: column; `;
const ColumnTitle = styled.h3`
  color: #2c3e50; margin-bottom: 0.5rem; font-size: 1.1rem; text-align: center;
  padding-bottom: 0.5rem; border-bottom: 1px solid #eee;
`;
const PDFPreview = styled.iframe`
  width: 100%; height: 500px; border: 1px solid #eee; border-radius: 6px; background: #f9f9f9;
`;
const JSONPreview = styled.pre`
  background: white; padding: 1.5em; border-radius: 6px; border: 1px solid #eee;
  height: 500px; overflow-y: auto; font-size: 0.85em; line-height: 1.5;
  white-space: pre-wrap; word-wrap: break-word;
`;
const DownloadButton = styled.a`
  display: inline-block; margin-top: 1rem; padding: 0.6em 1.2em;
  background: #27ae60; color: white; border: none; border-radius: 6px;
  font-size: 0.9em; font-weight: 500; cursor: pointer; text-align: center; text-decoration: none;
  transition: all 0.2s;
  &:hover { background: #219653; transform: translateY(-1px); }
`;

const WalletInfoContainer = styled.div`
  background: #e8f5e8;
  padding: 1em;
  border-radius: 6px;
  margin-bottom: 1em;
  border-left: 4px solid #27ae60;
`;

const WalletInfo = styled.div`
  font-size: 0.9em;
  color: #2c3e50;
  & strong { color: #27ae60; }
`;

const ComponentSection = styled.div`
  margin-bottom: 1.5em;
  padding: 1em;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const ComponentTitle = styled.h4`
  color: #2c3e50;
  margin-bottom: 0.5em;
  font-size: 1em;
  border-bottom: 1px solid #ddd;
  padding-bottom: 0.3em;
`;

const ComponentList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
`;

const SkillTag = styled.span`
  background: #3498db;
  color: white;
  padding: 0.2em 0.6em;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: 500;
`;

function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

export default function ResumeUploader() {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
    }
  };

  async function uploadFile(e) {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setStatus("Uploading...");
    setResult(null);
    setWalletInfo(null);

    try {
      // 1) Upload PDF → POST /Extract
      const uploadRes = await fetch(`${API_URL}/Extract`, {
        method: "POST",
        headers: {
          "Content-Type": "application/pdf",
          ...(API_KEY && { "x-api-key": API_KEY }),
        },
        body: file,
      });
      
      if (!uploadRes.ok) throw new Error("Upload failed: " + (await uploadRes.text()));
      const { jobId, walletId, walletVersionId } = await uploadRes.json();

      setStatus("Uploaded! Processing your resume");

      // 2) Poll status → GET /JobStatus/{jobId}
      let completedWalletVersionId = null;
      while (true) {
        await sleep(3000);
        const statusRes = await fetch(`${API_URL}/JobStatus/${jobId}`, {
          headers: API_KEY ? { "x-api-key": API_KEY } : {},
        });
        
        if (!statusRes.ok) continue;

        const data = await statusRes.json();
        console.log("Status check:", data);

        if (data.Status === "COMPLETED") {
          completedWalletVersionId = data.WalletVersionId || walletVersionId;
          setWalletInfo({
            jobId: data.JobId,
            walletId: data.WalletId || walletId, // Use the stable wallet ID
            walletVersionId: data.WalletVersionId,
            createdAt: data.CreatedAt,
            completedAt: data.CompletedAt,
            isActive: data.IsActive,
            sourceDocuments: data.SourceDocuments
          });
          break;
        }
        
        if (data.Status === "FAILED") {
          throw new Error("Processing failed.");
        }
        
        setStatus(`Processing your resume (${String(data.Status || "").toLowerCase()})`);
      }

      setStatus("Done! Fetching results...");

      // 3) Fetch the latest active wallet → GET /query?latest=true (fallback)
      let walletRes;
      try {
        walletRes = await fetch(`${API_URL}/wallet/latest`, {
          headers: API_KEY ? { "x-api-key": API_KEY } : {},
        });
      } catch (walletError) {
        // Fallback to query endpoint
        console.log("Wallet endpoint not found, using query fallback");
        walletRes = await fetch(`${API_URL}/query?latest=true`, {
          headers: API_KEY ? { "x-api-key": API_KEY } : {},
        });
      }
      
      if (!walletRes.ok) {
        // Final fallback: try to get the specific wallet version if latest fails
        const fallbackRes = await fetch(`${API_URL}/query?walletVersionId=${completedWalletVersionId}`, {
          headers: API_KEY ? { "x-api-key": API_KEY } : {},
        });
        
        if (fallbackRes.ok) {
          const fallbackWallet = await fallbackRes.json();
          setResult(fallbackWallet.walletData || fallbackWallet);
        } else {
          throw new Error("Failed to fetch wallet data");
        }
      } else {
        const wallet = await walletRes.json();
        setResult(wallet.walletData || wallet);
      }

      setStatus("Done!");
    } catch (err) {
      console.error("Upload error:", err);
      setStatus(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  const renderStructuredResult = (data) => {
    if (!data || typeof data !== 'object') {
      return <JSONPreview>{JSON.stringify(data, null, 2)}</JSONPreview>;
    }

    return (
      <div>
        {/* Personal Info */}
        {data.personalInfo && (
          <ComponentSection>
            <ComponentTitle>Personal Information</ComponentTitle>
            <div>
              {data.personalInfo.name && <div><strong>Name:</strong> {data.personalInfo.name}</div>}
              {data.personalInfo.email && <div><strong>Email:</strong> {data.personalInfo.email}</div>}
              {data.personalInfo.phone && <div><strong>Phone:</strong> {data.personalInfo.phone}</div>}
              {data.personalInfo.location && <div><strong>Location:</strong> {data.personalInfo.location}</div>}
            </div>
          </ComponentSection>
        )}

        {/* Skills */}
        {data.skills && Object.keys(data.skills).length > 0 && (
          <ComponentSection>
            <ComponentTitle>Skills</ComponentTitle>
            {Object.entries(data.skills).map(([category, skillList]) => (
              <div key={category} style={{ marginBottom: '0.8em' }}>
                <div style={{ fontWeight: '500', marginBottom: '0.4em' }}>{category}:</div>
                <ComponentList>
                  {Array.isArray(skillList) ? skillList.map((skill, idx) => (
                    <SkillTag key={idx}>{skill}</SkillTag>
                  )) : null}
                </ComponentList>
              </div>
            ))}
          </ComponentSection>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <ComponentSection>
            <ComponentTitle>Experience</ComponentTitle>
            {data.experience.map((exp, idx) => (
              <div key={idx} style={{ marginBottom: '1em', paddingBottom: '1em', borderBottom: idx < data.experience.length - 1 ? '1px solid #eee' : 'none' }}>
                <div style={{ fontWeight: '600' }}>{exp.title} at {exp.company}</div>
                <div style={{ color: '#666', fontSize: '0.9em' }}>
                  {exp.startDate} - {exp.endDate}
                </div>
                {exp.description && <div style={{ marginTop: '0.5em' }}>{exp.description}</div>}
                {exp.responsibilities && exp.responsibilities.length > 0 && (
                  <ul style={{ marginTop: '0.5em', paddingLeft: '1.2em' }}>
                    {exp.responsibilities.map((resp, respIdx) => (
                      <li key={respIdx} style={{ fontSize: '0.9em', marginBottom: '0.2em' }}>{resp}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </ComponentSection>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <ComponentSection>
            <ComponentTitle>Education</ComponentTitle>
            {data.education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '0.8em' }}>
                <div style={{ fontWeight: '600' }}>{edu.degree} in {edu.field}</div>
                <div style={{ color: '#666' }}>{edu.school}</div>
                <div style={{ fontSize: '0.9em' }}>
                  {edu.graduationDate} {edu.gpa && `• GPA: ${edu.gpa}`}
                </div>
              </div>
            ))}
          </ComponentSection>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <ComponentSection>
            <ComponentTitle>Certifications</ComponentTitle>
            {data.certifications.map((cert, idx) => (
              <div key={idx} style={{ marginBottom: '0.5em' }}>
                <div style={{ fontWeight: '500' }}>{cert.name}</div>
                <div style={{ color: '#666', fontSize: '0.9em' }}>
                  {cert.issuer} • {cert.date}
                </div>
              </div>
            ))}
          </ComponentSection>
        )}

        {/* Other/Summary */}
        {data.other && (
          <ComponentSection>
            <ComponentTitle>Additional Information</ComponentTitle>
            {data.other.summary && (
              <div style={{ marginBottom: '0.8em' }}>
                <strong>Summary:</strong> {data.other.summary}
              </div>
            )}
            {data.other.languages && data.other.languages.length > 0 && (
              <div style={{ marginBottom: '0.5em' }}>
                <strong>Languages:</strong> {data.other.languages.join(', ')}
              </div>
            )}
            {data.other.interests && data.other.interests.length > 0 && (
              <div>
                <strong>Interests:</strong> {data.other.interests.join(', ')}
              </div>
            )}
          </ComponentSection>
        )}

        {/* Raw JSON for debugging */}
        <ComponentSection>
          <ComponentTitle>Raw JSON Data</ComponentTitle>
          <JSONPreview>{JSON.stringify(data, null, 2)}</JSONPreview>
        </ComponentSection>
      </div>
    );
  };

  return (
    <Container>
      <Title>Resume Parser</Title>
      <UploadForm onSubmit={uploadFile}>
        <FileInputContainer>
          <FileInput
            type="file"
            id="resume-upload"
            accept="application/pdf"
            onChange={handleFileChange}
            required
          />
          <FileInputLabel htmlFor="resume-upload">
            <UploadIcon>📄</UploadIcon>
            <div>Drag & drop your resume here or click to browse</div>
            <div><small>(PDF files only)</small></div>
            {file && <FileName>{file.name}</FileName>}
          </FileInputLabel>
        </FileInputContainer>

        <SubmitButton type="submit" disabled={!file || isLoading}>
          {isLoading ? "Processing..." : "Analyze Resume"}
        </SubmitButton>
      </UploadForm>

      {(status || result) && (
        <StatusContainer>
          <StatusText $status={status} $hasResult={!!result}>
            {status}
            {status.toLowerCase().includes("processing") && <LoadingDots />}
          </StatusText>

          {/* Wallet Information */}
          {walletInfo && (
            <WalletInfoContainer>
              <WalletInfo>
                <strong>Wallet ID:</strong> {walletInfo.walletId} (stable)<br/>
                <strong>Version ID:</strong> {walletInfo.walletVersionId} (unique)<br/>
                <strong>Job ID:</strong> {walletInfo.jobId}<br/>
                <strong>Created:</strong> {new Date(walletInfo.createdAt).toLocaleString()}<br/>
                {walletInfo.completedAt && (
                  <>
                    <strong>Completed:</strong> {new Date(walletInfo.completedAt).toLocaleString()}<br/>
                  </>
                )}
                <strong>Active Wallet:</strong> {walletInfo.isActive ? 'Yes' : 'No'}
              </WalletInfo>
            </WalletInfoContainer>
          )}

          {result && fileUrl && (
            <ResultGrid>
              <ResultColumn>
                <ColumnTitle>Resume Preview</ColumnTitle>
                <PDFPreview
                  src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  title="Resume Preview"
                />
                <DownloadButton
                  href={fileUrl}
                  download={file?.name || "resume.pdf"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Original PDF
                </DownloadButton>
              </ResultColumn>

              <ResultColumn>
                <ColumnTitle>Parsed Results</ColumnTitle>
                <div style={{ height: '500px', overflowY: 'auto', background: 'white', border: '1px solid #eee', borderRadius: '6px' }}>
                  {renderStructuredResult(result)}
                </div>
                <DownloadButton
                  href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`}
                  download="resume_results.json"
                >
                  Download JSON Results
                </DownloadButton>
              </ResultColumn>
            </ResultGrid>
          )}
        </StatusContainer>
      )}
    </Container>
  );
}
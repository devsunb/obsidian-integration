import { UploadAdfFileResult } from "@markdown-confluence/lib";
import { App, Modal } from "obsidian";
import * as React from "react";
import { useState } from "react";
import { createRoot, Root } from "react-dom/client";

export interface FailedFile {
  fileName: string;
  reason: string;
}

export interface UploadResults {
  errorMessage: string | null;
  failedFiles: FailedFile[];
  filesUploadResult: UploadAdfFileResult[];
}

export interface UploadResultsProps {
  uploadResults: UploadResults;
}

const CompletedView: React.FC<UploadResultsProps> = ({ uploadResults }) => {
  const { errorMessage, failedFiles, filesUploadResult } = uploadResults;
  const [expanded, setExpanded] = useState(false);

  const countResults = {
    content: { same: 0, updated: 0 },
    labels: { same: 0, updated: 0 },
  };

  filesUploadResult.forEach((result) => {
    countResults.content[result.contentResult]++;
    countResults.labels[result.labelResult]++;
  });

  const renderUpdatedFiles = (type: "content" | "label") => {
    return filesUploadResult
      .filter((result) => result[`${type}Result`] === "updated")
      .map((result, index) => (
        <li key={index}>
          <a href={result.adfFile.pageUrl}>{result.adfFile.absoluteFilePath}</a>
        </li>
      ));
  };

  return (
    <div className="upload-results">
      <div>
        <h1>Confluence Integration</h1>
      </div>
      {errorMessage ? (
        <div className="error-message">
          <h3>Publish Failed</h3>
          <p>Error Message: {errorMessage}</p>
        </div>
      ) : (
        <>
          <div className="successful-uploads">
            <h3>Publish Succeed</h3>
            <p>{filesUploadResult.length} file(s) uploaded successfully.</p>
          </div>

          {failedFiles.length > 0 && (
            <div className="failed-uploads">
              <p>{failedFiles.length} file(s) failed to upload.</p>
              <ul>
                {failedFiles.map((file, index) => (
                  <li key={index}>
                    <strong>{file.fileName}</strong>: {file.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <table className="result-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Same</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Content</td>
                <td>{countResults.content.same}</td>
                <td>{countResults.content.updated}</td>
              </tr>
              <tr>
                <td>Labels</td>
                <td>{countResults.labels.same}</td>
                <td>{countResults.labels.updated}</td>
              </tr>
            </tbody>
          </table>
          <div className="expandable-section">
            <button onClick={() => setExpanded(!expanded)}>
              {expanded ? "Collapse" : "Expand"} Updated Files
            </button>
            {expanded && (
              <div className="updated-files">
                <div className="updated-content">
                  <h4>Updated Content</h4>
                  <ul>{renderUpdatedFiles("content")}</ul>
                </div>
                <div className="updated-labels">
                  <h4>Updated Labels</h4>
                  <ul>{renderUpdatedFiles("label")}</ul>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export class CompletedModal extends Modal {
  uploadResults: UploadResultsProps;
  root: Root;

  constructor(app: App, uploadResults: UploadResultsProps) {
    super(app);
    this.uploadResults = uploadResults;
  }

  override onOpen() {
    const { contentEl } = this;
    this.root = createRoot(contentEl);
    this.root.render(React.createElement(CompletedView, this.uploadResults));
  }

  override onClose() {
    const { contentEl } = this;
    this.root.unmount();
    contentEl.empty();
  }
}

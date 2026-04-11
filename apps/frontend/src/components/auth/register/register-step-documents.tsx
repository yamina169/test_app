"use client";

import * as React from "react";
import { FileText, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { DocumentType } from "@/domain/enums/document.enum";
import type { AccountType } from "./register-form";

export interface FileEntry {
  file: File;
  documentType: DocumentType;
}

interface Props {
  accountType: AccountType;
  files: FileEntry[];
  caregiverFiles: FileEntry[];
  showCaregiverSection: boolean;
  onAddFiles: (entries: FileEntry[]) => void;
  onRemoveFile: (index: number) => void;
  onAddCaregiverFiles: (entries: FileEntry[]) => void;
  onRemoveCaregiverFile: (index: number) => void;
}

function UploadZone({
  id,
  label,
  required,
  multiple,
  onFiles,
}: {
  id: string;
  label: string;
  required?: boolean;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const t = useTranslations("register.documents");
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-primary/30 px-5 py-3 text-sm text-primary transition-colors hover:border-primary/60 min-h-12 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <Upload className="h-4 w-4" aria-hidden="true" />
        {t("browse")}
        <input
          id={id}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple={multiple}
          className="sr-only"
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            if (picked.length) onFiles(picked);
            e.target.value = "";
          }}
        />
      </label>
      <p className="text-xs text-muted-foreground">{t("hint")}</p>
    </div>
  );
}

function FileList({
  entries,
  ariaLabel,
  onRemove,
  getRemoveLabel,
}: {
  entries: FileEntry[];
  ariaLabel: string;
  onRemove: (i: number) => void;
  getRemoveLabel: (name: string) => string;
}) {
  if (!entries.length) return null;
  return (
    <ul className="mt-2 space-y-1" aria-label={ariaLabel}>
      {entries.map((entry, i) => (
        <li
          key={`${entry.file.name}-${i}`}
          className="flex items-center gap-2 text-sm text-foreground"
        >
          <FileText
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="flex-1 truncate">{entry.file.name}</span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={getRemoveLabel(entry.file.name)}
            className="flex min-h-11 min-w-11 items-center justify-center text-destructive hover:text-destructive/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}

export function RegisterStepDocuments({
  accountType,
  files,
  caregiverFiles,
  showCaregiverSection,
  onAddFiles,
  onRemoveFile,
  onAddCaregiverFiles,
  onRemoveCaregiverFile,
}: Props) {
  const t = useTranslations("register");
  const tDocs = useTranslations("register.documents");
  const isHandicap = accountType === "handicapped";

  const handleMainFiles = React.useCallback(
    (picked: File[]) => {
      const docType = isHandicap
        ? DocumentType.PROOF_OF_HANDICAP
        : DocumentType.INSTITUTION_DOC;
      onAddFiles(picked.map((f) => ({ file: f, documentType: docType })));
    },
    [isHandicap, onAddFiles],
  );

  const handleCaregiverFiles = React.useCallback(
    (picked: File[]) =>
      onAddCaregiverFiles(
        picked.map((f) => ({
          file: f,
          documentType: DocumentType.CAREGIVER_PROOF,
        })),
      ),
    [onAddCaregiverFiles],
  );

  const getRemoveLabel = React.useCallback(
    (name: string) => tDocs("remove", { name }),
    [tDocs],
  );

  return (
    <section aria-labelledby="step4-heading" className="space-y-5">
      <h2 id="step4-heading" className="sr-only">
        {t("steps.documents")}
      </h2>

      <div className="space-y-2">
        <UploadZone
          id="register-docs-main"
          label={
            isHandicap ? tDocs("mainLabel") : tDocs("mainLabelInstitution")
          }
          required
          multiple
          onFiles={handleMainFiles}
        />
        <FileList
          entries={files}
          ariaLabel={tDocs("mainLabel")}
          onRemove={onRemoveFile}
          getRemoveLabel={getRemoveLabel}
        />
      </div>

      {isHandicap && showCaregiverSection && (
        <div className="space-y-2">
          <UploadZone
            id="register-docs-caregiver"
            label={tDocs("caregiverLabel")}
            required
            onFiles={handleCaregiverFiles}
          />
          <FileList
            entries={caregiverFiles}
            ariaLabel={tDocs("caregiverLabel")}
            onRemove={onRemoveCaregiverFile}
            getRemoveLabel={getRemoveLabel}
          />
        </div>
      )}
    </section>
  );
}

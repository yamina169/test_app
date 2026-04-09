"use client";

import * as React from "react";
import { FileText, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { DocumentType } from "@/domain/enums/document.enum";
import type { AccountType } from "./register-form";

interface FileEntry {
  file: File;
  documentType: DocumentType;
}

interface RegisterStepDocumentsProps {
  accountType: AccountType;
  files: FileEntry[];
  caregiverFiles: FileEntry[];
  onAddFiles: (entries: FileEntry[]) => void;
  onRemoveFile: (index: number) => void;
  onAddCaregiverFiles: (entries: FileEntry[]) => void;
  onRemoveCaregiverFile: (index: number) => void;
  showCaregiverSection: boolean;
}

// ── Single file list item ─────────────────────────────────────────
function FileItem({
  name,
  onRemove,
  ariaLabel,
}: {
  name: string;
  onRemove: () => void;
  ariaLabel: string;
}) {
  return (
    <li className="flex items-center gap-2 text-sm text-foreground">
      <FileText
        className="h-4 w-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="flex-1 truncate">{name}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={ariaLabel}
        className="flex min-h-11 min-w-11 items-center justify-center text-destructive hover:text-destructive/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
}

// ── Upload zone ───────────────────────────────────────────────────
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length) onFiles(picked);
    e.target.value = "";
  }

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
      <label
        className={[
          "inline-flex cursor-pointer items-center gap-2 rounded-xl",
          "border-2 border-dashed border-primary/30 px-5 py-3 text-sm text-primary",
          "transition-colors hover:border-primary/60 min-h-[48px]",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        ].join(" ")}
      >
        <Upload className="h-4 w-4" aria-hidden="true" />
        {t("browse")}
        <input
          id={id}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple={multiple}
          className="sr-only"
          onChange={handleChange}
        />
      </label>
      <p className="text-xs text-muted-foreground">{t("hint")}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export function RegisterStepDocuments({
  accountType,
  files,
  caregiverFiles,
  onAddFiles,
  onRemoveFile,
  onAddCaregiverFiles,
  onRemoveCaregiverFile,
  showCaregiverSection,
}: RegisterStepDocumentsProps) {
  const t = useTranslations("register");
  const isHandicap = accountType === "handicapped";

  function handleMainFiles(picked: File[]) {
    const docType = isHandicap
      ? DocumentType.PROOF_OF_HANDICAP
      : DocumentType.INSTITUTION_DOC;
    onAddFiles(picked.map((f) => ({ file: f, documentType: docType })));
  }

  function handleCaregiverFiles(picked: File[]) {
    onAddCaregiverFiles(
      picked.map((f) => ({
        file: f,
        documentType: DocumentType.CAREGIVER_PROOF,
      })),
    );
  }

  return (
    <section aria-labelledby="step4-heading" className="space-y-5">
      <h2 id="step4-heading" className="sr-only">
        {t("steps.documents")}
      </h2>

      {/* Main documents */}
      <div className="space-y-2">
        <UploadZone
          id="register-docs-main"
          label={
            isHandicap
              ? t("documents.mainLabel")
              : t("documents.mainLabelInstitution")
          }
          required
          multiple
          onFiles={handleMainFiles}
        />

        {files.length > 0 && (
          <ul className="mt-2 space-y-1" aria-label="Fichiers ajoutés">
            {files.map((entry, i) => (
              <FileItem
                key={`${entry.file.name}-${i}`}
                name={entry.file.name}
                onRemove={() => onRemoveFile(i)}
                ariaLabel={t("documents.remove", { name: entry.file.name })}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Caregiver document — handicapped only, when caregiver=true */}
      {isHandicap && showCaregiverSection && (
        <div className="space-y-2">
          <UploadZone
            id="register-docs-caregiver"
            label={t("documents.caregiverLabel")}
            required
            onFiles={handleCaregiverFiles}
          />

          {caregiverFiles.length > 0 && (
            <ul className="mt-2 space-y-1" aria-label="Documents aidant">
              {caregiverFiles.map((entry, i) => (
                <FileItem
                  key={`${entry.file.name}-${i}`}
                  name={entry.file.name}
                  onRemove={() => onRemoveCaregiverFile(i)}
                  ariaLabel={t("documents.remove", { name: entry.file.name })}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

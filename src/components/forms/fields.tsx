"use client";

import { useState, type ReactNode, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type FocusEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { AlertCircle, ImagePlus, X } from "lucide-react";
import { useFieldError, messageFor } from "./FormShell";

const control =
  "block w-full rounded-[var(--radius-sm)] border bg-white px-3 text-[0.9375rem] text-ink placeholder:text-muted/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent-text disabled:bg-surface";
const controlState = (err: string | null) => (err ? "border-danger" : "border-line-strong hover:border-slate");

function Label({ htmlFor, children, required, optional }: { htmlFor: string; children: ReactNode; required?: boolean; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
      {children}
      {required && (
        <>
          <span className="ml-0.5 text-accent-text" aria-hidden>*</span>
          <span className="sr-only"> (required)</span>
        </>
      )}
      {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
    </label>
  );
}

function FieldError({ id, error }: { id: string; error: string | null }) {
  return (
    <p id={id} className={error ? "mt-1.5 flex items-start gap-1.5 text-sm text-danger animate-fade-in" : "sr-only"} aria-live="polite">
      {error && (
        <>
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {error}
        </>
      )}
    </p>
  );
}

type ValidatableEl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

function useValidation(name: string) {
  const f = useFieldError(name);
  const [touched, setTouched] = useState(false);
  return {
    ...f,
    onBlur: (e: FocusEvent<ValidatableEl>) => {
      setTouched(true);
      f.setError(messageFor(e.currentTarget));
    },
    onChange: (e: ChangeEvent<ValidatableEl>) => {
      if (touched || f.error) f.setError(messageFor(e.currentTarget));
    },
  };
}

interface BaseProps {
  name: string;
  label: string;
  hint?: ReactNode;
  className?: string;
  /** Used in error messages, e.g. "your email". Defaults to the lowercased label. */
  errorLabel?: string;
  patternMessage?: string;
}

export function TextField({
  name,
  label,
  hint,
  className = "",
  errorLabel,
  patternMessage,
  required,
  onChange,
  onBlur,
  ...rest
}: BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, "name">) {
  const v = useValidation(name);
  const hintId = hint ? `${v.inputId}-hint` : undefined;
  return (
    <div className={className}>
      <Label htmlFor={v.inputId} required={required} optional={!required && rest.type !== "hidden"}>
        {label}
      </Label>
      <input
        id={v.inputId}
        name={name}
        required={required}
        data-label={errorLabel ?? label.toLowerCase()}
        data-pattern-message={patternMessage}
        aria-invalid={v.error ? true : undefined}
        aria-describedby={[hintId, v.errorId].filter(Boolean).join(" ")}
        onBlur={(e) => {
          v.onBlur(e);
          onBlur?.(e as never);
        }}
        onChange={(e) => {
          v.onChange(e);
          onChange?.(e as never);
        }}
        className={`${control} ${controlState(v.error)} h-11`}
        {...rest}
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      <FieldError id={v.errorId} error={v.error} />
    </div>
  );
}

export function SelectField({
  name,
  label,
  hint,
  className = "",
  errorLabel,
  options,
  placeholder,
  required,
  onChange,
  onBlur,
  defaultValue,
  ...rest
}: BaseProps & { options: { value: string; label: string }[]; placeholder?: string } & Omit<SelectHTMLAttributes<HTMLSelectElement>, "name">) {
  const v = useValidation(name);
  const hintId = hint ? `${v.inputId}-hint` : undefined;
  return (
    <div className={className}>
      <Label htmlFor={v.inputId} required={required} optional={!required}>
        {label}
      </Label>
      <select
        id={v.inputId}
        name={name}
        required={required}
        data-label={errorLabel ?? label.toLowerCase()}
        aria-invalid={v.error ? true : undefined}
        aria-describedby={[hintId, v.errorId].filter(Boolean).join(" ")}
        onBlur={(e) => {
          v.onBlur(e);
          onBlur?.(e as never);
        }}
        onChange={(e) => {
          v.onChange(e);
          onChange?.(e as never);
        }}
        className={`${control} ${controlState(v.error)} h-11 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%234a5260' stroke-width='1.6'/%3E%3C/svg%3E")] bg-[position:right_0.85rem_center] bg-no-repeat pr-9`}
        defaultValue={defaultValue ?? ""}
        {...rest}
      >
        {placeholder !== undefined && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      <FieldError id={v.errorId} error={v.error} />
    </div>
  );
}

export function TextareaField({
  name,
  label,
  hint,
  className = "",
  errorLabel,
  required,
  rows = 4,
  onChange,
  onBlur,
  ...rest
}: BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name">) {
  const v = useValidation(name);
  const hintId = hint ? `${v.inputId}-hint` : undefined;
  return (
    <div className={className}>
      <Label htmlFor={v.inputId} required={required} optional={!required}>
        {label}
      </Label>
      <textarea
        id={v.inputId}
        name={name}
        rows={rows}
        required={required}
        maxLength={2000}
        data-label={errorLabel ?? label.toLowerCase()}
        aria-invalid={v.error ? true : undefined}
        aria-describedby={[hintId, v.errorId].filter(Boolean).join(" ")}
        onBlur={(e) => {
          v.onBlur(e);
          onBlur?.(e as never);
        }}
        onChange={(e) => {
          v.onChange(e);
          onChange?.(e as never);
        }}
        className={`${control} ${controlState(v.error)} py-2.5 leading-relaxed`}
        {...rest}
      />
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      )}
      <FieldError id={v.errorId} error={v.error} />
    </div>
  );
}

export function CheckboxField({
  name,
  label,
  required,
  requiredMessage,
  className = "",
  defaultChecked,
}: {
  name: string;
  label: ReactNode;
  required?: boolean;
  requiredMessage?: string;
  className?: string;
  defaultChecked?: boolean;
}) {
  const v = useValidation(name);
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <input
          id={v.inputId}
          type="checkbox"
          name={name}
          required={required}
          defaultChecked={defaultChecked}
          data-required-message={requiredMessage}
          aria-invalid={v.error ? true : undefined}
          aria-describedby={v.errorId}
          onBlur={v.onBlur}
          onChange={v.onChange}
          className="mt-0.5 size-5 shrink-0 rounded-[3px] border-line-strong accent-accent cursor-pointer"
        />
        <label htmlFor={v.inputId} className="text-sm leading-relaxed text-slate cursor-pointer">
          {label}
          {required && (
            <>
              <span className="ml-0.5 text-accent-text" aria-hidden>*</span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </label>
      </div>
      <FieldError id={v.errorId} error={v.error} />
    </div>
  );
}

export function RadioGroupField({
  name,
  legend,
  options,
  defaultValue,
  required,
  className = "",
  hint,
}: {
  name: string;
  legend: string;
  options: { value: string; label: string; description?: string }[];
  defaultValue?: string;
  required?: boolean;
  className?: string;
  hint?: ReactNode;
}) {
  const v = useValidation(name);
  return (
    <fieldset className={className} aria-describedby={v.errorId}>
      <legend className="mb-2 text-sm font-semibold text-ink">
        {legend}
        {required && (
          <>
            <span className="ml-0.5 text-accent-text" aria-hidden>*</span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </legend>
      {hint && <p className="-mt-1 mb-2 text-xs text-muted">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className="relative flex min-h-11 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-line-strong bg-white px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-slate has-[:checked]:border-navy-900 has-[:checked]:bg-navy-900 has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent-text"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              defaultChecked={defaultValue === o.value}
              required={required}
              data-label={legend.toLowerCase()}
              onChange={v.onChange}
              className="sr-only"
            />
            <span>
              {o.label}
              {o.description && <span className="block text-xs font-normal opacity-80">{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
      <FieldError id={v.errorId} error={v.error} />
    </fieldset>
  );
}

export function FileField({ name, label, hint, maxFiles = 6 }: { name: string; label: string; hint?: ReactNode; maxFiles?: number }) {
  const v = useFieldError(name);
  const [files, setFiles] = useState<string[]>([]);
  return (
    <div>
      <Label htmlFor={v.inputId} optional>
        {label}
      </Label>
      <label
        htmlFor={v.inputId}
        className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-dashed border-line-strong bg-surface px-4 py-5 text-center text-sm text-slate transition-colors hover:border-slate has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-accent-text"
      >
        <ImagePlus className="size-5 text-navy-700" aria-hidden />
        <span>
          <span className="font-semibold text-navy-700 underline underline-offset-2">Choose photos</span> or take them with your phone
        </span>
        <span className="text-xs text-muted">{hint}</span>
        <input
          id={v.inputId}
          type="file"
          name={name}
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          aria-describedby={v.errorId}
          className="sr-only"
          onChange={(e) => {
            const list = Array.from(e.currentTarget.files ?? []);
            setFiles(list.map((f) => f.name));
            if (list.length > maxFiles) v.setError(`Please choose up to ${maxFiles} photos.`);
            else if (list.some((f) => f.size > 8 * 1024 * 1024)) v.setError("Each photo must be 8 MB or smaller.");
            else v.setError(null);
          }}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Selected photos">
          {files.map((f) => (
            <li key={f} className="inline-flex max-w-full items-center gap-1 rounded-[var(--radius-xs)] bg-surface-2 px-2 py-1 text-xs text-slate">
              <span className="truncate max-w-[14rem]">{f}</span>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-[var(--radius-xs)] px-2 py-1 text-xs text-slate underline"
              onClick={(e) => {
                const input = document.getElementById(v.inputId) as HTMLInputElement | null;
                if (input) input.value = "";
                setFiles([]);
                v.setError(null);
                (e.currentTarget as HTMLButtonElement).blur();
              }}
            >
              <X className="size-3" aria-hidden /> Clear
            </button>
          </li>
        </ul>
      )}
      <FieldError id={v.errorId} error={v.error} />
    </div>
  );
}

/* ───────────────────────── Composite blocks ───────────────────────── */

export function ContactFields({ withMessage = true, messageLabel = "Message", messagePlaceholder, defaultMessage }: { withMessage?: boolean; messageLabel?: string; messagePlaceholder?: string; defaultMessage?: string }) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField name="firstName" label="First name" autoComplete="given-name" required maxLength={60} errorLabel="your first name" />
        <TextField name="lastName" label="Last name" autoComplete="family-name" required maxLength={60} errorLabel="your last name" />
        <TextField name="email" type="email" label="Email" autoComplete="email" inputMode="email" required maxLength={120} errorLabel="your email" />
        <TextField
          name="phone"
          type="tel"
          label="Phone"
          autoComplete="tel-national"
          inputMode="tel"
          required
          pattern="[\d\s().+\-]{10,20}"
          patternMessage="Please enter a 10-digit phone number, like (210) 555-0123."
          errorLabel="your phone number"
          placeholder="(210) 555-0123"
        />
      </div>
      <RadioGroupField
        name="preferredContactMethod"
        legend="Preferred contact method"
        defaultValue="phone"
        options={[
          { value: "phone", label: "Phone call" },
          { value: "text", label: "Text message" },
          { value: "email", label: "Email" },
        ]}
      />
      {withMessage && <TextareaField name="message" label={messageLabel} placeholder={messagePlaceholder} defaultValue={defaultMessage} rows={3} />}
    </>
  );
}

export function ConsentFields({ sms = true }: { sms?: boolean }) {
  return (
    <div className="grid gap-3 rounded-[var(--radius-sm)] border border-line bg-surface/60 p-4">
      {sms && (
        <CheckboxField
          name="smsConsent"
          label={
            <>
              Text me about this request. By checking this box, I agree to receive text messages from Auto Select at the number provided. Consent is not a
              condition of purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.
            </>
          }
        />
      )}
      <CheckboxField name="marketingConsent" label="Send me occasional emails about new inventory and offers. You can unsubscribe at any time." />
      <p className="text-xs leading-relaxed text-muted">
        By submitting this form, you agree that Auto Select may contact you about this request by your preferred method. See our{" "}
        <Link href="/privacy-policy" className="underline underline-offset-2">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms-of-use" className="underline underline-offset-2">
          Terms of Use
        </Link>
        .
      </p>
    </div>
  );
}

export function FormSection({ title, children, description }: { title: string; children: ReactNode; description?: ReactNode }) {
  return (
    <fieldset className="grid gap-5 border-t border-line pt-6 first:border-t-0 first:pt-0">
      <legend className="float-left w-full font-display text-lg font-bold text-ink">
        {title}
        {description && <span className="mt-1 block font-sans text-sm font-normal text-muted">{description}</span>}
      </legend>
      <div className="clear-both grid gap-5">{children}</div>
    </fieldset>
  );
}

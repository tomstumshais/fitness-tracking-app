import { useEffect } from "react";
import {
  eventPickerOptions,
  type LoggableEventType,
} from "../cardioActivities.ts";

interface Props {
  onClose: () => void;
  onSelect: (type: LoggableEventType, activityName?: string) => void;
}

export function EventTypePicker({ onClose, onSelect }: Props) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="dialog-overlay" role="presentation">
      <section
        aria-labelledby="event-picker-title"
        aria-modal="true"
        className="form-dialog event-picker"
        role="dialog"
      >
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Completed activity</p>
            <h2 id="event-picker-title">What did you do?</h2>
          </div>
          <button
            aria-label="Close"
            className="dialog-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="event-type-grid">
          {eventPickerOptions.map((option) => (
            <button
              className={`event-type-option ${option.tone}`}
              key={option.title}
              onClick={() => onSelect(option.type, option.activityName)}
              type="button"
            >
              <span className="event-type-icon">{option.icon}</span>
              <span>
                <strong>{option.title}</strong>
                <small>{option.description}</small>
              </span>
              <span aria-hidden="true" className="option-arrow">›</span>
            </button>
          ))}
          <button
            className="event-type-option resistance"
            disabled
            type="button"
          >
            <span className="event-type-icon">🏋️</span>
            <span>
              <strong>Resistance</strong>
              <small>Set-by-set logger coming next</small>
            </span>
            <span className="coming-badge">Next</span>
          </button>
        </div>
      </section>
    </div>
  );
}

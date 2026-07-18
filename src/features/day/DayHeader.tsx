import { format } from "date-fns";
import { Link } from "react-router-dom";

interface Props {
  date: Date;
  onAdd: () => void;
}

export function DayHeader({ date, onAdd }: Props) {
  return (
    <>
      <Link className="back-link" to={`/calendar/${format(date, "yyyy-MM")}`}>
        ← Calendar
      </Link>
      <div className="day-heading">
        <div>
          <p className="eyebrow">{format(date, "EEEE")}</p>
          <h1>{format(date, "d MMMM yyyy")}</h1>
        </div>
        <button className="primary-button" onClick={onAdd} type="button">
          + Add event
        </button>
      </div>
    </>
  );
}

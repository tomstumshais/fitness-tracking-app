import { NameDialog } from "../../../components/ui/NameDialog.tsx";

interface Props {
  defaultName: string;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}

export function WorkoutNameDialog(props: Props) {
  return (
    <NameDialog
      defaultName={props.defaultName}
      eyebrow="Workout details"
      fieldLabel="Workout name"
      onClose={props.onClose}
      onSave={props.onSave}
      submitLabel="Save name"
      title="Edit workout name"
    />
  );
}

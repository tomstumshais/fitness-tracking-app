import {
  NameDialog,
  type NameDialogProps,
} from "../../../components/ui/NameDialog.tsx";

export function TemplateNameDialog(
  props: Omit<NameDialogProps, "fieldLabel">,
) {
  return <NameDialog {...props} fieldLabel="Template name" />;
}

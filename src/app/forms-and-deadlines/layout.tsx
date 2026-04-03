import FormsLayoutClient from "./FormsLayoutClient";

export default function FormsAndDeadlinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FormsLayoutClient>{children}</FormsLayoutClient>;
}
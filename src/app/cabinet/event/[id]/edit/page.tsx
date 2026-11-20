import { EditEventClient } from "./EditEventClient";

export default async function EditEventPage(props: PageProps<"/cabinet/event/[id]/edit">) {
  const { id } = await props.params;
  return <EditEventClient id={id} />;
}

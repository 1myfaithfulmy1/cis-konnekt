import { MessageThreadClient } from "./MessageThreadClient";

export default async function MessageThreadPage(props: PageProps<"/messages/[userId]">) {
  const { userId } = await props.params;
  return <MessageThreadClient otherId={userId} />;
}

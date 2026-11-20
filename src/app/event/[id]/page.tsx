import { EventDetailClient } from "./EventDetailClient";

export default async function EventPage(props: PageProps<"/event/[id]">) {
  const { id } = await props.params;

  // Событие может быть и из seed.ts, и созданным в кабинете (а значит, жить
  // только в localStorage этого устройства) — поэтому сам поиск события и
  // решение «не найдено / закрыто / показать» происходит в браузере,
  // внутри клиентского компонента, а не здесь, на сервере.
  return <EventDetailClient id={id} />;
}

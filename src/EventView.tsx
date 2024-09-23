import css from "./EventView.module.css";
import { NYCCEvent } from ".";

const LINK_REGEX = /[^'"](http?s:\/\/.*)/gi;

export const EventView = ({
  event,
  showDescription = true,
  addFavorite,
  removeFavorite,
  isFavorite,
}: {
  event: NYCCEvent;
  showDescription?: boolean;
  addFavorite: (e: string) => void;
  removeFavorite: (e: string) => void;
  isFavorite: boolean;
}) => (
  <div className={css.event} key={event.id}>
    <div className={css.title_favorite}>
      <h4 dangerouslySetInnerHTML={{ __html: event.title }}></h4>
      <input
        type="checkbox"
        checked={isFavorite}
        onChange={(ev) =>
          ev.target.checked ? addFavorite(event.id) : removeFavorite(event.id)
        }
      />
    </div>
    <div className={css.time_location}>
      <div className={css.time}>
        {new Date(event.start_time).toLocaleString("en-US", {
          weekday: "short",
        })}{" "}
        {new Date(event.start_time).toLocaleString("en-US", {
          timeStyle: "short",
        })}
        -
        {new Date(event.end_time).toLocaleString("en-US", {
          timeStyle: "short",
        })}
      </div>
      <div
        className={css.location}
        dangerouslySetInnerHTML={{ __html: event.location }}
      ></div>
    </div>
    {showDescription ? (
      <>
        <div className={css.tags}>
          {Array.from(
            new Set(
              [...event.schedule_categories, ...event.global_categories].map(
                (c) => c.name
              )
            ).values()
          ).map((c) => (
            <div key={c} className={css.pill}>
              {c}
            </div>
          ))}
          {event.schedule_tags.map((t) => (
            <div key={t.id} className={css.pill}>
              {t.tag}
            </div>
          ))}
        </div>
        <p
          className={css.description}
          dangerouslySetInnerHTML={{
            __html: event.description.replace(
              LINK_REGEX,
              "<a target='__blank' href='$1'>link</a>"
            ),
          }}
        ></p>
      </>
    ) : null}
  </div>
);

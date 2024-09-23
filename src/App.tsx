import { useEffect, useMemo, useRef, useState } from "react";
import css from "./App.module.css";
import { NYCCEvent, ScheduleCategory, ScheduleTag } from ".";
import { EventView } from "./EventView";

const CACHE_KEY = "events";
const FAVORITES_KEY = "favorites";

function App() {
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<Record<string, NYCCEvent>>({});
  const [favorites, setFavorites] = useState<string[]>([]);

  const addFavorite = (id: string) =>
    setFavorites((f) => Array.from(new Set(f).add(id).values()));

  const removeFavorite = (id: string) =>
    setFavorites((f) => f.filter((f) => f !== id));

  const hasLoadedFavorites = useRef(false);
  useEffect(() => {
    const url = new URL(window.location.href);
    setFavorites(
      url.searchParams
        .get(FAVORITES_KEY)
        ?.split(",")
        .filter((f) => typeof f !== undefined && f !== null && f !== "") ?? []
    );
    // HACK
    setTimeout(() => (hasLoadedFavorites.current = true), 1000);
  }, []);

  useEffect(() => {
    if (!hasLoadedFavorites.current) {
      return;
    }
    const url = new URL(window.location.href);
    if (favorites.length > 0) {
      url.searchParams.set(FAVORITES_KEY, favorites.join(","));
    } else {
      url.searchParams.delete(FAVORITES_KEY);
    }
    history.replaceState(history.state, "", url.href);
  }, [favorites]);

  const [categories, setCategories] = useState<
    Record<string, ScheduleCategory>
  >({});
  const [tags, setTags] = useState<Record<string, ScheduleTag>>({});
  const [locations, setLocations] = useState<string[]>([]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const toggleSelectedCategory = (c: string) =>
    setSelectedCategories((s) =>
      s.includes(c) ? s.filter((s) => s !== c) : [...s, c]
    );

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const toggleSelectedTag = (t: string) =>
    setSelectedTags((s) =>
      s.includes(t) ? s.filter((s) => s !== t) : [...s, t]
    );

  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const toggleSelectedLocation = (l: string) =>
    setSelectedLocations((s) =>
      s.includes(l) ? s.filter((s) => s !== l) : [...s, l]
    );

  useEffect(() => {
    const get = async () => {
      try {
        const cachedEvents = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "");
        setEvents(cachedEvents);
      } catch (error) {
        localStorage.removeItem(CACHE_KEY);
      }
      try {
        const result = await fetch(
          `https://register.growtix.com/api/schedules?key=0a00c84d-7546-45e1-a596-96594b5cc463`
        );
        const data: NYCCEvent[] = (await result.json()).schedules;
        const events = data.reduce((acc, e) => ({ ...acc, [e.id]: e }), {});
        setEvents(events);
        localStorage.setItem(CACHE_KEY, JSON.stringify(events));
        setError(false);
      } catch (error) {
        setError(true);
      }
    };
    get();
  }, []);

  const filtedEvents = useMemo(() => {
    return Object.values(events)
      .filter(
        (e) =>
          (e.title.toLowerCase().includes(search.toLowerCase()) ||
            e.description.toLowerCase().includes(search.toLowerCase())) &&
          (selectedCategories.length === 0 ||
            e.global_categories.find((c) =>
              selectedCategories.includes(c.name)
            ) ||
            e.schedule_categories.find((c) =>
              selectedCategories.includes(c.name)
            )) &&
          (selectedTags.length === 0 ||
            e.schedule_tags.find((t) => selectedTags.includes(t.tag))) &&
          (selectedLocations.length === 0 ||
            selectedLocations.includes(e.location))
      )
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
  }, [events, search, selectedCategories, selectedLocations, selectedTags]);

  useEffect(() => {
    setCategories(
      Object.values(events).reduce(
        (acc, e) => ({
          ...acc,
          ...e.global_categories.reduce(
            (acc, c) => ({ ...acc, [c.id]: c }),
            {}
          ),
          ...e.schedule_categories.reduce(
            (acc, c) => ({ ...acc, [c.id]: c }),
            {}
          ),
        }),
        {}
      )
    );
    setTags(
      Object.values(events).reduce(
        (acc, e) => ({
          ...acc,
          ...e.schedule_tags.reduce((acc, t) => ({ ...acc, [t.id]: t }), {}),
        }),
        {}
      )
    );
    setLocations(
      Array.from(
        Object.values(events)
          .reduce((acc, e) => acc.add(e.location), new Set())
          .values()
      ) as string[]
    );
  }, [events]);

  return (
    <section>
      {error ? (
        <div className={css.error}>
          There was an error fetching the latest events from NYCC. Showing the
          last fetched version (if any). Please ping Seth to fix it.
        </div>
      ) : null}

      <div className={css.container}>
        <section>
          <h3>Filter</h3>
          <div className={css.filters}>
            <div>
              <label>Search</label>
              <input
                className={css.search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <div className={css.filter_header}>
                <label>Category</label>
                <div
                  className={css.clear}
                  onClick={() => setSelectedCategories([])}
                >
                  Clear
                </div>
              </div>
              <div className={css.categories}>
                {Object.values(categories)
                  .sort((a, b) => (a.name > b.name ? 1 : -1))
                  .map((c) => (
                    <div
                      className={`${css.pill} ${
                        selectedCategories.includes(c.name) ? css.selected : ""
                      }`}
                      key={c.name}
                      onClick={() => toggleSelectedCategory(c.name)}
                    >
                      {c.name}
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <div className={css.filter_header}>
                <label>Tag</label>
                <div className={css.clear} onClick={() => setSelectedTags([])}>
                  Clear
                </div>
              </div>
              <div className={css.tags}>
                {Object.values(tags)
                  .sort((a, b) => (a.tag > b.tag ? 1 : -1))
                  .map((t) => (
                    <div
                      className={`${css.pill} ${
                        selectedTags.includes(t.tag) ? css.selected : ""
                      }`}
                      key={t.tag}
                      onClick={() => toggleSelectedTag(t.tag)}
                    >
                      {t.tag}
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <div className={css.filter_header}>
                <label>Location</label>
                <div
                  className={css.clear}
                  onClick={() => setSelectedLocations([])}
                >
                  Clear
                </div>
              </div>
              <div className={css.locations}>
                {locations
                  .sort((a, b) => (a > b ? 1 : -1))
                  .map((l) => (
                    <div
                      className={`${css.pill} ${
                        selectedLocations.includes(l) ? css.selected : ""
                      }`}
                      key={l}
                      onClick={() => toggleSelectedLocation(l)}
                    >
                      {l}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </section>
        <section>
          <h3>Events</h3>
          <div className={css.events}>
            {filtedEvents.map((e) => (
              <EventView
                event={e}
                key={e.id}
                addFavorite={addFavorite}
                removeFavorite={removeFavorite}
                isFavorite={favorites.includes(e.id)}
              />
            ))}
          </div>
        </section>
        <section className={css.saved}>
          <h3>Saved</h3>
          <div className={css.events}>
            {Object.values(favorites).length === 0 ? (
              <div>Nothing saved yet.</div>
            ) : (
              favorites
                .map((e) => events[e])
                .sort(
                  (a, b) =>
                    new Date(a.start_time).getTime() -
                    new Date(b.start_time).getTime()
                )
                .map((e) => (
                  <EventView
                    key={e.id}
                    event={e}
                    showDescription={false}
                    addFavorite={addFavorite}
                    removeFavorite={removeFavorite}
                    isFavorite={true}
                  />
                ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

export default App;

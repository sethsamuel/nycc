export interface NYCC {
  event_id: string;
  event_name: string;
  event_slug: string;
  schedules: NYCCEvent[];
}

export interface NYCCEvent {
  id: string;
  title: string;
  description: string;
  livestream: string;
  category: string;
  tags: string;
  start_time: string;
  end_time: string;
  no_end_time?: boolean;
  location: string;
  people_list: string;
  image: any;
  people: People[];
  schedule_categories: ScheduleCategory[];
  global_categories: ScheduleCategory[];
  schedule_tags: ScheduleTag[];
  video_link?: string;
  bonus_link?: string;
  bonus_link_text?: string;
  epic_photo_url?: string;
  venue_location: VenueLocation;
}

export interface People {
  id: string;
  uid?: string;
  publicly_visible: boolean;
  first_name: string;
  last_name: string;
  alt_name?: string;
}

export interface ScheduleCategory {
  id: string;
  name: string;
  color: string;
  is_public: string;
}

export interface ScheduleTag {
  tag: string;
  id: string;
}

export interface VenueLocation {
  id: string;
  name: string;
}

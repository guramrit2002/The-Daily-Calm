// Sample data for building the UI before the backend exists.
// Fictional placeholder copy, not real news.
import type { Edition } from "./types";

const sample = { name: "Sample source", url: "https://example.com" };

export const sampleEdition: Edition = {
  date: "2026-11-12",
  number: 43, // first sample edition is 2026-10-01 (see archiveFixtures.ts)
  prevDate: "2026-11-11",
  nextDate: null,
  stories: [
    // India
    {
      id: 1,
      category: "india",
      headline: "State rail network adds early-morning commuter services",
      summary:
        "A regional rail operator has added four early-morning commuter services on its busiest suburban line, starting next month. The new trains run every twenty minutes between 5 and 6 am, a window that earlier had one service. Officials said the change follows a year of ridership counts showing crowding on the first trains of the day. Fares and stops stay the same.",
      sources: [sample],
    },
    {
      id: 2,
      category: "india",
      headline: "City libraries extend weekend opening hours",
      summary:
        "Public libraries in a large city will stay open until 8 pm on Saturdays and Sundays from December, two hours later than now. The municipal body said reading rooms had been full most weekend afternoons. Extra staff will be hired on short contracts for the trial, which runs for six months before a review. Membership remains free for students.",
      sources: [sample],
    },
    {
      id: 3,
      category: "india",
      headline: "Farmers' cooperative opens cold-storage units in three districts",
      summary:
        "A farmers' cooperative has opened shared cold-storage units in three districts, letting members store fruit and vegetables for up to three weeks. Members pay a small fee per crate. The cooperative said the aim is to reduce spoilage between harvest and sale. Two more units are planned for next year if use stays high.",
      sources: [sample],
    },
    {
      id: 4,
      category: "india",
      headline: "Hill town trials paid parking to ease weekend traffic",
      summary:
        "A hill town will charge for parking in its central market area on weekends for three months, starting this Saturday. Residents with permits are exempt. The local council said the trial is meant to reduce congestion on narrow roads and encourage use of the shuttle bus from the outer car park, which will run every fifteen minutes.",
      sources: [sample],
    },
    {
      id: 5,
      category: "india",
      headline: "State board publishes revised exam calendar",
      summary:
        "A state school board has published its exam calendar for the coming year, moving final exams one week earlier than last year. The board said the change leaves more time for results before college admissions begin. Practical exams will be held in the two weeks before written papers. The full timetable is on the board's website.",
      sources: [sample],
    },
    // World
    {
      id: 6,
      category: "world",
      headline: "Coastal nations agree on shared fishing limits for next season",
      summary:
        "Representatives from five coastal countries agreed on catch limits for three fish species for the coming season after two days of talks. The limits are slightly lower than last year, reflecting survey data on stock levels. The agreement also sets up a joint group to compare monitoring methods. It takes effect in January once each government signs it.",
      sources: [sample],
    },
    {
      id: 7,
      category: "world",
      headline: "Mountain railway reopens after year-long restoration",
      summary:
        "A historic narrow-gauge mountain railway has reopened to passengers after a restoration that replaced worn track and repaired two tunnels. The line, more than a century old, carries both residents and visitors between valley towns. Operators said timetables will be reduced during winter and return to a full schedule in spring.",
      sources: [sample],
    },
    {
      id: 8,
      category: "world",
      headline: "River cleanup project reports return of native fish species",
      summary:
        "A ten-year river cleanup project has recorded two native fish species in stretches where they had not been seen for decades. Researchers credited reduced industrial discharge and restored riverbanks. They cautioned that numbers are still small and that monitoring will continue for several more seasons before drawing firm conclusions.",
      sources: [sample],
    },
    {
      id: 9,
      category: "world",
      headline: "Island nation opens its first national museum of craft",
      summary:
        "An island nation has opened a national museum dedicated to traditional crafts, including weaving, boat-building and pottery. Most items were lent by families and village groups. Entry is free for residents. Curators said the museum will also run weekend workshops led by local craftspeople, starting with basket weaving.",
      sources: [sample],
    },
    {
      id: 10,
      category: "world",
      headline: "Two neighbouring countries simplify border crossing for students",
      summary:
        "Two neighbouring countries have agreed to let enrolled students cross their shared border with a single annual permit instead of monthly visas. The change applies from the next academic term. Officials said several thousand students commute across the border for school and university. Applications open online next week.",
      sources: [sample],
    },
    // Tech
    {
      id: 11,
      category: "tech",
      headline: "Open-source mapping project publishes offline country maps",
      summary:
        "A volunteer mapping project has released downloadable offline maps for every country, updated monthly. The files work in several free navigation apps without a data connection. Maintainers said the main aim is to help people in areas with weak coverage. The release also adds clearer labels for footpaths and public toilets, two of the most requested changes.",
      sources: [sample],
    },
    {
      id: 12,
      category: "tech",
      headline: "Phone makers agree on common repair-part labelling",
      summary:
        "Several phone makers have agreed to a shared format for labelling replacement parts, so repair shops can identify batteries and screens more easily. The format covers part numbers, compatible models and basic safety information. The group said it hopes other manufacturers join next year. No changes to warranty terms were announced.",
      sources: [sample],
    },
    {
      id: 13,
      category: "tech",
      headline: "Public broadcaster adds audio descriptions to its streaming archive",
      summary:
        "A public broadcaster has added audio descriptions to about two hundred programmes in its streaming archive, describing on-screen action for viewers with low vision. The feature can be switched on from the player settings. The broadcaster said it plans to cover most of its documentary catalogue by the end of next year.",
      sources: [sample],
    },
    {
      id: 14,
      category: "tech",
      headline: "Programming language releases long-term support version",
      summary:
        "Maintainers of a widely used programming language have released a long-term support version that will receive security fixes for five years. The release focuses on faster start-up times and clearer error messages rather than new syntax. Older versions will stop receiving updates in eighteen months, giving teams time to upgrade.",
      sources: [sample],
    },
    {
      id: 15,
      category: "tech",
      headline: "Solar-powered weather stations installed at rural schools",
      summary:
        "A science outreach group has installed small solar-powered weather stations at forty rural schools. Students record temperature, rainfall and wind speed, and the readings are shared on a public website. Teachers said the data is being used in maths and geography lessons. The group plans to add another forty schools next year.",
      sources: [sample],
    },
    // Sports
    {
      id: 16,
      category: "sports",
      headline: "Domestic cricket season opens with revised schedule",
      summary:
        "The domestic cricket season begins this weekend with a schedule that adds rest days between multi-day matches. Organisers said the change responds to player feedback about travel and fatigue. The opening round has eight matches across six cities. The final is planned for March, about a week later than last season.",
      sources: [sample],
    },
    {
      id: 17,
      category: "sports",
      headline: "National hockey squad named for winter tour",
      summary:
        "Selectors have named a twenty-member squad for a three-match winter hockey tour, including four players yet to play internationally. The coach said the tour is a chance to try combinations ahead of next year's qualifiers. The first match is on 3 December, and all three will be broadcast.",
      sources: [sample],
    },
    {
      id: 18,
      category: "sports",
      headline: "City marathon adds a shorter route for first-time runners",
      summary:
        "Organisers of a city marathon have added a five-kilometre route for first-time runners alongside the existing full and half marathons. The new route starts after the main races to avoid crowding. Registration opens on Monday, and organisers said a share of places is reserved for local running clubs.",
      sources: [sample],
    },
    {
      id: 19,
      category: "sports",
      headline: "Badminton league announces season format",
      summary:
        "A professional badminton league has confirmed that its next season will run for four weeks with eight teams, the same number as last year. Each tie will include men's, women's and mixed doubles. The league said ticket prices for weekday matches will be lowered to bring in more school groups.",
      sources: [sample],
    },
    {
      id: 20,
      category: "sports",
      headline: "Chess federation launches online coaching for small towns",
      summary:
        "A national chess federation has started free weekly online coaching sessions for players in small towns without local clubs. Sessions are grouped by rating and run in several languages. The federation said around a thousand players signed up in the first week, and more coaches are being added to keep group sizes small.",
      sources: [sample],
    },
  ],
};

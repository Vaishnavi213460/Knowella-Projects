# Smart Toolkit — Q4, Q5, Q10

A 3-in-1 React application built with Vite + React + Tailwind CSS.

## Question Mapping

### Q4 — Route Optimizer (/routes)
Minimizes distance travelled by delivery trucks across predefined 
delivery locations using the Nearest Neighbor TSP algorithm with 
real road routing via OSRM API.

### Q5 — CSV Processor (/csv)
Performs configurable operations on CSV/Excel files including 
filter, rename, sort, and remove column transforms. 
Exports processed result as a new CSV file.

### Q10 — Hot Topics (/hot-topics)
Social media trending feed showing top 20 posts ranked by a 
scoring formula: (likes × 3) + (comments × 5) + (views × 1) + recency decay.
Features category filtering, search, bookmarks, and personalized interests.

## Tech Stack
- React 18 + Vite
- React Router v6
- Tailwind CSS
- Zustand (state management)
- PapaParse (CSV parsing)
- SheetJS (Excel parsing)
- React Leaflet + OSRM (maps and routing)
- Lucide React (icons)

## Running locally
npm install
npm run dev
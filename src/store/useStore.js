import { create } from 'zustand'

export const useStore = create((set, get) => ({
  userInterests: [],
  posts: [],
  searchQuery: '',
  activeCategory: 'All',

  setUserInterests: (interests) => set({ userInterests: interests }),
  setPosts: (posts) => set({ posts }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setActiveCategory: (cat) => set({ activeCategory: cat }),

  // like a post — updates score
  likePost: (id) => set(state => ({
    posts: state.posts.map(p =>
      p.id === id
        ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked, score: calcScore({ ...p, likes: p.liked ? p.likes - 1 : p.likes + 1 }) }
        : p
    )
  })),

  // bookmark a post
  bookmarkPost: (id) => set(state => ({
    posts: state.posts.map(p =>
      p.id === id ? { ...p, bookmarked: !p.bookmarked } : p
    )
  })),

  // increment view count
  viewPost: (id) => set(state => ({
    posts: state.posts.map(p =>
      p.id === id
        ? { ...p, views: p.views + 1, score: calcScore({ ...p, views: p.views + 1 }) }
        : p
    )
  })),

  // top 20 trending posts
  getHotPosts: () => {
    const { posts, userInterests } = get()
    const filtered = userInterests.length > 0
      ? posts.filter(p => userInterests.includes(p.category))
      : posts
    return [...filtered].sort((a, b) => b.score - a.score).slice(0, 20)
  },

  // posts filtered by category + search
  getFilteredPosts: () => {
    const { posts, activeCategory, searchQuery } = get()
    return posts
      .filter(p => activeCategory === 'All' || p.category === activeCategory)
      .filter(p =>
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => b.score - a.score)
  },
}))

// ── Trending score formula ───────────────────────────────────
export function calcScore(post) {
  const hoursOld = (Date.now() - new Date(post.createdAt).getTime()) / 36e5
  const decay = Math.max(0, 1 - hoursOld / 72) // decays over 72 hours
  return Math.round(
    (post.likes * 3) +
    (post.comments * 5) +
    (post.views * 1) +
    decay * 100
  )
}
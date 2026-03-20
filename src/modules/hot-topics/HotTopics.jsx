import { useEffect, useState, useMemo } from 'react'
import { Search, Flame, TrendingUp, Bookmark, RefreshCw, SlidersHorizontal } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { mockPosts, CATEGORIES } from '../../assets/mockData'
import PostCard from './components/PostCard'
import PostDetail from './components/PostDetail'
import InterestSetup from './components/InterestSetup'

export default function HotTopics() {
  const {
    posts, setPosts,
    searchQuery, setSearchQuery,
    activeCategory, setActiveCategory,
    userInterests,
    getHotPosts, getFilteredPosts,
    viewPost,
  } = useStore()

  const [selectedPost, setSelectedPost]   = useState(null)
  const [showSetup, setShowSetup]         = useState(true)
  const [view, setView]                   = useState('hot') // 'hot' | 'browse' | 'saved'
  const [sortBy, setSortBy]               = useState('trending') // 'trending' | 'latest' | 'mostLiked'

  // Load mock posts once
  useEffect(() => {
    if (posts.length === 0) setPosts(mockPosts)
  }, [])

  // Hot posts (top 20)
  const hotPosts = useMemo(() => getHotPosts(), [posts, userInterests])

  // Browseable / filtered posts
  const filteredPosts = useMemo(() => {
    let result = getFilteredPosts()
    if (sortBy === 'latest')    result = [...result].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (sortBy === 'mostLiked') result = [...result].sort((a, b) => b.likes - a.likes)
    return result
  }, [posts, activeCategory, searchQuery, sortBy])

  // Saved posts
  const savedPosts = useMemo(() => posts.filter(p => p.bookmarked), [posts])

  function openPost(post) {
    viewPost(post.id)
    setSelectedPost(post)
  }

  const displayPosts = view === 'hot' ? hotPosts : view === 'saved' ? savedPosts : filteredPosts

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Interest setup overlay */}
      {showSetup && <InterestSetup onDone={() => setShowSetup(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Flame className="text-orange-500" size={26} /> Hot Topics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {userInterests.length > 0
              ? `Personalized for: ${userInterests.join(', ')}`
              : 'Showing all categories'}
          </p>
        </div>
        <button
          onClick={() => setShowSetup(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
        >
          <SlidersHorizontal size={14} /> Interests
        </button>
      </div>

      {/* View tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'hot',    label: '🔥 Hot',    count: hotPosts.length },
          { key: 'browse', label: '🔍 Browse',  count: null },
          { key: 'saved',  label: '🔖 Saved',   count: savedPosts.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              view === tab.key ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Browse controls */}
      {view === 'browse' && (
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts, tags, topics..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {['All', ...CATEGORIES].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort by:</span>
            {[
              { key: 'trending',  label: '🔥 Trending' },
              { key: 'latest',    label: '🕐 Latest' },
              { key: 'mostLiked', label: '❤️ Most liked' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                  sortBy === s.key ? 'bg-blue-100 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hot topics header banner */}
      {view === 'hot' && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-white" />
            <div>
              <p className="text-white font-semibold text-sm">Top {hotPosts.length} Trending Posts</p>
              <p className="text-orange-100 text-xs">Ranked by likes, comments, views and recency</p>
            </div>
          </div>
          <button
            onClick={() => setPosts([...mockPosts])}
            className="flex items-center gap-1 text-white text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      )}

      {/* Saved empty state */}
      {view === 'saved' && savedPosts.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Bookmark size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No saved posts yet</p>
          <p className="text-xs">Click the bookmark icon on any post to save it</p>
        </div>
      )}

      {/* Post grid */}
      {displayPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayPosts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              rank={view === 'hot' ? index + 1 : null}
              onClick={() => openPost(post)}
            />
          ))}
        </div>
      )}

      {/* Post detail modal */}
      {selectedPost && (
        <PostDetail
          post={posts.find(p => p.id === selectedPost.id)}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  )
}